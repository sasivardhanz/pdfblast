"use client";

import { Upload, FileText, X, Download, Stamp } from "lucide-react";
import { useRef, useState } from "react";

export default function WatermarkBox() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState("44");
  const [opacity, setOpacity] = useState("0.25");

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [renameFile, setRenameFile] = useState("");
  const [message, setMessage] = useState("");

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    setFile(selectedFiles[0]);
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
    setRenameFile("");
  }

  function removeFile() {
    setFile(null);
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
    setRenameFile("");
  }

  function formatSize(bytes: number) {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  }

  function cleanFileName(name: string) {
    return name.trim().replace(/[<>:"/\\|?*]+/g, "-");
  }

  function getDownloadName() {
    const customName = cleanFileName(renameFile);
    return customName ? `${customName}.pdf` : "watermarked-pdf.pdf";
  }

  async function addWatermark() {
    if (!file) {
      setMessage("Please upload a PDF first.");
      return;
    }

    if (!watermarkText.trim()) {
      setMessage("Please enter watermark text.");
      return;
    }

    let progressTimer: ReturnType<typeof setInterval> | null = null;

    try {
      setProcessing(true);
      setProgress(10);
      setMessage("");
      setDownloadUrl("");

      progressTimer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 5));
      }, 500);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", watermarkText);
      formData.append("fontSize", fontSize);
      formData.append("opacity", opacity);

      const response = await fetch("/api/watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setMessage("Watermark failed.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);
      setMessage("Watermark added successfully.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setProcessing(false);
    }
  }

  function downloadFile() {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = getDownloadName();
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="mx-auto w-full max-w-[650px]">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="cursor-pointer rounded-[28px] border-2 border-dashed border-blue-300 bg-blue-50 px-8 py-10 text-center transition hover:border-blue-500"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
          <Upload size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Upload PDF</h2>

        <p className="mt-3 text-base text-gray-600">
          Add a custom text watermark to every page.
        </p>

        <button
          type="button"
          className="mt-6 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500"
        >
          Choose PDF
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {file && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <FileText size={20} />
              </div>

              <div>
                <p className="max-w-[250px] truncate font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Watermark Text
            </label>

            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Example: CONFIDENTIAL"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font Size
                </label>

                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  min="12"
                  max="100"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Opacity
                </label>

                <input
                  type="number"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  min="0.1"
                  max="1"
                  step="0.05"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Rename file before download
            </label>

            <input
              type="text"
              value={renameFile}
              onChange={(e) => setRenameFile(e.target.value)}
              placeholder="Example: confidential-document"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Leave empty to download as watermarked-pdf.pdf
            </p>
          </div>

          <button
            type="button"
            onClick={addWatermark}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Stamp size={18} />
            {processing ? "Adding Watermark..." : "Add Watermark"}
          </button>

          {processing && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex justify-between text-sm font-medium text-blue-700">
                <span>Adding watermark...</span>
                <span>{progress}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {downloadUrl && (
            <button
              type="button"
              onClick={downloadFile}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-500"
            >
              <Download size={18} />
              Download {getDownloadName()}
            </button>
          )}

          {message && (
            <p className="text-center text-sm font-medium text-green-600">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}