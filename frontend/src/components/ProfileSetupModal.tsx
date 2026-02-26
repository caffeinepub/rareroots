import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import { toast } from "sonner";

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState("");

  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), role: "user" });
      toast.success("Profile created!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-poppins text-earthBrown">
            Welcome to समृद्धिस्रोत! 🙏
          </DialogTitle>
          <DialogDescription className="font-roboto text-earthBrown/60">
            Please enter your name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name" className="font-poppins text-sm text-earthBrown">
              Your Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1 border-earthBrown/30 focus:border-earthBrown"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
          >
            {saveProfile.isPending ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
