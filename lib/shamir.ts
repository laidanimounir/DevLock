import * as ExpoCrypto from "expo-crypto";

export interface ShamirShare {
  index: number;
  share: string;
}

// ── GF(256) Arithmetic ──────────────────────────────────────────────
// Irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)

const EXP_TABLE: number[] = [];
const LOG_TABLE: number[] = new Array(256);

function initTables(): void {
  if (EXP_TABLE.length > 0) return;
  let x = 1;
  for (let i = 0; i < 256; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x & 0x80 ? 0x11b : 0);
    x &= 0xff;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
}

function gfMul(a: number, b: number): number {
  initTables();
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

function gfDiv(a: number, b: number): number {
  initTables();
  if (a === 0) return 0;
  if (b === 0) throw new Error("Division by zero in GF(256)");
  let diff = LOG_TABLE[a] - LOG_TABLE[b];
  if (diff < 0) diff += 255;
  return EXP_TABLE[diff];
}

function gfPow(base: number, exp: number): number {
  if (exp === 0) return 1;
  if (base === 0) return 0;
  let result = 1;
  for (let i = 0; i < exp; i++) {
    result = gfMul(result, base);
  }
  return result;
}

// ── Hex ↔ Bytes Utilities ───────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) hex = "0" + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── String ↔ Hex Encoding ──────────────────────────────────────────

export function stringToHex(str: string): string {
  const bytes = new Uint8Array(str.length * 2);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i * 2] = (code >> 8) & 0xff;
    bytes[i * 2 + 1] = code & 0xff;
  }
  return bytesToHex(bytes);
}

export function hexToString(hex: string): string {
  const bytes = hexToBytes(hex);
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i += 2) {
    const code = (bytes[i] << 8) | bytes[i + 1];
    chars.push(String.fromCharCode(code));
  }
  return chars.join("");
}

// ── Polynomial Evaluation & Interpolation ──────────────────────────

function evalPolynomial(coeffs: Uint8Array, x: number): number {
  if (x === 0) return coeffs[0];
  let result = coeffs[coeffs.length - 1];
  for (let i = coeffs.length - 2; i >= 0; i--) {
    result = gfMul(result, x);
    result ^= coeffs[i];
  }
  return result;
}

function lagrangeInterpolateZero(points: Array<{ x: number; y: number }>): number {
  let result = 0;
  for (let i = 0; i < points.length; i++) {
    let basis = 1;
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const num = points[j].x;
        const denom = points[j].x ^ points[i].x;
        basis = gfMul(basis, gfDiv(num, denom));
      }
    }
    result ^= gfMul(points[i].y, basis);
  }
  return result;
}

// ── Shamir Secret Sharing ──────────────────────────────────────────

export function splitSecret(
  secretHex: string,
  totalShares: number,
  threshold: number
): ShamirShare[] {
  if (threshold > totalShares) throw new Error("Threshold cannot exceed total shares");
  if (threshold < 2) throw new Error("Threshold must be at least 2");
  if (totalShares > 255) throw new Error("Cannot create more than 255 shares");

  const secretBytes = hexToBytes(secretHex);
  const randomBuffer = ExpoCrypto.getRandomBytes(secretBytes.length * (threshold - 1));
  const shares: Uint8Array[] = [];

  for (let s = 0; s < totalShares; s++) {
    shares.push(new Uint8Array(secretBytes.length));
  }

  for (let i = 0; i < secretBytes.length; i++) {
    const coeffs = new Uint8Array(threshold);
    coeffs[0] = secretBytes[i];
    for (let c = 1; c < threshold; c++) {
      coeffs[c] = randomBuffer[i * (threshold - 1) + (c - 1)];
    }

    for (let s = 0; s < totalShares; s++) {
      const x = s + 1;
      shares[s][i] = evalPolynomial(coeffs, x);
    }
  }

  return shares.map((data, i) => ({
    index: i + 1,
    share: `${i + 1}-${bytesToHex(data)}`,
  }));
}

export function combineShares(shareStrings: string[]): string {
  if (shareStrings.length < 2) {
    throw new Error("Need at least 2 shares to reconstruct");
  }

  const parsed: Array<{ x: number; bytes: Uint8Array }> = shareStrings.map((s) => {
    const dashIdx = s.indexOf("-");
    if (dashIdx === -1) throw new Error(`Invalid share format: ${s}`);
    const x = parseInt(s.substring(0, dashIdx), 10);
    const hexData = s.substring(dashIdx + 1);
    return { x, bytes: hexToBytes(hexData) };
  });

  const shareLength = parsed[0].bytes.length;
  for (const p of parsed) {
    if (p.bytes.length !== shareLength) {
      throw new Error("All shares must have the same length");
    }
  }

  const result = new Uint8Array(shareLength);
  for (let i = 0; i < shareLength; i++) {
    const points = parsed.map((p) => ({ x: p.x, y: p.bytes[i] }));
    result[i] = lagrangeInterpolateZero(points);
  }

  return bytesToHex(result);
}

export function createMasterKeyShares(masterKey: string): {
  share1: string;
  share2: string;
  share3: string;
} {
  const hexKey = stringToHex(masterKey);
  const shares = splitSecret(hexKey, 3, 2);

  return {
    share1: shares[0].share,
    share2: shares[1].share,
    share3: shares[2].share,
  };
}

export function recoverMasterKey(share1: string, share2: string): string {
  const hexKey = combineShares([share1, share2]);
  return hexToString(hexKey);
}
