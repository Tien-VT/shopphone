import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BEFORE_PATH = "d:/website-ban-dthoai/vietnam-divisions-js/src/seeds/vietnam";
const AFTER_PATH = "d:/website-ban-dthoai/vietnamese-provinces-database/json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "before" or "after"
    const level = searchParams.get("level"); // "province" | "district" | "commune" | "ward"
    const parentId = searchParams.get("parentId"); // e.g. provinceId, districtId, provinceCode

    if (!type || !level) {
      return NextResponse.json({ error: "Missing type or level parameter" }, { status: 400 });
    }

    if (type === "before") {
      if (level === "province") {
        const fileContent = await fs.readFile(path.join(BEFORE_PATH, "province.json"), "utf-8");
        return NextResponse.json(JSON.parse(fileContent));
      }

      if (level === "district") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const fileContent = await fs.readFile(path.join(BEFORE_PATH, "district.json"), "utf-8");
        const districts = JSON.parse(fileContent);
        const filtered = districts.filter((d: any) => d.idProvince === parentId);
        return NextResponse.json(filtered);
      }

      if (level === "commune") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const fileContent = await fs.readFile(path.join(BEFORE_PATH, "commune.json"), "utf-8");
        const communes = JSON.parse(fileContent);
        const filtered = communes.filter((c: any) => c.idDistrict === parentId);
        return NextResponse.json(filtered);
      }
    }

    if (type === "after") {
      if (level === "province") {
        const fileContent = await fs.readFile(path.join(AFTER_PATH, "simplified_json_generated_data_vn_units.json"), "utf-8");
        const data = JSON.parse(fileContent);
        // Map to return only code, name, fullName for performance (excluding large Wards array)
        const provinces = data.map((p: any) => ({
          code: p.Code,
          name: p.Name,
          fullName: p.FullName
        }));
        return NextResponse.json(provinces);
      }

      if (level === "ward") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const fileContent = await fs.readFile(path.join(AFTER_PATH, "simplified_json_generated_data_vn_units.json"), "utf-8");
        const data = JSON.parse(fileContent);
        const province = data.find((p: any) => p.Code === parentId);
        if (!province) return NextResponse.json([]);
        return NextResponse.json(province.Wards || []);
      }
    }

    return NextResponse.json({ error: "Invalid type or level" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
