"use client";

import { useState, useEffect, use } from "react";
import { Book } from "@/types/book";
import { getBook, addChapter } from "@/lib/storage";
import {
  WRITING_PROMPTS,
  CATEGORY_LABELS,
  SUGGESTED_OUTLINE,
  getRandomPrompt,
} from "@/lib/prompts";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PromptsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [spotlight, setSpotlight] = useState(getRandomPrompt());
  const [showOutline, setShowOutline] = useState(false);

  useEffect(() => {
    const b = getBook(id);
    if (!b) {
      router.push("/");
      return;
    }
    setBook(b);
  }, [id, router]);

  if (!book) return null;

  const categories = Object.keys(CATEGORY_LABELS);
  const filteredPrompts =
    activeCategory === "all"
      ? WRITING_PROMPTS
      : WRITING_PROMPTS.filter((p) => p.category === activeCategory);

  const handleUseAsChapter = (promptText: string) => {
    const shortTitle =
      promptText.length > 60
        ? promptText.substring(0, 57) + "..."
        : promptText;
    const chapter = addChapter(book.id, shortTitle);
    if (chapter) {
      router.push(`/book/${book.id}/write/${chapter.id}`);
    }
  };

  const handleApplyOutline = () => {
    if (
      book.chapters.length > 0 &&
      !confirm(
        "This will add suggested chapters to your existing chapters. Continue?"
      )
    ) {
      return;
    }
    SUGGESTED_OUTLINE.forEach((title) => {
      addChapter(book.id, title);
    });
    router.push(`/book/${book.id}`);
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
            Writing Prompts & Inspiration
          </h1>
          <p className="text-warm-600 mt-1">
            Guided prompts to help you tell your story
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Spotlight prompt */}
        <div className="bg-sage-600 text-white rounded-2xl p-8 mb-8">
          <p className="text-sage-200 text-sm uppercase tracking-wide mb-3">
            Writing Prompt
          </p>
          <p className="text-2xl font-serif leading-relaxed mb-6">
            &ldquo;{spotlight.text}&rdquo;
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSpotlight(getRandomPrompt())}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-colors"
            >
              Another Prompt
            </button>
            <button
              onClick={() => handleUseAsChapter(spotlight.text)}
              className="bg-white text-sage-700 px-6 py-3 rounded-xl hover:bg-sage-50 transition-colors font-medium"
            >
              Start Writing This
            </button>
          </div>
        </div>

        {/* Suggested outline */}
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-serif font-semibold text-xl">
                Suggested Book Outline
              </h2>
              <p className="text-warm-500 mt-1">
                A proven structure for caregiving memoirs — customize it to
                make it your own
              </p>
            </div>
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="text-sage-600 hover:text-sage-700 font-medium px-4 py-2 rounded-xl hover:bg-sage-50 transition-colors"
            >
              {showOutline ? "Hide" : "Show"} Outline
            </button>
          </div>
          {showOutline && (
            <div className="mt-4">
              <ol className="space-y-3">
                {SUGGESTED_OUTLINE.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-warm-700"
                  >
                    <span className="text-warm-400 font-mono w-8">
                      {i + 1}.
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <button
                onClick={handleApplyOutline}
                className="mt-6 bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 transition-colors"
              >
                Use This Outline (Add as Chapters)
              </button>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full transition-colors ${
              activeCategory === "all"
                ? "bg-sage-600 text-white"
                : "bg-white border border-warm-200 text-warm-600 hover:bg-warm-50"
            }`}
          >
            All Prompts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full transition-colors ${
                activeCategory === cat
                  ? "bg-sage-600 text-white"
                  : "bg-white border border-warm-200 text-warm-600 hover:bg-warm-50"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Prompts grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white rounded-2xl border border-warm-200 p-6 hover:shadow-sm transition-shadow"
            >
              <p className="text-sm text-sage-600 uppercase tracking-wide mb-2">
                {CATEGORY_LABELS[prompt.category]}
              </p>
              <p className="text-warm-800 font-serif leading-relaxed text-lg mb-4">
                {prompt.text}
              </p>
              <button
                onClick={() => handleUseAsChapter(prompt.text)}
                className="text-sage-600 hover:text-sage-800 font-medium"
              >
                Start Writing &rarr;
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
