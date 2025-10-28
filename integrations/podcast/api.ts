type TranscriptMode = "explainer" | "repetition";
type StudyCastMode = "FocusCast" | "SleepCast";

type GeneratePodcastRequest = {
  subject: string;
  topic: string;
  exam_board: string;
  level: "Foundation" | "Higher";
  mode: StudyCastMode;
  repetition_level?: number;
  preview_only?: boolean;
  edited_script?: string;
  voice_id?: string;
  speaking_speed?: number;
};

type GeneratePodcastResponse = {
  title: string;
  audio_url: string | null;
  script_text: string;
  duration: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const shouldUseMock = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true';

import { supabase } from "@/integrations/supabase/client";

const callEdgeFunction = async <TPayload, TResult>(
  functionName: string,
  payload: TPayload,
  fallback: () => TResult,
  options?: RequestOptions,
): Promise<TResult> => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      console.error(`[StudyCast] Edge function error:`, error);
      const detailed = (error as any)?.context?.error || (error as any)?.message || `Edge Function error`;
      throw new Error(detailed);
    }

    if (!data) {
      throw new Error(`No data returned from ${functionName}`);
    }

    return data as TResult;
  } catch (error) {
    // Only use mock fallback for preview-only flows; never for final audio generation
    const isPreview = (payload as any)?.preview_only === true;
    if (!shouldUseMock || !isPreview || (options?.signal?.aborted ?? false)) {
      throw error;
    }

    console.warn(`[StudyCast] Falling back to mock response for ${functionName}`, error);
    return fallback();
  }
};

const mockPodcast = (request: GeneratePodcastRequest): GeneratePodcastResponse => {
  const modeLabel = request.mode === "FocusCast" ? "Explainer" : "Repetition";
  const repLabel = request.repetition_level ? ` x${request.repetition_level}` : "";
  
  return {
    title: `${request.subject} – ${request.topic} (${modeLabel}${repLabel})`,
    audio_url: request.preview_only ? null : `/assets/sample-3s.mp3`,
    script_text: request.mode === "FocusCast" 
      ? `Let's dive into ${request.topic}. This is a clear walkthrough...`
      : `${request.topic} — repeating key facts... ${request.topic} — repeating key facts...`,
    duration: "5m 30s",
  };
};

export const generatePodcast = (
  payload: GeneratePodcastRequest,
  options?: RequestOptions,
): Promise<GeneratePodcastResponse> =>
  callEdgeFunction("generate-podcast", payload, () => mockPodcast(payload), options);

export type { TranscriptMode, StudyCastMode, GeneratePodcastRequest, GeneratePodcastResponse };
