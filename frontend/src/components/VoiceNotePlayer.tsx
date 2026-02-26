import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import type { ExternalBlob } from "../hooks/useQueries";

interface VoiceNotePlayerProps {
  blob: ExternalBlob;
  label?: string;
}

export default function VoiceNotePlayer({ blob, label = "Voice Story" }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioUrl = blob.getDirectURL();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 bg-ivoryCream border border-earthBrown/20 rounded-xl px-3 py-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-earthBrown text-ivoryCream flex items-center justify-center shrink-0 hover:bg-earthBrown/90 transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-poppins text-xs font-medium text-earthBrown truncate mb-1">
          {label}
        </p>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 accent-earthBrown cursor-pointer"
        />
      </div>
      <span className="font-roboto text-xs text-earthBrown/60 shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
