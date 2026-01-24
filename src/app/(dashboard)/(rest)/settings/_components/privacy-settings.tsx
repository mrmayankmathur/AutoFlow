"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Lock, EyeOff, FileKey, Server } from "lucide-react";

export const PrivacySettings = () => {
  return (
    <div className="lg:max-h-[55vh] lg:scale-y-90 -mt-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-[#15161d]/60 border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-emerald-500" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              All sensitive credentials and API keys are encrypted at rest using
              AES-256 encryption. We never store raw keys in our database.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#15161d]/60 border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <EyeOff className="h-4 w-4 text-blue-500" />
              Private Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your workflows are private by default. Only you can access and
              execute them unless you explicitly share a trigger URL.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#15161d]/60 border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-purple-500" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Execution logs are retained for 30 days to help you debug issues.
              After this period, they are automatically purged from our systems.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#15161d]/60 border-neutral-200/60 dark:border-neutral-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileKey className="h-4 w-4 text-orange-500" />
              Third Party Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              We do not share your data with third parties. Integrations (like
              Google Drive) operate strictly under the scopes you authorize.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-4 border border-blue-100 dark:border-blue-900/20">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
              Security Policy
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              AutoFlow adheres to strict security standards. For any security
              concerns, please contact security@autoflow.ai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
