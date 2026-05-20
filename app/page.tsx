import Link from "next/link";

import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import {
  FileArchive,
  Images,
  Merge,
  Scissors,
  Trash2,
  RotateCw,
  Stamp,
  Hash,
  Lock,
  Unlock,
  ImageDown,
  Pencil,
} from "lucide-react";

const tools = [
  {
    title: "Compress PDF",
    desc: "Reduce huge PDFs up to 90%. Supports up to 500MB.",
    icon: FileArchive,
    href: "/compress",
  },

  {
    title: "Images to PDF",
    desc: "Convert JPG, PNG and WebP images into one PDF.",
    icon: Images,
    href: "/images-to-pdf",
  },

  {
    title: "PDF to JPG",
    desc: "Convert every PDF page into JPG images.",
    icon: ImageDown,
    href: "/pdf-to-jpg",
  },

  {
    title: "Merge PDF",
    desc: "Combine multiple PDFs into one file.",
    icon: Merge,
    href: "/merge",
  },

  {
    title: "Split PDF",
    desc: "Extract selected pages from your PDF.",
    icon: Scissors,
    href: "/split",
  },

  {
    title: "Remove Pages",
    desc: "Select and remove unwanted pages from your PDF.",
    icon: Trash2,
    href: "/remove-pages",
  },

  {
    title: "Rotate PDF",
    desc: "Rotate PDF pages left, right or 180 degrees.",
    icon: RotateCw,
    href: "/rotate-pdf",
  },

  {
    title: "Watermark PDF",
    desc: "Add custom text watermark to your PDF.",
    icon: Stamp,
    href: "/watermark",
  },

  {
    title: "Page Numbers",
    desc: "Add page numbers with custom positions.",
    icon: Hash,
    href: "/page-numbers",
  },

  {
    title: "Protect PDF",
    desc: "Add password protection to your PDF.",
    icon: Lock,
    href: "/protect-pdf",
  },

  {
    title: "Unlock PDF",
    desc: "Remove password protection with the correct password.",
    icon: Unlock,
    href: "/unlock-pdf",
  },

  {
    title: "Edit PDF",
    desc: "Add or visually replace text inside PDFs.",
    icon: Pencil,
    href: "/edit-pdf",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            PDF
            <span className="text-blue-600">
              Blast
            </span>
          </Link>

          <div className="hidden gap-6 text-sm font-medium text-gray-600 lg:flex">
            <Link href="/compress">
              Compress
            </Link>

            <Link href="/images-to-pdf">
              Images to PDF
            </Link>

            <Link href="/pdf-to-jpg">
              PDF to JPG
            </Link>

            <Link href="/merge">
              Merge
            </Link>

            <Link href="/split">
              Split
            </Link>

            <Link href="/edit-pdf">
              Edit PDF
            </Link>

            <Link href="/protect-pdf">
              Protect PDF
            </Link>
          </div>

          {/* AUTH */}
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Login
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Sign Up
              </button>
            </SignUpButton>

            <UserButton />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
              Fast • Secure • Professional PDF Tools
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-7xl">
              Everything You Need

              <span className="block text-blue-600">
                For PDF Editing
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-600">
              Compress, merge, split,
              edit, rotate, watermark,
              protect and convert PDFs
              with a fast modern workflow
              designed for large files.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/compress"
                className="rounded-2xl bg-blue-600 px-8 py-4 text-center font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500"
              >
                Start Editing PDFs
              </Link>

              <Link
                href="/edit-pdf"
                className="rounded-2xl border border-gray-200 bg-white px-8 py-4 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Edit PDF
              </Link>
            </div>

            <div className="mt-12 rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-sm backdrop-blur">
              <p className="text-lg italic leading-8 text-gray-700">
                “Simple tools create
                powerful workflows.”
              </p>

              <p className="mt-3 text-sm font-semibold text-blue-600">
                — PDFBlast
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="relative rounded-[40px] border border-gray-200 bg-white p-6 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1400&auto=format&fit=crop"
                alt="PDF workspace"
                className="h-[500px] w-full rounded-[28px] object-cover"
              />

              <div className="absolute bottom-10 left-10 rounded-2xl bg-white/90 px-5 py-4 shadow-lg backdrop-blur">
                <p className="text-sm font-medium text-gray-500">
                  Trusted PDF Workflow
                </p>

                <p className="text-xl font-bold text-gray-900">
                  Fast & Secure Editing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            All PDF Tools
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Powerful tools designed for
            students, professionals,
            freelancers and businesses.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-110">
                  <Icon size={26} />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {tool.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MOTIVATION */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-16 text-center shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
            Motivation
          </p>

          <h2 className="mx-auto mt-6 max-w-4xl text-3xl font-bold leading-tight text-white md:text-5xl">
            “Small improvements every day
            create extraordinary results.”
          </h2>

          <p className="mt-6 text-lg text-blue-100">
            Build faster. Work smarter.
            Stay productive.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              PDF
              <span className="text-blue-600">
                Blast
              </span>
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Professional PDF tools for
              fast, secure and modern
              workflows.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            © 2026 PDFBlast. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}