"use client";
import React from "react";
import { FileUpload } from "@/components/global/file-upload";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

type Props = {
  userImage: string | null;
  onDelete?: any;
  onUpload: (url: string) => Promise<any>;
};

const ProfilePicture = ({ userImage, onDelete, onUpload }: Props) => {
  const router = useRouter();

  // 1. Setup UploadThing Hook
  const { startUpload, isUploading } = useUploadThing("profileImage", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await onUpload(res[0].url);
        router.refresh();
        toast.success("Profile picture updated successfully");
      }
    },
    onUploadError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const onRemoveProfileImage = async () => {
    const response = await onDelete();
    if (response) {
      router.refresh();
    }
  };

  const handleFileChange = async (files: File[]) => {
    if (files.length > 0) {
      await startUpload(files);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
        Profile Picture
      </p>

      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 p-6">
        {userImage ? (
          // STATE 1: Image Exists
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-xl ring-4 ring-neutral-200 dark:ring-neutral-800">
              <Image
                src={userImage}
                alt="User_Image"
                fill
                className="object-cover"
              />
            </div>
            <Button
              onClick={onRemoveProfileImage}
              variant="destructive"
              className="bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20 dark:border-red-500/50"
            >
              <X className="mr-2 h-4 w-4" /> Remove Picture
            </Button>
          </div>
        ) : (
          // STATE 2: No Image (Show Aceternity Dropzone)
          <div className="relative w-full max-w-lg">
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Uploading...
                </p>
              </div>
            )}

            <FileUpload onChange={handleFileChange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
