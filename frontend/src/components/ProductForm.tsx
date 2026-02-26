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
import { Progress } from "@/components/ui/progress";
import { useCreateOrUpdateProduct } from "../hooks/useQueries";
import type { Product } from "../hooks/useQueries";
import { ExternalBlob } from "../backend";
import VoiceNoteRecorder from "./VoiceNoteRecorder";
import { toast } from "sonner";

const REGIONS = ["Himalayas", "Kutch", "Banarasi", "Tribal", "Northeast"];

interface ProductFormProps {
  existing?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ existing, onSuccess, onCancel }: ProductFormProps) {
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [price, setPrice] = useState(existing ? String(Number(existing.price)) : "");
  const [stock, setStock] = useState(existing ? String(Number(existing.stock)) : "");
  const [region, setRegion] = useState(existing?.region || "");
  const [rarityBadge, setRarityBadge] = useState(existing?.rarityBadge || "");
  const [liveVideoURL, setLiveVideoURL] = useState(existing?.liveVideoURL || "");
  const [rarityCountdownEnd, setRarityCountdownEnd] = useState(
    existing?.rarityCountdownEnd
      ? new Date(Number(existing.rarityCountdownEnd) / 1_000_000).toISOString().slice(0, 16)
      : ""
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<ExternalBlob | null>(
    existing?.voiceNote || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useCreateOrUpdateProduct();

  const handleSubmit = async () => {
    if (!title.trim() || !price || !stock || !region) {
      toast.error("Title, price, stock, and region are required");
      return;
    }

    let thumbnail: ExternalBlob | null = existing?.thumbnail || null;

    if (thumbnailFile) {
      setIsUploading(true);
      const bytes = new Uint8Array(await thumbnailFile.arrayBuffer());
      thumbnail = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setThumbnailProgress(pct)
      );
    }

    const countdownBigInt = rarityCountdownEnd
      ? BigInt(new Date(rarityCountdownEnd).getTime()) * 1_000_000n
      : null;

    try {
      const id = existing?.id || `product-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await mutation.mutateAsync({
        id,
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(parseFloat(price))),
        region,
        stock: BigInt(Math.round(parseFloat(stock))),
        voiceNote: voiceBlob,
        thumbnail,
        rarityBadge: rarityBadge.trim(),
        rarityCountdownEnd: countdownBigInt,
        liveVideoURL: liveVideoURL.trim() || null,
      });
      toast.success(existing ? "Product updated!" : "Product created!");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setThumbnailProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-poppins text-sm text-earthBrown">Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product title"
          className="mt-1 border-earthBrown/30"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product..."
          rows={3}
          className="mt-1 border-earthBrown/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-poppins text-sm text-earthBrown">Price (₹) *</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            min="0"
            className="mt-1 border-earthBrown/30"
          />
        </div>
        <div>
          <Label className="font-poppins text-sm text-earthBrown">Stock *</Label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            min="0"
            className="mt-1 border-earthBrown/30"
          />
        </div>
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
        <Label className="font-poppins text-sm text-earthBrown">Rarity Badge</Label>
        <Input
          value={rarityBadge}
          onChange={(e) => setRarityBadge(e.target.value)}
          placeholder="e.g. Limited Edition, 1-of-1"
          className="mt-1 border-earthBrown/30"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Rarity Countdown End</Label>
        <Input
          type="datetime-local"
          value={rarityCountdownEnd}
          onChange={(e) => setRarityCountdownEnd(e.target.value)}
          className="mt-1 border-earthBrown/30"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Live Video URL</Label>
        <Input
          value={liveVideoURL}
          onChange={(e) => setLiveVideoURL(e.target.value)}
          placeholder="https://..."
          className="mt-1 border-earthBrown/30"
        />
      </div>

      <div>
        <Label className="font-poppins text-sm text-earthBrown">Thumbnail</Label>
        <label className="mt-1 flex items-center gap-2 cursor-pointer border border-dashed border-earthBrown/30 rounded-lg p-3 hover:bg-earthBrown/5 transition-colors">
          <Upload size={16} className="text-earthBrown/50" />
          <span className="font-roboto text-sm text-earthBrown/60">
            {thumbnailFile ? thumbnailFile.name : "Upload thumbnail"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </label>
        {isUploading && (
          <Progress value={thumbnailProgress} className="mt-2 h-1" />
        )}
      </div>

      <VoiceNoteRecorder
        onSave={(blob) => setVoiceBlob(blob)}
        maxSeconds={30}
        label="Product Voice Note"
      />

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-earthBrown/30 text-earthBrown"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending || isUploading}
          className="flex-1 bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
        >
          {mutation.isPending || isUploading ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : null}
          {existing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
