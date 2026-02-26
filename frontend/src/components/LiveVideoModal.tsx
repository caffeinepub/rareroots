import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LiveVideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function LiveVideoModal({
  open,
  onClose,
  videoUrl,
  title = "Live Snap",
}: LiveVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
      timerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        onClose();
      }, 15000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="font-poppins text-earthBrown text-sm">
            🎬 {title}
          </DialogTitle>
        </DialogHeader>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          playsInline
          muted={false}
          controls
        />
        <p className="text-center font-roboto text-xs text-earthBrown/50 py-2">
          Auto-closes after 15 seconds
        </p>
      </DialogContent>
    </Dialog>
  );
}
