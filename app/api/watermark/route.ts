import { NextResponse } from "next/server";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const text = data.get("text") as string;
    const fontSize = Number(data.get("fontSize"));
    const opacity = Number(data.get("opacity"));

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Watermark text is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    const pages = pdf.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();

      page.drawText(text, {
        x: width / 2 - text.length * (fontSize || 40) * 0.25,
        y: height / 2,
        size: fontSize || 40,
        font,
        color: rgb(0.75, 0.75, 0.75),
        opacity: opacity || 0.25,
        rotate: degrees(-35),
      });
    });

    const outputBytes = await pdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="watermarked-pdf.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Watermark failed" }, { status: 500 });
  }
}
