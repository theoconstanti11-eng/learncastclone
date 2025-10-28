import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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

interface TextbookCardProps {
  textbook: Textbook;
  onClick: () => void;
}

export function TextbookCard({ textbook, onClick }: TextbookCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-primary/20 shadow-glass overflow-hidden group cursor-pointer hover:shadow-glow-accent transition-all duration-300">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {textbook.cover_image ? (
            <img
              src={textbook.cover_image}
              alt={textbook.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-primary/40" />
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </motion.div>
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {textbook.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {textbook.description || `${textbook.chapters.length} chapters available`}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {textbook.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {textbook.exam_board}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {textbook.course}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={onClick}
            className="w-full group-hover:shadow-glow-accent transition-all duration-300"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Chapters
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
