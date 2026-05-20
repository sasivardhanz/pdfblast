"use client";

import {
  Upload,
  FileText,
  X,
  Download,
  Combine,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRef, useState } from "react";

export default function MergeUploadBox() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [renameFile, setRenameFile] = useState("");
  const [message, setMessage] = useState("");

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    setFiles(Array.from(selectedFiles));
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
    setRenameFile("");
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
  }

  function moveFile(index: number, direction: "up" | "down") {
    setFiles((prev) => {
      const newFiles = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= newFiles.length) return prev;

      [newFiles[index], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[index],
      ];

      return newFiles;
    });

    setDownloadUrl("");
    setMessage("");
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
    return customName ? `${customName}.pdf` : "merged-pdf.pdf";
  }

  async function mergeFiles() {
    if (files.length < 2) {
      setMessage("Please upload at least 2 PDFs.");
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
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setMessage("Merge failed.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);
      setMessage("PDFs merged successfully.");
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

        <h2 className="text-2xl font-bold text-gray-900">
          Upload PDFs to Merge
        </h2>

        <p className="mt-3 text-base text-gray-600">
          Choose two or more PDF files and arrange them in order.
        </p>

        <button
          type="button"
          className="mt-6 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500"
        >
          Choose PDFs
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-5 space-y-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {index + 1}. {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => moveFile(index, "up")}
                  disabled={index === 0}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp size={16} />
                  Move Up
                </button>

                <button
                  type="button"
                  onClick={() => moveFile(index, "down")}
                  disabled={index === files.length - 1}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown size={16} />
                  Move Down
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Rename file before download
            </label>

            <input
              type="text"
              value={renameFile}
              onChange={(e) => setRenameFile(e.target.value)}
              placeholder="Example: my-merged-file"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Leave empty to download as merged-pdf.pdf
            </p>
          </div>

          <button
            type="button"
            onClick={mergeFiles}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Combine size={18} />
            {processing ? "Merging..." : "Merge PDFs"}
          </button>

          {processing && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex justify-between text-sm font-medium text-blue-700">
                <span>Merging PDFs...</span>
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