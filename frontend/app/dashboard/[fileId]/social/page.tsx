'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Share2, Twitter, Linkedin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SocialPageProps {
  params: {
    fileId: string;
  };
}

export default function SocialPage({ params }: SocialPageProps) {
  return (
    <FileLayout fileId={params.fileId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Share Learning</h1>
          <p className="text-muted-foreground">
            Create and share your learning insights
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Creator</CardTitle>
            <CardDescription>
              Generate and customize content for different platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="thread">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="thread">Twitter Thread</TabsTrigger>
                <TabsTrigger value="linkedin">LinkedIn Post</TabsTrigger>
              </TabsList>
              
              <TabsContent value="thread" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Thread Content</label>
                  <Textarea
                    placeholder="Enter your thread content..."
                    className="mt-1.5"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Twitter className="h-4 w-4" />
                    Share on Twitter
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="linkedin" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Post Content</label>
                  <Textarea
                    placeholder="Enter your LinkedIn post..."
                    className="mt-1.5"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    <Linkedin className="h-4 w-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share History</CardTitle>
            <CardDescription>
              Your previously shared content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              No shared content yet
            </div>
          </CardContent>
        </Card>
      </div>
    </FileLayout>
  );
}