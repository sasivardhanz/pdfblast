import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    const mode = data.get("mode") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();

    const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
    const outputPath = path.join(tempDir, `compressed-${Date.now()}.pdf`);

    fs.writeFileSync(inputPath, buffer);

    let command = "";

    if (mode === "Under 2MB") {
      command = `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.3 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -dSubsetFonts=true -dDownsampleColorImages=true -dColorImageDownsampleType=/Subsample -dColorImageResolution=20 -dDownsampleGrayImages=true -dGrayImageDownsampleType=/Subsample -dGrayImageResolution=20 -dDownsampleMonoImages=true -dMonoImageDownsampleType=/Subsample -dMonoImageResolution=20 -sOutputFile="${outputPath}" "${inputPath}"`;
    } else if (mode === "Under 5MB") {
      command = `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.3 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -dSubsetFonts=true -dDownsampleColorImages=true -dColorImageResolution=35 -dDownsampleGrayImages=true -dGrayImageResolution=35 -dDownsampleMonoImages=true -dMonoImageResolution=35 -sOutputFile="${outputPath}" "${inputPath}"`;
    } else if (mode === "Maximum Compression") {
      command = `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.3 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -dSubsetFonts=true -dDownsampleColorImages=true -dColorImageResolution=15 -dDownsampleGrayImages=true -dGrayImageResolution=15 -dDownsampleMonoImages=true -dMonoImageResolution=15 -sOutputFile="${outputPath}" "${inputPath}"`;
    } else {
      command = `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -dSubsetFonts=true -sOutputFile="${outputPath}" "${inputPath}"`;
    }

    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    const compressedBuffer = fs.readFileSync(outputPath);

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return new Response(compressedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Compression failed" }, { status: 500 });
  }
}