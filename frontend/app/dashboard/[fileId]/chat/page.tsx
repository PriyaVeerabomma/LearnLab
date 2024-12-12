'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFileStore } from "@/store/file-store";
import { Send } from "lucide-react";

interface ChatPageProps {
  params: {
    fileId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { selectedFile } = useFileStore();

  return (
    <FileLayout fileId={params.fileId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chat with Document
          </h1>
          <p className="text-muted-foreground">
            Ask questions about {selectedFile?.filename}
          </p>
        </div>

        <Card className="w-full min-h-[calc(100vh-12rem)] flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="text-center text-muted-foreground">
              Start chatting with your document
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <form className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </FileLayout>
  );
}