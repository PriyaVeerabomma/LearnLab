'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileStore } from "@/store/file-store";
import { useEffect } from "react";
import { Headphones, BrainCircuit, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ErrorBoundary } from 'react-error-boundary';
type Params = Promise<{ fileId: string }>

interface FilePageProps {
  params: Params;
}

export default function FilePage({ params }: FilePageProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const fileId = resolvedParams.fileId;

  const router = useRouter();
  const { selectedFile } = useFileStore();

  useEffect(() => {
    // TODO: Fetch file details and stats if not already in store
  }, [fileId]);

  const features = [
    {
      title: "Podcasts",
      icon: Headphones,
      description: "0 podcasts generated",
      href: `/dashboard/${fileId}/podcast`,
      stats: [
        { label: "Total", value: "0" },
        { label: "Completed", value: "0" },
        { label: "In Progress", value: "0" }
      ]
    },
    {
      title: "Quizzes",
      icon: BrainCircuit,
      description: "0 quizzes created",
      href: `/dashboard/${fileId}/quiz`,
      stats: [
        { label: "Total", value: "0" },
        { label: "Attempted", value: "0" },
        { label: "Avg. Score", value: "0%" }
      ]
    },
    {
      title: "Flashcards",
      icon: Car,
      description: "0 cards created",
      href: `/dashboard/${fileId}/flashcard`,
      stats: [
        { label: "Total Cards", value: "0" },
        { label: "Mastered", value: "0" },
        { label: "To Review", value: "0" }
      ]
    }
  ];

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <FileLayout fileId={fileId}>
        <div className="space-y-6">
          {/* File Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedFile?.filename || 'File Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              View and manage your learning materials
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {feature.title}
                  </CardTitle>
                  <feature.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <CardDescription>{feature.description}</CardDescription>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {feature.stats.map((stat) => (
                        <div key={stat.label}>
                          <p className="text-muted-foreground">{stat.label}</p>
                          <p className="font-medium">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => router.push(feature.href)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </FileLayout>
    </ErrorBoundary>
  );
}
