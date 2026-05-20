import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import archiver = require("archiver");

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();

    const jobId = Date.now();
    const inputPath = path.join(tempDir, `pdf-to-jpg-${jobId}.pdf`);
    const outputFolder = path.join(tempDir, `jpg-output-${jobId}`);
    const zipPath = path.join(tempDir, `jpg-pages-${jobId}.zip`);

    fs.mkdirSync(outputFolder, { recursive: true });
    fs.writeFileSync(inputPath, buffer);

    const outputPattern = path.join(outputFolder, "page-%03d.jpg");

    const command = `gswin64c -dNOPAUSE -dBATCH -dQUIET -sDEVICE=jpeg -r150 -dJPEGQ=90 -sOutputFile="${outputPattern}" "${inputPath}"`;

    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    const jpgFiles = fs
      .readdirSync(outputFolder)
      .filter((name) => name.endsWith(".jpg"));

    if (jpgFiles.length === 0) {
      return NextResponse.json(
        { error: "No JPG files created" },
        { status: 500 }
      );
    }

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolve());
      archive.on("error", (err) => reject(err));

      archive.pipe(output);

      jpgFiles.forEach((jpg) => {
        archive.file(path.join(outputFolder, jpg), { name: jpg });
      });

      archive.finalize();
    });

    const zipBuffer = fs.readFileSync(zipPath);

    fs.unlinkSync(inputPath);
    fs.rmSync(outputFolder, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="pdf-to-jpg.zip"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "PDF to JPG failed" }, { status: 500 });
  }
}