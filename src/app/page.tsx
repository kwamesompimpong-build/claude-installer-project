"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { getBooks, createBook, deleteBook, getTotalWordCount } from "@/lib/storage";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showNewBookForm, setShowNewBookForm] = useState(false);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const handleCreateBook = () => {
    if (!title.trim() || !authorName.trim()) return;
    createBook(title.trim(), authorName.trim());
    setBooks(getBooks());
    setTitle("");
    setAuthorName("");
    setShowNewBookForm(false);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm("Are you sure you want to delete this book? This cannot be undone.")) {
      deleteBook(id);
      setBooks(getBooks());
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-serif font-bold text-warm-900">
            Book Writer Pro
          </h1>
          <p className="text-warm-600 mt-1">
            Write your story. Share it with the world.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {books.length === 0 && !showNewBookForm ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📖</div>
            <h2 className="text-2xl font-serif font-semibold text-warm-800 mb-3">
              Every book starts with a single word
            </h2>
            <p className="text-warm-600 max-w-md mx-auto mb-8">
              This app will guide you through writing your book — from first
              outline to a finished manuscript ready for publishing.
            </p>
            <button
              onClick={() => setShowNewBookForm(true)}
              className="bg-sage-600 text-white px-8 py-3 rounded-lg hover:bg-sage-700 transition-colors text-lg"
            >
              Start Your Book
            </button>
          </div>
        ) : (
          <>
            {/* Book list */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-serif font-semibold">Your Books</h2>
              <button
                onClick={() => setShowNewBookForm(true)}
                className="bg-sage-600 text-white px-5 py-2 rounded-lg hover:bg-sage-700 transition-colors"
              >
                + New Book
              </button>
            </div>

            {/* New book form */}
            {showNewBookForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-6">
                <h3 className="font-serif font-semibold text-lg mb-4">
                  Create a New Book
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-warm-700 mb-1">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Walking Beside You: A Caregiver's Story"
                      className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-warm-700 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateBook}
                      disabled={!title.trim() || !authorName.trim()}
                      className="bg-sage-600 text-white px-6 py-2 rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Book
                    </button>
                    <button
                      onClick={() => {
                        setShowNewBookForm(false);
                        setTitle("");
                        setAuthorName("");
                      }}
                      className="border border-warm-300 px-6 py-2 rounded-lg hover:bg-warm-50 transition-colors"
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

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl border border-warm-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <Link href={`/book/${book.id}`} className="flex-1">
                        <h3 className="font-serif text-xl font-semibold text-warm-900 hover:text-sage-700">
                          {book.title}
                        </h3>
                        {book.subtitle && (
                          <p className="text-warm-500 text-sm mt-1">
                            {book.subtitle}
                          </p>
                        )}
                        <p className="text-warm-600 text-sm mt-1">
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

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-warm-500">Words</span>
                        <p className="font-semibold">
                          {wordCount.toLocaleString()}{" "}
                          <span className="text-warm-400 font-normal">
                            / {book.targetWordCount.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-warm-500">Chapters</span>
                        <p className="font-semibold">
                          {completedChapters} / {chapterCount} done
                        </p>
                      </div>
                      <div>
                        <span className="text-warm-500">Last edited</span>
                        <p className="font-semibold">
                          {new Date(book.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-warm-100 rounded-full h-2">
                        <div
                          className="bg-sage-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-warm-500 mt-1">
                        {progress}% of word count goal
                      </p>
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
