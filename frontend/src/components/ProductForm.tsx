import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Tag, Clock } from 'lucide-react';
import type { Product } from '../backend';
import { ExternalBlob } from '../backend';
import { useCreateOrUpdateProduct } from '../hooks/useQueries';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import { toast } from 'sonner';

interface ProductFormProps {
  existingProduct?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function generateId(): string {
  return `product_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toDatetimeLocalString(ts: bigint): string {
  // ts is nanoseconds from IC
  const ms = Number(ts) / 1_000_000;
  const d = new Date(ms);
  // Format as YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ProductForm({ existingProduct, onSuccess, onCancel }: ProductFormProps) {
  const [title, setTitle] = useState(existingProduct?.title || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct ? Number(existingProduct.price).toString() : '');
  const [region, setRegion] = useState(existingProduct?.region || '');
  const [stock, setStock] = useState(existingProduct ? Number(existingProduct.stock).toString() : '');
  const [thumbnailBlob, setThumbnailBlob] = useState<ExternalBlob | null>(existingProduct?.thumbnail || null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    existingProduct?.thumbnail?.getDirectURL() || null
  );
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<ExternalBlob | null>(existingProduct?.voiceNote || null);
  const [thumbUploadProgress, setThumbUploadProgress] = useState(0);
  const [isThumbUploading, setIsThumbUploading] = useState(false);
  const [rarityBadge, setRarityBadge] = useState(existingProduct?.rarityBadge || '');
  const [rarityCountdownEnd, setRarityCountdownEnd] = useState<string>(
    existingProduct?.rarityCountdownEnd ? toDatetimeLocalString(existingProduct.rarityCountdownEnd) : ''
  );
  const mutation = useCreateOrUpdateProduct();

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);
    setIsThumbUploading(true);
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => setThumbUploadProgress(pct));
    setThumbnailBlob(blob);
    setIsThumbUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (!title.trim() || !region.trim() || isNaN(priceNum) || isNaN(stockNum)) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (priceNum < 0 || stockNum < 0) {
      toast.error('Price and stock must be non-negative.');
      return;
    }

    // Convert datetime-local string to nanosecond bigint timestamp
    let countdownEndBigInt: bigint | null = null;
    if (rarityCountdownEnd) {
      const ms = new Date(rarityCountdownEnd).getTime();
      if (!isNaN(ms)) {
        countdownEndBigInt = BigInt(ms) * BigInt(1_000_000);
      }
    }

    try {
      await mutation.mutateAsync({
        id: existingProduct?.id || generateId(),
        title: title.trim(),
        description: description.trim(),
        price: BigInt(Math.round(priceNum)),
        region: region.trim(),
        stock: BigInt(stockNum),
        voiceNote: voiceNoteBlob,
        thumbnail: thumbnailBlob,
        rarityBadge: rarityBadge.trim(),
        rarityCountdownEnd: countdownEndBigInt,
      });
      toast.success(existingProduct ? 'Product updated!' : 'Product created!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Thumbnail */}
      <div className="space-y-2">
        <Label className="text-forest font-medium">Product Thumbnail</Label>
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border overflow-hidden bg-accent flex items-center justify-center shrink-0">
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                Upload Image
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            </label>
            {isThumbUploading && <Progress value={thumbUploadProgress} className="h-1 w-32" />}
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-title" className="text-forest font-medium">Product Title *</Label>
        <Input
          id="product-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ghost Village Shawl"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description" className="text-forest font-medium">Description</Label>
        <Textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product, its materials, and what makes it special..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product-price" className="text-forest font-medium">Price (₹) *</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-region" className="text-forest font-medium">Region *</Label>
          <Input
            id="product-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Himalayas"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock" className="text-forest font-medium">Stock *</Label>
          <Input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Rarity Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg border border-border">
        <div className="space-y-1.5">
          <Label htmlFor="rarity-badge" className="text-forest font-medium flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Rarity Badge
          </Label>
          <Input
            id="rarity-badge"
            value={rarityBadge}
            onChange={(e) => setRarityBadge(e.target.value)}
            placeholder="e.g. Himalayan Secret, Only 3 Left"
          />
          <p className="text-xs text-muted-foreground">Optional badge shown on product card</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rarity-countdown" className="text-forest font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Countdown End
          </Label>
          <Input
            id="rarity-countdown"
            type="datetime-local"
            value={rarityCountdownEnd}
            onChange={(e) => setRarityCountdownEnd(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Optional FOMO timer end date/time</p>
        </div>
      </div>

      {/* Voice Note */}
      <div className="space-y-2">
        <Label className="text-forest font-medium">Voice Note</Label>
        <p className="text-xs text-muted-foreground">Record or upload a voice note telling consumers about this product.</p>
        <VoiceNoteRecorder
          onVoiceNoteReady={setVoiceNoteBlob}
          existingVoiceNote={existingProduct?.voiceNote}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Saving...
            </span>
          ) : existingProduct ? 'Update Product' : 'Create Product'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
