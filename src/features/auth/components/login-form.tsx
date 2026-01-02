"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingSocialProvider, setPendingSocialProvider] = useState<
    "google" | "github" | null
  >(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: "/",
          rememberMe: rememberMe,
        },
        {
          onSuccess: () => {
            toast.success("Logged in successfully");
            router.push("/");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    } catch (error) {
      toast.error(`An unexpected error occurred. ${error} Please try again.`);
    }
  };

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setPendingSocialProvider(provider);
      await authClient.signIn.social(
        {
          provider: provider,
          callbackURL: "/", // Redirect after successful login
        },
        {
          onSuccess: () => {
            toast.success("Logged in successfully");
            router.push("/");
            setPendingSocialProvider(null);
          },
          onError: () => {
            toast.error("Something went wrong. Please try again.");
            setPendingSocialProvider(null);
          },
        }
      );
    } catch (error) {
      toast.error(`An unexpected error occurred. ${error} Please try again.`);
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ backgroundColor: "white", color: "#0f172a" }}
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center md:blur-[18px] scale-140"
        style={{
          backgroundImage: "url('/flow.png')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Light gradient overlay (right side fade) */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-white/15" />

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center">
        {/* ⬇️ KEEP YOUR EXISTING CARD CONTAINER HERE */}

        <div className="flex w-full max-w-[95vw] h-[91vh] overflow-hidden rounded-3xl bg-white">
          {/* LEFT IMAGE */}
          <div className="relative hidden w-1/2 md:block">
            <Image
              src="/flow.png"
              alt="Auth Background"
              className="absolute inset-0 h-full w-full object-cover"
              width={500}
              height={500}
              referrerPolicy="no-referrer"
            />

            <div className="relative z-10 h-full p-10 text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">
                AutoFlow
              </p>

              <div className="absolute bottom-10 left-10 max-w-sm">
                <h1 className="font-serif text-4xl leading-tight">
                  Build with intention.
                  <br />
                  Scale with intelligence.
                </h1>
                <p className="mt-4 text-sm opacity-80">
                  Build, automate, and scale AI-powered workflows with
                  production-ready architecture.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-14">
            <div className="md:mb-10 mb-6 md:-mt-6 flex items-center gap-2">
              <Link href="/">
                <Image src="/logo.png" alt="Logo" width={30} height={30} />
              </Link>
              <Link href="/">
                <span className="text-[21.5px] font-semibold cursor-pointer opacity-60 text-[#2A1E67]">
                  AutoFlow
                </span>
              </Link>
            </div>

            <h2 className="font-serif text-3xl">Welcome Back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and password to access your account
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-6"
              >
                {/* EMAIL */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          style={{ backgroundColor: "white", color: "black" }}
                          className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PASSWORD */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            style={{ backgroundColor: "white", color: "black" }}
                            className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
                            {...field}
                            value={field.value || ""}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <Input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ colorScheme: "light" }}
                      className="h-4 w-4 rounded border border-slate-300 bg-white text-slate-900 focus:ring-slate-900 accent-black cursor-pointer"
                    />
                    Remember me
                  </label>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Forgot Password
                  </Link>
                </div>

                <Button
                  className="w-full bg-[#171717] text-white hover:bg-[#2E2E2E]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner /> <span>Signing in...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative mb-6 mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isPending || !!pendingSocialProvider}
                    onClick={() => handleSignIn("github")}
                    style={{ backgroundColor: "white", color: "#0f172a" }}
                    className="w-full bg-white! text-slate-900! border-slate-200! hover:bg-slate-50!"
                  >
                    {pendingSocialProvider === "github" ? (
                      <Spinner />
                    ) : (
                      <Image
                        alt="github"
                        src="https://img.icons8.com/?size=100&id=AZOZNnY73haj&format=png&color=000000"
                        width={24}
                        height={24}
                      />
                    )}
                    GitHub
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    disabled={isPending || !!pendingSocialProvider}
                    onClick={() => handleSignIn("google")}
                    style={{ backgroundColor: "white", color: "#0f172a" }}
                    className="w-full bg-white! text-slate-900! border-slate-200! hover:bg-slate-50!"
                  >
                    {pendingSocialProvider === "google" ? (
                      <Spinner />
                    ) : (
                      <Image
                        alt="google"
                        src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
                        width={20}
                        height={20}
                      />
                    )}
                    Google
                  </Button>
                </div>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link href="/signup" className="font-medium text-black">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
