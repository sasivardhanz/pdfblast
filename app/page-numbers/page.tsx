import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const position = data.get("position") as string;
    const fontSize = Number(data.get("fontSize"));

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const pages = pdf.getPages();

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const text = `${index + 1}`;

      let x = width / 2;
      let y = 30;

      if (position === "top-left") {
        x = 30;
        y = height - 40;
      }

      if (position === "top-center") {
        x = width / 2;
        y = height - 40;
      }

      if (position === "top-right") {
        x = width - 40;
        y = height - 40;
      }

      if (position === "bottom-left") {
        x = 30;
        y = 30;
      }

      if (position === "bottom-center") {
        x = width / 2;
        y = 30;
      }

      if (position === "bottom-right") {
        x = width - 40;
        y = 30;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize || 14,
        font,
        color: rgb(0, 0, 0),
      });
    });

    const outputBytes = await pdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="page-numbered.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add page numbers" },
      { status: 500 }
    );
  }
}