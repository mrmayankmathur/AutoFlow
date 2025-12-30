"use client";

import ProfileForm from "@/components/forms/profile-form";
import React, { useState } from "react";
import ProfilePicture from "./profile-picture";
import { ThemeSelector } from "./theme-selector";
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Lock,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";
import { User as PrismaUser } from "@prisma/client";
import { cn } from "@/lib/utils";

type Props = {
  user: PrismaUser | null;
  removeProfileImage: () => Promise<PrismaUser | undefined>;
  uploadProfileImage: (image: string) => Promise<PrismaUser | undefined>;
  updateUserInfo: (name: string) => Promise<PrismaUser | undefined>;
  sendVerificationEmail: () => Promise<
    { success: boolean } | { error: string }
  >;
};

type Tab = "profile" | "appearance" | "account" | "notifications" | "privacy";

export const SettingsClient = ({
  user,
  removeProfileImage,
  uploadProfileImage,
  updateUserInfo,
  sendVerificationEmail,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const sidebarItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Moon,
    },
    {
      id: "account",
      label: "Account",
      icon: Shield,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Lock,
    },
  ] as const;

  return (
    <div className="h-[calc(100vh-72px)]! bg-[#F4F2EE] dark:bg-[#080808] pb-20">
      <div className="-ml-1 md:ml-0 mx-auto w-full p-6 md:p-10">
        {/* Page Header */}
        <div className="mb-8 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-200" />
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* --- Sidebar Navigation --- */}
          <nav className="w-full md:w-64 shrink-0 space-y-2">
            {sidebarItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer w-full text-left",
                  activeTab === item.id
                    ? "bg-white dark:bg-[#1f212b] shadow-sm border border-neutral-200/50 dark:border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    activeTab === item.id
                      ? "text-neutral-900 dark:text-white"
                      : ""
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    activeTab === item.id
                      ? "text-neutral-900 dark:text-white"
                      : ""
                  )}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* --- Main Content Area --- */}
          <div className="flex-1 w-full space-y-8">
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-[#1F212B] rounded-3xl p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">
                  Profile
                </h2>

                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Left: Profile Picture Area */}
                  <div className="flex flex-col items-center lg:items-start gap-4 shrink-0">
                    <div className="relative">
                      <ProfilePicture
                        onDelete={removeProfileImage}
                        userImage={user?.image || ""}
                        onUpload={uploadProfileImage}
                      />
                    </div>
                  </div>

                  {/* Right: Form Inputs */}
                  <div className="flex-1 w-full">
                    <ProfileForm
                      user={user}
                      onUpdate={updateUserInfo}
                      onVerifyEmail={sendVerificationEmail}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-[#1F212B] rounded-3xl p-8 shadow-sm border lg:max-h-[calc(100vh-27rem)] border-neutral-200/60 dark:border-neutral-800">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Appearance
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Choose your preferred theme. "System" will match your
                    device's settings.
                  </p>
                </div>

                <div className="w-full">
                  <ThemeSelector />
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-white dark:bg-[#1F212B] rounded-3xl p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Account
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Manage your account settings.
                  </p>
                </div>
                <div className="h-40 flex items-center justify-center text-muted-foreground border border-dashed border-[#404040] rounded-xl">
                  Account settings coming soon
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-[#1F212B] rounded-3xl p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Notifications
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Configure how you receive notifications.
                  </p>
                </div>
                <div className="h-40 flex items-center justify-center text-muted-foreground border border-dashed border-[#404040] rounded-xl">
                  Notification settings coming soon
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-[#1F212B] rounded-3xl p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Privacy
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Manage your privacy and security settings.
                  </p>
                </div>
                <div className="h-40 flex items-center justify-center text-muted-foreground border border-dashed border-[#404040] rounded-xl">
                  Privacy settings coming soon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
