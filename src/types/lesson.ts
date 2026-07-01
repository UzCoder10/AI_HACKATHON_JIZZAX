export interface LessonPausePoint {
  id: string;
  timestampSeconds: number;
  label?: string;
  /** Fonus Kids: keyin AI topshiriq turi */
  taskType: "ai_task" | "quiz" | "talk";
  taskPayload?: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
}

export interface LessonVideo {
  youtubeId: string;
  videoTitle: string;
  videoUrl?: string;
  durationSeconds?: number;
}

export interface LessonRecord {
  id: string;
  slug: string;
  title: string;
  subject: string;
  description?: string;
  status: "active" | "draft";
  author?: string;
  video?: LessonVideo;
  pausePoints?: LessonPausePoint[];
  updatedAt?: string;
}

export interface UpdateLessonVideoInput {
  youtubeId?: string;
  youtubeUrl?: string;
  videoTitle?: string;
  videoDurationSeconds?: number;
}

export interface ApiLessonResponse {
  success: boolean;
  data?: LessonRecord;
  error?: string;
}
