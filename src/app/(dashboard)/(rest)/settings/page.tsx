import ProfileForm from "@/components/forms/profile-form";
import React from "react";
import ProfilePicture from "./_components/profile-picture";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeSelector } from "./_components/theme-selector";

type Props = {};

const Settings = async (props: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  const removeProfileImage = async () => {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return;
    return await db.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });
  };

  const uploadProfileImage = async (image: string) => {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return;
    return await db.user.update({
      where: { id: session.user.id },
      data: { image },
    });
  };

  const updateUserInfo = async (name: string) => {
    "use server";
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return;
    return await db.user.update({
      where: { id: session.user.id },
      data: { name },
    });
  };

  // --- Verification Server Action ---
  const sendVerificationEmail = async () => {
    "use server";
    // 1. Get fresh session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    // 2. Trigger Better Auth Verification
    await auth.api.sendVerificationEmail({
      body: {
        email: session.user.email,
        callbackURL: "/settings",
      },
      headers: await headers(),
    });

    return { success: true };
  };

  return (
    <div className="xs:-ml-6flex flex-col min-h-screen bg-gray-50 dark:bg-[#0B0D14] sm:overflow-x-clip">
      <div className="sticky top-17 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/75 dark:bg-black/40 p-6 backdrop-blur-xl">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="mx-auto w-full max-h-screen lg:max-w-5xl md:max-w-xl p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            User Profile
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#14161F] p-8 shadow-sm">
              <ProfileForm
                user={user}
                onUpdate={updateUserInfo}
                onVerifyEmail={sendVerificationEmail}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <ProfilePicture
                onDelete={removeProfileImage}
                userImage={user?.image || ""}
                onUpload={uploadProfileImage}
              />
            </div>
          </div>
        </div>
        {/* ----- Appearance Section ----- */}
        <div className="grid gap-10 lg:grid-cols-5 pt-8">
          <div className="lg:col-span-5">
            <div className="mb-0">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                Customize the look and feel of the application.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
