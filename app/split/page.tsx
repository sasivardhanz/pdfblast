import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const fromPage = Number(data.get("fromPage"));
    const toPage = Number(data.get("toPage"));

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);

    const totalPages = pdf.getPageCount();

    if (
      !fromPage ||
      !toPage ||
      fromPage < 1 ||
      toPage < 1 ||
      fromPage > totalPages ||
      toPage > totalPages ||
      fromPage > toPage
    ) {
      return NextResponse.json(
        { error: `Enter valid page range between 1 and ${totalPages}` },
        { status: 400 }
      );
    }

    const newPdf = await PDFDocument.create();

    const pageIndexes: number[] = [];

    for (let i = fromPage - 1; i <= toPage - 1; i++) {
      pageIndexes.push(i);
    }

    const copiedPages = await newPdf.copyPages(pdf, pageIndexes);

    copiedPages.forEach((page) => {
      newPdf.addPage(page);
    });

    const splitBytes = await newPdf.save();

    return new Response(Buffer.from(splitBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="extracted-pages.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Split failed" }, { status: 500 });
  }
}