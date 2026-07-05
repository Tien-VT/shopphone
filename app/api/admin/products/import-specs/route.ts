import { NextResponse } from "next/server";
import fs from "fs";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();
    if (!filePath) {
      return NextResponse.json({ error: "Vui lòng cung cấp đường dẫn file" }, { status: 400 });
    }

    // Verify if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Không tìm thấy file tại đường dẫn đã nhập" }, { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const wb = XLSX.read(fileBuffer, { type: "buffer" });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    const specs: { key: string; value: string }[] = [];
    for (const row of data) {
      if (Array.isArray(row) && row.length >= 2) {
        const key = String(row[0] || "").trim();
        const value = String(row[1] || "").trim();

        if (
          key.toLowerCase() === "tên thông số" ||
          key.toLowerCase() === "thông số" ||
          key.toLowerCase() === "key" ||
          key.toLowerCase() === "name" ||
          key === ""
        ) {
          continue;
        }

        specs.push({ key, value });
      }
    }

    return NextResponse.json({ specs });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Lỗi khi đọc file Excel" }, { status: 500 });
  }
}
