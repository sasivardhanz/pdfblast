import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const selectedPagesRaw = data.get("selectedPages") as string;

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (!selectedPagesRaw) {
      return NextResponse.json({ error: "No pages selected" }, { status: 400 });
    }

    const selectedPages = JSON.parse(selectedPagesRaw) as number[];

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const totalPages = pdf.getPageCount();

    const pagesToKeep = [];

    for (let i = 0; i < totalPages; i++) {
      const pageNumber = i + 1;

      if (!selectedPages.includes(pageNumber)) {
        pagesToKeep.push(i);
      }
    }

    if (pagesToKeep.length === 0) {
      return NextResponse.json(
        { error: "You cannot remove all pages" },
        { status: 400 }
      );
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);

    copiedPages.forEach((page) => newPdf.addPage(page));

    const outputBytes = await newPdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="removed-pages.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Remove pages failed" }, { status: 500 });
  }
}
