"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Hash,
  Layers,
  Link,
  MessageCircle,
  Terminal,
  Variable,
  Webhook,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Badge } from "@/components/ui/badge";
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

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message: "Variable name must start with a letter or underscore.",
    }),
  content: z
    .string()
    .min(1, "Content is required")
    .max(4000, "Content can't exceed 4000 characters"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
});

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "mySlack";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40vw] p-0 gap-0 overflow-hidden outline-none bg-background shadow-2xl border-border/50">
        {/* Header - Slack (Pink/Purple) Theme */}
        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-linear-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center border border-pink-500/20 shadow-inner">
                <Image
                  src="/logos/slack.svg"
                  alt="slack"
                  width={20}
                  height={20}
                  className="size-5"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                    Slack Webhook
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20"
                  >
                    NOTIFICATION
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Send messages to workspace
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
          <Form {...form}>
            <form
              id="slack-node-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="p-6 space-y-8"
            >
              {/* SECTION 1: Output Variable */}
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
                                placeholder="mySlack"
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

              {/* SECTION 2: Connection Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Link className="size-4 text-muted-foreground" />
                  <span>Connection Details</span>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Webhook URL
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Webhook className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                              placeholder="https://hooks.slack.com/services/..."
                              {...field}
                              className="pl-9 font-mono text-sm bg-muted/30 focus:bg-background transition-all"
                            />
                          </div>
                        </FormControl>
                        <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                          <p>• Workspace Settings → Workflows → Webhooks</p>
                          <p className="opacity-80">
                            • Ensure the payload uses "content" as the key
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SECTION 3: Message Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <MessageCircle className="size-4 text-muted-foreground" />
                  <span>Message Payload</span>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                          Message Content
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute top-3 left-3 pointer-events-none">
                              <Hash className="size-4 text-muted-foreground/60" />
                            </div>
                            <Textarea
                              {...field}
                              placeholder="Summary: {{aiResponse.text}}"
                              className="min-h-[120px] pl-9 font-mono text-sm bg-muted/20 focus:bg-background border-muted transition-colors resize-y focus:ring-1 focus:ring-pink-500/20"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="flex items-center gap-1.5 mt-2 text-[11.5px] text-muted-foreground">
                          <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 px-1.5 rounded text-[10px] border border-pink-500/20 font-medium">
                            TIP
                          </span>
                          <span>
                            Use{" "}
                            <code className="text-primary bg-muted px-1 py-0.5 rounded">
                              {"{{"}
                            </code>{" "}
                            to insert dynamic variables.
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
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
            form="slack-node-form"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-sm"
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
