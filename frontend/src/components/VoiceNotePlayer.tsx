import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface VoiceNotePlayerProps {
  blob?: ExternalBlob;
  label?: string;
}

export default function VoiceNotePlayer({ blob, label = 'Voice Story' }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = blob.getDirectURL();
    setAudioUrl(url);
    return () => {
      // cleanup
    };
  }, [blob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const formatTime = (t: number) => {
    if (!isFinite(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="voice-player-bar"
      style={{ backgroundColor: '#8B4513', borderRadius: '12px' }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <button
        onClick={togglePlay}
        disabled={!audioUrl}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all disabled:opacity-50"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Waveform / progress bar */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Mic className="w-3 h-3 text-white opacity-70" />
          <span className="text-white text-xs font-roboto opacity-80 truncate">{label}</span>
        </div>
        <div className="relative h-1.5 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 30}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <span className="text-white text-xs font-roboto opacity-80 flex-shrink-0">
        {formatTime(currentTime)} / {formatTime(duration || 30)}
      </span>
    </div>
  );
}
