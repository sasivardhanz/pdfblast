"use client";

import { Upload, FileText, X, Download, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function EditPdfBox() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const [pageNumber, setPageNumber] = useState("1");
  const [text, setText] = useState("");
  const [x, setX] = useState("50");
  const [y, setY] = useState("700");
  const [fontSize, setFontSize] = useState("14");
  const [color, setColor] = useState("black");
  const [coverOldText, setCoverOldText] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [renameFile, setRenameFile] = useState("");
  const [message, setMessage] = useState("");

  async function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const selectedFile = selectedFiles[0];

    setFile(selectedFile);
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
    setRenameFile("");
    setText("");
    setPageNumber("1");
    setTotalPages(0);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setTotalPages(pdf.getPageCount());
    } catch {
      setMessage("Could not read PDF pages.");
    }
  }

  function removeFile() {
    setFile(null);
    setTotalPages(0);
    setDownloadUrl("");
    setMessage("");
    setProgress(0);
    setRenameFile("");
    setText("");
    setPageNumber("1");
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
    return customName ? `${customName}.pdf` : "edited-pdf.pdf";
  }

  async function editPdf() {
    if (!file) {
      setMessage("Please upload a PDF first.");
      return;
    }

    if (!text.trim()) {
      setMessage("Please enter text to add.");
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
      formData.append("pageNumber", pageNumber);
      formData.append("text", text);
      formData.append("x", x);
      formData.append("y", y);
      formData.append("fontSize", fontSize);
      formData.append("color", color);
      formData.append("coverOldText", String(coverOldText));

      const response = await fetch("/api/edit-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || "Edit PDF failed.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProgress(100);
      setMessage("PDF edited successfully.");
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
    <div className="mx-auto w-full max-w-[700px]">
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

        <h2 className="text-2xl font-bold text-gray-900">Upload PDF to Edit</h2>

        <p className="mt-3 text-base text-gray-600">
          Add new text or cover old text and replace it visually.
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
                <p className="max-w-[270px] truncate font-medium text-gray-900">
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

          {totalPages > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
              <p className="font-semibold text-blue-700">
                This PDF has {totalPages} pages
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Text to add / replace
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: Updated phone number, name, date, or description"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Page Number
                </label>

                <input
                  type="number"
                  min="1"
                  max={totalPages || 1}
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font Size
                </label>

                <input
                  type="number"
                  min="8"
                  max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  X Position
                </label>

                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Y Position
                </label>

                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Text Color
                </label>

                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="black">Black</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={coverOldText}
                  onChange={(e) => setCoverOldText(e.target.checked)}
                />
                Cover old text with white box
              </label>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Tip: Increase/decrease X and Y position until text appears in the correct place.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Rename file before download
            </label>

            <input
              type="text"
              value={renameFile}
              onChange={(e) => setRenameFile(e.target.value)}
              placeholder="Example: edited-resume"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Leave empty to download as edited-pdf.pdf
            </p>
          </div>

          <button
            type="button"
            onClick={editPdf}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <Pencil size={18} />
            {processing ? "Editing..." : "Edit PDF"}
          </button>

          {processing && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 flex justify-between text-sm font-medium text-blue-700">
                <span>Editing PDF...</span>
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