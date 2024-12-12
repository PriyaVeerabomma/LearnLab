// app/dashboard/[fileId]/view-pdf/page.tsx
'use client';

import { FileLayout } from "@/components/layout/file-layout";
import { useFileStore } from "@/store/file-store";
import { PDFViewer } from '@/components/file/pdf-viewer';

interface PDFViewerPageProps {
  params: {
    fileId: string;
  };
}

export default function PDFViewerPage({ params }: PDFViewerPageProps) {
  const { selectedFile } = useFileStore();

  return (
    <FileLayout fileId={params.fileId}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedFile?.filename || 'View PDF'}
          </h1>
          <p className="text-muted-foreground">
            Read and interact with your document
          </p>
        </div>

        <PDFViewer file={selectedFile!} />
      </div>
    </FileLayout>
  );
}