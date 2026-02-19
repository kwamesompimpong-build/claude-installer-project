"use client";

import { useState, useEffect, use } from "react";
import { Book, PublishingChecklist } from "@/types/book";
import {
  getBook,
  saveBook,
  exportAsText,
  exportAsHtml,
  getTotalWordCount,
} from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CHECKLIST_ITEMS: {
  key: keyof PublishingChecklist;
  label: string;
  description: string;
  guide: string;
}[] = [
  {
    key: "manuscriptComplete",
    label: "Manuscript Complete",
    description: "All chapters are written and in their final form.",
    guide: "Review each chapter and mark it as 'Final' when you're satisfied with the content.",
  },
  {
    key: "editingComplete",
    label: "Editing Complete",
    description: "Professional or thorough self-editing has been done.",
    guide: "Consider hiring a professional editor, or at minimum do multiple rounds of self-editing. Read your work aloud to catch awkward phrasing.",
  },
  {
    key: "proofread",
    label: "Proofreading Done",
    description: "A final proofread for typos, grammar, and formatting.",
    guide: "This should be the very last pass. Have a fresh pair of eyes look at it — a friend, family member, or professional proofreader.",
  },
  {
    key: "bookDescription",
    label: "Book Description / Back Cover",
    description: "A compelling description for your book listing.",
    guide: "Write 150-250 words that hook the reader. Start with the emotional core of your story. Mention who the book is for. End with what readers will gain from it.",
  },
  {
    key: "authorBio",
    label: "Author Bio",
    description: "A short biography about you as the author.",
    guide: "Write 100-150 words in third person. Mention your caregiving experience, your connection to the topic, and anything that establishes your credibility and warmth.",
  },
  {
    key: "coverDesign",
    label: "Cover Design",
    description: "A professional book cover has been designed.",
    guide: "Your cover is the first thing readers see. Consider hiring a cover designer (services like 99designs or Reedsy). For the caregiving genre, warm colors and simple, dignified imagery work well.",
  },
  {
    key: "isbn",
    label: "ISBN Obtained",
    description: "You have an ISBN for your book.",
    guide: "You can get a free ISBN through many self-publishing platforms (like Amazon KDP). If you want to sell through bookstores, purchase your own through Bowker (US) or your country's ISBN agency.",
  },
  {
    key: "copyrightPage",
    label: "Copyright Page",
    description: "Copyright notice, ISBN, and legal information.",
    guide: "Include: Copyright \u00A9 [Year] [Your Name]. All rights reserved. ISBN. Publisher name (can be your own). Edition information.",
  },
  {
    key: "formatting",
    label: "Book Formatting",
    description: "The manuscript is properly formatted for publishing.",
    guide: "Format for both ebook (EPUB) and print (PDF). Use consistent fonts, margins, and spacing. Tools like Reedsy Book Editor, Vellum (Mac), or Atticus can help.",
  },
  {
    key: "backMatter",
    label: "Back Matter",
    description: "Acknowledgments, resources, or appendices.",
    guide: "Consider including: Acknowledgments, a resource list for caregivers (support groups, websites, hotlines), recommended reading, and a note inviting readers to connect with you.",
  },
];

const PUBLISHING_PATHS = [
  {
    name: "Amazon KDP",
    description:
      "The largest self-publishing platform. Publish ebook and paperback.",
    pros: "Massive reach, free to publish, print-on-demand",
  },
  {
    name: "IngramSpark",
    description: "Distribute to bookstores and libraries worldwide.",
    pros: "Wider bookstore distribution, library access, professional credibility",
  },
  {
    name: "Barnes & Noble Press",
    description: "Publish directly to Barnes & Noble's platform.",
    pros: "Direct B&N distribution, ebook and print options",
  },
  {
    name: "Draft2Digital",
    description: "Distribute to multiple retailers from one platform.",
    pros: "Wide distribution, easy formatting tools, no exclusivity required",
  },
];

export default function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    const b = getBook(id);
    if (!b) {
      router.push("/");
      return;
    }
    setBook(b);
  }, [id, router]);

  if (!book) return null;

  const checklist = book.publishingChecklist;
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const publishProgress = Math.round((completedCount / totalCount) * 100);
  const wordCount = getTotalWordCount(book);

  const toggleChecklistItem = (key: keyof PublishingChecklist) => {
    const updated = {
      ...book,
      publishingChecklist: {
        ...book.publishingChecklist,
        [key]: !book.publishingChecklist[key],
      },
    };
    saveBook(updated);
    setBook(updated);
  };

  const handleExportText = () => {
    const text = exportAsText(book);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const html = exportAsHtml(book);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 border-b border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link
            href={`/book/${book.id}`}
            className="text-warm-500 hover:text-warm-700"
          >
            &larr; Back to {book.title}
          </Link>
          <h1 className="text-3xl font-serif font-bold text-warm-900 mt-2">
            Publishing Checklist
          </h1>
          <p className="text-warm-600 mt-1">
            Everything you need to get your book to market
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif font-semibold text-xl">
              Publishing Readiness
            </h2>
            <span className="text-warm-600">
              {completedCount} / {totalCount} complete
            </span>
          </div>
          <div className="w-full bg-warm-100 rounded-full h-4">
            <div
              className="bg-sage-500 h-4 rounded-full transition-all"
              style={{ width: `${publishProgress}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-warm-600">
            <p>
              Manuscript: {wordCount.toLocaleString()} words across{" "}
              {book.chapters.length} chapters
            </p>
            <p>
              Chapters finalized:{" "}
              {book.chapters.filter((c) => c.status === "final").length} /{" "}
              {book.chapters.length}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-10">
          {CHECKLIST_ITEMS.map((item) => (
            <ChecklistItem
              key={item.key}
              item={item}
              checked={checklist[item.key]}
              onToggle={() => toggleChecklistItem(item.key)}
            />
          ))}
        </div>

        {/* Export section */}
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
          <h2 className="font-serif font-semibold text-xl mb-4">
            Export Your Manuscript
          </h2>
          <p className="text-warm-600 mb-4">
            Download your book for editing, formatting, or submission to
            publishing platforms.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleExportText}
              className="bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 transition-colors"
            >
              Download as Text (.txt)
            </button>
            <button
              onClick={handleExportHtml}
              className="border border-sage-600 text-sage-700 px-6 py-3 rounded-xl hover:bg-sage-50 transition-colors"
            >
              Download as HTML (printable)
            </button>
          </div>
        </div>

        {/* Publishing paths */}
        <div>
          <h2 className="font-serif font-semibold text-xl mb-4">
            Publishing Platforms
          </h2>
          <p className="text-warm-600 mb-4">
            Here are the main platforms where you can self-publish your book.
            Many authors publish on multiple platforms for maximum reach.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {PUBLISHING_PATHS.map((platform) => (
              <div
                key={platform.name}
                className="bg-white rounded-2xl border border-warm-200 p-6"
              >
                <h3 className="font-semibold text-warm-900 text-lg">
                  {platform.name}
                </h3>
                <p className="text-warm-600 mt-1">{platform.description}</p>
                <p className="text-sage-600 mt-2">{platform.pros}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ChecklistItem({
  item,
  checked,
  onToggle,
}: {
  item: (typeof CHECKLIST_ITEMS)[number];
  checked: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-colors ${
        checked ? "border-sage-300 bg-sage-50/50" : "border-warm-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            checked
              ? "bg-sage-600 border-sage-600 text-white"
              : "border-warm-300"
          }`}
        >
          {checked && (
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3
              className={`font-medium text-lg ${checked ? "text-sage-700 line-through" : "text-warm-900"}`}
            >
              {item.label}
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-warm-400 hover:text-warm-600 px-3 py-1 rounded-lg hover:bg-warm-50 transition-colors"
            >
              {expanded ? "Hide guide" : "How to do this"}
            </button>
          </div>
          <p className="text-warm-500 mt-1">{item.description}</p>
          {expanded && (
            <div className="mt-3 p-4 bg-parchment rounded-xl text-warm-700 leading-relaxed">
              {item.guide}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
