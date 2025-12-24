import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// We export these helpers to use inside custom components
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
