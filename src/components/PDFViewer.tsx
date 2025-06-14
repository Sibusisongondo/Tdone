
import React from 'react';
import { Document, Page } from 'react-pdf';
import { BookOpen } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError
}) => {
  return (
    <div className="flex justify-center p-4 overflow-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="flex items-center justify-center h-96">
            <BookOpen className="h-8 w-8 text-primary animate-pulse mr-2" />
            <span>Loading PDF...</span>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-96">
            <p className="text-destructive">Failed to load PDF. Please try again.</p>
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          className="shadow-lg"
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
    </div>
  );
};

export default PDFViewer;
