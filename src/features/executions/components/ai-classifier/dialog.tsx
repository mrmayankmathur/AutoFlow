"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CredentialType } from "@prisma/client";
import {
  ArrowRight,
  BrainCircuit,
  GitFork,
  KeyRound,
  Layers,
  Plus,
  Sparkles,
  Split,
  Tag,
  Terminal,
  Trash2,
  Variable,
} from "lucide-react";
import { createId } from "@paralleldrive/cuid2";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message: "Variable name must utilize letters, numbers, or underscores.",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.string().optional(),
  routes: z
    .array(
      z.object({
        id: z.string().min(1, "Route ID is required"),
        label: z.string().min(1, "Label is required"),
      })
    )
    .min(1, "At least one route is required"),
  input: z.string().min(1, "Input text is required"),
});

export type AiClassifierFormValues = z.infer<typeof formSchema>;

interface AiClassifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AiClassifierFormValues) => void;
  defaultValues?: Partial<AiClassifierFormValues>;
}

const MODEL_OPTIONS = {
  [CredentialType.GEMINI]: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
    { value: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  ],
  [CredentialType.OPENAI]: [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  ],
};

export function AiClassifierDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: AiClassifierDialogProps) {
  const trpc = useTRPC();
  const form = useForm<AiClassifierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: "",
      credentialId: "",
      model: "",
      routes: [
        { id: "positive", label: "Positive" },
        { id: "negative", label: "Negative" },
      ],
      input: "",
      ...defaultValues,
    },
  });

  const selectedCredentialId = form.watch("credentialId");
  const watchVariableName = form.watch("variableName") || "classification";

  useEffect(() => {
    if (open) {
      const currentValues = form.getValues();
      const newValues = {
        variableName: "",
        credentialId: "",
        model: "",
        routes: [
          { id: "positive", label: "Positive" },
          { id: "negative", label: "Negative" },
        ],
        input: "",
        ...defaultValues,
      };

      if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
        form.reset(newValues);
      }
    }
  }, [open, JSON.stringify(defaultValues), form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "routes",
  });

  const { data: credentials, isLoading: isLoadingCredentials } = useQuery(
    trpc.credentials.getMany.queryOptions({})
  );

  const filteredCredentials = useMemo(() => {
    return credentials?.items?.filter(
      (c) =>
        c.type === CredentialType.GEMINI || c.type === CredentialType.OPENAI
    );
  }, [credentials]);

  const availableModels = useMemo(() => {
    if (!selectedCredentialId || !filteredCredentials) return [];

    const selectedCredential = filteredCredentials.find(
      (c) => c.id === selectedCredentialId
    );

    if (!selectedCredential) return [];

    return (
      MODEL_OPTIONS[selectedCredential.type as keyof typeof MODEL_OPTIONS] || []
    );
  }, [selectedCredentialId, filteredCredentials]);

  useEffect(() => {
    if (availableModels.length > 0) {
      const currentModel = form.getValues("model");
      const isModelValid = availableModels.some(
        (m) => m.value === currentModel
      );

      if (!currentModel || !isModelValid) {
        form.setValue("model", availableModels[0].value);
      }
    }
  }, [availableModels, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[45vw] p-0 gap-0 overflow-hidden outline-none bg-background shadow-2xl border-border/50">
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-linear-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <GitFork className="size-5 text-indigo-600 dark:text-indigo-400 rotate-90" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Smart Router
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                >
                  LOGIC CONTROL
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Classify input & route workflow execution
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
          <Form {...form}>
            <form
              id="classifier-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-8"
            >
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
                                placeholder="classification"
                                {...field}
                                className="pl-9 font-mono bg-muted/30 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <div className="hidden sm:flex items-center h-10 px-3 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground font-mono whitespace-nowrap">
                            <Terminal className="size-3 mr-2 opacity-50" />
                            {`{{${watchVariableName}.category}}`}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <BrainCircuit className="size-4 text-muted-foreground" />
                  <span>Intelligence Settings</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="credentialId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Credential
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                          }}
                          value={field.value}
                          disabled={isLoadingCredentials}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-muted/30 focus:bg-background transition-all">
                              <SelectValue placeholder="Select Credential" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(!filteredCredentials ||
                              filteredCredentials.length === 0) && (
                              <div className="py-2 px-3 text-sm text-muted-foreground">
                                No Gemini or OpenAI credentials found
                              </div>
                            )}
                            {filteredCredentials?.map((credential) => (
                              <SelectItem
                                key={credential.id}
                                value={credential.id}
                              >
                                <div className="flex items-center gap-2">
                                  <KeyRound className="size-3.5 text-indigo-500" />
                                  <span className="truncate max-w-[150px]">
                                    {credential.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="ml-auto text-[9px] h-4"
                                  >
                                    {credential.type}
                                  </Badge>
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
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Model
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !selectedCredentialId ||
                            availableModels.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-muted/30 focus:bg-background transition-all">
                              <SelectValue
                                placeholder={
                                  !selectedCredentialId
                                    ? "Select credential first"
                                    : "Select Model"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="size-3.5 text-indigo-500" />
                                  {model.label}
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

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Tag className="size-4 text-muted-foreground" />
                  <span>Input to Classify</span>
                </div>
                <div className="p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="input"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter text or use {{variable}} to be classified..."
                            {...field}
                            className="min-h-[100px] font-mono text-sm bg-muted/20 focus:bg-background border-muted resize-none focus:ring-1 focus:ring-indigo-500/20"
                          />
                        </FormControl>
                        <FormDescription className="flex items-center gap-1.5 mt-2 text-[11.5px] text-muted-foreground">
                          <Terminal className="size-3" />
                          <span>
                            Supports Handlebars syntax (e.g.,{" "}
                            <code className="text-primary bg-muted px-1 py-0.5 rounded">
                              {"{{trigger.body}}"}
                            </code>
                            )
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Split className="size-4 text-muted-foreground" />
                    <span>Routing Logic</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ id: createId(), label: "" })}
                    className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  >
                    <Plus className="size-3 mr-1" /> Add Route
                  </Button>
                </div>

                <div className="space-y-2 rounded-xl border border-border/50 bg-card shadow-sm p-4">
                  {fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg">
                      No routes defined. Add a route to start classifying.
                    </div>
                  )}
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="group flex gap-3 items-start relative animate-in slide-in-from-left-2 fade-in duration-300"
                    >
                      <div className="absolute -left-[20px] top-5 w-[12px] h-px bg-border/50 hidden md:block" />

                      <FormField
                        control={form.control}
                        name={`routes.${index}.id`}
                        render={({ field }) => (
                          <FormItem className="w-[140px] shrink-0">
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="ID"
                                  {...field}
                                  className="h-9 text-xs font-mono bg-muted/50"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-center h-9 text-muted-foreground/30">
                        <ArrowRight className="size-4" />
                      </div>

                      <FormField
                        control={form.control}
                        name={`routes.${index}.label`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Description (e.g. Refund Request)"
                                {...field}
                                className="h-9 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label={`Remove route ${fields[index]?.label || index + 1}`}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
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
            form="classifier-form"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-sm"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
