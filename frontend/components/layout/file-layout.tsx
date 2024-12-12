'use client';

import { DashboardLayout } from "./dashboard-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  MessageSquare, 
  Headphones, 
  BrainCircuit,
  Share2,
  ChevronLeft,
  Car
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileLayoutProps {
  children: React.ReactNode;
  fileId: string;
}

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  tooltip: string;
}

export function FileLayout({ children, fileId }: FileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const sidebarItems: SidebarItem[] = [
    {
      icon: FileText,
      label: "View PDF",
      href: `/dashboard/${fileId}/view-pdf`,
      tooltip: "View and read your PDF"
    },
    {
      icon: MessageSquare,
      label: "Chat",
      href: `/dashboard/${fileId}/chat`,
      tooltip: "Chat with your document"
    },
    {
      icon: Headphones,
      label: "Podcasts",
      href: `/dashboard/${fileId}/podcast`,
      tooltip: "Listen to generated podcasts"
    },
    {
      icon: BrainCircuit,
      label: "Quizzes",
      href: `/dashboard/${fileId}/quiz`,
      tooltip: "Test your knowledge"
    },
    {
      icon: Car,
      label: "Flashcards",
      href: `/dashboard/${fileId}/flashcard`,
      tooltip: "Study with flashcards"
    },
    {
      icon: Share2,
      label: "Share",
      href: `/dashboard/${fileId}/social`,
      tooltip: "Share your learnings"
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-[68px] shrink-0">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Separator />
            
            <TooltipProvider>
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={pathname === item.href ? "default" : "ghost"}
                          size="icon"
                          className={cn(
                            "w-full",
                            pathname === item.href && "bg-primary text-primary-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </DashboardLayout>
  );
}