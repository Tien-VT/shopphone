import { NextResponse } from "next/server";
import provincesBefore from "@/data/vietnam/province.json";
import districtsBefore from "@/data/vietnam/district.json";
import communesBefore from "@/data/vietnam/commune.json";
import provincesAfter from "@/data/vietnam/simplified_json_generated_data_vn_units.json";

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
        return NextResponse.json(provincesBefore);
      }

      if (level === "district") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const filtered = districtsBefore.filter((d: any) => d.idProvince === parentId);
        return NextResponse.json(filtered);
      }

      if (level === "commune") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const filtered = communesBefore.filter((c: any) => c.idDistrict === parentId);
        return NextResponse.json(filtered);
      }
    }

    if (type === "after") {
      if (level === "province") {
        // Map to return only code, name, fullName for performance (excluding large Wards array)
        const provinces = provincesAfter.map((p: any) => ({
          code: p.Code,
          name: p.Name,
          fullName: p.FullName
        }));
        return NextResponse.json(provinces);
      }

      if (level === "ward") {
        if (!parentId) return NextResponse.json({ error: "Missing parentId" }, { status: 400 });
        const province = provincesAfter.find((p: any) => p.Code === parentId);
        if (!province) return NextResponse.json([]);
        return NextResponse.json(province.Wards || []);
      }
    }

    return NextResponse.json({ error: "Invalid type or level" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
