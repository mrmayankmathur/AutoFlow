"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingSocialProvider, setPendingSocialProvider] = useState<
    "google" | "github" | null
  >(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignIn = async (provider: "google" | "github") => {
    setPendingSocialProvider(provider);
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "/", // Redirect after successful login
    });
    setPendingSocialProvider(null);
    toast.success("Account created successfully");
  };

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
          toast.success("Account created successfully");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div
      style={{ backgroundColor: "white", color: "#0f172a" }}
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center md:blur-[18px] scale-[1.4]"
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
              width={500}
              height={500}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />

            <div className="relative z-10 h-full p-10 text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">
                AutoFlow
              </p>

              <div className="absolute bottom-10 left-10 max-w-sm">
                <h1 className="text-4xl leading-tight">
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

          <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2 md:px-14">
            <h2 className="text-3xl font-semibold opacity-75">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started with your free account
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First Name"
                            {...field}
                            value={field.value || ""}
                            style={{ backgroundColor: "white", color: "black" }}
                            className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373] focus-visible:ring-[#737373]!"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Last Name"
                            {...field}
                            value={field.value || ""}
                            style={{ backgroundColor: "white", color: "black" }}
                            className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          value={field.value || ""}
                          style={{ backgroundColor: "white", color: "black" }}
                          className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            {...field}
                            value={field.value || ""}
                            style={{ backgroundColor: "white", color: "black" }}
                            className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Enter to confirm the password"
                            {...field}
                            value={field.value || ""}
                            style={{ backgroundColor: "white", color: "black" }}
                            className="bg-white! text-black! border-[#E5E5E5]! placeholder:text-[#737373]! focus-visible:ring-[#737373]!"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                          >
                            {showConfirmPassword ? (
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

                <Button
                  className="w-full bg-[#171717] text-white hover:bg-[#2E2E2E]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner /> <p>Creating your account...</p>
                    </>
                  ) : (
                    "Create an account"
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
                    disabled={isPending}
                    style={{ backgroundColor: "white", color: "#0f172a" }}
                    className="w-full bg-white! text-slate-900! border-slate-200! hover:bg-slate-50!"
                    onClick={() => handleSignIn("github")}
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
                    disabled={isPending}
                    style={{ backgroundColor: "white", color: "#0f172a" }}
                    className="w-full bg-white! text-slate-900! border-slate-200! hover:bg-slate-50!"
                    onClick={() => handleSignIn("google")}
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

            <p className="lg:mt-8 mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-black">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
