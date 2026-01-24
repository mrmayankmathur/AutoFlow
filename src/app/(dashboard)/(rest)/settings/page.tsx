import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsClient } from "./_components/settings-client";

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
    <div className="">
      <SettingsClient
        user={user}
        removeProfileImage={removeProfileImage}
        uploadProfileImage={uploadProfileImage}
        updateUserInfo={updateUserInfo}
        sendVerificationEmail={sendVerificationEmail}
      />
    </div>
  );
};

export default Settings;
