"use client";

import dynamic from "next/dynamic";
import { WorkflowsLoading } from "./workflows";

export const WorkflowsListClient = dynamic(
  () => import("./workflows").then((mod) => mod.WorkflowsList),
  {
    ssr: false,
    loading: () => <WorkflowsLoading />,
  },
);
