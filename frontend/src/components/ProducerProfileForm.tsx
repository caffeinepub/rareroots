import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { useCreateOrUpdateProducer } from "../hooks/useQueries";
import type { Producer } from "../hooks/useQueries";
import { ExternalBlob } from "../backend";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const REGIONS = ["Himalayas", "Kutch", "Banarasi", "Tribal", "Northeast"];

interface ProducerProfileFormProps {
  existing?: Producer | null;
  onSuccess?: () => void;
}

export default function ProducerProfileForm({
  existing,
  onSuccess,
}: ProducerProfileFormProps) {
  const [name, setName] = useState(existing?.name || "");
  const [region, setRegion] = useState(existing?.region || "");
  const [bio, setBio] = useState(existing?.bio || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useCreateOrUpdateProducer();

  const handleSubmit = async () => {
    if (!name.trim() || !region) {
      toast.error("Name and region are required");
      return;
    }

    let profilePhoto: ExternalBlob | null = existing?.profilePhoto || null;

    if (photoFile) {
      setIsUploading(true);
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      profilePhoto = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct)
      );
    }

    try {
      await mutation.mutateAsync({
        name: name.trim(),
        region,
        bio: bio.trim(),
        profilePhoto,
        brandName: existing?.brandName || "",
        brandTagline: existing?.brandTagline || "",
        brandLogoBlob: existing?.brandLogoBlob || null,
        brandColor: existing?.brandColor || "",
        voiceStoryBlob: existing?.voiceStoryBlob || null,
        whatsApp: existing?.whatsApp || "",
        rarityBadge: existing?.rarityBadge || "",
      });
      toast.success("Profile saved!");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-poppins text-sm text-earthBrown">Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your artisan name"
          className="mt-1 border-earthBrown/30"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Region *</Label>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="mt-1 border-earthBrown/30">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your story..."
          rows={3}
          className="mt-1 border-earthBrown/30 resize-none"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Profile Photo</Label>
        <label className="mt-1 flex items-center gap-2 cursor-pointer border border-dashed border-earthBrown/30 rounded-lg p-3 hover:bg-earthBrown/5 transition-colors">
          <Upload size={16} className="text-earthBrown/50" />
          <span className="font-roboto text-sm text-earthBrown/60">
            {photoFile ? photoFile.name : "Upload photo"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
        </label>
        {isUploading && (
          <Progress value={uploadProgress} className="mt-2 h-1" />
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending || isUploading}
        className="w-full bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
      >
        {mutation.isPending || isUploading ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : null}
        Save Profile
      </Button>
    </div>
  );
}
