import React, { useRef, useState } from 'react';
import { Mic, MicOff, Square, Upload, Play, Pause, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { useMediaRecorder } from '../hooks/useMediaRecorder';

interface VoiceNoteRecorderProps {
  onVoiceNoteReady: (blob: ExternalBlob | null) => void;
  existingVoiceNote?: ExternalBlob | null;
}

export default function VoiceNoteRecorder({ onVoiceNoteReady, existingVoiceNote }: VoiceNoteRecorderProps) {
  const { recordingState, audioBlob, audioUrl, duration, error, startRecording, stopRecording, clearRecording } = useMediaRecorder();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => setUploadProgress(pct));
    setIsUploading(true);
    setUploadProgress(0);
    onVoiceNoteReady(blob);
    setIsSaved(true);
    setIsUploading(false);
  };

  const handleSaveRecording = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    setUploadProgress(0);
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const externalBlob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => setUploadProgress(pct));
    onVoiceNoteReady(externalBlob);
    setIsSaved(true);
    setIsUploading(false);
  };

  const handleClear = () => {
    clearRecording();
    setIsSaved(false);
    setUploadProgress(0);
    onVoiceNoteReady(null);
  };

  const togglePreview = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
    } else {
      audio.play().then(() => setIsPreviewPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Record Button */}
        {recordingState === 'idle' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="border-terracotta text-terracotta hover:bg-terracotta hover:text-primary-foreground"
          >
            <Mic className="h-4 w-4 mr-1.5" />
            Record Voice Note
          </Button>
        )}

        {recordingState === 'recording' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground animate-pulse"
          >
            <Square className="h-4 w-4 mr-1.5 fill-current" />
            Stop ({formatDuration(duration)})
          </Button>
        )}

        {/* Upload Button */}
        {recordingState === 'idle' && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-forest text-forest hover:bg-forest hover:text-secondary-foreground"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Audio
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </>
        )}

        {/* Preview & Save */}
        {recordingState === 'stopped' && audioUrl && (
          <>
            <audio
              ref={previewAudioRef}
              src={audioUrl}
              onEnded={() => setIsPreviewPlaying(false)}
            />
            <Button type="button" variant="outline" size="sm" onClick={togglePreview}>
              {isPreviewPlaying ? <Pause className="h-4 w-4 mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
              {isPreviewPlaying ? 'Pause' : 'Preview'}
            </Button>
            {!isSaved && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRecording}
                disabled={isUploading}
                className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Use Recording
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          </>
        )}
      </div>

      {/* Status */}
      {recordingState === 'recording' && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          Recording... {formatDuration(duration)}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {isUploading && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Preparing audio...</p>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {isSaved && (
        <p className="text-sm text-forest flex items-center gap-1">
          <Check className="h-3.5 w-3.5" />
          Voice note ready to save
        </p>
      )}

      {existingVoiceNote && !isSaved && recordingState === 'idle' && (
        <p className="text-xs text-muted-foreground">
          ✓ Existing voice note attached. Record or upload to replace it.
        </p>
      )}
    </div>
  );
}
