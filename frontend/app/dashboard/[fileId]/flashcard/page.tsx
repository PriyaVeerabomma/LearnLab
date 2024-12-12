'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Clock, Lightbulb, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FlashcardPageProps {
  params: {
    fileId: string;
  };
}

export default function FlashcardPage({ params }: FlashcardPageProps) {
  return (
    <FileLayout fileId={params.fileId}>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
            <p className="text-muted-foreground">
              Master concepts through spaced repetition
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Deck
          </Button>
        </div>

        {/* Learning Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Review Rate</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>
              Track your mastery of concepts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Mastery</span>
                <span className="text-muted-foreground">0%</span>
              </div>
              <Progress value={0} />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium">New</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Learning</div>
                <div className="text-2xl font-bold">0</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Mastered</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Deck */}
        <Card>
          <CardHeader>
            <CardTitle>Study Now</CardTitle>
            <CardDescription>
              Review due cards from your deck
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              No cards available for review
            </div>
          </CardContent>
        </Card>
      </div>
    </FileLayout>
  );
}