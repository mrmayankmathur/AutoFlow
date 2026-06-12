"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Workflow } from "lucide-react"; // Import Workflow icon
import { useRouter } from "next/navigation";
import { generateSlug } from "random-word-slugs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { useCreateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useModal } from "@/providers/modal-provider";

// 1. Updated Schema (Name only)
export const WorkflowFormSchema = z.object({
  name: z.string().optional(),
});

type Props = {
  title?: string;
  subTitle?: string;
};

const WorkflowForm = ({ subTitle, title }: Props) => {
  const [placeholderName, setPlaceholderName] = useState("");
  const { setClose } = useModal();
  const router = useRouter();
  const { mutate, isPending } = useCreateWorkflow();

  useEffect(() => {
    setPlaceholderName(generateSlug(3, { format: "title" }));
  }, []);

  const egName = placeholderName;

  const form = useForm<z.infer<typeof WorkflowFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(WorkflowFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof WorkflowFormSchema>) => {
    mutate(
      { name: values.name || egName },
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
          router.refresh();
          setClose();
        },
      },
    );
  };

  return (
    <Card className="w-full max-w-[650px] border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-col items-center justify-center text-center p-6">
        {/* 2. Visual Anchor: Large Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Workflow className="w-8 h-8 text-primary" />
        </div>

        {title && <CardTitle className="text-xl">{title}</CardTitle>}
        {subTitle && (
          <CardDescription className="max-w-sm mx-auto">
            {subTitle}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4 text-left"
          >
            <FormField
              disabled={isPending}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`e.g. ${egName}`} />
                  </FormControl>
                  {/* 3. Helper text to fill space and guide user */}
                  <p className="text-xs text-muted-foreground mt-2">
                    Give your workflow a unique name to easily identify it
                    later.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-4 w-full" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Workflow"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WorkflowForm;
