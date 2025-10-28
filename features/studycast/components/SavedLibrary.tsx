import { Fragment, useMemo } from "react";
import { motion } from "framer-motion";
import { StudyCastRecording } from "../types";

type SavedLibraryProps = {
  recordings: StudyCastRecording[];
};

export const SavedLibrary = ({ recordings }: SavedLibraryProps) => {
  const grouped = useMemo(() => {
    const bySubject: Record<string, { icon: string; title: string; modes: Record<string, StudyCastRecording[]> }> = {};

    recordings.forEach((recording) => {
      if (!bySubject[recording.guideId]) {
        bySubject[recording.guideId] = {
          icon: recording.subjectIcon,
          title: recording.guideTitle,
          modes: {},
        };
      }
      if (!bySubject[recording.guideId].modes[recording.mode]) {
        bySubject[recording.guideId].modes[recording.mode] = [];
      }
      bySubject[recording.guideId].modes[recording.mode].push(recording);
    });

    return bySubject;
  }, [recordings]);

  if (recordings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/60 p-10 text-center shadow-inner shadow-indigo-200/40">
        <p className="text-lg font-semibold text-slate-700">No StudyCasts saved yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Generate a StudyCast and tap "Save to Library" to build your personalised revision playlist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([subjectId, subjectGroup]) => (
        <motion.div
          key={subjectId}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-indigo-200/40"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                {subjectGroup.icon}
              </span>
              <div>
                <h4 className="text-xl font-semibold text-slate-900">{subjectGroup.title}</h4>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {Object.values(subjectGroup.modes)
                    .reduce((count, recordingsForMode) => count + recordingsForMode.length, 0)
                    .toString()} {" "}
                  saved StudyCasts
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Object.entries(subjectGroup.modes).map(([mode, items]) => (
              <div
                key={mode}
                className="rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-100/50 via-purple-100/40 to-pink-100/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-lg font-semibold text-slate-900">{mode}</h5>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    {items.length} saved
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((recording) => (
                    <Fragment key={recording.id}>
                      <div className="rounded-2xl bg-white/80 p-4 shadow-inner shadow-indigo-200/40">
                        <div className="flex flex-col gap-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">{recording.topicTitle}</span>
                          <span>
                            {recording.examBoard} • {recording.level} • {recording.repetitionLevel}x
                          </span>
                          <span className="text-xs text-slate-400">
                            Saved {new Date(recording.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
