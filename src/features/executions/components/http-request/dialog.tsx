"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightLeft,
  Braces,
  FileJson,
  Globe,
  Layers,
  Network,
  Terminal,
  Variable,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type HTTPRequestFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HTTPRequestFormValues>;
}

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores.",
    }),
  endpoint: z.string().min(1, { message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  body: z.string().optional(),
});

export const HTTPRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      endpoint: defaultValues.endpoint || "",
      method: defaultValues.method || "GET",
      body: defaultValues.body || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        endpoint: defaultValues.endpoint || "",
        method: defaultValues.method || "GET",
        body: defaultValues.body || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "apiResponse";
  const watchMethod = form.watch("method");
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

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
              <div className="size-10 rounded-xl bg-linear-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                <Globe className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                    HTTP Request
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  >
                    NETWORK
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Configure API endpoint & params
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
          <Form {...form}>
            <form
              id="http-node-form"
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
                                placeholder="apiResponse"
                                {...field}
                                className="pl-9 font-mono bg-muted/30 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <div className="hidden sm:flex items-center h-10 px-3 rounded-md bg-muted/50 border border-border/50 text-xs text-muted-foreground font-mono whitespace-nowrap">
                            <Terminal className="size-3 mr-2 opacity-50" />
                            {`{{${watchVariableName}.httpResponse.data}}`}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Endpoint Configuration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Network className="size-4 text-muted-foreground" />
                  <span>Request Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="md:col-span-1">
                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Method
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full bg-muted/30 focus:bg-background transition-all">
                                <SelectValue placeholder="Method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="endpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Endpoint URL
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ArrowRightLeft className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <Input
                                placeholder="https://api.example.com/v1/resource"
                                {...field}
                                className="pl-9 font-mono bg-muted/30 focus:bg-background transition-all"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Body Configuration (Conditional) */}
              {showBodyField && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                      <FileJson className="size-4 text-muted-foreground" />
                      <span>Request Body</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal h-5"
                    >
                      JSON
                    </Badge>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                    <div className="p-4 bg-muted/10">
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                              <span>JSON Payload</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Braces className="absolute top-3 left-3 size-4 text-muted-foreground/60" />
                                <Textarea
                                  {...field}
                                  placeholder={
                                    '{\n  "key": "value",\n  "userId": "{{trigger.userId}}"\n}'
                                  }
                                  className="min-h-[150px] pl-9 font-mono text-sm bg-background border-muted resize-none focus:ring-1 focus:ring-purple-500/20"
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="flex items-center gap-1.5 mt-2 text-[11.5px] text-muted-foreground">
                              <span>
                                Wrap values in{" "}
                                <code className="text-primary bg-muted px-1 py-0.5 rounded">
                                  {"{{variable}}"}
                                </code>{" "}
                                for dynamic insertion.
                              </span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
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
            form="http-node-form"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-sm"
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
