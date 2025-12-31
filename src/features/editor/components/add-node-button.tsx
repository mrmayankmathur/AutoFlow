"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";

export const AddNodeButton = memo(() => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {}}
        size="icon"
        variant="outline"
        className="bg-background text-black dark:text-white"
      >
        <PlusIcon />
      </Button>
    </div>
  );
});

AddNodeButton.displayName = "AddNodeButton";
