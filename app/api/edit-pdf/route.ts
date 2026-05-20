import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const pageNumber = Number(data.get("pageNumber"));
    const text = data.get("text") as string;
    const x = Number(data.get("x"));
    const y = Number(data.get("y"));
    const fontSize = Number(data.get("fontSize"));
    const color = data.get("color") as string;
    const coverOldText = data.get("coverOldText") === "true";

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = pdf.getPages();

    if (pageNumber < 1 || pageNumber > pages.length) {
      return NextResponse.json(
        { error: `Page number must be between 1 and ${pages.length}` },
        { status: 400 }
      );
    }

    const page = pages[pageNumber - 1];
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const finalFontSize = fontSize || 14;

    let textColor = rgb(0, 0, 0);

    if (color === "blue") textColor = rgb(0, 0.2, 0.8);
    if (color === "red") textColor = rgb(0.8, 0, 0);
    if (color === "green") textColor = rgb(0, 0.5, 0);

    if (coverOldText) {
      page.drawRectangle({
        x,
        y: y - 4,
        width: text.length * finalFontSize * 0.65,
        height: finalFontSize + 8,
        color: rgb(1, 1, 1),
      });
    }

    page.drawText(text, {
      x,
      y,
      size: finalFontSize,
      font,
      color: textColor,
    });

    const outputBytes = await pdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="edited-pdf.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Edit PDF failed" }, { status: 500 });
  }
}