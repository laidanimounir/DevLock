import * as ExpoCrypto from "expo-crypto";
import CryptoJS from "crypto-js";

export function generateIV(): string {
  const randomBytes = ExpoCrypto.getRandomBytes(16);
  const wordArray = CryptoJS.lib.WordArray.create(randomBytes as any);
  return CryptoJS.enc.Base64.stringify(wordArray);
}

export function generateSalt(): string {
  const randomBytes = ExpoCrypto.getRandomBytes(32);
  const wordArray = CryptoJS.lib.WordArray.create(randomBytes as any);
  return CryptoJS.enc.Base64.stringify(wordArray);
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
  const randomBytes = ExpoCrypto.getRandomBytes(32);
  const wordArray = CryptoJS.lib.WordArray.create(randomBytes as any);
  return CryptoJS.enc.Base64.stringify(wordArray);
}

export function encryptCredential(plainText: string, masterKey: string): { encrypted: string; iv: string } {
  const iv = generateIV();
  const encrypted = encryptAES256(plainText, masterKey, iv);
  return { encrypted, iv };
}

export function decryptCredential(encrypted: string, masterKey: string, iv: string): string {
  return decryptAES256(encrypted, masterKey, iv);
}
