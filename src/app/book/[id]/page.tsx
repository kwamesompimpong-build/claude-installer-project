"use client";

import { useState, useEffect, use } from "react";
import { Book, ChapterStatus } from "@/types/book";
import { getBook, saveBook, addChapter, deleteChapter, getTotalWordCount } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<ChapterStatus, string> = {
  outline: "Outline",
  draft: "Draft",
  revision: "Revision",
  final: "Final",
};

const STATUS_COLORS: Record<ChapterStatus, string> = {
  outline: "bg-warm-200 text-warm-700",
  draft: "bg-yellow-100 text-yellow-800",
  revision: "bg-blue-100 text-blue-800",
  final: "bg-green-100 text-green-800",
};

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);

  useEffect(() => {
    const b = getBook(id);
    if (!b) {
      router.push("/");
      return;
    }
    setBook(b);
  }, [id, router]);

  if (!book) return null;

  const wordCount = getTotalWordCount(book);
  const progress = Math.min(100, Math.round((wordCount / book.targetWordCount) * 100));

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    addChapter(book.id, newChapterTitle.trim());
    setBook(getBook(book.id) || book);
    setNewChapterTitle("");
    setShowNewChapter(false);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm("Delete this chapter?")) {
      deleteChapter(book.id, chapterId);
      setBook(getBook(book.id) || book);
    }
  };

  const handleSaveDetails = () => {
    saveBook(book);
    setEditingDetails(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-warm-500 hover:text-warm-700 text-sm">
            ← Back to Books
          </Link>
          <h1 className="text-2xl font-serif font-bold text-warm-900 mt-2">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="text-warm-500 italic">{book.subtitle}</p>
          )}
          <p className="text-warm-600 text-sm">by {book.authorName}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-warm-200 p-4 text-center">
            <p className="text-2xl font-bold text-sage-700">
              {wordCount.toLocaleString()}
            </p>
            <p className="text-xs text-warm-500">words written</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-200 p-4 text-center">
            <p className="text-2xl font-bold text-sage-700">
              {book.chapters.length}
            </p>
            <p className="text-xs text-warm-500">chapters</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-200 p-4 text-center">
            <p className="text-2xl font-bold text-sage-700">{progress}%</p>
            <p className="text-xs text-warm-500">word goal</p>
          </div>
          <div className="bg-white rounded-xl border border-warm-200 p-4 text-center">
            <p className="text-2xl font-bold text-sage-700">
              {book.chapters.filter((c) => c.status === "final").length}
            </p>
            <p className="text-xs text-warm-500">chapters finalized</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-warm-100 rounded-full h-3">
            <div
              className="bg-sage-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-warm-500 mt-1">
            {wordCount.toLocaleString()} / {book.targetWordCount.toLocaleString()} words
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Link
            href={`/book/${book.id}/prompts`}
            className="bg-white border border-warm-200 px-5 py-2.5 rounded-lg hover:bg-sage-50 hover:border-sage-300 transition-colors text-sm font-medium"
          >
            ✨ Writing Prompts
          </Link>
          <Link
            href={`/book/${book.id}/publish`}
            className="bg-white border border-warm-200 px-5 py-2.5 rounded-lg hover:bg-sage-50 hover:border-sage-300 transition-colors text-sm font-medium"
          >
            📦 Publishing Checklist
          </Link>
          <button
            onClick={() => setEditingDetails(!editingDetails)}
            className="bg-white border border-warm-200 px-5 py-2.5 rounded-lg hover:bg-sage-50 hover:border-sage-300 transition-colors text-sm font-medium"
          >
            ⚙️ Book Details
          </button>
        </div>

        {/* Book details editor */}
        {editingDetails && (
          <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8">
            <h2 className="font-serif font-semibold text-lg mb-4">
              Book Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-warm-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) => setBook({ ...book, title: e.target.value })}
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={book.subtitle}
                  onChange={(e) =>
                    setBook({ ...book, subtitle: e.target.value })
                  }
                  placeholder="Optional subtitle"
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-700 mb-1">
                  Genre
                </label>
                <input
                  type="text"
                  value={book.genre}
                  onChange={(e) => setBook({ ...book, genre: e.target.value })}
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-700 mb-1">
                  Word Count Goal
                </label>
                <input
                  type="number"
                  value={book.targetWordCount}
                  onChange={(e) =>
                    setBook({
                      ...book,
                      targetWordCount: parseInt(e.target.value) || 50000,
                    })
                  }
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-warm-700 mb-1">
                  Book Description
                </label>
                <textarea
                  value={book.description}
                  onChange={(e) =>
                    setBook({ ...book, description: e.target.value })
                  }
                  rows={3}
                  placeholder="A brief description of your book (useful for the back cover and publishing)"
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
            </div>
            <button
              onClick={handleSaveDetails}
              className="mt-4 bg-sage-600 text-white px-6 py-2 rounded-lg hover:bg-sage-700 transition-colors"
            >
              Save Details
            </button>
          </div>
        )}

        {/* Chapters */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-serif font-semibold">Chapters</h2>
          <button
            onClick={() => setShowNewChapter(true)}
            className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors text-sm"
          >
            + Add Chapter
          </button>
        </div>

        {showNewChapter && (
          <div className="bg-white rounded-xl border border-warm-200 p-4 mb-4 flex gap-3">
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
              placeholder="Chapter title..."
              className="flex-1 border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
              autoFocus
            />
            <button
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
              className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowNewChapter(false);
                setNewChapterTitle("");
              }}
              className="border border-warm-300 px-4 py-2 rounded-lg hover:bg-warm-50"
            >
              Cancel
            </button>
          </div>
        )}

        {book.chapters.length === 0 ? (
          <div className="bg-white rounded-xl border border-warm-200 p-10 text-center">
            <p className="text-warm-500 mb-4">No chapters yet.</p>
            <p className="text-warm-400 text-sm max-w-md mx-auto">
              Start by adding your first chapter. If you need inspiration, check
              out the Writing Prompts section — it has guided prompts tailored
              for caregiving memoirs.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {book.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-xl border border-warm-200 p-4 hover:shadow-sm transition-shadow flex items-center gap-4"
                >
                  <span className="text-warm-400 text-sm font-mono w-8">
                    {chapter.order}.
                  </span>
                  <Link
                    href={`/book/${book.id}/write/${chapter.id}`}
                    className="flex-1"
                  >
                    <h3 className="font-medium text-warm-900 hover:text-sage-700">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-warm-500">
                      {chapter.wordCount.toLocaleString()} words
                    </p>
                  </Link>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[chapter.status]}`}
                  >
                    {STATUS_LABELS[chapter.status]}
                  </span>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="text-warm-300 hover:text-red-500 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
