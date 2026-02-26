import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import {
  useCreateOrUpdateProducer,
  useGetCallerUserProfile,
  useGetAllProducers,
} from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ExternalBlob } from "../backend";
import { ArrowLeft, Camera, Mic, Square, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ProducerBrandSetup() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: producers } = useGetAllProducers();
  const createOrUpdateProducer = useCreateOrUpdateProducer();

  const myProducer = producers?.find(
    (p) => p.id.toString() === identity?.getPrincipal().toString()
  );

  const [brandName, setBrandName] = useState(myProducer?.brandName || "");
  const [brandTagline, setBrandTagline] = useState(myProducer?.brandTagline || "");
  const [brandColor, setBrandColor] = useState(myProducer?.brandColor || "#8B4513");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    myProducer?.brandLogoBlob?.getDirectURL() || null
  );
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 29) {
            stopRecording();
            return 30;
          }
          return t + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleSave = async () => {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }

    let logoBlobRef: ExternalBlob | null = myProducer?.brandLogoBlob ?? null;
    let voiceBlobRef: ExternalBlob | null = myProducer?.voiceStoryBlob ?? null;

    if (logoFile) {
      const bytes = new Uint8Array(await logoFile.arrayBuffer());
      logoBlobRef = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
        setLogoUploadProgress(p)
      );
    }

    if (audioBlob) {
      const bytes = new Uint8Array(await audioBlob.arrayBuffer());
      voiceBlobRef = ExternalBlob.fromBytes(bytes);
    }

    try {
      await createOrUpdateProducer.mutateAsync({
        name: myProducer?.name || userProfile?.name || brandName,
        region: myProducer?.region || "",
        bio: myProducer?.bio || "",
        profilePhoto: myProducer?.profilePhoto ?? null,
        brandName,
        brandTagline: brandTagline.slice(0, 20),
        brandLogoBlob: logoBlobRef,
        brandColor,
        voiceStoryBlob: voiceBlobRef,
        whatsApp: myProducer?.whatsApp ?? "",
        rarityBadge: myProducer?.rarityBadge ?? "",
      });
      toast.success("Brand saved!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Failed to save brand. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(139,69,19,0.1)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#8B4513" }} />
          </button>
          <h1
            className="font-poppins font-bold"
            style={{ fontSize: "22px", color: "#8B4513" }}
          >
            Complete Your Brand
          </h1>
        </div>

        <div className="space-y-5">
          {/* Brand Name */}
          <div>
            <Label
              className="font-poppins font-semibold text-sm mb-2 block"
              style={{ color: "#8B4513" }}
            >
              Brand Name *
            </Label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="LaxmiLoom / MountainHealer"
              className="h-12 font-roboto"
              style={{ borderColor: "rgba(218,165,32,0.5)", fontSize: "16px" }}
            />
          </div>

          {/* Brand Tagline */}
          <div>
            <Label
              className="font-poppins font-semibold text-sm mb-2 block"
              style={{ color: "#8B4513" }}
            >
              Brand Tagline{" "}
              <span
                className="font-roboto font-normal text-xs"
                style={{ color: "#666" }}
              >
                (max 20 chars)
              </span>
            </Label>
            <Input
              value={brandTagline}
              onChange={(e) => setBrandTagline(e.target.value.slice(0, 20))}
              placeholder="e.g. Kutch Secret Weaves"
              maxLength={20}
              className="h-12 font-roboto"
              style={{ borderColor: "rgba(218,165,32,0.5)", fontSize: "16px" }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: "#666" }}>
              {brandTagline.length}/20
            </p>
          </div>

          {/* Brand Logo */}
          <div>
            <Label
              className="font-poppins font-semibold text-sm mb-2 block"
              style={{ color: "#8B4513" }}
            >
              📸 Brand Logo Photo
            </Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 rounded-full object-cover border-2"
                  style={{ borderColor: "#DAA520" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed"
                  style={{
                    borderColor: "#DAA520",
                    backgroundColor: "rgba(218,165,32,0.05)",
                  }}
                >
                  <Camera className="w-8 h-8" style={{ color: "#DAA520" }} />
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-poppins font-semibold text-sm"
                style={{ backgroundColor: "#DAA520", color: "white" }}
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </button>
            </div>
            {logoUploadProgress > 0 && logoUploadProgress < 100 && (
              <div className="mt-2">
                <Progress value={logoUploadProgress} className="h-2" />
                <p className="text-xs mt-1" style={{ color: "#666" }}>
                  Uploading... {logoUploadProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Brand Color */}
          <div>
            <Label
              className="font-poppins font-semibold text-sm mb-2 block"
              style={{ color: "#8B4513" }}
            >
              🎨 Brand Color
            </Label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-2"
                style={{ borderColor: "#DAA520", padding: "2px" }}
              />
              <div>
                <p className="font-roboto text-sm" style={{ color: "#555" }}>
                  Selected:{" "}
                  <span className="font-semibold">{brandColor}</span>
                </p>
                <div
                  className="w-24 h-6 rounded mt-1"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
            </div>
          </div>

          {/* Voice Story Recorder */}
          <div>
            <Label
              className="font-poppins font-semibold text-sm mb-2 block"
              style={{ color: "#8B4513" }}
            >
              🎙️ Tell Your Story{" "}
              <span
                className="font-roboto font-normal text-xs"
                style={{ color: "#666" }}
              >
                (max 30 sec)
              </span>
            </Label>

            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: "white",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              {isRecording ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: "#FF4500" }}
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <p
                    className="font-poppins font-bold"
                    style={{ color: "#FF4500", fontSize: "18px" }}
                  >
                    {recordingTime}s / 30s
                  </p>
                  <Progress value={(recordingTime / 30) * 100} className="w-full h-2" />
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-poppins font-semibold"
                    style={{ backgroundColor: "#FF4500", color: "white" }}
                  >
                    <Square className="w-4 h-4" />
                    Stop Recording
                  </button>
                </div>
              ) : audioUrl ? (
                <div className="space-y-3">
                  <audio src={audioUrl} controls className="w-full" />
                  <button
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                      setRecordingTime(0);
                    }}
                    className="text-xs font-roboto"
                    style={{ color: "#FF4500" }}
                  >
                    Clear & Re-record
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-poppins font-semibold w-full justify-center"
                  style={{ backgroundColor: "#8B4513", color: "white" }}
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={createOrUpdateProducer.isPending}
            className="w-full h-14 rounded-full font-poppins font-bold text-lg text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#228B22" }}
          >
            {createOrUpdateProducer.isPending ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Save Brand
          </button>
        </div>
      </div>
    </Layout>
  );
}
