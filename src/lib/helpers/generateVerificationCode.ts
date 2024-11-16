/**
 * Generates a 6-digit verification code as a string.
 * @returns {string} A 6-digit verification code.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
