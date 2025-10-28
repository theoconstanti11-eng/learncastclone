import { Topic } from "./data";

export type StudyCastMode = "FocusCast" | "SleepCast";

export type StudyCastRecording = {
  id: string;
  guideId: string;
  guideTitle: string;
  subjectIcon: string;
  topicId: string;
  topicTitle: string;
  mode: StudyCastMode;
  repetitionLevel: number;
  examBoard: string;
  level: "Foundation" | "Higher";
  audioUrl: string;
  transcript: string;
  createdAt: string;
};

export const buildRecording = (
  params: {
    guideId: string;
    guideTitle: string;
    subjectIcon: string;
    topic: Topic;
    mode: StudyCastMode;
    repetitionLevel: number;
    examBoard: string;
    level: "Foundation" | "Higher";
    audioUrl?: string;
    transcript?: string;
  },
  id?: string
): StudyCastRecording => {
  const identifier =
    id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  return {
    id: identifier,
    guideId: params.guideId,
    guideTitle: params.guideTitle,
    subjectIcon: params.subjectIcon,
    topicId: params.topic.id,
    topicTitle: params.topic.title,
    mode: params.mode,
    repetitionLevel: params.repetitionLevel,
    examBoard: params.examBoard,
    level: params.level,
    audioUrl:
      params.audioUrl ??
      `https://files.studycast.dev/audio/${identifier}.mp3`,
    transcript:
      params.transcript ??
      `This is a preview of the StudyCast for ${params.topic.title}. It summarises the key specification points in a ${
        params.mode === "FocusCast" ? "direct" : "soothing"
      } tone with curated examiner guidance.`,
    createdAt: new Date().toISOString(),
  };
};
