import { NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const rotation = Number(data.get("rotation"));

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (![90, 180, 270].includes(rotation)) {
      return NextResponse.json({ error: "Invalid rotation" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);

    const pages = pdf.getPages();

    pages.forEach((page) => {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotation) % 360));
    });

    const rotatedBytes = await pdf.save();

    return new Response(rotatedBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rotated-pdf.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Rotate failed" }, { status: 500 });
  }
}