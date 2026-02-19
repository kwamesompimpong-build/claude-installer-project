import { WritingPrompt } from "@/types/book";

export const WRITING_PROMPTS: WritingPrompt[] = [
  // Getting Started
  {
    id: "gs-1",
    category: "getting-started",
    text: "What moment made you realize you were becoming a caregiver? Describe that day in detail.",
  },
  {
    id: "gs-2",
    category: "getting-started",
    text: "If you could tell someone just starting their caregiving journey one thing, what would it be?",
  },
  {
    id: "gs-3",
    category: "getting-started",
    text: "Write about the person you care for before their diagnosis. What were they like?",
  },

  // Memories
  {
    id: "mem-1",
    category: "memories",
    text: "Describe a moment of unexpected joy during your caregiving experience.",
  },
  {
    id: "mem-2",
    category: "memories",
    text: "What is your favorite memory of the person you care for? Paint the scene vividly.",
  },
  {
    id: "mem-3",
    category: "memories",
    text: "Write about a holiday or birthday that was different because of dementia.",
  },
  {
    id: "mem-4",
    category: "memories",
    text: "Describe a conversation that stays with you — one that made you laugh, cry, or think differently.",
  },

  // Emotions
  {
    id: "emo-1",
    category: "emotions",
    text: "Write honestly about a time you felt overwhelmed. What did you do to cope?",
  },
  {
    id: "emo-2",
    category: "emotions",
    text: "Describe the guilt that sometimes comes with caregiving. When do you feel it most?",
  },
  {
    id: "emo-3",
    category: "emotions",
    text: "Write about a time you felt proud of how you handled a difficult situation.",
  },
  {
    id: "emo-4",
    category: "emotions",
    text: "What does grief look like when the person is still here? Describe that feeling.",
  },

  // Daily Life
  {
    id: "dl-1",
    category: "daily-life",
    text: "Walk the reader through a typical day. What does morning to night look like?",
  },
  {
    id: "dl-2",
    category: "daily-life",
    text: "Describe the small routines that bring comfort — to you and to the person you care for.",
  },
  {
    id: "dl-3",
    category: "daily-life",
    text: "What is the hardest part of the day? Why?",
  },
  {
    id: "dl-4",
    category: "daily-life",
    text: "Write about a moment when music, food, or a familiar object triggered a connection.",
  },

  // Relationships
  {
    id: "rel-1",
    category: "relationships",
    text: "How has caregiving changed your relationship with the person you care for?",
  },
  {
    id: "rel-2",
    category: "relationships",
    text: "Write about someone who showed up for you during this journey — and someone who didn't.",
  },
  {
    id: "rel-3",
    category: "relationships",
    text: "How has caregiving affected your other relationships — with your spouse, children, or friends?",
  },

  // Lessons Learned
  {
    id: "ll-1",
    category: "lessons-learned",
    text: "What has caregiving taught you about patience?",
  },
  {
    id: "ll-2",
    category: "lessons-learned",
    text: "What do you know now about dementia that you wish you had known at the start?",
  },
  {
    id: "ll-3",
    category: "lessons-learned",
    text: "Write about a mistake you made and what it taught you.",
  },

  // Advice
  {
    id: "adv-1",
    category: "advice",
    text: "What practical advice would you give to a new caregiver navigating the medical system?",
  },
  {
    id: "adv-2",
    category: "advice",
    text: "How do you take care of yourself? Write about self-care honestly — what works and what doesn't.",
  },
  {
    id: "adv-3",
    category: "advice",
    text: "What resources, tools, or communities have been most helpful to you?",
  },
];

export function getPromptsByCategory(category: string): WritingPrompt[] {
  return WRITING_PROMPTS.filter((p) => p.category === category);
}

export function getRandomPrompt(): WritingPrompt {
  return WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
}

export const CATEGORY_LABELS: Record<string, string> = {
  "getting-started": "Getting Started",
  memories: "Memories",
  emotions: "Emotions & Feelings",
  "daily-life": "Daily Life",
  relationships: "Relationships",
  "lessons-learned": "Lessons Learned",
  advice: "Advice & Resources",
};

export const SUGGESTED_OUTLINE = [
  "Introduction — Why I Wrote This Book",
  "Before the Diagnosis — The Person I Knew",
  "The Diagnosis — When Everything Changed",
  "Learning the Basics — Understanding Dementia",
  "Becoming the Caregiver — The Early Days",
  "Daily Life — Routines, Challenges, and Small Victories",
  "The Emotional Toll — Grief, Guilt, and Grace",
  "Navigating the System — Doctors, Insurance, and Facilities",
  "Family Dynamics — Who Shows Up and Who Doesn't",
  "Finding Moments of Joy — Connection Despite the Disease",
  "Taking Care of Yourself — Lessons in Self-Compassion",
  "Resources and Practical Advice",
  "Looking Back, Moving Forward — What I've Learned",
];
