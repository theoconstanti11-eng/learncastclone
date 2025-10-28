import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
  User,
  Play,
  Pause,
  ListMusic,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  STUDYCAST_LIBRARY,
  type LibraryMode,
  type LibrarySubject,
  type LibrarySubtopic,
  type LibraryTopic
} from "@/features/studycast/libraryData";
import { ChemistryFilterModal } from "@/features/studycast/components/ChemistryFilterModal";
import { DuplicatePodcastDialog } from "@/features/studycast/components/DuplicatePodcastDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  PodcastGenerationModal,
  type PodcastGenerationResult,
  type VoiceOption,
  type SpeedOption,
  type BackgroundOption,
} from "@/features/studycast/components/PodcastGenerationModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type CourseFilter = "All" | "Combined" | "Triple";
type TierFilter = "All" | "Foundation" | "Higher";
type ExamBoardFilter = "All" | "AQA" | "Edexcel" | "OCR";
type ModeFilter = "All" | LibraryMode;

type QueueItem = {
  id: string;
  subjectId: string;
  subjectIcon: string;
  subjectName: string;
  subjectAccent: string;
  topicId: string;
  topicTitle: string;
  subtopicId: string;
  subtopicTitle: string;
  mode: LibraryMode;
  durationSeconds: number;
  audioUrl?: string;
  transcript?: string;
  voice?: VoiceOption;
  speed?: SpeedOption;
  background?: BackgroundOption;
  source?: "library" | "saved";
};

type SavedPodcast = {
  id: string;
  subject: string;
  topic: string;
  audioUrl: string | null;
  durationSeconds: number | null;
  mode: string | null;
  createdAt: string | null;
};

const durationToSeconds = (duration: string) => {
  const numeric = parseInt(duration, 10);
  if (Number.isNaN(numeric)) return 0;
  return numeric * 60;
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.05, type: "spring" as const, stiffness: 120, damping: 16 },
  }),
};

const getGradientStyle = (subject: LibrarySubject) => ({
  background: `linear-gradient(135deg, ${subject.gradient[0]}, ${subject.gradient[1]})`
});

const defaultModeForFilters = (mode: ModeFilter): LibraryMode => (mode === "All" ? "Explainer" : mode);
const StudyCastLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSubjectId, setActiveSubjectId] = useState<string>(STUDYCAST_LIBRARY[0]?.id ?? "biology");
  const [activeView, setActiveView] = useState<"library" | "my-podcasts">("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ course: CourseFilter; tier: TierFilter; examBoard: ExamBoardFilter; mode: ModeFilter }>({
    course: "All",
    tier: "All",
    examBoard: "All",
    mode: "All"
  });
  const [activeTopic, setActiveTopic] = useState<LibraryTopic | null>(null);
  const [modeSelections, setModeSelections] = useState<Record<string, LibraryMode>>({});
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChemistryFilterModalOpen, setIsChemistryFilterModalOpen] = useState(false);
  const [pendingChemistryTopic, setPendingChemistryTopic] = useState<LibraryTopic | null>(null);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [modalSubtopic, setModalSubtopic] = useState<LibrarySubtopic | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentTrack, setCurrentTrack] = useState<QueueItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>([]);
  const [savedPodcasts, setSavedPodcasts] = useState<SavedPodcast[]>([]);
  const [isLoadingSavedPodcasts, setIsLoadingSavedPodcasts] = useState(false);
  const [savedPodcastsError, setSavedPodcastsError] = useState<string | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [duplicatePodcastId, setDuplicatePodcastId] = useState<string | null>(null);
  const [pendingSubtopicGeneration, setPendingSubtopicGeneration] = useState<LibrarySubtopic | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const subjects = STUDYCAST_LIBRARY;
  const subjectLookup = useMemo(() => {
    const map = new Map<string, (typeof subjects)[number]>();
    subjects.forEach(subject => {
      map.set(subject.id, subject);
      map.set(subject.name.toLowerCase(), subject);
    });
    return map;
  }, [subjects]);

  const activeSubject = useMemo(
    () => subjectLookup.get(activeSubjectId) ?? subjects[0],
    [activeSubjectId, subjectLookup, subjects]
  );

  const savedPodcastsByTopic = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const groups = new Map<string, { subject: string; topic: string; podcasts: SavedPodcast[] }>();

    const matchesSearch = (podcast: SavedPodcast) => {
      if (!query) return true;
      return (
        podcast.topic.toLowerCase().includes(query) ||
        podcast.subject.toLowerCase().includes(query)
      );
    };

    savedPodcasts.forEach(podcast => {
      if (!matchesSearch(podcast)) return;
      const key = `${podcast.subject}::${podcast.topic}`;
      const existing = groups.get(key);
      if (existing) {
        existing.podcasts.push(podcast);
      } else {
        groups.set(key, { subject: podcast.subject, topic: podcast.topic, podcasts: [podcast] });
      }
    });

    const grouped = Array.from(groups.values()).map(group => ({
      ...group,
      podcasts: group.podcasts.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    }));

    grouped.sort((a, b) => {
      const firstA = a.podcasts[0]?.createdAt ? new Date(a.podcasts[0].createdAt!).getTime() : 0;
      const firstB = b.podcasts[0]?.createdAt ? new Date(b.podcasts[0].createdAt!).getTime() : 0;
      return firstB - firstA;
    });

    return grouped;
  }, [savedPodcasts, searchTerm]);

  const filteredTopics = useMemo(() => {
    if (activeView !== "library" || !activeSubject) return [];
    const query = searchTerm.trim().toLowerCase();

    return activeSubject.topics.filter(topic => {
      const matchesCourse = filters.course === "All" || topic.courseType === filters.course;
      const matchesTier = filters.tier === "All" || topic.tier === filters.tier;
      const matchesExamBoard = filters.examBoard === "All" || topic.examBoard === filters.examBoard;

      const matchesSearch =
        query.length === 0 ||
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.subtopics.some(subtopic => subtopic.title.toLowerCase().includes(query));

      return matchesCourse && matchesTier && matchesExamBoard && matchesSearch;
    });
  }, [activeSubject, activeView, filters.course, filters.examBoard, filters.tier, searchTerm]);

  const preferredMode = defaultModeForFilters(filters.mode);

  const getModeForSubtopic = (subtopicId: string) => modeSelections[subtopicId] ?? preferredMode;

  const loadSavedPodcasts = useCallback(async () => {
    if (!user?.id) {
      setSavedPodcasts([]);
      setIsLoadingSavedPodcasts(false);
      return;
    }

    setIsLoadingSavedPodcasts(true);
    setSavedPodcastsError(null);

    const { data, error } = await supabase
      .from("podcasts")
      .select("id, subject, topic, audio_url, duration, created_at, mode")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load saved podcasts", error);
      setSavedPodcastsError("We couldn't load your podcasts. Please try again.");
      toast({
        title: "Unable to load podcasts",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setSavedPodcasts([]);
    } else {
      setSavedPodcasts(
        (data ?? []).map(item => ({
          id: item.id,
          subject: item.subject,
          topic: item.topic,
          audioUrl: item.audio_url,
          durationSeconds: item.duration,
          mode: item.mode,
          createdAt: item.created_at,
        }))
      );
    }

    setIsLoadingSavedPodcasts(false);
  }, [toast, user?.id]);

  const openTopic = (topic: LibraryTopic) => {
    setActiveTopic(topic);
    setIsPlaylistOpen(true);
  };

  const closeTopic = () => {
    setIsPlaylistOpen(false);
    setActiveTopic(null);
  };

  useEffect(() => {
    void loadSavedPodcasts();
  }, [loadSavedPodcasts]);

  useEffect(() => {
    if (activeView === "my-podcasts") {
      setIsPlaylistOpen(false);
      setActiveTopic(null);
    }
  }, [activeView]);

  const handleChemistryFilterConfirm = (selectedFilters: { courseType: "Combined" | "Triple"; tier: "Foundation" | "Higher"; examBoard: "AQA" | "Edexcel" | "OCR" }) => {
    if (pendingChemistryTopic) {
      // Create a topic variant with the selected filters
      const topicVariant: LibraryTopic = {
        ...pendingChemistryTopic,
        courseType: selectedFilters.courseType,
        tier: selectedFilters.tier,
        examBoard: selectedFilters.examBoard,
      };
      setActiveTopic(topicVariant);
      setIsPlaylistOpen(true);
      setPendingChemistryTopic(null);
    }
  };

  const updateModeSelection = (subtopicId: string, mode: LibraryMode) => {
    setModeSelections(prev => ({ ...prev, [subtopicId]: mode }));
  };

  const buildQueueItem = (
    subject: LibrarySubject,
    topic: LibraryTopic,
    subtopic: LibrarySubtopic,
    mode: LibraryMode,
    overrides: Partial<QueueItem> = {}
  ): QueueItem => ({
    id: `${subtopic.id}-${mode}`,
    subjectId: subject.id,
    subjectIcon: subject.icon,
    subjectName: subject.name,
    subjectAccent: subject.accent,
    topicId: topic.id,
    topicTitle: topic.title,
    subtopicId: subtopic.id,
    subtopicTitle: subtopic.title,
    mode,
    durationSeconds: overrides.durationSeconds ?? durationToSeconds(subtopic.duration),
    audioUrl: overrides.audioUrl,
    transcript: overrides.transcript,
    voice: overrides.voice,
    speed: overrides.speed,
    background: overrides.background,
    source: "library",
  });

  const mapSavedModeToLibrary = (mode: string | null): LibraryMode => {
    if (!mode) return "Explainer";
    return mode === "SleepCast" ? "Repetition" : "Explainer";
  };

  const buildQueueItemFromSaved = (podcast: SavedPodcast): QueueItem => {
    const subjectFromLibrary = subjectLookup.get(podcast.subject.toLowerCase());
    return {
      id: `saved-${podcast.id}`,
      subjectId: subjectFromLibrary?.id ?? "custom",
      subjectIcon: subjectFromLibrary?.icon ?? "🎧",
      subjectName: podcast.subject,
      subjectAccent: subjectFromLibrary?.accent ?? "#6366F1",
      topicId: `saved-topic-${podcast.topic}`,
      topicTitle: podcast.topic,
      subtopicId: `saved-${podcast.id}`,
      subtopicTitle: podcast.topic,
      mode: mapSavedModeToLibrary(podcast.mode),
      durationSeconds: podcast.durationSeconds ?? 0,
      audioUrl: podcast.audioUrl ?? undefined,
      source: "saved",
    };
  };

  const playQueueItem = (item: QueueItem) => {
    setCurrentTrack(item);
    setProgress(0);
    setCurrentDuration(item.durationSeconds);
    setIsPlaying(true);
    setQueue(prev => prev.filter(entry => entry.id !== item.id));
  };

  const openSubtopicForGeneration = async (subtopic: LibrarySubtopic) => {
    if (!user?.id || !activeSubject || !activeTopic) {
      setModalSubtopic(subtopic);
      setIsGenerationModalOpen(true);
      return;
    }

    // Check for duplicate podcast
    const currentMode = getModeForSubtopic(subtopic.id);
    const studyCastMode = currentMode === "Repetition" ? "SleepCast" : "FocusCast";
    
    const { data: existingPodcasts, error } = await supabase
      .from("podcasts")
      .select("id")
      .eq("user_id", user.id)
      .eq("subject", activeSubject.name)
      .eq("topic", subtopic.title)
      .eq("mode", studyCastMode)
      .eq("exam_board", activeTopic.examBoard ?? "AQA")
      .eq("level", activeTopic.tier ?? "Foundation")
      .limit(1);

    if (error) {
      console.error("Error checking for duplicates:", error);
      // Proceed with generation if check fails
      setModalSubtopic(subtopic);
      setIsGenerationModalOpen(true);
      return;
    }

    if (existingPodcasts && existingPodcasts.length > 0) {
      // Duplicate found
      setDuplicatePodcastId(existingPodcasts[0].id);
      setPendingSubtopicGeneration(subtopic);
      setIsDuplicateDialogOpen(true);
    } else {
      // No duplicate, proceed
      setModalSubtopic(subtopic);
      setIsGenerationModalOpen(true);
    }
  };

  const closeGenerationModal = () => {
    setIsGenerationModalOpen(false);
    setModalSubtopic(null);
  };

  const handleReplacePodcast = async () => {
    if (!duplicatePodcastId || !pendingSubtopicGeneration) return;

    // Delete the old podcast
    const { error } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", duplicatePodcastId);

    if (error) {
      console.error("Error deleting old podcast:", error);
      toast({
        title: "Error",
        description: "Couldn't remove the old podcast. Please try again.",
        variant: "destructive",
      });
      setIsDuplicateDialogOpen(false);
      setDuplicatePodcastId(null);
      setPendingSubtopicGeneration(null);
      return;
    }

    // Proceed with generation
    setIsDuplicateDialogOpen(false);
    setDuplicatePodcastId(null);
    setModalSubtopic(pendingSubtopicGeneration);
    setPendingSubtopicGeneration(null);
    setIsGenerationModalOpen(true);
    await loadSavedPodcasts();
  };

  const handleKeepOldPodcast = () => {
    setIsDuplicateDialogOpen(false);
    setDuplicatePodcastId(null);
    setPendingSubtopicGeneration(null);
    setActiveView("my-podcasts");
  };

  const handlePodcastReady = (result: PodcastGenerationResult) => {
    if (!activeSubject) return;

    if (!result.audioUrl) {
      toast({
        title: "Audio not available",
        description: "We couldn't generate audio right now. Try shortening the script or changing settings.",
        variant: "destructive",
      });
      return;
    }

    const queueItem = buildQueueItem(activeSubject, result.topic, result.subtopic, result.libraryMode, {
      audioUrl: result.audioUrl,
      transcript: result.transcript,
      voice: result.voice,
      speed: result.speed,
      background: result.background,
    });

    setModeSelections(prev => ({ ...prev, [result.subtopic.id]: result.libraryMode }));
    setCurrentTrack(queueItem);
    setProgress(0);
    setCurrentDuration(0);
    setIsPlaying(true);
    setQueue(prev => prev.filter(entry => entry.id !== queueItem.id));
    setIsGenerationModalOpen(false);
    setModalSubtopic(null);
    void loadSavedPodcasts();
  };

  const handleAddAllToQueue = (topic: LibraryTopic) => {
    if (!activeSubject) return;
    setQueue(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const additions = topic.subtopics.map(subtopic => {
        const mode = getModeForSubtopic(subtopic.id);
        return buildQueueItem(activeSubject, topic, subtopic, mode);
      });
      const merged = [...prev];
      for (const item of additions) {
        if (currentTrack?.id === item.id || existingIds.has(item.id)) continue;
        merged.push(item);
      }
      return merged;
    });
  };

  const handlePlaySavedPodcast = (podcast: SavedPodcast) => {
    if (!podcast.audioUrl) {
      toast({
        title: "Audio not ready",
        description: "This StudyCast is still processing. Try again soon.",
        variant: "destructive",
      });
      return;
    }

    const queueItem = buildQueueItemFromSaved(podcast);
    setCurrentTrack(queueItem);
    setProgress(0);
    setCurrentDuration(0);
    setIsPlaying(true);
    setQueue(prev => prev.filter(entry => entry.id !== queueItem.id));
  };

  const handleQueueSavedPodcast = (podcast: SavedPodcast) => {
    if (!podcast.audioUrl) {
      toast({
        title: "Audio not ready",
        description: "This StudyCast is still processing. Try again soon.",
        variant: "destructive",
      });
      return;
    }

    const queueItem = buildQueueItemFromSaved(podcast);
    setQueue(prev => {
      const filtered = prev.filter(item => item.id !== queueItem.id);
      if (!currentTrack) {
        return filtered;
      }
      return [queueItem, ...filtered];
    });

    if (!currentTrack) {
      setCurrentTrack(queueItem);
      setProgress(0);
      setCurrentDuration(0);
      setIsPlaying(true);
    }

    toast({
      title: "Added to queue",
      description: `${podcast.topic} will play next.`,
    });
  };

  const formatSavedDuration = (durationSeconds: number | null) => {
    if (!durationSeconds) return "";
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.max(0, Math.floor(durationSeconds % 60));
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  const formatSavedDate = (timestamp: string | null) => {
    if (!timestamp) return "Recently generated";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Recently generated";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const togglePlayback = () => {
    if (!currentTrack) return;
    if (currentTrack.audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error("Unable to resume playback", error);
          });
      }
      return;
    }
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (value: number[]) => {
    const nextPosition = value[0] ?? 0;
    if (currentTrack?.audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = nextPosition;
      setProgress(nextPosition);
      return;
    }
    setProgress(nextPosition);
  };
  useEffect(() => {
    if (!currentTrack || currentTrack.audioUrl || !isPlaying) return;
    setCurrentDuration(currentTrack.durationSeconds);
    const interval = window.setInterval(() => {
      setProgress(prev => {
        const target = currentTrack.durationSeconds;
        const next = Math.min(target, prev + 1);
        if (next >= target) {
          window.clearInterval(interval);
          setCompletedSubtopics(prevCompleted =>
            prevCompleted.includes(currentTrack.subtopicId)
              ? prevCompleted
              : [...prevCompleted, currentTrack.subtopicId]
          );
          setIsPlaying(false);
          setQueue(prevQueue => {
            if (prevQueue.length === 0) {
              setCurrentTrack(null);
              setProgress(0);
              return [];
            }
            const [nextTrack, ...rest] = prevQueue;
            setCurrentTrack(nextTrack);
            setProgress(0);
            setIsPlaying(true);
            return rest;
          });
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [currentTrack, isPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoaded = () => {
      setCurrentDuration(Number.isFinite(audio.duration) ? audio.duration : currentTrack.durationSeconds);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCompletedSubtopics(prevCompleted =>
        currentTrack.subtopicId && !prevCompleted.includes(currentTrack.subtopicId)
          ? [...prevCompleted, currentTrack.subtopicId]
          : prevCompleted
      );

      setQueue(prevQueue => {
        if (prevQueue.length === 0) {
          setCurrentTrack(null);
          setCurrentDuration(0);
          return [];
        }
        const [nextTrack, ...rest] = prevQueue;
        setCurrentTrack(nextTrack);
        setCurrentDuration(nextTrack.durationSeconds);
        setProgress(0);
        setIsPlaying(true);
        return rest;
      });
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, queue.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack?.audioUrl) {
      audio.pause();
      audio.currentTime = 0;
      if (audio.src) {
        audio.removeAttribute("src");
        audio.load();
      }
      return;
    }

    audio.src = currentTrack.audioUrl;
    audio.currentTime = 0;
  }, [currentTrack?.audioUrl]);

  useEffect(() => {
    if (!currentTrack?.audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio
        .play()
        .catch(error => {
          console.error("Unable to continue playback", error);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.audioUrl]);

  const resetPlayback = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentDuration(0);
  };

  const handleClearQueue = () => {
    setQueue([]);
    resetPlayback();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg shadow-inner">🎧</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">StudyCast</p>
          <p className="text-xl font-semibold text-slate-900">Library</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
          placeholder="Search topics or episodes"
          className="h-12 rounded-2xl border-white/30 bg-white/40 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-600 focus-visible:ring-0"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pb-16">
          <button
            onClick={() => {
              setActiveView("my-podcasts");
              setIsMobileSidebarOpen(false);
            }}
            className={cn(
              "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
              "hover:bg-white/30",
              activeView === "my-podcasts" ? "bg-slate-900 text-white shadow-lg" : "bg-white/50 text-slate-900"
            )}
          >
            <span className="text-xl">🎧</span>
            <div>
              <p className="text-sm font-semibold">My Podcasts</p>
              <p className={cn("text-xs", activeView === "my-podcasts" ? "text-white/70" : "text-slate-600")}>SAVED</p>
            </div>
          </button>
          <div className="pt-2">
            {subjects.map(subject => {
              const isActive = activeView === "library" && subject.id === activeSubject?.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => {
                    setActiveView("library");
                    setActiveSubjectId(subject.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={cn(
                    "group mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                    "hover:bg-white/30",
                    isActive ? "bg-slate-900 text-white shadow-lg" : "bg-white/50 text-slate-900"
                  )}
                >
                  <span className="text-xl">{subject.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{subject.name}</p>
                    <p className={cn("text-xs", isActive ? "text-white/70" : "text-slate-600")}>{isActive ? "VIEWING" : "VIEW"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto space-y-3 border-t border-white/20 pt-6">
        <Button
          variant="ghost"
          className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/30 bg-white/40 text-sm font-semibold text-slate-900"
          onClick={() => setIsFilterDrawerOpen(true)}
          disabled={activeView === "my-podcasts"}
        >
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
          <span className="text-xs text-slate-600">
            {filters.course !== "All" || filters.tier !== "All" || filters.mode !== "All" ? "Active" : ""}
          </span>
        </Button>
        <div className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-slate-700">
          <Settings className="h-4 w-4" />
          <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  const showEmptyState = activeView === "library" && filteredTopics.length === 0;
  const totalDuration = currentTrack ? currentDuration || currentTrack.durationSeconds : 0;
  const sliderMax = Math.max(1, totalDuration || 1);
  const clampedProgress = Math.min(progress, sliderMax);
  const remainingTime = Math.max(0, totalDuration - progress);

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${minutes}:${`${secs}`.padStart(2, "0")}`;
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#B8A5E0] via-[#9B8FD0] to-[#7E73C0] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,139,219,0.4),transparent_60%)]" />

      <div className="relative z-10 flex">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/20 bg-white/10 backdrop-blur-xl px-6 lg:flex">
          {sidebarContent}
        </aside>

        <main className="flex-1">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/20 bg-white/20 px-4 py-4 backdrop-blur lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/30 bg-white/40 text-slate-900"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/30 bg-white/40 text-slate-900"
                onClick={() => setIsFilterDrawerOpen(true)}
                disabled={activeView === "my-podcasts"}
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/30 bg-white/40 text-slate-900"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <section className="space-y-8 px-6 py-10 sm:px-8">
            {activeView === "library" ? (
              <>
                <div>
                  <p className="inline-block rounded-full bg-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800">
                    StudyCast Library • AI-Powered Revision Podcasts
                  </p>
                  <h1 className="mt-4 text-4xl font-bold sm:text-5xl text-slate-900">Unlock immersive GCSE revision radio</h1>
                  <p className="mt-3 max-w-2xl text-base text-slate-700">
                    Every guide has been crafted with examiner insight, curated topics, and instant access to AI-generated StudyCasts in Focus and Sleep modes.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">StudyCast Library</h2>
                  <p className="text-sm text-slate-700 mb-4">Browse curated GCSE guides and unlock immersive audio revision sessions.</p>
                </div>
                <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredTopics.map((topic, index) => (
                    <motion.button
                      key={topic.id}
                      onClick={() => openTopic(topic)}
                      className="group relative flex h-full flex-col rounded-3xl bg-white/80 backdrop-blur-sm p-8 text-left shadow-sm transition-all hover:shadow-lg"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                    >
                      <div className="relative flex items-start gap-4 mb-6">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center text-3xl">
                          {activeSubject?.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{topic.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{topic.description}</p>
                        </div>
                      </div>
                      <div className="relative mb-6 flex flex-wrap gap-2">
                        <span className="rounded-md bg-indigo-100/60 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
                          {topic.courseType}
                        </span>
                        <span className="rounded-md bg-purple-100/60 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-600">
                          {topic.tier}
                        </span>
                        <span className="rounded-md bg-blue-100/60 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-600">
                          {topic.examBoard}
                        </span>
                      </div>
                      <div className="relative mt-auto flex items-center justify-between text-sm font-semibold text-indigo-600">
                        <span>Open Guide</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </motion.button>
                  ))}
                  {showEmptyState && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                      <p className="text-lg font-semibold text-slate-900">No StudyCasts saved yet.</p>
                      <p className="mt-2 max-w-sm text-sm text-slate-700">
                        Generate a StudyCast and tap "Save to Library" to build your personalised revision playlist.
                      </p>
                    </div>
                  )}
                </motion.div>
              </>
            ) : (
              <>
                <div>
                  <p className="inline-block rounded-full bg-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800">
                    My StudyCasts • Your generated episodes
                  </p>
                  <h1 className="mt-4 text-4xl font-bold sm:text-5xl text-slate-900">Dive back into your personalised podcasts</h1>
                  <p className="mt-3 max-w-2xl text-base text-slate-700">
                    Queue or replay anything you've generated. Hover a topic to reveal every episode you've crafted.
                  </p>
                </div>

                {savedPodcastsError && (
                  <div className="rounded-3xl border border-red-200 bg-red-50/70 px-6 py-5 text-sm text-red-700 shadow-sm">
                    <p>{savedPodcastsError}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 rounded-full border border-red-200 bg-white/70 text-red-700 hover:bg-red-100"
                      onClick={() => void loadSavedPodcasts()}
                    >
                      Try again
                    </Button>
                  </div>
                )}

                {isLoadingSavedPodcasts ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/60 px-8 py-14 text-center shadow-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
                    <p className="mt-4 text-sm font-semibold text-slate-700">Loading your StudyCasts…</p>
                  </div>
                ) : savedPodcastsByTopic.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 px-8 py-16 text-center">
                    <p className="text-lg font-semibold text-slate-900">No podcasts yet</p>
                    <p className="mt-2 max-w-md text-sm text-slate-700">
                      Generate a StudyCast to see it here instantly, ready to play or queue.
                    </p>
                  </div>
                ) : (
                  <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {savedPodcastsByTopic.map((group, index) => {
                      const subjectDetails = subjectLookup.get(group.subject.toLowerCase());
                      const accent = subjectDetails?.accent ?? "#6366F1";
                      const icon = subjectDetails?.icon ?? "🎧";
                      return (
                        <motion.div
                          key={`${group.subject}-${group.topic}`}
                          className="group relative flex h-full flex-col rounded-3xl bg-white/80 backdrop-blur-sm p-6 text-left shadow-sm transition-all hover:shadow-lg"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
                              style={{ background: `${accent}20`, color: accent }}
                            >
                              {icon}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-slate-900">{group.topic}</h3>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">{group.subject}</p>
                              <p className="mt-1 text-xs text-slate-500">{group.podcasts.length} episode{group.podcasts.length > 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2 overflow-hidden transition-all duration-300 ease-out md:max-h-0 md:opacity-0 md:group-hover:max-h-72 md:group-hover:opacity-100 md:group-focus-within:max-h-72 md:group-focus-within:opacity-100">
                            {group.podcasts.map(podcast => {
                              const modeLabel = mapSavedModeToLibrary(podcast.mode);
                              const dateLabel = formatSavedDate(podcast.createdAt);
                              const durationLabel = formatSavedDuration(podcast.durationSeconds);
                              return (
                                <div
                                  key={podcast.id}
                                  className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 px-3 py-2 shadow-sm"
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100"
                                    onClick={() => handlePlaySavedPodcast(podcast)}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">{modeLabel} session</p>
                                    <p className="text-xs text-slate-600">
                                      {dateLabel}
                                      {durationLabel ? ` • ${durationLabel}` : ""}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100"
                                    onClick={() => handleQueueSavedPodcast(podcast)}
                                  >
                                    <ListMusic className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
      <Drawer open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <DrawerContent className="bg-gradient-to-br from-[#B8A5E0] to-[#9B8FD0] text-slate-900">
          <DrawerHeader>
            <DrawerTitle className="text-left text-xl">Subjects</DrawerTitle>
            <DrawerDescription className="text-left text-slate-700">
              Pin a subject to refresh the playlists in the main view.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-10">{sidebarContent}</div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent className="bg-gradient-to-br from-[#B8A5E0] to-[#9B8FD0] text-slate-900">
          <DrawerHeader>
            <DrawerTitle className="text-left text-lg">Filter playlists</DrawerTitle>
            <DrawerDescription className="text-left text-slate-700">
              Combine filters to tune the StudyCast experience.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-6 px-6 pb-10">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Course type</h3>
              <div className="mt-3 flex gap-3">
                {(["All", "Combined", "Triple"] as CourseFilter[]).map(option => (
                  <Button
                    key={option}
                    onClick={() => setFilters(prev => ({ ...prev, course: option }))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs",
                      filters.course === option 
                        ? "border-slate-900 bg-slate-900 text-white" 
                        : "border-white/40 bg-white/40 text-slate-700 hover:bg-white/60"
                    )}
                    variant="ghost"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tier</h3>
              <div className="mt-3 flex gap-3">
                {(["All", "Foundation", "Higher"] as TierFilter[]).map(option => (
                  <Button
                    key={option}
                    onClick={() => setFilters(prev => ({ ...prev, tier: option }))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs",
                      filters.tier === option 
                        ? "border-slate-900 bg-slate-900 text-white" 
                        : "border-white/40 bg-white/40 text-slate-700 hover:bg-white/60"
                    )}
                    variant="ghost"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Preferred mode</h3>
              <div className="mt-3 flex gap-3">
                {(["All", "Explainer", "Repetition"] as ModeFilter[]).map(option => (
                  <Button
                    key={option}
                    onClick={() => setFilters(prev => ({ ...prev, mode: option }))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs",
                      filters.mode === option 
                        ? "border-slate-900 bg-slate-900 text-white" 
                        : "border-white/40 bg-white/40 text-slate-700 hover:bg-white/60"
                    )}
                    variant="ghost"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <DrawerClose asChild>
                <Button className="flex-1 rounded-full border border-white/40 bg-white/40 text-sm text-slate-700" variant="ghost">
                  Close
                </Button>
              </DrawerClose>
              <Button
                className="flex-1 rounded-full bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => setFilters({ course: "All", tier: "All", examBoard: "All", mode: "All" })}
              >
                Reset filters
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <AnimatePresence>
        {isPlaylistOpen && activeTopic && activeSubject && (
          <>
            <motion.div
              className="fixed inset-0 z-30 backdrop-blur-md bg-slate-900/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTopic}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-40 flex w-[90%] max-w-4xl h-[85vh] flex-col rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="flex items-start justify-between border-b border-slate-200 px-8 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-3xl">
                    {activeSubject.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeSubject.name} {activeTopic.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{activeTopic.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                        {activeTopic.courseType}
                      </span>
                      <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
                        {activeTopic.tier}
                      </span>
                      <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {activeTopic.examBoard}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                  onClick={closeTopic}
                >
                  Close
                </Button>
              </div>

              <div className="border-b border-slate-200 px-8 py-4">
                <div className="flex items-start justify-between">
                  {["chemistry", "biology", "physics"].includes(activeSubjectId) ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Course Type</h3>
                      <div className="flex gap-3">
                        {(["Combined", "Triple"] as const).map(option => (
                          <Button
                            key={option}
                            onClick={() => setActiveTopic(prev => prev ? {...prev, courseType: option} : null)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-xs",
                              activeTopic.courseType === option 
                                ? "border-slate-900 bg-slate-900 text-white" 
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            )}
                            variant="ghost"
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="self-center rounded-full border border-indigo-600 bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      onClick={() => handleAddAllToQueue(activeTopic)}
                    >
                      Generate podcast from whole topic
                    </Button>
                  )}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Tier</h3>
                    <div className="flex gap-3">
                      {(["Foundation", "Higher"] as const).map(option => (
                        <Button
                          key={option}
                          onClick={() => setActiveTopic(prev => prev ? {...prev, tier: option} : null)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs",
                            activeTopic.tier === option 
                              ? "border-slate-900 bg-slate-900 text-white" 
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          )}
                          variant="ghost"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Exam Board</h3>
                    <div className="flex gap-3">
                      {(["AQA", "Edexcel", "OCR"] as const).map(option => (
                        <Button
                          key={option}
                          onClick={() => setActiveTopic(prev => prev ? {...prev, examBoard: option} : null)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs",
                            activeTopic.examBoard === option 
                              ? "border-slate-900 bg-slate-900 text-white" 
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          )}
                          variant="ghost"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 px-8 py-6">
                <div className="space-y-3">
                  {activeTopic.subtopics.map((subtopic, index) => {
                    const mode = getModeForSubtopic(subtopic.id);
                    const isCompleted = completedSubtopics.includes(subtopic.id);
                    const isCurrent = currentTrack?.subtopicId === subtopic.id;
                    return (
                      <div
                        key={subtopic.id}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-white px-6 py-4 transition-all hover:shadow-md",
                          isCurrent ? "border-indigo-200 bg-indigo-50" : "border-slate-200 hover:border-slate-300",
                          isCompleted ? "opacity-80" : ""
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900">{subtopic.title}</h3>
                            <p className="mt-1 text-sm text-slate-600">{subtopic.title}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            onClick={() => openSubtopicForGeneration(subtopic)}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            className="pointer-events-auto fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <div className="flex w-full max-w-3xl items-center gap-5 rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-lg">
              <audio ref={audioRef} className="hidden" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                    style={{ background: `${currentTrack.subjectAccent}26`, color: currentTrack.subjectAccent }}
                  >
                    {currentTrack.subjectIcon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-600">{currentTrack.mode}</p>
                    <p className="text-sm font-semibold text-slate-900">{currentTrack.subtopicTitle}</p>
                    <p className="text-xs text-slate-600">{currentTrack.topicTitle}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Slider
                    max={sliderMax}
                    value={[clampedProgress]}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-slate-600">
                    <span>{formatTime(clampedProgress)}</span>
                    <span>{formatTime(remainingTime)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Button
                  size="icon"
                  className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-slate-300 bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                  onClick={handleClearQueue}
                >
                  Clear queue
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chemistry Filter Modal */}
      <PodcastGenerationModal
        isOpen={isGenerationModalOpen && Boolean(modalSubtopic)}
        onClose={closeGenerationModal}
        userId={user?.id ?? null}
        subjectIcon={activeSubject?.icon ?? "🎧"}
        subjectAccent={activeSubject?.accent ?? "#6366F1"}
        subjectName={activeSubject?.name ?? "GCSE"}
        topic={activeTopic}
        subtopic={modalSubtopic}
        initialMode={modalSubtopic ? getModeForSubtopic(modalSubtopic.id) : preferredMode}
        courseType={activeTopic?.courseType ?? "Combined"}
        examBoard={activeTopic?.examBoard ?? "AQA"}
        tier={activeTopic?.tier ?? "Foundation"}
        onModeChange={mode => {
          if (modalSubtopic) {
            updateModeSelection(modalSubtopic.id, mode);
          }
        }}
        onPodcastReady={handlePodcastReady}
      />
      <ChemistryFilterModal
        isOpen={isChemistryFilterModalOpen}
        onClose={() => {
          setIsChemistryFilterModalOpen(false);
          setPendingChemistryTopic(null);
        }}
        onConfirm={handleChemistryFilterConfirm}
        topicTitle={pendingChemistryTopic?.title ?? ""}
      />
      <DuplicatePodcastDialog
        isOpen={isDuplicateDialogOpen}
        onReplace={handleReplacePodcast}
        onKeepOld={handleKeepOldPodcast}
      />
    </div>
  );
};

export default StudyCastLibrary;
