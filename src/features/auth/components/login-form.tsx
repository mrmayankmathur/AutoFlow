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
import { authClient } from "@/lib/auth-client";
import { Github, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// const loginSchema = z.object({
//   email: z.email("Please enter a valid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters long"),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// export function LoginForm() {
//   const router = useRouter();
//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (values: LoginFormValues) => {
//     console.log(values);
//     toast.success("Login successful");
//   };

//   const isPending = form.formState.isSubmitting;

//   // Google Icon Component (SVG)
//   const GoogleIcon = () => (
//     <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//       <path
//         fill="#4285F4"
//         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//       />
//       <path
//         fill="#34A853"
//         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//       />
//       <path
//         fill="#FBBC05"
//         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//       />
//       <path
//         fill="#EA4335"
//         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//       />
//     </svg>
//   );

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <Card className="md:w-full max-w-md min-w-xs">
//         <CardHeader className="text-center">
//           <CardTitle>Welcome Back</CardTitle>
//           <CardDescription>
//             Sign in to your account to continue!
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid gap-6">
//                 {/* Social Login */}
//                 <div className="flex gap-4">
//                   <Button
//                     variant="outline"
//                     className="md:w-48 w-[130px]"
//                     type="button"
//                     disabled={isPending}
//                   >
//                     <Github className="w-5 h-5 mr-2" />
//                     Github
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="md:w-48 w-[130px]"
//                     type="button"
//                     disabled={isPending}
//                   >
//                     <GoogleIcon />
//                     Google
//                   </Button>
//                 </div>

//                 {/* Divider */}
//                 <div className="relative mb-4 mt-2">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-slate-200"></div>
//                   </div>
//                   <div className="relative flex justify-center text-xs uppercase">
//                     <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 {/* Form Fields */}
//                 <div className="grid gap-6">
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="email"
//                             placeholder="Enter your email"
//                             {...field}
//                             value={field.value || ""}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="password"
//                             placeholder="Enter your password"
//                             {...field}
//                             value={field.value || ""}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Button type="submit" className="w-full" disabled={isPending}>
//                     {isPending ? "Signing in..." : "Sign In"}
//                   </Button>
//                 </div>
//                 <div className="text-center text-sm">
//                   Don&apos;t have an account?{" "}
//                   <Link href="/signup" className="underline underline-offset-4">
//                     Register
//                   </Link>
//                 </div>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
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
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
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

        <div className="flex w-full max-w-[91vw] h-[91vh] overflow-hidden rounded-3xl bg-white">
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
                Kriya Labs
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
            <div className="mb-10 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-black" />
              <span className="text-sm font-semibold">KriyaLabs</span>
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
                        <Input placeholder="Enter your email" {...field} />
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
                            {...field}
                            value={field.value || ""}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                    <input type="checkbox" />
                    Remember me
                  </label>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:underline"
                  >
                    Forgot Password
                  </Link>
                </div>

                <Button className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Spinner /> <p>Signing in...</p>
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
                    disabled={isPending}
                    className="w-full"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    disabled={isPending}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
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
