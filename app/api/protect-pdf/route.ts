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
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();

    const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
    const outputPath = path.join(tempDir, `protected-${Date.now()}.pdf`);

    fs.writeFileSync(inputPath, buffer);

    const command = `gswin64c -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOwnerPassword="${password}" -sUserPassword="${password}" -dEncryptionR=4 -dKeyLength=128 -sOutputFile="${outputPath}" "${inputPath}"`;

    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    const protectedBuffer = fs.readFileSync(outputPath);

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return new Response(protectedBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="protected-pdf.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Protect PDF failed" }, { status: 500 });
  }
}