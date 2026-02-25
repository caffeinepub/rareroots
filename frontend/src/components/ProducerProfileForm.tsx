import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Camera } from 'lucide-react';
import type { Producer } from '../backend';
import { ExternalBlob } from '../backend';
import { useCreateOrUpdateProducer } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProducerProfileFormProps {
  existingProducer?: Producer | null;
  onSuccess?: () => void;
}

export default function ProducerProfileForm({ existingProducer, onSuccess }: ProducerProfileFormProps) {
  const [name, setName] = useState(existingProducer?.name || '');
  const [region, setRegion] = useState(existingProducer?.region || '');
  const [bio, setBio] = useState(existingProducer?.bio || '');
  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(existingProducer?.profilePhoto || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingProducer?.profilePhoto?.getDirectURL() || null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useCreateOrUpdateProducer();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setIsUploading(true);
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => setUploadProgress(pct));
    setPhotoBlob(blob);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !region.trim()) {
      toast.error('Name and region are required.');
      return;
    }
    try {
      await mutation.mutateAsync({
        name: name.trim(),
        region: region.trim(),
        bio: bio.trim(),
        profilePhoto: photoBlob,
        // Preserve existing brand fields when updating basic profile
        brandName: existingProducer?.brandName ?? '',
        brandTagline: existingProducer?.brandTagline ?? '',
        brandLogoBlob: existingProducer?.brandLogoBlob ?? null,
        brandColor: existingProducer?.brandColor ?? '',
        voiceStoryBlob: existingProducer?.voiceStoryBlob ?? null,
      });
      toast.success('Producer profile saved!');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={photoPreview || '/assets/generated/producer-avatar-placeholder.dim_200x200.png'}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover border-2 border-border"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-terracotta text-primary-foreground flex items-center justify-center shadow-sm hover:bg-terracotta-dark transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
          {isUploading && <Progress value={uploadProgress} className="h-1 mt-1 w-32" />}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="producer-name" className="text-forest font-medium">Full Name *</Label>
          <Input
            id="producer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your artisan name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="producer-region" className="text-forest font-medium">Region *</Label>
          <Input
            id="producer-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Himalayas, Rajasthan"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="producer-bio" className="text-forest font-medium">Bio</Label>
        <Textarea
          id="producer-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell consumers about yourself, your craft, and your region..."
          rows={4}
          className="resize-none"
        />
      </div>

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
        ) : existingProducer ? 'Update Profile' : 'Create Producer Profile'}
      </Button>
    </form>
  );
}
