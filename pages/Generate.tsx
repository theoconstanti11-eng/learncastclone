import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Headphones, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { StudyCastAppShell } from "@/components/layouts/StudyCastAppShell";

const generatePodcastSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(100, "Subject must be less than 100 characters"),
  topic: z.string().trim().min(1, "Topic is required").max(500, "Topic must be less than 500 characters"),
  level: z.string().max(50, "Level must be less than 50 characters").optional(),
  exam_board: z.string().max(50, "Exam board must be less than 50 characters").optional(),
});

const subjects = [
  "Mathematics",
  "Science",
  "History",
  "french",
  "Literature",
  "English language",
  "Geography",
  "Economics",
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "Business Studies",
  "Music",
  "PE",
];

const levels = ["Foundation", "Higher"];

const examBoards = ["AQA", "Edexcel", "OCR", "WJEC", "CCEA", "SQA"];

const Generate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(location.state?.subject || "");
  const [topic, setTopic] = useState(location.state?.topic || "");
  const [level, setLevel] = useState<string>("");
  const [examBoard, setExamBoard] = useState<string>("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    // Validate input before submission
    const validationResult = generatePodcastSchema.safeParse({
      subject,
      topic,
      level: level || undefined,
      exam_board: examBoard || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Generating your podcast... 🎙️");

    try {
      // Call edge function to generate podcast
      const { data, error } = await supabase.functions.invoke("generate-podcast", {
        body: validationResult.data,
      });

      if (error) throw error;

      toast.dismiss(loadingToast);

      if (data.cached) {
        toast.success("Found existing podcast! 🎧");
      } else {
        toast.success("Podcast generated! 🎧");
      }

      navigate(`/listen/${data.podcastId}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);

      // Show specific error messages
      const errorMessage = error.message || "Failed to generate podcast";
      if (errorMessage.includes("too long")) {
        toast.error("Topic too broad. Try being more specific! 📝");
      } else if (errorMessage.includes("Unauthorized")) {
        toast.error("Please log in to generate podcasts");
        navigate("/login");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudyCastAppShell>
      <header className="border-b border-white/25 bg-white/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full border border-white/40 bg-white/50 text-slate-800 hover:bg-white/70"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/40 bg-white/60 p-2 shadow-sm">
                <Headphones className="h-5 w-5 text-indigo-500" />
              </div>
              <span className="text-lg font-semibold tracking-wide text-slate-900">StudyCast Studio</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/40 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>AI Generation</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Generate Your Podcast</h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Tell us what you want to learn and we'll create a personalized podcast for you
            </p>
          </div>

          <Card className="rounded-3xl border border-white/30 bg-white/80 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">Podcast Details</CardTitle>
              <CardDescription className="text-slate-600">
                Choose a subject and topic to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level (Optional)</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examBoard">Exam Board (Optional)</Label>
                    <Select value={examBoard} onValueChange={setExamBoard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {examBoards.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Electrolysis, Pythagorean Theorem, Photosynthesis"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific for better results. The AI will generate a 5-8 minute study podcast.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 py-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Podcast
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-10 rounded-2xl border border-white/30 bg-white/60 p-6 text-left text-slate-700 shadow-lg backdrop-blur-xl">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm">
              <li>• Podcasts are 5-8 minutes of relaxing study content</li>
              <li>• Same topic won't be regenerated (saves your credits)</li>
              <li>• Add level and exam board for tailored content</li>
              <li>• Audio files are stored securely in your library</li>
            </ul>
          </div>
        </div>
      </main>
    </StudyCastAppShell>
  );
};

export default Generate;
