import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload, Check } from "lucide-react";
import { ExternalBlob } from "../backend";
import { toast } from "sonner";

interface VoiceNoteRecorderProps {
  onSave: (blob: ExternalBlob) => void;
  maxSeconds?: number;
  label?: string;
}

export default function VoiceNoteRecorder({
  onSave,
  maxSeconds = 30,
  label = "Record Voice Note",
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [saved, setSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      setDuration(0);
      setSaved(false);

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d + 1 >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return d + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setDuration(0);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const externalBlob = ExternalBlob.fromBytes(uint8);
    onSave(externalBlob);
    setSaved(true);
    toast.success("Voice note saved");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);
    setSaved(false);
  };

  return (
    <div className="border border-earthBrown/20 rounded-xl p-3 bg-white">
      <p className="font-poppins text-xs font-medium text-earthBrown mb-2">{label}</p>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      <div className="flex items-center gap-2">
        {!audioUrl ? (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-poppins font-medium transition-colors ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-earthBrown text-ivoryCream hover:bg-earthBrown/90"
              }`}
            >
              {isRecording ? (
                <>
                  <Square size={12} /> Stop ({maxSeconds - duration}s)
                </>
              ) : (
                <>
                  <Mic size={12} /> Record
                </>
              )}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-poppins font-medium border border-earthBrown/30 text-earthBrown hover:bg-earthBrown/5"
            >
              <Upload size={12} /> Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </>
        ) : (
          <>
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-earthBrown text-ivoryCream flex items-center justify-center hover:bg-earthBrown/90"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <span className="font-roboto text-xs text-earthBrown/60 flex-1">
              {duration}s recorded
            </span>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-poppins font-medium transition-colors ${
                saved
                  ? "bg-forestGreen/10 text-forestGreen"
                  : "bg-forestGreen text-white hover:bg-forestGreen/90"
              }`}
            >
              <Check size={12} /> {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleClear}
              className="w-7 h-7 rounded-full border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
