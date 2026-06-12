"use client";

import { Plus } from "lucide-react";
import React from "react";
import Workflowform from "@/components/forms/workflow-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";

const WorkflowButton = () => {
  const { setOpen } = useModal();

  const handleClick = () => {
    setOpen(
      <CustomModal
        title="Create a Workflow Automation"
        subheading="Workflows help you automate tasks."
      >
        <Workflowform />
      </CustomModal>,
    );
  };

  return (
    <Button size={"sm"} onClick={handleClick}>
      <Plus className="mr-2 h-4 w-4" />
      New Workflow
    </Button>
  );
};

export default WorkflowButton;
