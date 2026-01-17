"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Credential, CredentialType } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PlusIcon,
  SearchIcon,
  MoreVerticalIcon,
  FilterIcon,
  FolderKeyIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LoadingView,
  ErrorView,
  EntityPagination,
} from "@/components/entity-components";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const CredentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg",
};

const ProviderStyles: Record<
  CredentialType,
  { gradient: string; text: string; iconBg: string }
> = {
  [CredentialType.OPENAI]: {
    gradient: "from-emerald-500/30 via-teal-500/20 to-transparent",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  [CredentialType.ANTHROPIC]: {
    gradient: "from-orange-500/30 via-amber-500/20 to-transparent",
    text: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500/10",
  },
  [CredentialType.GEMINI]: {
    gradient: "from-blue-500/30 via-violet-500/20 to-transparent",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
  },
};

export const CredentialsHeader = () => {
  return (
    <div className="flex flex-col gap-1 mb-8 px-1">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Credentials
      </h1>
      <p className="text-muted-foreground text-sm">
        Connect and manage your API keys for AI providers.
      </p>
    </div>
  );
};

export const CredentialsFilterBar = ({
  currentFilter,
  onFilterChange,
}: {
  currentFilter: CredentialType | "ALL";
  onFilterChange: (val: CredentialType | "ALL") => void;
}) => {
  const filters = [
    { label: "All Credentials", value: "ALL" },
    { label: "Gemini", value: CredentialType.GEMINI },
    { label: "OpenAI", value: CredentialType.OPENAI },
    { label: "Anthropic", value: CredentialType.ANTHROPIC },
  ];

  const activeLabel = filters.find((f) => f.value === currentFilter)?.label;

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* DESKTOP: Tabs */}
      <div className="hidden lg:flex items-center p-1 bg-muted/60 rounded-xl border w-fit gap-x-1.5">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            onClick={() =>
              onFilterChange(filter.value as CredentialType | "ALL")
            }
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
              currentFilter === filter.value
                ? "bg-background text-foreground hover:bg-background shadow-sm"
                : "text-muted-foreground bg-transparent hover:text-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* MOBILE/TABLET: Dropdown */}
      <div className="lg:hidden w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-background border-dashed"
            >
              <span className="flex items-center">
                <FilterIcon className="mr-2 size-4 text-muted-foreground" />
                {activeLabel}
              </span>
              <span className="text-xs text-muted-foreground opacity-50">
                Filter
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.value}
                onClick={() =>
                  onFilterChange(filter.value as CredentialType | "ALL")
                }
              >
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-3 w-full lg:hidden">
          {!isDesktop && <CredentialsSearch />}
        </div>

        <Button
          asChild
          className="h-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/credentials/new">
            <PlusIcon className="mr-2 size-4" />
            Add New
          </Link>
        </Button>
      </div>
    </div>
  );
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <div className="relative group flex-1 md:flex-none">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search Credentials"
        className="pl-9 h-9 w-full md:w-[250px] bg-background"
      />
    </div>
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();
  const [typeFilter, setTypeFilter] = useState<CredentialType | "ALL">("ALL");

  const filteredItems = credentials.data.items.filter((item) => {
    if (typeFilter === "ALL") return true;
    return item.type === typeFilter;
  });

  if (credentials.data.items.length === 0) {
    return <CredentialsEmpty />;
  }

  return (
    <div className="flex flex-col lg:px-10 md:px-5 px-2 w-full h-full min-h-[calc(100vh-135px)]">
      <CredentialsHeader />

      <CredentialsFilterBar
        currentFilter={typeFilter}
        onFilterChange={setTypeFilter}
      />

      {filteredItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px] border border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground">
            No credentials found for this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((credential) => (
              <CredentialCard key={credential.id} data={credential} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-auto py-4 border-t">
        <CredentialsPagination />
      </div>
    </div>
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => {
        setParams({ ...params, page });
      }}
    />
  );
};

export const CredentialCard = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeCredential.mutate({ id: data.id });
    setShowDeleteDialog(false);
  };

  const style = ProviderStyles[data.type] || {
    gradient: "from-gray-500/20 via-gray-500/5",
    text: "text-foreground",
    iconBg: "bg-muted",
  };
  const logo = CredentialLogos[data.type] || "/logos/openai.svg";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={() => router.push(`/credentials/${data.id}`)}
        className={cn(
          "relative group flex flex-col h-full overflow-hidden cursor-pointer border transition-all duration-300",
          "bg-card hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/5",
          removeCredential.isPending && "opacity-50 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl transition-opacity duration-500 bg-linear-to-br to-transparent pointer-events-none z-0",
            style.gradient,
            "opacity-60 group-hover:opacity-100"
          )}
        />

        <div className="absolute top-0 right-0 w-32 h-32 z-0 pointer-events-none">
          <Image
            src="/stars-pattern.png"
            alt="Stars Pattern"
            fill
            className="scale-175 scale-y-200 opacity-20 group-hover:opacity-30 rotate-350 transition-opacity duration-300"
          />
        </div>

        <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0 relative z-1">
          <div
            className={cn(
              "size-12 rounded-xl flex items-center justify-center border transition-colors",
              style.iconBg
            )}
          >
            <Image src={logo} alt={data.type} width={24} height={24} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <TrashIcon className="size-4 mr-2" />
                Delete Credential
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-1 space-y-1.5 relative z-1">
          <h3
            className={cn(
              "font-semibold text-lg leading-none tracking-tight",
              style.text
            )}
          >
            {data.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Secure API configuration for {data.type.toLowerCase()}.
          </p>
        </CardContent>

        <CardFooter className="pt-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center mt-auto relative z-1 backdrop-blur-[1px]">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            <span>
              {formatDistanceToNow(data.createdAt, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheckIcon className="size-3" />
            Active
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              credential "{data.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemove}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] p-6 md:p-8 w-full">
      {children}
    </div>
  );
};

export const CredentialsLoading = () => {
  const [typeFilter, setTypeFilter] = useState<CredentialType | "ALL">("ALL");
  return (
    <div className="flex flex-col lg:px-10 md:px-5 px-2 w-full h-full min-h-[calc(100vh-135px)]">
      <CredentialsHeader />
      <CredentialsFilterBar
        currentFilter={typeFilter}
        onFilterChange={setTypeFilter}
      />

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col h-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden"
          >
            <div className="flex flex-col flex-1 p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                {/* Icon Skeleton */}
                <Skeleton className="h-12 w-12 rounded-xl" />
                {/* Menu Dot Skeleton */}
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Title & Desc Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Footer Skeleton */}
            <div className="flex items-center justify-between p-4 pt-4 border-t bg-muted/10 mt-auto">
              <Skeleton className="h-4 w-24" /> {/* Date */}
              <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingAnimate = () => (
  <div className="p-4 md:px-22 md:py-16 h-full">
    <div className="mx-auto py-46 w-full flex flex-col gap-y-8 h-full">
      <LoadingView message="Loading credentials..." />
    </div>
  </div>
);

export const CredentialsError = () => (
  <ErrorView message="Error loading credentials" />
);

export const CredentialsEmpty = () => {
  const [typeFilter, setTypeFilter] = useState<CredentialType | "ALL">("ALL");
  return (
    <div className="flex flex-col lg:px-10 md:px-5 px-2 w-full h-full min-h-[calc(100vh-135px)]">
      <CredentialsHeader />

      <CredentialsFilterBar
        currentFilter={typeFilter}
        onFilterChange={setTypeFilter}
      />
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center animate-in fade-in-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FolderKeyIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No Credentials created</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
          You haven't created any credentials yet. Start automating your tasks
          by creating your first credential.
        </p>
        <Button
          asChild
          className="h-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/credentials/new">
            <PlusIcon className="mr-2 size-4" />
            Add New
          </Link>
        </Button>
      </div>
    </div>
  );
};
