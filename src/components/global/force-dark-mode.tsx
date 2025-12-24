"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export const ForceDarkMode = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return null;
};
