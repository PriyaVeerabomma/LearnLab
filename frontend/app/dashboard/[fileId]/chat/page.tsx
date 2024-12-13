'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFileStore } from "@/store/file-store";
import { Send } from 'lucide-react';
import React, { useEffect, useState, use } from "react";
import { useChat } from 'ai/react';
import { API_BASE_URL } from "@/config";

type Params = Promise<{ fileId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface ChatPageProps {
  params: Params;
  searchParams?: SearchParams;
}

interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'response';
  category?: 'podcast' | 'flashcard' | 'quiz';
}

export default function ChatPage({ params, searchParams }: ChatPageProps) {
  const resolvedParams = use(params);
  const fileId = resolvedParams.fileId;
  
  const { selectedFile } = useFileStore();
  
  const [generateOptions, setGenerateOptions] = useState({
    podcast: false,
    flashcard: false,
    quiz: false
  });

  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit, isLoading } = useChat({
    api: `${API_BASE_URL}/api/chat`,
    body: {
      fileId,
      ...generateOptions
    },
    onFinish: (message) => {
      console.log('Chat completed', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // Handle checkbox changes
  const handleCheckboxChange = (option: keyof typeof generateOptions) => {
    setGenerateOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleChatSubmit(e);
  };

  // Convert AI SDK messages to ChatMessage format
  const formattedMessages: ChatMessage[] = messages.map(m => ({
    id: m.id,
    text: m.content,
    type: m.role === 'user' ? 'user' : 'response',
    category: m.role === 'assistant' ? determineCategory(m.content) : undefined
  }));

  // Helper function to determine message category
  function determineCategory(content: string): 'podcast' | 'flashcard' | 'quiz' | undefined {
    if (content.toLowerCase().includes('podcast')) return 'podcast';
    if (content.toLowerCase().includes('flashcard')) return 'flashcard';
    if (content.toLowerCase().includes('quiz')) return 'quiz';
    return undefined;
  }

  return (
    <FileLayout fileId={fileId}>
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
            {formattedMessages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Start chatting with your document
              </div>
            ) : (
              formattedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                      : 'bg-muted mr-auto max-w-[80%]'
                  }`}
                >
                  {message.category && (
                    <div className="text-sm font-semibold mb-1">
                      {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                    </div>
                  )}
                  {message.text}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-center items-center h-8">
                <div className="animate-pulse bg-gray-300 h-4 w-4 rounded-full"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-4 rounded-full mx-1"></div>
                <div className="animate-pulse bg-gray-300 h-4 w-4 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Generation Options */}
          <div className="border-t p-4">
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={generateOptions.podcast}
                  onCheckedChange={() => handleCheckboxChange('podcast')}
                />
                <span>Podcast</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={generateOptions.flashcard}
                  onCheckedChange={() => handleCheckboxChange('flashcard')}
                />
                <span>Flashcard</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={generateOptions.quiz}
                  onCheckedChange={() => handleCheckboxChange('quiz')}
                />
                <span>Quiz</span>
              </label>
            </div>

            {/* Input Area */}
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <Input
                placeholder="Ask a question..."
                className="flex-1"
                value={input}
                onChange={handleInputChange}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </FileLayout>
  );
}