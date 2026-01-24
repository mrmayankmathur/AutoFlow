"use client";

import React, { useEffect, useState } from "react";
import {
  deleteAccount,
  getActiveSessions,
  revokeSession,
  getUserStats,
} from "@/actions/user-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Laptop, Smartphone, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type Session = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  isCurrent: boolean;
};

type UserStats = {
  workflows: number;
  credentials: number;
  subscription: string;
};

export const AccountSettings = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await getUserStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const result = await getActiveSessions();
      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        toast.error("Failed to load sessions");
      }
    } catch (error) {
      toast.error("An error occurred while loading sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    try {
      const result = await revokeSession(sessionId);
      if (result.success) {
        toast.success("Session revoked");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        toast.error(result.error || "Failed to revoke session");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted successfully");
        router.push("/login?deleted=true");
      } else {
        toast.error(result.error || "Failed to delete account");
        setIsDeletingAccount(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      setIsDeletingAccount(false);
    }
  };

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Laptop className="h-5 w-5" />;
    if (ua.toLowerCase().includes("mobile"))
      return <Smartphone className="h-5 w-5" />;
    return <Laptop className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8 lg:max-h-[55vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#15161d] border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Total Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.workflows ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#15161d] border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Connected Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats?.credentials ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#15161d] border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <Badge
                variant="outline"
                className="text-base font-semibold border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3 py-1"
              >
                {stats?.subscription ?? "Unknown"}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card className="bg-white dark:bg-[#15161d] border-neutral-200/60 dark:border-neutral-800 shadow-sm">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices and browsers logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSessions ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No active sessions found.
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {session.userAgent || "Unknown Device"}
                      </p>
                      {session.isCurrent && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none"
                        >
                          Current Device
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {session.ipAddress || "Unknown IP"} • Last active{" "}
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={deletingSessionId === session.id}
                  >
                    {deletingSessionId === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                )}
                {session.isCurrent && (
                  <div className="text-xs text-muted-foreground px-3">
                    Active Now
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#15161d] border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden">
        <CardHeader className="bg-red-50/50 -mt-6 pt-6 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/70">
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">
                Delete Account
              </h4>
              <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                Permanently remove your account and all of its contents from the
                AutoFlow platform. This action is not reversible, so please
                continue with caution.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account, workflows, and remove your data from our
                    servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAccount();
                    }}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
