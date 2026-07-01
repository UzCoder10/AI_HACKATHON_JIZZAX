export type LessonQuizChoice = {
  id: string;
  label: string;
  correct?: boolean;
};

export type LessonQuizQuestion = {
  id: string;
  question: string;
  choices: LessonQuizChoice[];
};

/** Dars slug → mock savollar (DB dan oldin demo) */
export const LESSON_QUIZZES: Record<string, LessonQuizQuestion[]> = {
  "l-001": [
    {
      id: "l-001-q1",
      question: "Ingliz tilida \"Salom\" qanday aytiladi?",
      choices: [
        { id: "hello", label: "Hello", correct: true },
        { id: "bye", label: "Goodbye" },
        { id: "thanks", label: "Thank you" },
      ],
    },
    {
      id: "l-001-q2",
      question: "\"Good morning\" nima degani?",
      choices: [
        { id: "night", label: "Xayr" },
        { id: "morning", label: "Xayrli tong", correct: true },
        { id: "thanks", label: "Rahmat" },
      ],
    },
    {
      id: "l-001-q3",
      question: "\"Goodbye\" nima degani?",
      choices: [
        { id: "hello", label: "Salom" },
        { id: "bye", label: "Xayr", correct: true },
        { id: "please", label: "Iltimos" },
      ],
    },
    {
      id: "l-001-q4",
      question: "\"How are you?\" ga qanday javob beriladi?",
      choices: [
        { id: "fine", label: "I'm fine, thank you", correct: true },
        { id: "night", label: "Good night" },
        { id: "see", label: "See you later" },
      ],
    },
    {
      id: "l-001-q5",
      question: "\"Thank you\" nima degani?",
      choices: [
        { id: "sorry", label: "Kechirasiz" },
        { id: "thanks", label: "Rahmat", correct: true },
        { id: "hello", label: "Salom" },
      ],
    },
  ],
  "l-002": [
    {
      id: "l-002-q1",
      question: "\"Cat\" so'zi qaysi hayvonni anglatadi?",
      choices: [
        { id: "cat", label: "Mushuk", correct: true },
        { id: "dog", label: "It" },
        { id: "bird", label: "Qush" },
      ],
    },
    {
      id: "l-002-q2",
      question: "\"Dog\" so'zi qaysi hayvonni anglatadi?",
      choices: [
        { id: "cat", label: "Mushuk" },
        { id: "dog", label: "It", correct: true },
        { id: "fish", label: "Baliq" },
      ],
    },
    {
      id: "l-002-q3",
      question: "\"Elephant\" so'zi qaysi hayvonni anglatadi?",
      choices: [
        { id: "elephant", label: "Fil", correct: true },
        { id: "lion", label: "Sher" },
        { id: "monkey", label: "Maymun" },
      ],
    },
    {
      id: "l-002-q4",
      question: "\"Lion\" so'zi qaysi hayvonni anglatadi?",
      choices: [
        { id: "tiger", label: "Yo'lbars" },
        { id: "lion", label: "Sher", correct: true },
        { id: "bear", label: "Ayiq" },
      ],
    },
    {
      id: "l-002-q5",
      question: "\"Bird\" so'zi qaysi hayvonni anglatadi?",
      choices: [
        { id: "fish", label: "Baliq" },
        { id: "bird", label: "Qush", correct: true },
        { id: "snake", label: "Ilon" },
      ],
    },
  ],
  "l-003": [
    {
      id: "l-003-q1",
      question: "\"Blue\" so'zi qaysi rangni anglatadi?",
      choices: [
        { id: "blue", label: "Ko'k", correct: true },
        { id: "red", label: "Qizil" },
        { id: "yellow", label: "Sariq" },
      ],
    },
    {
      id: "l-003-q2",
      question: "\"Red\" so'zi qaysi rangni anglatadi?",
      choices: [
        { id: "blue", label: "Ko'k" },
        { id: "red", label: "Qizil", correct: true },
        { id: "green", label: "Yashil" },
      ],
    },
    {
      id: "l-003-q3",
      question: "\"Yellow\" so'zi qaysi rangni anglatadi?",
      choices: [
        { id: "yellow", label: "Sariq", correct: true },
        { id: "purple", label: "Binafsha" },
        { id: "white", label: "Oq" },
      ],
    },
    {
      id: "l-003-q4",
      question: "\"Purple\" so'zi qaysi rangni anglatadi?",
      choices: [
        { id: "orange", label: "To'q sariq" },
        { id: "purple", label: "Binafsha", correct: true },
        { id: "black", label: "Qora" },
      ],
    },
    {
      id: "l-003-q5",
      question: "Osmon odatda qanday rangda?",
      choices: [
        { id: "blue", label: "Ko'k", correct: true },
        { id: "red", label: "Qizil" },
        { id: "yellow", label: "Sariq" },
      ],
    },
  ],
  "l-004": [
    {
      id: "l-004-q1",
      question: "Qaysi sayyora Quyoshga eng yaqin?",
      choices: [
        { id: "venus", label: "Venera" },
        { id: "mercury", label: "Merkuriy", correct: true },
        { id: "mars", label: "Mars" },
      ],
    },
    {
      id: "l-004-q2",
      question: "Quyosh tizimidagi eng katta sayyora qaysi?",
      choices: [
        { id: "saturn", label: "Saturn" },
        { id: "jupiter", label: "Yupiter", correct: true },
        { id: "neptune", label: "Neptun" },
      ],
    },
    {
      id: "l-004-q3",
      question: "Yer qanday sayyora hisoblanadi?",
      choices: [
        { id: "gas", label: "Gaz sayyorasi" },
        { id: "rocky", label: "Qattiq sayyora", correct: true },
        { id: "dwarf", label: "Kechik sayyora" },
      ],
    },
    {
      id: "l-004-q4",
      question: "Quyosh nima hisoblanadi?",
      choices: [
        { id: "planet", label: "Sayyora" },
        { id: "star", label: "Yulduz", correct: true },
        { id: "moon", label: "Oy" },
      ],
    },
    {
      id: "l-004-q5",
      question: "Mars odatda qanday rangda ko'rinadi?",
      choices: [
        { id: "blue", label: "Ko'k" },
        { id: "red", label: "Qizil", correct: true },
        { id: "green", label: "Yashil" },
      ],
    },
  ],
};

export function getLessonQuiz(slug: string): LessonQuizQuestion[] {
  return LESSON_QUIZZES[slug] ?? [];
}
