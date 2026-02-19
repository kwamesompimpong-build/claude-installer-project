"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { Book, Chapter, ChapterStatus } from "@/types/book";
import {
  getBook,
  updateChapter,
  countWords,
  updateDailyLog,
  getTodayLog,
  getSettings,
} from "@/lib/storage";
import {
  getSessionEncouragement,
  getDailyProgressMessage,
} from "@/lib/encouragement";
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

  // Session tracking
  const sessionStartRef = useRef<number>(Date.now());
  const wordCountAtStartRef = useRef<number>(0);
  const lastLoggedWordsRef = useRef<number>(0);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [sessionWords, setSessionWords] = useState(0);
  const [todayWords, setTodayWords] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(200);

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
    wordCountAtStartRef.current = countWords(ch.content);
    lastLoggedWordsRef.current = 0;
    sessionStartRef.current = Date.now();

    const todayLog = getTodayLog();
    setTodayWords(todayLog.wordsWritten);
    setDailyGoal(getSettings().dailyWordGoal);
  }, [id, chapterId, router]);

  // Session timer — update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const mins = Math.floor(
        (Date.now() - sessionStartRef.current) / 60000
      );
      setSessionMinutes(mins);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Track words written this session
  useEffect(() => {
    const currentWords = countWords(content);
    const delta = currentWords - wordCountAtStartRef.current;
    setSessionWords(Math.max(0, delta));
  }, [content]);

  const save = useCallback(() => {
    if (!chapter || !book) return;

    // Calculate new words since last log
    const currentWords = countWords(content);
    const newWordsTotal = Math.max(
      0,
      currentWords - wordCountAtStartRef.current
    );
    const newWordsSinceLastLog = newWordsTotal - lastLoggedWordsRef.current;

    // Log daily progress
    if (newWordsSinceLastLog > 0) {
      const minutesSinceStart = Math.floor(
        (Date.now() - sessionStartRef.current) / 60000
      );
      updateDailyLog(newWordsSinceLastLog, 0);
      lastLoggedWordsRef.current = newWordsTotal;
      setTodayWords((prev) => prev + newWordsSinceLastLog);
    }

    const updated: Chapter = {
      ...chapter,
      title,
      content,
      notes,
      status,
      wordCount: currentWords,
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

  // Log minutes when leaving the page
  useEffect(() => {
    return () => {
      const mins = Math.floor(
        (Date.now() - sessionStartRef.current) / 60000
      );
      if (mins > 0) {
        updateDailyLog(0, mins);
      }
    };
  }, []);

  if (!book || !chapter) return null;

  const words = countWords(content);
  const prevChapter = book.chapters.find(
    (c) => c.order === chapter.order - 1
  );
  const nextChapter = book.chapters.find(
    (c) => c.order === chapter.order + 1
  );

  const dailyProgress = Math.min(
    100,
    Math.round((todayWords / dailyGoal) * 100)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white/90 border-b border-warm-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/book/${book.id}`}
              className="text-warm-500 hover:text-warm-700"
            >
              &larr; {book.title}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-warm-500">
              {words.toLocaleString()} words
            </span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ChapterStatus);
                setSaved(false);
              }}
              className="border border-warm-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                showNotes
                  ? "bg-sage-50 border-sage-300 text-sage-700"
                  : "border-warm-300 text-warm-500 hover:bg-warm-50"
              }`}
            >
              Notes
            </button>
            <button
              onClick={save}
              className={`px-6 py-2 rounded-xl transition-colors font-medium ${
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

      {/* Encouragement bar */}
      <div className="bg-parchment border-b border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <p className="text-warm-600 font-serif italic">
            {getSessionEncouragement(sessionMinutes, sessionWords)}
          </p>
          <div className="flex items-center gap-4 text-sm text-warm-500">
            {sessionMinutes > 0 && (
              <span>{sessionMinutes} min this session</span>
            )}
            {sessionWords > 0 && (
              <span className="text-sage-600 font-medium">
                +{sessionWords} words
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Daily progress mini-bar */}
      <div className="bg-white border-b border-warm-100">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-warm-500 whitespace-nowrap">
              Today: {todayWords}/{dailyGoal}
            </span>
            <div className="flex-1 bg-warm-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  dailyProgress >= 100 ? "bg-gold-500" : "bg-sage-400"
                }`}
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            {dailyProgress >= 100 && (
              <span className="text-sm text-gold-500 font-medium">
                Goal reached!
              </span>
            )}
          </div>
        </div>
      </div>

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
            className="w-full text-3xl font-serif font-bold text-warm-900 mb-6 bg-transparent border-none focus:outline-none placeholder-warm-300"
            placeholder="Chapter Title"
          />

          {/* Main editor */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            className="w-full min-h-[60vh] bg-transparent border-none focus:outline-none resize-none text-warm-800 leading-loose text-xl font-serif placeholder-warm-300"
            placeholder="Start writing... Let your story flow. You can always come back and change things later."
          />
        </div>

        {/* Notes sidebar */}
        {showNotes && (
          <div className="w-80 bg-white border-l border-warm-200 p-5">
            <h3 className="font-semibold text-warm-700 mb-3">
              Chapter Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              className="w-full h-64 border border-warm-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              placeholder="Jot down ideas, reminders, or research notes for this chapter..."
            />
            <p className="text-sm text-warm-400 mt-2">
              Notes are private and won&apos;t appear in the exported book.
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <footer className="bg-white/90 border-t border-warm-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-4">
            {prevChapter && (
              <Link
                href={`/book/${book.id}/write/${prevChapter.id}`}
                className="text-warm-500 hover:text-sage-700"
              >
                &larr; {prevChapter.title}
              </Link>
            )}
          </div>
          <span className="text-warm-400">
            {lastSaved
              ? `Last saved: ${lastSaved}`
              : "Your work saves automatically"}
          </span>
          <div className="flex gap-4">
            {nextChapter && (
              <Link
                href={`/book/${book.id}/write/${nextChapter.id}`}
                className="text-warm-500 hover:text-sage-700"
              >
                {nextChapter.title} &rarr;
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
