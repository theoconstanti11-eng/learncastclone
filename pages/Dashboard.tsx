import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PodcastCard } from '@/components/PodcastCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ProgressWidget } from '@/components/ProgressWidget';
import { StudyCastChatPanel } from '@/features/dashboard/StudyCastChatPanel';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, FlaskConical, Globe, Calculator, Languages, Brain, Headphones, Sparkles, ChevronDown, LayoutDashboard, Settings, User, Bookmark, ChevronsDownUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';
interface Podcast {
  id: string;
  subject: string;
  topic: string;
  audio_url: string | null;
  is_favorite: boolean;
  created_at: string;
}
interface FullPodcast extends Podcast {
  content?: string | null;
}
interface Profile {
  full_name: string | null;
  has_completed_onboarding: boolean;
  course: string | null;
  year_group: string | null;
  subjects: string[] | null;
}
type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};
const levelOptions = ['Foundation', 'Higher'];
const examBoardOptions = ['AQA', 'Edexcel', 'OCR'];
const topicLibrary: Record<string, Record<string, string[]>> = {
  Mathematics: {
    AQA: ['Algebraic Fractions', 'Quadratic Graphs', 'Probability Essentials'],
    Edexcel: ['Circle Theorems', 'Vectors in Geometry', 'Statistical Sampling'],
    OCR: ['Simultaneous Equations', 'Trigonometry Identities', 'Indices & Surds']
  },
  Science: {
    AQA: ['Atomic Structure', 'Energy Transfers', 'Inheritance & Variation'],
    Edexcel: ['Enzymes & Digestion', 'Magnetism Basics', 'Respiration Pathways'],
    OCR: ['Cell Division', 'Forces & Motion', 'Chemical Bonding']
  },
  History: {
    AQA: ['Cold War Origins', 'Elizabethan England', 'Medicine Through Time'],
    Edexcel: ['Weimar Republic', 'American West', 'Crime & Punishment'],
    OCR: ['Norman Conquest', 'Civil Rights Movement', 'The Age of Exploration']
  },
  Languages: {
    AQA: ['Holiday Conversations', 'Healthy Living', 'Future Plans'],
    Edexcel: ['School & Education', 'Cultural Celebrations', 'Technology & Media'],
    OCR: ['Family & Relationships', 'Environment & Sustainability', 'Work & Careers']
  },
  Literature: {
    AQA: ['Macbeth Themes', 'Poetry Comparisons', 'Unseen Prose Skills'],
    Edexcel: ['An Inspector Calls', 'Love & Relationships Poetry', '19th Century Fiction'],
    OCR: ['Jekyll and Hyde', 'Dystopian Literature', 'Romantic Poetry Movements']
  },
  Psychology: {
    AQA: ['Attachment Theories', 'Memory Models', 'Social Influence'],
    Edexcel: ['Research Methods', 'Biological Psychology', 'Learning Theories'],
    OCR: ['Clinical Psychology', 'Criminal Psychology', 'Issues & Debates']
  }
};
const chatSteps = [{
  id: 'subject',
  question: 'Hey 👋 What subject would you like to focus on?',
  type: 'text' as const
}, {
  id: 'level',
  question: 'Nice! Are you doing Foundation or Higher?',
  type: 'buttons' as const
}, {
  id: 'examBoard',
  question: 'Which exam board?',
  type: 'dropdown' as const
}, {
  id: 'topic',
  question: 'Any particular topic?',
  type: 'dropdown' as const
}];
const subjects = [{
  icon: Calculator,
  title: 'Mathematics',
  description: 'Algebra, Calculus & more',
  slug: 'mathematics'
}, {
  icon: FlaskConical,
  title: 'Science',
  description: 'Physics, Chemistry, Biology',
  slug: 'science'
}, {
  icon: Globe,
  title: 'History',
  description: 'World History & Events',
  slug: 'history'
}, {
  icon: Languages,
  title: 'Languages',
  description: 'Learn new languages',
  slug: 'languages'
}, {
  icon: BookOpen,
  title: 'Literature',
  description: 'Books & Writing',
  slug: 'literature'
}, {
  icon: Brain,
  title: 'Psychology',
  description: 'Mind & Behavior',
  slug: 'psychology'
}];
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [isTypingQuestion, setIsTypingQuestion] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedExamBoard, setSelectedExamBoard] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatedPodcast, setGeneratedPodcast] = useState<FullPodcast | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const typingIntervals = useRef<ReturnType<typeof setInterval>[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const prevChatLengthRef = useRef(0);
  const floatingParticles = useMemo(() => [{
    top: '10%',
    left: '8%',
    size: 240,
    offset: 24,
    duration: 18,
    delay: 0
  }, {
    top: '32%',
    left: '75%',
    size: 180,
    offset: 32,
    duration: 22,
    delay: 1.4
  }, {
    top: '68%',
    left: '15%',
    size: 200,
    offset: 28,
    duration: 19,
    delay: 0.7
  }, {
    top: '80%',
    left: '70%',
    size: 260,
    offset: 36,
    duration: 24,
    delay: 1.1
  }, {
    top: '45%',
    left: '40%',
    size: 160,
    offset: 22,
    duration: 16,
    delay: 0.5
  }], []);
  const navItems = useMemo(() => [{
    label: 'Dashboard',
    description: 'Your StudyCast home',
    icon: LayoutDashboard,
    onClick: () => navigate('/dashboard'),
    active: true
  }, {
    label: 'Generate Podcast',
    description: 'Craft something new',
    icon: Sparkles,
    onClick: () => navigate('/generate'),
    active: false
  }, {
    label: 'My Podcasts',
    description: 'Pick up where you left',
    icon: Headphones,
    onClick: () => navigate('/my-podcasts'),
    active: false
  }, {
    label: 'Library',
    description: 'Textbooks & notes',
    icon: BookOpen,
    onClick: () => navigate('/library'),
    active: false
  }, {
    label: 'Profile',
    description: 'Personalise your feed',
    icon: User,
    onClick: () => navigate('/profile'),
    active: false
  }, {
    label: 'Upgrade',
    description: 'Unlock premium StudyCast',
    icon: Settings,
    onClick: () => navigate('/pricing'),
    active: false
  }], [navigate]);
  const availableTopics = useMemo(() => {
    if (!selectedSubject || !selectedExamBoard) return [];
    const topics = topicLibrary[selectedSubject]?.[selectedExamBoard] ?? [];
    if (topics.length > 0) return topics;
    return ['Core Concepts Recap', 'Exam Techniques Masterclass', 'Practice Paper Workshop'];
  }, [selectedSubject, selectedExamBoard]);
  const activeStep = currentStepIndex >= 0 && currentStepIndex < chatSteps.length ? chatSteps[currentStepIndex] : null;
  const addAiMessage = useCallback((id: string, text: string, onComplete?: () => void) => {
    setChatHistory(prev => [...prev, {
      id,
      role: 'ai',
      text: ''
    }]);
    setIsTypingQuestion(true);
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setChatHistory(prev => prev.map(message => message.id === id ? {
        ...message,
        text: text.slice(0, index)
      } : message));
      if (index >= text.length) {
        clearInterval(interval);
        typingIntervals.current = typingIntervals.current.filter(timer => timer !== interval);
        setIsTypingQuestion(false);
        onComplete?.();
      }
    }, 35);
    typingIntervals.current.push(interval);
  }, []);
  const markStepCompleted = useCallback((id: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [id]: true
    }));
  }, []);
  useEffect(() => {
    return () => {
      typingIntervals.current.forEach(timer => clearInterval(timer));
    };
  }, []);
  useEffect(() => {
    if (loading) return;
    if (chatHistory.length > 0) return;
    addAiMessage(`${chatSteps[0].id}-question`, chatSteps[0].question);
  }, [addAiMessage, chatHistory.length, loading]);
  useEffect(() => {
    if (loading) return;
    if (!activeStep || activeStep.id === 'subject') return;
    const messageId = `${activeStep.id}-question`;
    const alreadyAsked = chatHistory.some(message => message.id === messageId);
    if (!alreadyAsked) {
      addAiMessage(messageId, activeStep.question);
    }
  }, [activeStep, addAiMessage, chatHistory, loading]);
  useEffect(() => {
    const isNewMessage = chatHistory.length > prevChatLengthRef.current;
    prevChatLengthRef.current = chatHistory.length;
    if (!isNewMessage) return;
    chatEndRef.current?.scrollIntoView({
      behavior: chatHistory.length <= 1 ? 'auto' : 'smooth'
    });
  }, [chatHistory]);
  const handleSubjectSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subjectInput.trim() || isTypingQuestion) return;
    const rawValue = subjectInput.trim();
    const rawValueLower = rawValue.toLowerCase();
    const matchedSubject = subjects.find(subject => subject.title.toLowerCase() === rawValueLower)?.title || subjects.find(subject => subject.slug === rawValueLower)?.title || subjects.find(subject => subject.title.toLowerCase().includes(rawValueLower) || rawValueLower.includes(subject.slug))?.title || rawValue.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    setSelectedSubject(matchedSubject);
    setSelectedLevel('');
    setSelectedExamBoard('');
    setSelectedTopic('');
    setGeneratedPodcast(null);
    setTranscriptOpen(false);
    setSubjectInput('');
    setChatHistory(prev => [...prev, {
      id: 'subject-user',
      role: 'user',
      text: matchedSubject
    }]);
    markStepCompleted('subject');
    setCurrentStepIndex(1);
  };
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setChatHistory(prev => {
      const existingIndex = prev.findIndex(message => message.id === 'level-user');
      if (existingIndex !== -1) {
        const clone = [...prev];
        clone[existingIndex] = {
          id: 'level-user',
          role: 'user',
          text: level
        };
        return clone;
      }
      return [...prev, {
        id: 'level-user',
        role: 'user',
        text: level
      }];
    });
    if (!completedSteps.level) {
      markStepCompleted('level');
      setCurrentStepIndex(prev => Math.min(prev + 1, chatSteps.length - 1));
    }
  };
  const handleExamBoardSelect = (value: string) => {
    setSelectedExamBoard(value);
    setSelectedTopic('');
    setGeneratedPodcast(null);
    setTranscriptOpen(false);
    setChatHistory(prev => {
      const existingIndex = prev.findIndex(message => message.id === 'examBoard-user');
      if (existingIndex !== -1) {
        const clone = [...prev];
        clone[existingIndex] = {
          id: 'examBoard-user',
          role: 'user',
          text: value
        };
        return clone;
      }
      return [...prev, {
        id: 'examBoard-user',
        role: 'user',
        text: value
      }];
    });
    if (!completedSteps.examBoard) {
      markStepCompleted('examBoard');
      setCurrentStepIndex(prev => Math.min(prev + 1, chatSteps.length - 1));
    }
  };
  const handleTopicSelect = (value: string) => {
    setSelectedTopic(value);
    setGeneratedPodcast(null);
    setTranscriptOpen(false);
    setChatHistory(prev => {
      const existingIndex = prev.findIndex(message => message.id === 'topic-user');
      if (existingIndex !== -1) {
        const clone = [...prev];
        clone[existingIndex] = {
          id: 'topic-user',
          role: 'user',
          text: value
        };
        return clone;
      }
      return [...prev, {
        id: 'topic-user',
        role: 'user',
        text: value
      }];
    });
    if (!completedSteps.topic) {
      markStepCompleted('topic');
      addAiMessage('topic-confirmation', `Amazing choice! Shall we generate a StudyCast on ${value}?`);
    }
  };
  const handleGenerateStudyCast = async () => {
    if (!selectedSubject || !selectedTopic) {
      toast.error('Please choose a subject and topic to generate your StudyCast.');
      return;
    }
    if (!user) {
      toast.error('Please sign in to generate your StudyCast.');
      navigate('/login');
      return;
    }
    if (generating) return;
    setGenerating(true);
    const loadingMessageId = `generating-${Date.now()}`;
    setChatHistory(prev => [...prev, {
      id: loadingMessageId,
      role: 'ai',
      text: 'Creating your StudyCast... this may take a moment 🎶'
    }]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-podcast', {
        body: {
          subject: selectedSubject,
          topic: selectedTopic,
          level: selectedLevel || undefined,
          exam_board: selectedExamBoard || undefined
        }
      });
      if (error) throw error;
      const podcastId = data?.podcastId;
      if (podcastId) {
        const {
          data: podcast,
          error: podcastError
        } = await supabase.from('podcasts').select('*').eq('id', podcastId).single();
        if (podcastError) throw podcastError;
        setGeneratedPodcast(podcast);
        setRecentPodcasts(prev => {
          if (!podcast) return prev;
          const formattedPodcast: Podcast = {
            id: podcast.id,
            subject: podcast.subject,
            topic: podcast.topic,
            audio_url: podcast.audio_url,
            is_favorite: podcast.is_favorite,
            created_at: podcast.created_at
          };
          const exists = prev.some(item => item.id === podcast.id);
          if (exists) {
            return prev.map(item => item.id === podcast.id ? {
              ...item,
              ...formattedPodcast
            } : item);
          }
          return [formattedPodcast, ...prev].slice(0, 6);
        });
        setChatHistory(prev => [...prev, {
          id: `ready-${podcastId}`,
          role: 'ai',
          text: `Your StudyCast on ${selectedTopic} is ready! Press play and dive in ✨`
        }]);
        toast.success('StudyCast ready to play! 🎧');
      }
    } catch (error: any) {
      console.error('Failed to generate StudyCast', error);
      const errorMessage = error?.message ?? 'Unable to generate your StudyCast right now.';
      toast.error(errorMessage);
      setChatHistory(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'ai',
        text: 'Something went wrong creating your StudyCast. Try tweaking your topic and try again!'
      }]);
    } finally {
      setGenerating(false);
    }
  };
  const handleSaveToLibrary = async () => {
    if (!generatedPodcast) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setIsSaving(true);
    try {
      const nextFavorite = !generatedPodcast.is_favorite;
      const {
        error
      } = await supabase.from('podcasts').update({
        is_favorite: nextFavorite
      }).eq('id', generatedPodcast.id);
      if (error) throw error;
      setGeneratedPodcast(prev => prev ? {
        ...prev,
        is_favorite: nextFavorite
      } : prev);
      setRecentPodcasts(prev => prev.map(podcast => podcast.id === generatedPodcast.id ? {
        ...podcast,
        is_favorite: nextFavorite
      } : podcast));
      toast.success(nextFavorite ? 'Saved to your library' : 'Removed from your library');
    } catch (error) {
      console.error('Failed to update favorite status', error);
      toast.error('We could not update your library right now. Try again in a moment.');
    } finally {
      setIsSaving(false);
    }
  };
  const selectionSummary = useMemo(() => [{
    label: 'Subject',
    value: selectedSubject
  }, {
    label: 'Level',
    value: selectedLevel
  }, {
    label: 'Exam Board',
    value: selectedExamBoard
  }, {
    label: 'Topic',
    value: selectedTopic
  }], [selectedExamBoard, selectedLevel, selectedSubject, selectedTopic]);
  const filledSummary = useMemo(() => selectionSummary.filter(item => item.value), [selectionSummary]);
  const readyToGenerate = Boolean(completedSteps.topic && selectedTopic);
  const canResetFlow = Boolean(chatHistory.length > 1 || selectedSubject || selectedLevel || selectedExamBoard || selectedTopic || generatedPodcast);
  const handleResetFlow = () => {
    typingIntervals.current.forEach(timer => clearInterval(timer));
    typingIntervals.current = [];
    setChatHistory([]);
    setCurrentStepIndex(0);
    setCompletedSteps({});
    setSelectedSubject('');
    setSelectedLevel('');
    setSelectedExamBoard('');
    setSelectedTopic('');
    setGeneratedPodcast(null);
    setTranscriptOpen(false);
    setSubjectInput('');
    setIsTypingQuestion(false);
    setGenerating(false);
  };
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);
  const loadData = async () => {
    try {
      setLoading(true);
      const [podcasts, profileData] = await Promise.all([loadRecentPodcasts(), loadProfile()]);
      const hasPodcasts = (podcasts ?? []).length > 0;
      if (profileData && !profileData.has_completed_onboarding && hasPodcasts) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } finally {
      setLoading(false);
    }
  };
  const loadProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('full_name, has_completed_onboarding, course, year_group, subjects').eq('id', user?.id).single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      return null;
    }
  };
  const loadRecentPodcasts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('podcasts').select('*').order('created_at', {
        ascending: false
      }).limit(6);
      if (error) throw error;
      const podcasts = data || [];
      setRecentPodcasts(podcasts);
      return podcasts;
    } catch (error: any) {
      toast.error('Failed to load podcasts');
      console.error(error);
      return [];
    }
  };
  const toggleFavorite = async (podcastId: string, currentStatus: boolean) => {
    try {
      const {
        error
      } = await supabase.from('podcasts').update({
        is_favorite: !currentStatus
      }).eq('id', podcastId);
      if (error) throw error;
      setRecentPodcasts(prev => prev.map(p => p.id === podcastId ? {
        ...p,
        is_favorite: !currentStatus
      } : p));
      toast.success(currentStatus ? 'Removed from favorites' : 'Added to favorites');
    } catch (error: any) {
      toast.error('Failed to update favorite');
      console.error(error);
    }
  };
  const handlePodcastGenerated = useCallback((podcast: Podcast) => {
    setRecentPodcasts(prev => {
      const existingIndex = prev.findIndex(item => item.id === podcast.id);
      if (existingIndex !== -1) {
        const clone = [...prev];
        clone[existingIndex] = {
          ...clone[existingIndex],
          ...podcast
        };
        return clone;
      }
      return [podcast, ...prev].slice(0, 6);
    });
  }, []);
  const handleSubjectClick = (subject: string) => {
    navigate('/generate', {
      state: {
        subject
      }
    });
  };
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const personalization = useMemo(() => {
    if (!profile?.course && !profile?.subjects?.length) return null;
    const course = profile.course ? profile.course.toUpperCase() : null;
    const subjects = profile.subjects?.slice(0, 2).join(' & ');
    if (!course && !subjects) return null;
    return `🎯 Personalized for ${[course, subjects].filter(Boolean).join(' ')}${profile.subjects && profile.subjects.length > 2 ? ' +' + (profile.subjects.length - 2) + ' more' : ''}`;
  }, [profile]);
  if (!user || loading) {
    return <StudyCastAppShell className="items-center justify-center">
        <div className="relative flex flex-1 items-center justify-center">
          <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)]" animate={{
          opacity: [0.5, 0.9, 0.5]
        }} transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }} />
          <div className="relative z-10 text-center text-slate-800">
            <motion.div animate={{
            rotate: 360
          }} transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'linear'
          }} className="mx-auto h-14 w-14 rounded-full border-4 border-white/60 border-t-transparent" />
            <p className="mt-6 text-base font-medium tracking-wide text-slate-700">Preparing your StudyCast studio...</p>
          </div>
        </div>
      </StudyCastAppShell>;
  }
  return <>
      <StudyCastAppShell className="overflow-hidden">
        <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_transparent_55%)]" animate={{
        opacity: [0.55, 0.85, 0.55],
        scale: [1, 1.05, 1]
      }} transition={{
        duration: 14,
        repeat: Infinity,
        ease: 'easeInOut'
      }} />
        <motion.div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" animate={{
        y: [0, 20, 0]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut'
      }} />

        <div className="pointer-events-none absolute inset-0">
          {floatingParticles.map((particle, index) => <div key={index} className="absolute rounded-full bg-white/45 blur-3xl" style={{
          top: particle.top,
          left: particle.left,
          width: particle.size,
          height: particle.size
        }} />)}
        </div>

        <div className="relative z-10 flex min-h-screen">
          <aside className="hidden w-72 flex-col justify-between border-r border-white/40 bg-white/60 backdrop-blur-3xl shadow-glass lg:flex">
            <div className="space-y-10 px-6 pt-12 pb-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] p-3 shadow-lg">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-600">StudyCast</p>
                  <p className="text-lg font-semibold text-slate-900">Navigator</p>
                </div>
              </div>
              <div className="space-y-2">
                {navItems.map(item => <motion.button key={item.label} onClick={item.onClick} className={cn('flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition-all', item.active ? 'bg-white/80 border-white/60 text-slate-900 shadow-lg' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 hover:border-white/30')} whileHover={{
                scale: item.active ? 1 : 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                    <item.icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </motion.button>)}
              </div>
            </div>
            <div className="px-6 pb-10">
              <div className="rounded-3xl border border-white/40 bg-white/60 p-5 text-slate-700 backdrop-blur-xl">
                <p className="text-sm font-semibold text-slate-900">Continue learning</p>
                <p className="mt-2 text-xs text-slate-600">
                  Jump back into your saved StudyCasts or unlock more with Premium.
                </p>
                <div className="mt-4 space-y-2">
                  <Button onClick={() => navigate('/my-podcasts')} className="w-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white hover:opacity-90">
                    🎧 My Podcasts
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/pricing')} className="w-full rounded-full border-white/60 bg-white/50 text-slate-700 hover:bg-white/70">
                    ⭐ Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <header className="flex items-center justify-between px-6 py-6 sm:px-10">
              <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] p-3 shadow-lg sm:hidden">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-600">StudyCast</p>
                  <p className="text-xl font-semibold text-slate-900">Dashboard</p>
                </div>
              </motion.div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-3 rounded-full border border-white/40 bg-white/60 px-3 py-2 text-slate-900 hover:bg-white/80">
                    <Avatar className="h-9 w-9 border border-[#6366F1]/40">
                      <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#22D3EE] text-white text-sm">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-slate-700 md:inline">{firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border border-white/40 bg-white/95 text-slate-900">
                  <DropdownMenuItem onClick={() => navigate('/my-podcasts')}>🎧 My Podcasts</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>👤 Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>⭐ Upgrade</DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>🚪 Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-16 sm:px-8">
              <div className="mx-auto w-full max-w-[1200px] space-y-12">
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.6
              }} className="space-y-4 text-slate-900">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-600">
                    {personalization ? 'Personalised Mode' : 'StudyCast Concierge'}
                  </div>
                  <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                    Let's build the perfect StudyCast for your next revision session. Answer a few quick prompts and we'll recommend a tailored podcast.
                  </p>
                  {personalization && <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm text-slate-700">
                      {personalization}
                    </div>}
                </motion.div>

                {/* Progress Widget */}
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.1
              }} className="mb-8">
                  <ProgressWidget />
                </motion.div>

                {/* Generate Podcast CTA */}
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.2
              }} className="mb-12 grid md:grid-cols-2 gap-4">
                  <Button onClick={() => navigate('/generate')} className="w-full h-auto py-6 px-8 text-lg font-semibold bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white hover:opacity-90 transition-all shadow-lg group">
                    <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Generate New Podcast
                    <span className="ml-2">🎧</span>
                  </Button>
                  
                  <Button onClick={() => navigate('/library')} variant="outline" className="w-full h-auto py-6 px-8 text-lg font-semibold border-2 border-white/60 bg-white/60 text-slate-700 hover:bg-white/80 hover:border-white/80 transition-all group">
                    <BookOpen className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                    Browse Textbooks
                    <span className="ml-2">📚</span>
                  </Button>
                </motion.div>

                {/* StudyCast Chat Assistant */}
                <motion.section initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5,
                delay: 0.25
              }} className="mb-12">
                  <StudyCastChatPanel onPodcastGenerated={handlePodcastGenerated} />
                </motion.section>

                <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <motion.section initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.6,
                  delay: 0.1
                }} className="flex justify-center">
                    <div className="w-full max-w-[600px]">
                      <motion.div initial={{
                      opacity: 0,
                      y: 16
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.6,
                      delay: 0.15
                    }} className="rounded-[32px] border border-white/40 bg-white/60 p-8 backdrop-blur-2xl shadow-glass">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-600">AI Study Coach</p>
                            <h2 className="text-2xl font-semibold text-slate-900">Get Recommended Podcast</h2>
                          </div>
                          {canResetFlow && <Button variant="ghost" onClick={handleResetFlow} className="rounded-full border border-white/40 bg-white/50 px-3 py-2 text-xs text-slate-700 hover:bg-white/70">
                              Reset flow
                            </Button>}
                        </div>

                        {filledSummary.length > 0 && <div className="mt-4 flex flex-wrap gap-2">
                            {filledSummary.map(item => <span key={item.label} className="rounded-full border border-white/40 bg-white/50 px-3 py-1 text-xs text-slate-700">
                                <span className="font-semibold text-slate-900">{item.label}:</span> {item.value}
                              </span>)}
                          </div>}

                        <div className="mt-6 flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
                          {chatHistory.map(message => <motion.div key={message.id} initial={{
                          opacity: 0,
                          y: 12
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                              <div className={cn('max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg', message.role === 'user' ? 'bg-gradient-to-r from-[#6366F1] to-[#22D3EE] text-white' : 'border border-white/60 bg-white/80 text-slate-700 backdrop-blur-xl')}>
                                {message.text}
                              </div>
                            </motion.div>)}
                          <div ref={chatEndRef} />
                        </div>

                        {activeStep?.id === 'subject' && !completedSteps.subject && <motion.form onSubmit={handleSubjectSubmit} initial={{
                        opacity: 0,
                        y: 12
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-6">
                            <Input value={subjectInput} onChange={event => setSubjectInput(event.target.value)} placeholder="e.g. Mathematics, Biology, History..." className="h-12 rounded-full border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/40" />
                            <p className="mt-2 text-xs text-white/60">Tell StudyCast what subject you need help with.</p>
                          </motion.form>}

                        {activeStep?.id === 'level' && <motion.div initial={{
                        opacity: 0,
                        y: 12
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-6 grid gap-3 sm:grid-cols-2">
                            {levelOptions.map(level => <Button key={level} type="button" onClick={() => handleLevelSelect(level)} className={cn('h-12 rounded-full border border-white/15 bg-white/10 text-white/80 hover:text-white hover:bg-white/20', selectedLevel === level && 'border-white/30 bg-white/25 text-white')}>
                                {level}
                              </Button>)}
                          </motion.div>}

                        {activeStep?.id === 'examBoard' && <motion.div initial={{
                        opacity: 0,
                        y: 12
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-6">
                            <Select value={selectedExamBoard} onValueChange={handleExamBoardSelect}>
                              <SelectTrigger className="h-12 rounded-full border-white/15 bg-white/10 text-white focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Select your exam board" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/10 bg-[#0f102e]/95 text-white">
                                {examBoardOptions.map(board => <SelectItem key={board} value={board}>
                                    {board}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                          </motion.div>}

                        {activeStep?.id === 'topic' && <motion.div initial={{
                        opacity: 0,
                        y: 12
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-6">
                            <Select value={selectedTopic} onValueChange={handleTopicSelect}>
                              <SelectTrigger className="h-12 rounded-full border-white/15 bg-white/10 text-white focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Choose a topic to explore" />
                              </SelectTrigger>
                              <SelectContent className="border border-white/10 bg-[#0f102e]/95 text-white">
                                {availableTopics.map(topic => <SelectItem key={topic} value={topic}>
                                    {topic}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                            <p className="mt-2 text-xs text-white/60">
                              Tailored to the {selectedExamBoard || 'chosen'} specification.
                            </p>
                          </motion.div>}

                        {readyToGenerate && <motion.div initial={{
                        opacity: 0,
                        y: 14
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-8">
                            <Button onClick={handleGenerateStudyCast} disabled={generating} className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 py-5 text-lg font-semibold text-white shadow-[0_0_40px_rgba(129,140,248,0.25)] hover:opacity-90 transition-all">
                              {generating ? <>
                                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                  Creating your StudyCast...
                                </> : <>
                                  🎧 Generate My StudyCast
                                </>}
                            </Button>
                          </motion.div>}

                        {generatedPodcast && <motion.div initial={{
                        opacity: 0,
                        y: 16
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} className="mt-10 space-y-6">
                            {generatedPodcast.audio_url ? <AudioPlayer audioUrl={generatedPodcast.audio_url} title={generatedPodcast.topic} subject={generatedPodcast.subject} /> : <Card className="border border-white/15 bg-white/5 p-6 text-white/80">
                                <p>We're preparing the audio for this StudyCast. Check back shortly.</p>
                              </Card>}

                            <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white hover:bg-white/15">
                                  <span className="font-medium">
                                    {transcriptOpen ? 'Hide transcript' : 'View transcript'}
                                  </span>
                                  <ChevronsDownUp className={cn('h-4 w-4 transition-transform', transcriptOpen ? 'rotate-180' : '')} />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-4">
                                <div className="rounded-2xl border border-white/10 bg-[#0d0c26]/85 p-5 text-sm text-white/80 backdrop-blur-xl">
                                  <p className="whitespace-pre-wrap leading-relaxed">
                                    {generatedPodcast.content || 'Transcript coming soon.'}
                                  </p>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>

                            <Button onClick={handleSaveToLibrary} disabled={isSaving} variant="outline" className={cn('flex w-full items-center justify-center gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20', generatedPodcast.is_favorite && 'border-emerald-200/60 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30')}>
                              <Bookmark className="h-4 w-4" fill={generatedPodcast.is_favorite ? 'currentColor' : 'none'} />
                              {isSaving ? 'Saving...' : generatedPodcast.is_favorite ? 'Saved to Library' : 'Save to Library'}
                            </Button>
                          </motion.div>}
                      </motion.div>
                    </div>
                  </motion.section>

                  <motion.aside initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.6,
                  delay: 0.15
                }} className="space-y-6">
                    

                  <Card className="rounded-[28px] border border-white/40 bg-white/80 p-6 text-slate-700 backdrop-blur-2xl shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
                      <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Need inspiration? Jump straight into the library or revisit saved favourites.
                      </p>
                      <div className="mt-5 space-y-3">
                        <Button variant="ghost" onClick={() => navigate('/library')} className="w-full rounded-full border border-white/50 bg-white/70 text-slate-800 hover:bg-white/80">
                          📚 Browse Library
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/my-podcasts')} className="w-full rounded-full border border-white/40 bg-white/60 text-slate-800 hover:bg-white/70">
                          🎧 Open My Podcasts
                        </Button>
                      </div>
                    </Card>
                  </motion.aside>
                </div>

                <motion.section initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.6,
                delay: 0.25
              }} className="space-y-4">
                  <div className="flex flex-col gap-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-semibold">Quick subject jumps</h2>
                    <Button variant="ghost" onClick={() => navigate('/library')} className="self-start rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm text-slate-800 hover:bg-white/70 sm:self-auto">
                      Explore more resources
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject, index) => {
                    const Icon = subject.icon;
                    return <motion.button key={subject.slug} initial={{
                      opacity: 0,
                      y: 14
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.4,
                      delay: 0.05 * index
                    }} whileHover={{
                      scale: 1.02
                    }} whileTap={{
                      scale: 0.98
                    }} onClick={() => handleSubjectClick(subject.title)} className="flex w-full items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/80 px-5 py-4 text-left text-slate-700 backdrop-blur-xl shadow-sm transition hover:bg-white/90">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{subject.title}</p>
                            <p className="text-xs text-slate-600">{subject.description}</p>
                          </div>
                          <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
                            <Icon className="h-5 w-5 text-indigo-500" />
                          </div>
                        </motion.button>;
                  })}
                  </div>
                </motion.section>

                {recentPodcasts.length > 0 ? <motion.section initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.6,
                delay: 0.3
              }} className="space-y-6">
                    <div className="flex flex-col gap-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-2xl font-semibold">Recently generated for you</h2>
                      <Button variant="ghost" onClick={() => navigate('/my-podcasts')} className="self-start rounded-full border border-white/40 bg-white/60 px-4 py-2 text-sm text-slate-800 hover:bg-white/70 sm:self-auto">
                        View all
                      </Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {recentPodcasts.map((podcast, index) => <motion.div key={podcast.id} initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    duration: 0.4,
                    delay: 0.1 * index
                  }}>
                          <PodcastCard id={podcast.id} topic={podcast.topic} subject={podcast.subject} createdAt={podcast.created_at} isFavorite={podcast.is_favorite} onPlay={() => navigate(`/listen/${podcast.id}`)} onToggleFavorite={() => toggleFavorite(podcast.id, podcast.is_favorite)} />
                        </motion.div>)}
                    </div>
                  </motion.section> : <motion.section initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.6,
                delay: 0.3
              }} className="rounded-[32px] border border-white/40 bg-white/80 p-12 text-center text-slate-700 backdrop-blur-2xl shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/50 bg-white/70">
                      <Headphones className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-slate-900">Your study journey starts here</h3>
                    <p className="mt-3 text-sm text-slate-600">
                      Generate your first StudyCast and experience revision that feels immersive and focused.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button onClick={() => navigate('/generate')} className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-white shadow-[0_0_30px_rgba(129,140,248,0.35)] hover:shadow-[0_0_40px_rgba(129,140,248,0.45)] transition-all">
                        Create your first StudyCast 🎯
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/library')} className="rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/70">
                        Browse the library 📚
                      </Button>
                    </div>
                  </motion.section>}
              </div>
            </main>
          </div>
        </div>
      </StudyCastAppShell>

      <OnboardingModal open={showOnboarding} onClose={() => {
      setShowOnboarding(false);
      loadProfile();
    }} userId={user!.id} />
    </>;
};
export default Dashboard;