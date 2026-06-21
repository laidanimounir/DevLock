import secrets from "secrets.js-grempe";

export interface ShamirShare {
  index: number;
  share: string;
}

export function splitSecret(secretHex: string, totalShares: number, threshold: number): ShamirShare[] {
  secrets.init(8);

  const shares = secrets.share(secretHex, totalShares, threshold);

  return shares.map((s) => {
    const parts = s.split("-");
    return {
      index: parseInt(parts[0], 10),
      share: s,
    };
  });
}

export function stringToHex(str: string): string {
  return secrets.str2hex(str);
}

export function hexToString(hex: string): string {
  return secrets.hex2str(hex);
}

export function combineShares(shares: string[]): string {
  secrets.init(8);
  return secrets.combine(shares);
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
