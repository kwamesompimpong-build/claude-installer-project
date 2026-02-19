import {
  Book,
  Chapter,
  WritingSession,
  DailyLog,
  AppSettings,
  DEFAULT_PUBLISHING_CHECKLIST,
  DEFAULT_SETTINGS,
} from "@/types/book";
import { v4 as uuidv4 } from "uuid";

const BOOKS_KEY = "bookwriter_books";
const SESSIONS_KEY = "bookwriter_sessions";
const DAILY_KEY = "bookwriter_daily";
const SETTINGS_KEY = "bookwriter_settings";

// ─── Helpers ───

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ─── Books ───

export function getBooks(): Book[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getBook(id: string): Book | undefined {
  return getBooks().find((b) => b.id === id);
}

export function saveBook(book: Book): void {
  const books = getBooks();
  const index = books.findIndex((b) => b.id === book.id);
  book.updatedAt = new Date().toISOString();
  if (index >= 0) {
    books[index] = book;
  } else {
    books.push(book);
  }
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function deleteBook(id: string): void {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function createBook(title: string, authorName: string): Book {
  const now = new Date().toISOString();
  const book: Book = {
    id: uuidv4(),
    title,
    subtitle: "",
    authorName,
    genre: "Memoir / Caregiving",
    description: "",
    targetWordCount: 50000,
    chapters: [],
    publishingChecklist: { ...DEFAULT_PUBLISHING_CHECKLIST },
    createdAt: now,
    updatedAt: now,
  };
  saveBook(book);
  // Also save the author name in settings so we can greet her
  const settings = getSettings();
  if (!settings.authorName) {
    saveSettings({ ...settings, authorName });
  }
  return book;
}

// ─── Chapters ───

export function addChapter(
  bookId: string,
  title: string
): Chapter | undefined {
  const book = getBook(bookId);
  if (!book) return undefined;
  const now = new Date().toISOString();
  const chapter: Chapter = {
    id: uuidv4(),
    title,
    content: "",
    order: book.chapters.length + 1,
    notes: "",
    status: "outline",
    wordCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  book.chapters.push(chapter);
  saveBook(book);
  return chapter;
}

export function updateChapter(bookId: string, chapter: Chapter): void {
  const book = getBook(bookId);
  if (!book) return;
  const index = book.chapters.findIndex((c) => c.id === chapter.id);
  if (index >= 0) {
    chapter.updatedAt = new Date().toISOString();
    chapter.wordCount = countWords(chapter.content);
    book.chapters[index] = chapter;
    saveBook(book);
  }
}

export function deleteChapter(bookId: string, chapterId: string): void {
  const book = getBook(bookId);
  if (!book) return;
  book.chapters = book.chapters
    .filter((c) => c.id !== chapterId)
    .map((c, i) => ({ ...c, order: i + 1 }));
  saveBook(book);
}

export function reorderChapters(
  bookId: string,
  chapterIds: string[]
): void {
  const book = getBook(bookId);
  if (!book) return;
  const reordered: Chapter[] = [];
  chapterIds.forEach((id, index) => {
    const ch = book.chapters.find((c) => c.id === id);
    if (ch) {
      reordered.push({ ...ch, order: index + 1 });
    }
  });
  book.chapters = reordered;
  saveBook(book);
}

// ─── Word Count ───

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function getTotalWordCount(book: Book): number {
  return book.chapters.reduce((sum, ch) => sum + countWords(ch.content), 0);
}

// ─── Writing Sessions ───

export function getSessions(): WritingSession[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function logSession(session: WritingSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ─── Daily Logs & Streaks ───

export function getDailyLogs(): DailyLog[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(DAILY_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTodayLog(): DailyLog {
  const logs = getDailyLogs();
  const today = todayStr();
  const existing = logs.find((l) => l.date === today);
  return existing || { date: today, wordsWritten: 0, minutesWritten: 0 };
}

export function updateDailyLog(wordsAdded: number, minutesAdded: number): void {
  if (typeof window === "undefined") return;
  const logs = getDailyLogs();
  const today = todayStr();
  const idx = logs.findIndex((l) => l.date === today);
  if (idx >= 0) {
    logs[idx].wordsWritten += wordsAdded;
    logs[idx].minutesWritten += minutesAdded;
  } else {
    logs.push({ date: today, wordsWritten: wordsAdded, minutesWritten: minutesAdded });
  }
  localStorage.setItem(DAILY_KEY, JSON.stringify(logs));
}

export function getStreak(): number {
  const logs = getDailyLogs()
    .filter((l) => l.wordsWritten > 0)
    .map((l) => l.date)
    .sort()
    .reverse();

  if (logs.length === 0) return 0;

  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday
  if (logs[0] !== today && logs[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < logs.length - 1; i++) {
    const current = new Date(logs[i]);
    const prev = new Date(logs[i + 1]);
    const diff = (current.getTime() - prev.getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Settings ───

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ─── Export ───

export function exportAsText(book: Book): string {
  let text = `${book.title}\n`;
  if (book.subtitle) text += `${book.subtitle}\n`;
  text += `by ${book.authorName}\n\n`;
  text += "---\n\n";

  book.chapters
    .sort((a, b) => a.order - b.order)
    .forEach((ch) => {
      text += `Chapter ${ch.order}: ${ch.title}\n\n`;
      text += `${ch.content}\n\n`;
      text += "---\n\n";
    });

  return text;
}

export function exportAsHtml(book: Book): string {
  const chapters = book.chapters
    .sort((a, b) => a.order - b.order)
    .map(
      (ch) => `
    <div class="chapter" style="page-break-before: always;">
      <h2>Chapter ${ch.order}: ${ch.title}</h2>
      ${ch.content
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("\n")}
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${book.title}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; color: #333; }
    h1 { text-align: center; margin-bottom: 5px; }
    h2 { margin-top: 40px; margin-bottom: 20px; }
    .subtitle { text-align: center; font-style: italic; margin-bottom: 5px; }
    .author { text-align: center; margin-bottom: 40px; }
    p { text-indent: 2em; margin: 0.5em 0; }
    .chapter p:first-of-type { text-indent: 0; }
    @media print { body { max-width: none; } }
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  ${book.subtitle ? `<p class="subtitle">${book.subtitle}</p>` : ""}
  <p class="author">by ${book.authorName}</p>
  ${chapters}
</body>
</html>`;
}
