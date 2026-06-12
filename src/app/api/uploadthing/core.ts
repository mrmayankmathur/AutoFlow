import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth"; // Your Better Auth instance

const f = createUploadthing();

export const ourFileRouter = {
  // Define a route named "profileImage"
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // 1. Verify User with Better Auth
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      // 2. Throw if not authenticated
      if (!session) throw new Error("Unauthorized");

      // 3. Return user ID to the metadata
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
