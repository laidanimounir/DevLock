import * as ExpoCrypto from "expo-crypto";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generatePassword(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (charset.length === 0) charset = LOWERCASE + NUMBERS;

  const randomBytes = ExpoCrypto.getRandomBytes(options.length);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    const index = randomBytes[i] % charset.length;
    password += charset[index];
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  if (
    (options.uppercase && !hasUpper) ||
    (options.lowercase && !hasLower) ||
    (options.numbers && !hasNumber) ||
    (options.symbols && !hasSymbol)
  ) {
    return generatePassword(options);
  }

  return password;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "#EF4444" };
  if (score <= 4) return { score, label: "Fair", color: "#F59E0B" };
  if (score <= 6) return { score, label: "Strong", color: "#3B82F6" };
  return { score, label: "Very Strong", color: "#10B981" };
}
