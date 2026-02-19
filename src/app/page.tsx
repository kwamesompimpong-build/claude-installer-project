"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import {
  getBooks,
  createBook,
  deleteBook,
  getTotalWordCount,
  getSettings,
  saveSettings,
  getStreak,
  getTodayLog,
} from "@/lib/storage";
import {
  getGreeting,
  getStreakMessage,
  getDailyProgressMessage,
  getMilestoneMessage,
  getRandomQuote,
} from "@/lib/encouragement";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showNewBookForm, setShowNewBookForm] = useState(false);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayWords, setTodayWords] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(200);
  const [savedName, setSavedName] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setBooks(getBooks());
    setStreak(getStreak());
    const log = getTodayLog();
    setTodayWords(log.wordsWritten);
    const settings = getSettings();
    setDailyGoal(settings.dailyWordGoal);
    setSavedName(settings.authorName);
    setQuote(getRandomQuote());
  }, []);

  const handleCreateBook = () => {
    if (!title.trim() || !authorName.trim()) return;
    createBook(title.trim(), authorName.trim());
    setBooks(getBooks());
    setSavedName(authorName.trim());
    setTitle("");
    setAuthorName("");
    setShowNewBookForm(false);
  };

  const handleDeleteBook = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this book? This cannot be undone."
      )
    ) {
      deleteBook(id);
      setBooks(getBooks());
    }
  };

  const handleDailyGoalChange = (goal: number) => {
    setDailyGoal(goal);
    const settings = getSettings();
    saveSettings({ ...settings, dailyWordGoal: goal });
  };

  const dailyProgress = Math.min(100, Math.round((todayWords / dailyGoal) * 100));
  const firstName = savedName ? savedName.split(" ")[0] : "";

  // Find the most recent book for quick "Continue Writing" access
  const recentBook = books.length > 0
    ? books.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;

  const recentChapter = recentBook?.chapters
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 border-b border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-warm-900">
              My Story
            </h1>
            <p className="text-warm-600 mt-1">
              Your book writing companion
            </p>
          </div>
          {/* Streak display */}
          {streak > 0 && (
            <div className="text-center animate-glow">
              <div className="text-3xl">
                {streak >= 7 ? "\u{1F525}" : "\u2728"}
              </div>
              <p className="text-sm font-semibold text-warm-700">
                {streak} day{streak !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Warm greeting */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-serif text-warm-800">
            {getGreeting(firstName)}
          </h2>
          <p className="text-warm-500 mt-2 italic font-serif">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {books.length === 0 && !showNewBookForm ? (
          /* Empty state — first time experience */
          <div className="text-center py-16 animate-fade-in">
            <div className="text-7xl mb-6">{"\u{1F4D6}"}</div>
            <h2 className="text-3xl font-serif font-semibold text-warm-800 mb-4">
              Every book starts with a single word
            </h2>
            <p className="text-warm-600 max-w-lg mx-auto mb-4 text-xl leading-relaxed">
              You&apos;ve been carrying this story inside you. It&apos;s time to let it
              out — just a little bit each day.
            </p>
            <p className="text-warm-500 max-w-md mx-auto mb-10">
              Writing just 200 words a day — about one paragraph — will give
              you a finished book in a year.
            </p>
            <button
              onClick={() => setShowNewBookForm(true)}
              className="bg-sage-600 text-white px-10 py-4 rounded-xl hover:bg-sage-700 transition-colors text-xl font-medium"
            >
              Start Your Book
            </button>
          </div>
        ) : (
          <>
            {/* Today's Writing Progress */}
            <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif font-semibold text-xl text-warm-800">
                    Today&apos;s Writing
                  </h3>
                  <p className="text-warm-600 mt-1">
                    {getDailyProgressMessage(todayWords, dailyGoal)}
                  </p>
                </div>
                {streak > 0 && (
                  <p className="text-sm text-warm-500 max-w-[200px] text-right">
                    {getStreakMessage(streak)}
                  </p>
                )}
              </div>

              {/* Daily progress bar */}
              <div className="mb-4">
                <div className="w-full bg-warm-100 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      dailyProgress >= 100 ? "bg-gold-500" : "bg-sage-500"
                    }`}
                    style={{ width: `${dailyProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-warm-500">
                  <span>{todayWords} words today</span>
                  <span>Goal: {dailyGoal} words</span>
                </div>
              </div>

              {/* Daily goal selector */}
              <div className="flex items-center gap-3 text-sm text-warm-500">
                <span>Daily goal:</span>
                {[100, 200, 300, 500].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleDailyGoalChange(g)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      dailyGoal === g
                        ? "bg-sage-100 text-sage-700 font-medium"
                        : "hover:bg-warm-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick start — "Just 10 Minutes" CTA */}
            {recentBook && (
              <div className="bg-sage-600 text-white rounded-2xl p-6 mb-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-semibold">
                      Just 10 minutes today?
                    </h3>
                    <p className="text-sage-200 mt-1">
                      That&apos;s all it takes. Open your book and write whatever comes
                      to mind.
                    </p>
                  </div>
                  <Link
                    href={
                      recentChapter
                        ? `/book/${recentBook.id}/write/${recentChapter.id}`
                        : `/book/${recentBook.id}`
                    }
                    className="bg-white text-sage-700 px-8 py-3 rounded-xl text-lg font-medium hover:bg-sage-50 transition-colors whitespace-nowrap"
                  >
                    Continue Writing
                  </Link>
                </div>
              </div>
            )}

            {/* Book list header */}
            <div className="flex justify-between items-center mb-6 mt-8">
              <h2 className="text-xl font-serif font-semibold">Your Books</h2>
              <button
                onClick={() => setShowNewBookForm(true)}
                className="bg-sage-600 text-white px-6 py-3 rounded-xl hover:bg-sage-700 transition-colors text-base"
              >
                + New Book
              </button>
            </div>

            {/* New book form */}
            {showNewBookForm && (
              <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6">
                <h3 className="font-serif font-semibold text-xl mb-4">
                  Create a New Book
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-warm-700 mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Walking Beside You: A Caregiver's Story"
                      className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>
                  <div>
                    <label className="block text-warm-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-warm-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCreateBook}
                      disabled={!title.trim() || !authorName.trim()}
                      className="bg-sage-600 text-white px-8 py-3 rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      Create Book
                    </button>
                    <button
                      onClick={() => {
                        setShowNewBookForm(false);
                        setTitle("");
                        setAuthorName("");
                      }}
                      className="border border-warm-300 px-8 py-3 rounded-xl hover:bg-warm-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Book cards */}
            <div className="grid gap-4">
              {books.map((book) => {
                const wordCount = getTotalWordCount(book);
                const progress = Math.min(
                  100,
                  Math.round((wordCount / book.targetWordCount) * 100)
                );
                const chapterCount = book.chapters.length;
                const completedChapters = book.chapters.filter(
                  (c) => c.status === "final"
                ).length;
                const milestone = getMilestoneMessage(wordCount);

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-warm-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <Link href={`/book/${book.id}`} className="flex-1">
                        <h3 className="font-serif text-2xl font-semibold text-warm-900 hover:text-sage-700">
                          {book.title}
                        </h3>
                        {book.subtitle && (
                          <p className="text-warm-500 mt-1">
                            {book.subtitle}
                          </p>
                        )}
                        <p className="text-warm-600 mt-1">
                          by {book.authorName}
                        </p>
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-warm-400 hover:text-red-500 text-sm ml-4"
                        title="Delete book"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Milestone message */}
                    {milestone && (
                      <p className="mt-3 text-gold-500 font-medium font-serif italic">
                        {milestone}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-warm-500 text-sm">Words</span>
                        <p className="font-semibold text-lg">
                          {wordCount.toLocaleString()}{" "}
                          <span className="text-warm-400 font-normal text-sm">
                            / {book.targetWordCount.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-warm-500 text-sm">Chapters</span>
                        <p className="font-semibold text-lg">
                          {completedChapters} / {chapterCount} done
                        </p>
                      </div>
                      <div>
                        <span className="text-warm-500 text-sm">Last edited</span>
                        <p className="font-semibold text-lg">
                          {new Date(book.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="w-full bg-warm-100 rounded-full h-3">
                        <div
                          className="bg-sage-500 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-warm-500 mt-1">
                        {progress}% of word count goal
                      </p>
                    </div>

                    {/* Big continue button */}
                    <div className="mt-4">
                      <Link
                        href={`/book/${book.id}`}
                        className="inline-block bg-sage-600 text-white px-8 py-3 rounded-xl hover:bg-sage-700 transition-colors text-base font-medium"
                      >
                        Open Book
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
