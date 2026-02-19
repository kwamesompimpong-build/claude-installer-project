"use client";

import { useState, useEffect, use } from "react";
import { Book, ChapterStatus } from "@/types/book";
import {
  getBook,
  saveBook,
  addChapter,
  deleteChapter,
  getTotalWordCount,
  getStreak,
  getTodayLog,
  getSettings,
} from "@/lib/storage";
import {
  getDailyProgressMessage,
  getMilestoneMessage,
} from "@/lib/encouragement";
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

export default function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [todayWords, setTodayWords] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(200);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const b = getBook(id);
    if (!b) {
      router.push("/");
      return;
    }
    setBook(b);
    setTodayWords(getTodayLog().wordsWritten);
    setDailyGoal(getSettings().dailyWordGoal);
    setStreak(getStreak());
  }, [id, router]);

  if (!book) return null;

  const wordCount = getTotalWordCount(book);
  const progress = Math.min(
    100,
    Math.round((wordCount / book.targetWordCount) * 100)
  );
  const milestone = getMilestoneMessage(wordCount);

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

  // Find the most recent chapter for "Continue Writing"
  const recentChapter = book.chapters.length > 0
    ? [...book.chapters].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]
    : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 border-b border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link
            href="/"
            className="text-warm-500 hover:text-warm-700 text-base"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-serif font-bold text-warm-900 mt-2">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="text-warm-500 italic text-lg">{book.subtitle}</p>
          )}
          <p className="text-warm-600">by {book.authorName}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Today's progress + Quick start */}
        <div className="bg-sage-600 text-white rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sage-200 text-sm">
                Today: {todayWords} / {dailyGoal} words
                {streak > 0 && ` \u00B7 ${streak} day streak`}
              </p>
              <p className="text-lg mt-1">
                {getDailyProgressMessage(todayWords, dailyGoal)}
              </p>
            </div>
            {recentChapter && (
              <Link
                href={`/book/${book.id}/write/${recentChapter.id}`}
                className="bg-white text-sage-700 px-8 py-3 rounded-xl text-lg font-medium hover:bg-sage-50 transition-colors whitespace-nowrap"
              >
                Continue Writing
              </Link>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <p className="text-3xl font-bold text-sage-700">
              {wordCount.toLocaleString()}
            </p>
            <p className="text-sm text-warm-500 mt-1">words written</p>
          </div>
          <div className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <p className="text-3xl font-bold text-sage-700">
              {book.chapters.length}
            </p>
            <p className="text-sm text-warm-500 mt-1">chapters</p>
          </div>
          <div className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <p className="text-3xl font-bold text-sage-700">{progress}%</p>
            <p className="text-sm text-warm-500 mt-1">word goal</p>
          </div>
          <div className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <p className="text-3xl font-bold text-sage-700">
              {book.chapters.filter((c) => c.status === "final").length}
            </p>
            <p className="text-sm text-warm-500 mt-1">chapters finalized</p>
          </div>
        </div>

        {/* Milestone */}
        {milestone && (
          <div className="bg-parchment rounded-2xl p-5 mb-8 text-center animate-celebrate">
            <p className="text-gold-500 font-serif text-xl font-semibold italic">
              {milestone}
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-warm-100 rounded-full h-4">
            <div
              className="bg-sage-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-warm-500 mt-2">
            {wordCount.toLocaleString()} /{" "}
            {book.targetWordCount.toLocaleString()} words
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Link
            href={`/book/${book.id}/prompts`}
            className="bg-white border border-warm-200 px-6 py-3 rounded-xl hover:bg-sage-50 hover:border-sage-300 transition-colors font-medium"
          >
            Writing Prompts
          </Link>
          <Link
            href={`/book/${book.id}/publish`}
            className="bg-white border border-warm-200 px-6 py-3 rounded-xl hover:bg-sage-50 hover:border-sage-300 transition-colors font-medium"
          >
            Publishing Checklist
          </Link>
          <button
            onClick={() => setEditingDetails(!editingDetails)}
            className="bg-white border border-warm-200 px-6 py-3 rounded-xl hover:bg-sage-50 hover:border-sage-300 transition-colors font-medium"
          >
            Book Details
          </button>
        </div>

        {/* Book details editor */}
        {editingDetails && (
          <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
            <h2 className="font-serif font-semibold text-xl mb-4">
              Book Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-warm-700 mb-2">Title</label>
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) =>
                    setBook({ ...book, title: e.target.value })
                  }
                  className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-warm-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={book.subtitle}
                  onChange={(e) =>
                    setBook({ ...book, subtitle: e.target.value })
                  }
                  placeholder="Optional subtitle"
                  className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-warm-700 mb-2">Genre</label>
                <input
                  type="text"
                  value={book.genre}
                  onChange={(e) =>
                    setBook({ ...book, genre: e.target.value })
                  }
                  className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div>
                <label className="block text-warm-700 mb-2">
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
                  className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-warm-700 mb-2">
                  Book Description
                </label>
                <textarea
                  value={book.description}
                  onChange={(e) =>
                    setBook({ ...book, description: e.target.value })
                  }
                  rows={3}
                  placeholder="A brief description of your book"
                  className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
            </div>
            <button
              onClick={handleSaveDetails}
              className="mt-4 bg-sage-600 text-white px-8 py-3 rounded-xl hover:bg-sage-700 transition-colors text-lg"
            >
              Save Details
            </button>
          </div>
        )}

        {/* Chapters */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-semibold">Chapters</h2>
          <button
            onClick={() => setShowNewChapter(true)}
            className="bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 transition-colors"
          >
            + Add Chapter
          </button>
        </div>

        {showNewChapter && (
          <div className="bg-white rounded-2xl border border-warm-200 p-5 mb-4 flex gap-3">
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
              placeholder="Chapter title..."
              className="flex-1 border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
              autoFocus
            />
            <button
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
              className="bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowNewChapter(false);
                setNewChapterTitle("");
              }}
              className="border border-warm-300 px-6 py-3 rounded-xl hover:bg-warm-50"
            >
              Cancel
            </button>
          </div>
        )}

        {book.chapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 p-10 text-center">
            <p className="text-warm-500 mb-4 text-lg">No chapters yet.</p>
            <p className="text-warm-400 max-w-md mx-auto">
              Start by adding your first chapter, or check out the{" "}
              <Link
                href={`/book/${book.id}/prompts`}
                className="text-sage-600 underline hover:text-sage-700"
              >
                Writing Prompts
              </Link>{" "}
              for guided inspiration.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {book.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-2xl border border-warm-200 p-5 hover:shadow-sm transition-shadow flex items-center gap-4"
                >
                  <span className="text-warm-400 font-mono w-10 text-lg">
                    {chapter.order}.
                  </span>
                  <Link
                    href={`/book/${book.id}/write/${chapter.id}`}
                    className="flex-1"
                  >
                    <h3 className="font-medium text-warm-900 hover:text-sage-700 text-lg">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-warm-500">
                      {chapter.wordCount.toLocaleString()} words
                    </p>
                  </Link>
                  <span
                    className={`text-sm px-3 py-1.5 rounded-full ${STATUS_COLORS[chapter.status]}`}
                  >
                    {STATUS_LABELS[chapter.status]}
                  </span>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="text-warm-300 hover:text-red-500 text-lg px-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
