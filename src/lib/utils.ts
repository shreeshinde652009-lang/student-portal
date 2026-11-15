export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const uniqueSuffix = crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
  return `CET-${year}-${uniqueSuffix}`;
}
