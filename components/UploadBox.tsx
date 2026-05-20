"use client";

import { Upload, FileText, X, Zap, Download } from "lucide-react";
import { useRef, useState } from "react";

type UploadBoxProps = {
  title?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
};

const modes = [
  "Under 2MB",
  "Under 5MB",
  "Under 10MB",
  "Maximum Compression",
];

export default function UploadBox({
  title = "Upload your file",
  description = "Drag and drop your file here, or click to browse.",
  accept = ".pdf",
  multiple = false,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState("Under 5MB");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const [renameFile, setRenameFile] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const [originalSize, setOriginalSize] = useState("");
  const [compressedSize, setCompressedSize] = useState("");
  const [savedPercent, setSavedPercent] = useState("");

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const selected = multiple ? newFiles : newFiles.slice(0, 1);

    setFiles(selected);
    setMessage("");
    setDownloadUrl("");
    setOriginalSize("");
    setCompressedSize("");
    setSavedPercent("");
    setRenameFile("");
    setProgress(0);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMessage("");
    setDownloadUrl("");
    setOriginalSize("");
    setCompressedSize("");
    setSavedPercent("");
    setRenameFile("");
    setProgress(0);
  }

  function formatSize(bytes: number) {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(2)} MB`;
  }

  function cleanFileName(name: string) {
    return name.trim().replace(/[<>:"/\\|?*]+/g, "-");
  }

  function getDownloadName() {
    if (!files[0]) return "compressed.pdf";

    const customName = cleanFileName(renameFile);

    if (customName) {
      return `${customName}.pdf`;
    }

    return `compressed-${files[0].name}`;
  }

  async function compressFile() {
    if (files.length === 0) {
      setMessage("Please choose a PDF first.");
      return;
    }

    let progressTimer: ReturnType<typeof setInterval> | null = null;

    try {
      setUploading(true);
      setProgress(10);
      setMessage("");
      setDownloadUrl("");

      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 500);

      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", mode);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setMessage("Compression failed.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const originalMB = files[0].size / (1024 * 1024);
      const compressedMB = blob.size / (1024 * 1024);
      const reduction = ((originalMB - compressedMB) / originalMB) * 100;

      setDownloadUrl(url);
      setOriginalSize(`${originalMB.toFixed(2)} MB`);
      setCompressedSize(`${compressedMB.toFixed(2)} MB`);
      setSavedPercent(`${Math.max(0, reduction).toFixed(0)}%`);
      setProgress(100);
      setMessage("PDF compressed successfully.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer);
      }

      setUploading(false);
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

        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        <p className="mt-3 text-base text-gray-600">{description}</p>

        <button
          type="button"
          className="mt-6 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500"
        >
          Choose File
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-5 space-y-4">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText size={20} />
                </div>

                <div>
                  <p className="max-w-[250px] truncate font-medium text-gray-900">
                    {file.name}
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
          ))}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Rename file before download
            </label>

            <input
              type="text"
              value={renameFile}
              onChange={(e) => setRenameFile(e.target.value)}
              placeholder="Example: my-compressed-file"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Leave empty to download as compressed-{files[0]?.name}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Target compression
            </p>

            <div className="grid grid-cols-2 gap-3">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    mode === item
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={compressFile}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap size={18} />
            {uploading ? "Processing..." : "Compress PDF"}
          </button>

          {uploading && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex justify-between text-sm font-medium text-blue-700">
                <span>Processing PDF...</span>
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

          {savedPercent && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
              <h3 className="text-xl font-bold text-green-700">
                Compression Complete
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Original</p>
                  <p className="font-semibold">{originalSize}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Compressed</p>
                  <p className="font-semibold">{compressedSize}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Reduced</p>
                  <p className="font-semibold text-green-700">{savedPercent}</p>
                </div>
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