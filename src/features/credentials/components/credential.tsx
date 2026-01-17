"use client";

import { CredentialType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  useCreateCredential,
  useUpdateCredential,
  useSuspenseCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  BotIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  Loader2Icon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "Value is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
    description: "For GPT-4, GPT-3.5 Turbo models",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
    description: "For Claude 3 Opus, Sonnet, Haiku",
  },
  {
    value: CredentialType.GEMINI,
    label: "Google Gemini",
    logo: "/logos/gemini.svg",
    description: "For Gemini Pro and Ultra models",
  },
];

// Dynamic styles based on selection
const ProviderStyles: Record<
  CredentialType,
  { gradient: string; border: string; iconBg: string }
> = {
  [CredentialType.OPENAI]: {
    gradient: "from-emerald-500/20 via-emerald-500/5",
    border: "group-focus-within:border-emerald-500/50",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  [CredentialType.ANTHROPIC]: {
    gradient: "from-orange-500/20 via-orange-500/5",
    border: "group-focus-within:border-orange-500/50",
    iconBg: "bg-orange-500/10 text-orange-500",
  },
  [CredentialType.GEMINI]: {
    gradient: "from-blue-500/20 via-blue-500/5",
    border: "group-focus-within:border-blue-500/50",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
};

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    },
  });

  // Watch the type to apply dynamic styles
  const selectedType = form.watch("type");
  const currentStyle =
    ProviderStyles[selectedType] || ProviderStyles[CredentialType.OPENAI];

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initialData?.id) {
        await updateCredential.mutateAsync(
          {
            id: initialData?.id,
            ...values,
          },
          {
            onError: (error) => {
              handleError(error);
            },
          }
        );
      } else {
        await createCredential.mutateAsync(values, {
          onError: (error) => {
            handleError(error);
          },
        });
      }
      router.back();
    } catch (error) {
      handleError(error);
    }
  };

  const isSubmitting = createCredential.isPending || updateCredential.isPending;

  return (
    <>
      {modal}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mt-6 mb-2.5 pl-0 hover:bg-transparent hover:text-primary text-muted-foreground transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to Credentials
        </Button>

        <Card className="relative overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-xl">
          {/* Dynamic Background Glow */}
          <div
            className={cn(
              "absolute -top-[150px] -right-[150px] w-[300px] h-[300px] rounded-full blur-3xl opacity-20 transition-colors duration-500 pointer-events-none",
              "bg-linear-to-br",
              currentStyle.gradient
            )}
          />

          {/* Texture Overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 z-0 pointer-events-none opacity-10">
            <Image
              src="/stars-pattern.png"
              alt=""
              fill
              className="scale-150 rotate-12 object-contain"
            />
          </div>

          <CardHeader className="relative z-10 pt-1 pb-5">
            <div className="flex items-center gap-3 -mb-2">
              <div
                className={cn(
                  "p-2.5 rounded-lg transition-colors duration-300",
                  currentStyle.iconBg
                )}
              >
                <ShieldAlertIcon className="size-7.5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-xl">
                  {isEdit ? "Edit Credential" : "Connect New Provider"}
                </CardTitle>
                <CardDescription className="max-w-md">
                  {isEdit
                    ? "Update your API key configuration. Keys are encrypted at rest."
                    : "Add a new API key to unlock AI capabilities in your workflows."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel>Friendly Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BotIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="e.g. My Production Key"
                            {...field}
                            className="pl-9 bg-background/50 backdrop-blur-lg border-muted focus-visible:ring-offset-0 focus-visible:ring-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type Selection */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-15 w-full bg-background/50 backdrop-blur-lg border-muted focus:ring-0 focus:ring-offset-0 px-4">
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {credentialTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="py-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center border border-border/50">
                                  <Image
                                    src={option.logo}
                                    alt={option.label}
                                    width={18}
                                    height={18}
                                  />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="font-medium">
                                    {option.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* API Key Field */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="group">
                      <FormLabel>API Key Secret</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRoundIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            type="password"
                            placeholder="sk-..."
                            {...field}
                            className={cn(
                              "pl-9 bg-background/50 border-muted focus-visible:ring-offset-0 focus-visible:ring-1 font-mono text-sm",
                              currentStyle.border // Dynamic border color on focus
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="flex items-center gap-1 text-xs">
                        <SparklesIcon className="size-3 text-amber-500" />
                        Your key is encrypted using AES-256 before storage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-1 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {isEdit ? "Save Changes" : "Create Credential"}
                        <CheckCircle2Icon className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);
  return <CredentialForm initialData={credential} />;
};
