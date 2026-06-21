import * as ExpoCrypto from "expo-crypto";
import CryptoJS from "crypto-js";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateIV(): string {
  const bytes = ExpoCrypto.getRandomBytes(16);
  const hexStr = bytesToHex(bytes);
  return CryptoJS.enc.Hex.parse(hexStr).toString(CryptoJS.enc.Base64);
}

export function generateSalt(): string {
  const bytes = ExpoCrypto.getRandomBytes(32);
  const hexStr = bytesToHex(bytes);
  return CryptoJS.enc.Hex.parse(hexStr).toString(CryptoJS.enc.Base64);
}

export function encryptAES256(text: string, key: string, iv: string): string {
  const keyWordArray = CryptoJS.enc.Base64.parse(key);
  const ivWordArray = CryptoJS.enc.Base64.parse(iv);

  const encrypted = CryptoJS.AES.encrypt(text, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

export function decryptAES256(encrypted: string, key: string, iv: string): string {
  const keyWordArray = CryptoJS.enc.Base64.parse(key);
  const ivWordArray = CryptoJS.enc.Base64.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(encrypted, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function deriveKeyFromPIN(pin: string, salt: string): string {
  const saltWordArray = CryptoJS.enc.Base64.parse(salt);

  const key = CryptoJS.PBKDF2(pin, saltWordArray, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  return CryptoJS.enc.Base64.stringify(key);
}

export function hashPIN(pin: string): string {
  const hash = CryptoJS.SHA256(pin);
  return CryptoJS.enc.Base64.stringify(hash);
}

export function generateEncryptionKey(): string {
  const bytes = ExpoCrypto.getRandomBytes(32);
  const hexStr = bytesToHex(bytes);
  return CryptoJS.enc.Hex.parse(hexStr).toString(CryptoJS.enc.Base64);
}

export function encryptCredential(plainText: string, masterKey: string): { encrypted: string; iv: string } {
  const iv = generateIV();
  const encrypted = encryptAES256(plainText, masterKey, iv);
  return { encrypted, iv };
}

export function decryptCredential(encrypted: string, masterKey: string, iv: string): string {
  return decryptAES256(encrypted, masterKey, iv);
}
