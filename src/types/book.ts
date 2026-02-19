export interface Book {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  genre: string;
  description: string;
  targetWordCount: number;
  chapters: Chapter[];
  publishingChecklist: PublishingChecklist;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  notes: string;
  status: ChapterStatus;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus = "outline" | "draft" | "revision" | "final";

export interface PublishingChecklist {
  manuscriptComplete: boolean;
  editingComplete: boolean;
  coverDesign: boolean;
  bookDescription: boolean;
  authorBio: boolean;
  isbn: boolean;
  copyrightPage: boolean;
  formatting: boolean;
  proofread: boolean;
  backMatter: boolean;
}

export interface WritingPrompt {
  id: string;
  category: WritingPromptCategory;
  text: string;
}

export type WritingPromptCategory =
  | "getting-started"
  | "memories"
  | "emotions"
  | "daily-life"
  | "relationships"
  | "lessons-learned"
  | "advice";

export interface WritingSession {
  date: string;
  wordsWritten: number;
  chaptersWorkedOn: string[];
}

export const DEFAULT_PUBLISHING_CHECKLIST: PublishingChecklist = {
  manuscriptComplete: false,
  editingComplete: false,
  coverDesign: false,
  bookDescription: false,
  authorBio: false,
  isbn: false,
  copyrightPage: false,
  formatting: false,
  proofread: false,
  backMatter: false,
};
