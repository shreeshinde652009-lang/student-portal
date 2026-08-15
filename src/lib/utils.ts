export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 random digits
  return `LCS${year}${randomDigits}`;
}
