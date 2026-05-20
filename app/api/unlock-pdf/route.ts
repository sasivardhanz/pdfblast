import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const file = data.get("file") as File;
    const password = data.get("password") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF uploaded" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const tempDir = os.tmpdir();

    const inputPath = path.join(
      tempDir,
      `locked-${Date.now()}.pdf`
    );

    const outputPath = path.join(
      tempDir,
      `unlocked-${Date.now()}.pdf`
    );

    fs.writeFileSync(inputPath, buffer);

    const command = `gswin64c -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -sPDFPassword="${password}" -sOutputFile="${outputPath}" "${inputPath}"`;

    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    const unlockedBuffer =
      fs.readFileSync(outputPath);

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return new Response(unlockedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="unlocked-pdf.pdf"',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unlock PDF failed" },
      { status: 500 }
    );
  }
}