// Warm, encouraging messages for a writer who needs gentle motivation

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const nameStr = name ? `, ${name}` : "";

  if (hour < 12) {
    return `Good morning${nameStr}! A lovely time to write.`;
  } else if (hour < 17) {
    return `Good afternoon${nameStr}! Ready to add to your story?`;
  } else {
    return `Good evening${nameStr}. A perfect time for quiet writing.`;
  }
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Start writing today and begin your streak!";
  } else if (streak === 1) {
    return "You wrote today! Come back tomorrow to keep it going.";
  } else if (streak < 4) {
    return `${streak} days in a row! You're building a beautiful habit.`;
  } else if (streak < 8) {
    return `${streak} days strong! Your dedication is showing.`;
  } else if (streak < 15) {
    return `${streak} days! Over a week of writing — you should be so proud.`;
  } else if (streak < 31) {
    return `${streak} days! Your commitment is truly inspiring.`;
  } else {
    return `${streak} days! You are proof that consistency creates something beautiful.`;
  }
}

export function getDailyProgressMessage(
  wordsToday: number,
  dailyGoal: number
): string {
  if (wordsToday === 0) {
    return "Your story is waiting for you. Even one sentence counts.";
  }
  const pct = wordsToday / dailyGoal;
  if (pct < 0.5) {
    return `${wordsToday} words today — you've started, and that's what matters!`;
  } else if (pct < 1) {
    return `${wordsToday} words — almost at your daily goal! Keep going!`;
  } else if (pct < 2) {
    return `You hit today's goal! ${wordsToday} words. Wonderful work!`;
  } else {
    return `${wordsToday} words today! What an incredible writing day!`;
  }
}

export function getMilestoneMessage(totalWords: number): string | null {
  const milestones = [
    { words: 500, msg: "Your first 500 words! Your story has begun." },
    {
      words: 1000,
      msg: "1,000 words! You're a real writer now.",
    },
    {
      words: 2500,
      msg: "2,500 words! Your story is taking shape.",
    },
    {
      words: 5000,
      msg: "5,000 words — you're truly writing a book!",
    },
    {
      words: 10000,
      msg: "10,000 words! Your book is really coming to life.",
    },
    {
      words: 25000,
      msg: "25,000 words — halfway to a full book! Incredible!",
    },
    {
      words: 40000,
      msg: "40,000 words! The finish line is in sight.",
    },
    {
      words: 50000,
      msg: "50,000 words! You did it — your book is complete!",
    },
  ];

  // Find the most recent milestone hit
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (totalWords >= milestones[i].words) {
      return milestones[i].msg;
    }
  }
  return null;
}

export function getSessionEncouragement(
  minutesWriting: number,
  wordsThisSession: number
): string {
  if (minutesWriting < 2) {
    return "Just getting started — take your time.";
  } else if (minutesWriting < 5) {
    return "You're doing great. Let the words flow.";
  } else if (minutesWriting < 10) {
    return "Beautiful focus! Keep going at your own pace.";
  } else if (minutesWriting < 20) {
    return `${minutesWriting} minutes of writing — wonderful dedication!`;
  } else {
    return `${minutesWriting} minutes! What a productive writing session!`;
  }
}

export const GENTLE_QUOTES = [
  "The first draft is just you telling yourself the story. — Terry Pratchett",
  "You don't start out writing good stuff. You start out writing junk and thinking it's good stuff, and then gradually you get better at it. — Octavia E. Butler",
  "Start writing, no matter what. The water does not flow until the faucet is turned on. — Louis L'Amour",
  "Almost all good writing begins with terrible first efforts. — Anne Lamott",
  "You can always edit a bad page. You can't edit a blank page. — Jodi Picoult",
  "A writer is someone for whom writing is more difficult than it is for other people. — Thomas Mann",
  "The secret of getting ahead is getting started. — Mark Twain",
  "One word at a time. That's all it takes.",
  "Your story matters. Someone needs to hear it.",
  "Every chapter you write is a gift to your family.",
  "Writing is an act of courage. You're braver than you know.",
  "There's no wrong way to tell your story.",
];

export function getRandomQuote(): string {
  return GENTLE_QUOTES[Math.floor(Math.random() * GENTLE_QUOTES.length)];
}
