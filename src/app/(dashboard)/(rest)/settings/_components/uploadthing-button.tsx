"use client";
import React from "react";
import { UploadButton } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  onUpload: (url: string) => Promise<any>;
};

const UploadThingButton = ({ onUpload }: Props) => {
  const router = useRouter();

  return (
    <UploadButton
      endpoint="profileImage"
      appearance={{
        button: "bg-slate-800 text-white hover:bg-slate-700",
        container: "w-full",
      }}
      onClientUploadComplete={async (res) => {
        // res is an array of uploaded files
        if (res && res[0]) {
          const fileUrl = res[0].url;
          await onUpload(fileUrl);
          router.refresh();
        }
      }}
      onUploadError={(error: Error) => {
        console.error(error);
        toast.error(`Error: ${error.message}`);
        alert(`Error: ${error.message}`);
      }}
    />
  );
};

export default UploadThingButton;
