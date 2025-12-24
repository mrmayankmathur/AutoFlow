"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EditUserProfileSchema } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  user: User | null;
  onUpdate: (name: string) => Promise<any>;
  onVerifyEmail?: () => Promise<any>;
};

const ProfileForm = ({ user, onUpdate, onVerifyEmail }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof EditUserProfileSchema>>({
    mode: "onChange",
    resolver: zodResolver(EditUserProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const handleSubmit = async (
    values: z.infer<typeof EditUserProfileSchema>
  ) => {
    setIsLoading(true);
    try {
      await onUpdate(values.name);
      router.refresh();
      toast.success("Profile updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!onVerifyEmail) return;
    setIsVerifying(true);
    try {
      await onVerifyEmail();
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to send verification email.");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, email: user.email });
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          disabled={isLoading}
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg text-neutral-900 dark:text-white">
                User full name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Name"
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-lg text-neutral-900 dark:text-white">
                  Email
                </FormLabel>

                {/* Verification Status UI */}
                {user?.emailVerified ? (
                  <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isVerifying}
                    onClick={handleVerify}
                    className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    {isVerifying ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Mail className="mr-1 h-3 w-3" />
                    )}
                    {isVerifying ? "Sending..." : "Verify Email"}
                  </Button>
                )}
              </div>

              <FormControl>
                <Input
                  {...field}
                  disabled={true}
                  placeholder="Email"
                  type="email"
                  className="bg-neutral-100 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="self-start mt-4 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            "Save User Settings"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
