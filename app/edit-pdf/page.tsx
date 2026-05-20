import EditPdfBox from "@/components/EditPdfBox";
import Link from "next/link";
import { ArrowLeft, Pencil, Type, Download } from "lucide-react";

export default function EditPdfPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            PDF<span className="text-blue-600">Blast</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-14 text-center">
        <div className="mb-6 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-medium text-blue-700">
          Add or replace text visually
        </div>

        <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
          Edit PDF
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          Add new text or cover old text and place replacement text on your PDF.
          Useful for resumes, forms, dates and small corrections.
        </p>

        <div className="mt-10">
          <EditPdfBox />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Type className="mb-4 text-blue-600" />
          <h3 className="font-semibold">Add Text</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Add names, dates, phone numbers or descriptions to your PDF.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Pencil className="mb-4 text-blue-600" />
          <h3 className="font-semibold">Replace Visually</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Cover old text with a white box and place new text over it.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <Download className="mb-4 text-blue-600" />
          <h3 className="font-semibold">Instant Download</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Rename and download your edited PDF instantly.
          </p>
        </div>
      </section>
    </main>
  );
}