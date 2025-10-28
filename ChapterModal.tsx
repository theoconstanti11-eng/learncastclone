import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Headphones, ListMusic, AlertCircle, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Textbook {
  id: string;
  title: string;
  subject: string;
  exam_board: string;
  course: string;
  chapters: string[];
  description: string | null;
  cover_image: string | null;
}

interface ChapterModalProps {
  textbook: Textbook;
  open: boolean;
  onClose: () => void;
}

export function ChapterModal({ textbook, open, onClose }: ChapterModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapter)
        ? prev.filter((c) => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleGenerateChapter = (chapter: string) => {
    navigate("/generate", {
      state: {
        subject: textbook.subject,
        topic: `${textbook.title} - ${chapter}`,
        textbookContext: {
          textbookId: textbook.id,
          textbookTitle: textbook.title,
          chapter: chapter,
          examBoard: textbook.exam_board,
          course: textbook.course,
        },
      },
    });
    onClose();
  };

  const handleGeneratePlaylist = () => {
    if (selectedChapters.length === 0) {
      toast({
        title: "No chapters selected",
        description: "Please select at least one chapter to generate a playlist",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Playlist generation coming soon! 🎧",
      description: `For now, you can generate individual chapters. Selected: ${selectedChapters.length} chapter${selectedChapters.length > 1 ? "s" : ""}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card/95 backdrop-blur-lg border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {textbook.title}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{textbook.subject}</Badge>
              <Badge variant="outline">{textbook.exam_board}</Badge>
              <Badge variant="outline">{textbook.course}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">AI-Generated Content</p>
            <p className="text-muted-foreground">
              StudyCast creates original AI summaries inspired by this textbook's topics.
              We don't reproduce or distribute copyrighted material.
            </p>
          </div>
        </motion.div>

        {/* Chapters List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">
              Chapters ({textbook.chapters.length})
            </h3>
            {selectedChapters.length > 0 && (
              <Button
                onClick={handleGeneratePlaylist}
                variant="outline"
                size="sm"
                className="hover:shadow-glow-accent"
              >
                <ListMusic className="mr-2 h-4 w-4" />
                Generate Playlist ({selectedChapters.length})
              </Button>
            )}
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {textbook.chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-glass ${
                    selectedChapters.includes(chapter)
                      ? "bg-primary/10 border-primary/40"
                      : "bg-card/50 border-primary/20"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => toggleChapter(chapter)}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium">{chapter}</span>
                  </div>

                  <Button
                    onClick={() => handleGenerateChapter(chapter)}
                    size="sm"
                    className="ml-4 hover:shadow-glow-accent"
                  >
                    <Play className="mr-2 h-3 w-3" />
                    Generate
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-primary/10">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
