import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type DuplicatePodcastDialogProps = {
  isOpen: boolean;
  onReplace: () => void;
  onKeepOld: () => void;
};

export const DuplicatePodcastDialog = ({
  isOpen,
  onReplace,
  onKeepOld,
}: DuplicatePodcastDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md rounded-3xl border border-red-200/50 bg-white p-0 shadow-2xl">
        <div className="flex flex-col items-center gap-6 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              This podcast already exists
            </h2>
            <p className="text-sm text-slate-600">
              Do you want to{" "}
              <button
                onClick={onReplace}
                className="font-semibold text-red-600 underline decoration-red-600/30 underline-offset-2 transition-colors hover:text-red-700 hover:decoration-red-700"
              >
                replace
              </button>{" "}
              the current podcast or{" "}
              <button
                onClick={onKeepOld}
                className="font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-700"
              >
                keep the old one
              </button>
              ?
            </p>
          </div>

          <div className="flex w-full gap-3">
            <Button
              onClick={onKeepOld}
              variant="outline"
              className="flex-1 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Keep Old
            </Button>
            <Button
              onClick={onReplace}
              className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              Replace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
