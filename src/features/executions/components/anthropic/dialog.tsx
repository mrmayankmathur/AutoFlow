"use client";

import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@prisma/client";
import {
  Bot,
  Cpu,
  Fingerprint,
  KeyRound,
  Layers,
  Sparkles,
  Terminal,
  Variable,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicFormValues>;
}

const AVAILABLE_MODELS = [
  "claude-sonnet-4-5",
  "claude-sonnet-4-0",
  "claude-opus-4-0",
  "claude-opus-4-5",
  "claude-3-7-sonnet-latest",
  "claude-haiku-4-5",
  "claude-3-5-haiku-latest",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores.",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.string().min(1, "Model is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.ANTHROPIC);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      model: defaultValues.model || "claude-sonnet-4-5",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        model: defaultValues.model || "claude-sonnet-4-5",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "anthropicOutput";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40vw] p-0 gap-0 overflow-hidden outline-none bg-background shadow-2xl border-border/50">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-linear-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                <Image
                  src="/logos/anthropic.svg"
                  alt="Anthropic"
                  width={22}
                  height={22}
                  className="opacity-90"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                    Anthropic Configuration
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                  >
                    AI GENERATION
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Configure Claude models & prompts
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
          <Form {...form}>
            <form
              id="anthropic-node-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="p-6 space-y-8"
            >
              {/* Output Configuration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Layers className="size-4 text-muted-foreground" />
                  <span>Output Configuration</span>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="variableName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Variable Name
                        </FormLabel>
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <div className="relative flex-1">
                              <Variable className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <Input
                                placeholder="anthropicOutput"
                                {...field}
                                className="pl-9 font-mono bg-muted/30 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <div className="hidden sm:flex items-center h-10 px-3 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground font-mono whitespace-nowrap">
                            <Terminal className="size-3 mr-2 opacity-50" />
                            {`{{${watchVariableName}.text}}`}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Model Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Cpu className="size-4 text-muted-foreground" />
                  <span>Model Settings</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Model Version
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-muted/30 focus:bg-background transition-all">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AVAILABLE_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="size-3.5 text-orange-500" />
                                  <span>{model}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="credentialId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Credential
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={
                            isLoadingCredentials || !credentials?.length
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-muted/30 focus:bg-background transition-all">
                              <SelectValue placeholder="Select Key" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {credentials?.map((credential) => (
                              <SelectItem
                                key={credential.id}
                                value={credential.id}
                              >
                                <div className="flex items-center gap-2">
                                  <KeyRound className="size-3.5 text-orange-500" />
                                  <span className="truncate max-w-[200px]">
                                    {credential.name}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Prompt Engineering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Wand2 className="size-4 text-muted-foreground" />
                    <span>Prompt Engineering</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal h-5"
                  >
                    Supports Handlebars
                  </Badge>
                </div>

                <div className="rounded-xl border border-border/50 bg-card shadow-sm divide-y divide-border/50 overflow-hidden">
                  {/* System Prompt */}
                  <div className="p-4 bg-muted/10">
                    <FormField
                      control={form.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                            <span>System Prompt</span>
                            <span className="text-[10px] font-normal opacity-70">
                              Optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Bot className="absolute top-3 left-3 size-4 text-muted-foreground/60" />
                              <Textarea
                                {...field}
                                placeholder="You are a helpful AI assistant..."
                                className="min-h-[80px] pl-9 font-mono text-sm bg-background border-muted resize-none focus:ring-1 focus:ring-orange-500/20"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* User Prompt */}
                  <div className="p-4">
                    <FormField
                      control={form.control}
                      name="userPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                            User Prompt
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute top-3 left-3 pointer-events-none">
                                <Fingerprint className="size-4 text-muted-foreground/60" />
                              </div>
                              <Textarea
                                {...field}
                                placeholder="Summarize the following text: {{http.data}}"
                                className="min-h-[160px] pl-9 font-mono text-sm bg-muted/20 focus:bg-background border-muted transition-colors resize-y focus:ring-1 focus:ring-orange-500/20"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="flex items-center gap-1.5 mt-2 text-[11.5px] text-muted-foreground">
                            <Sparkles className="size-3 text-orange-500" />
                            <span>
                              Type{" "}
                              <code className="text-primary bg-muted px-1 py-0.5 rounded">
                                {"{{variable}}"}
                              </code>{" "}
                              to insert variables.
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="anthropic-node-form"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-sm"
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
