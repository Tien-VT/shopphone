export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    // If the object is a Decimal (from Prisma), convert it to number or string
    if (obj.constructor && obj.constructor.name === "Decimal") {
      return Number(obj);
    }
    // If it's a Date, return its ISO string
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  }
  return obj;
}
