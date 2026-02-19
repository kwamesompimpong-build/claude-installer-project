"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Book, Chapter, ChapterStatus } from "@/types/book";
import { getBook, updateChapter, countWords } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS: { value: ChapterStatus; label: string }[] = [
  { value: "outline", label: "Outline" },
  { value: "draft", label: "Draft" },
  { value: "revision", label: "Revision" },
  { value: "final", label: "Final" },
];

export default function WritePage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id, chapterId } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ChapterStatus>("outline");
  const [showNotes, setShowNotes] = useState(false);
  const [saved, setSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("");

  useEffect(() => {
    const b = getBook(id);
    if (!b) {
      router.push("/");
      return;
    }
    const ch = b.chapters.find((c) => c.id === chapterId);
    if (!ch) {
      router.push(`/book/${id}`);
      return;
    }
    setBook(b);
    setChapter(ch);
    setContent(ch.content);
    setTitle(ch.title);
    setNotes(ch.notes);
    setStatus(ch.status);
  }, [id, chapterId, router]);

  const save = useCallback(() => {
    if (!chapter || !book) return;
    const updated: Chapter = {
      ...chapter,
      title,
      content,
      notes,
      status,
      wordCount: countWords(content),
    };
    updateChapter(book.id, updated);
    setChapter(updated);
    setSaved(true);
    setLastSaved(new Date().toLocaleTimeString());
  }, [chapter, book, title, content, notes, status]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!saved) save();
    }, 30000);
    return () => clearInterval(interval);
  }, [saved, save]);

  // Keyboard shortcut to save (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  if (!book || !chapter) return null;

  const words = countWords(content);
  const prevChapter = book.chapters.find((c) => c.order === chapter.order - 1);
  const nextChapter = book.chapters.find((c) => c.order === chapter.order + 1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white/90 border-b border-warm-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/book/${book.id}`}
              className="text-warm-500 hover:text-warm-700 text-sm"
            >
              ← {book.title}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-warm-400">
              {words.toLocaleString()} words
            </span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ChapterStatus);
                setSaved(false);
              }}
              className="text-xs border border-warm-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                showNotes
                  ? "bg-sage-50 border-sage-300 text-sage-700"
                  : "border-warm-300 text-warm-500 hover:bg-warm-50"
              }`}
            >
              Notes
            </button>
            <button
              onClick={save}
              className={`text-xs px-4 py-1.5 rounded-lg transition-colors ${
                saved
                  ? "bg-warm-100 text-warm-500"
                  : "bg-sage-600 text-white hover:bg-sage-700"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Writing area */}
      <div className="flex-1 flex">
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {/* Chapter title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            className="w-full text-2xl font-serif font-bold text-warm-900 mb-6 bg-transparent border-none focus:outline-none placeholder-warm-300"
            placeholder="Chapter Title"
          />

          {/* Main editor */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            className="w-full min-h-[60vh] bg-transparent border-none focus:outline-none resize-none text-warm-800 leading-relaxed text-lg font-serif placeholder-warm-300"
            placeholder="Start writing... Let your story flow. You can always edit later."
          />
        </div>

        {/* Notes sidebar */}
        {showNotes && (
          <div className="w-80 bg-white border-l border-warm-200 p-4">
            <h3 className="font-semibold text-sm text-warm-700 mb-3">
              Chapter Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              className="w-full h-64 border border-warm-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              placeholder="Jot down ideas, reminders, or research notes for this chapter..."
            />
            <p className="text-xs text-warm-400 mt-2">
              Notes are private and won&apos;t appear in the exported book.
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <footer className="bg-white/90 border-t border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            {prevChapter && (
              <Link
                href={`/book/${book.id}/write/${prevChapter.id}`}
                className="text-warm-500 hover:text-sage-700"
              >
                ← {prevChapter.title}
              </Link>
            )}
          </div>
          <span className="text-warm-400 text-xs">
            {lastSaved ? `Last saved: ${lastSaved}` : "Ctrl+S to save"}
          </span>
          <div className="flex gap-4">
            {nextChapter && (
              <Link
                href={`/book/${book.id}/write/${nextChapter.id}`}
                className="text-warm-500 hover:text-sage-700"
              >
                {nextChapter.title} →
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
