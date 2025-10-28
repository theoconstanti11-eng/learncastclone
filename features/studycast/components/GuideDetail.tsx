import { motion } from "framer-motion";
import { StudyGuide, Topic } from "../data";
import { TopicAccordion } from "./TopicAccordion";

type GuideDetailProps = {
  guide: StudyGuide;
  examBoard: string;
  level: "Foundation" | "Higher";
  onExamBoardChange: (value: string) => void;
  onLevelChange: (value: "Foundation" | "Higher") => void;
  onSelectTopic: (topic: Topic) => void;
  onClose: () => void;
};

export const GuideDetail = ({
  guide,
  examBoard,
  level,
  onExamBoardChange,
  onLevelChange,
  onSelectTopic,
  onClose,
}: GuideDetailProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layout
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative z-10 flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl shadow-indigo-200/50"
      >
        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-indigo-100/90 via-purple-100/80 to-pink-100/80 px-8 py-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-4xl">
              {guide.icon}
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{guide.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{guide.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {guide.examBoards.map((board) => (
                  <span key={board} className="rounded-full bg-white/70 px-3 py-1">
                    {board}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-8 py-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Exam Board</span>
              <div className="mt-2 flex items-center gap-2 rounded-full bg-indigo-50/80 p-1 text-sm font-semibold text-indigo-600">
                {guide.examBoards.map((board) => (
                  <button
                    key={board}
                    type="button"
                    onClick={() => onExamBoardChange(board)}
                    className={`rounded-full px-4 py-1.5 transition ${
                      examBoard === board ? "bg-white text-indigo-600 shadow" : "text-indigo-500 hover:bg-white/70"
                    }`}
                  >
                    {board}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Level</span>
              <div className="mt-2 flex items-center gap-2 rounded-full bg-purple-50/80 p-1 text-sm font-semibold text-purple-600">
                {guide.levels.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onLevelChange(option)}
                    className={`rounded-full px-4 py-1.5 transition ${
                      level === option ? "bg-white text-purple-600 shadow" : "text-purple-500 hover:bg-white/70"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {guide.topics.map((topic) => (
              <TopicAccordion key={topic.id} topic={topic} onGenerate={onSelectTopic} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
