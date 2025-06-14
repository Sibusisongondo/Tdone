
import React from 'react';
import { Document, Page } from 'react-pdf';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  const [retryCount, setRetryCount] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  console.log('PDFViewer - File URL:', fileUrl);
  console.log('PDFViewer - Page Number:', pageNumber);
  console.log('PDFViewer - Scale:', scale);

  const handleLoadSuccess = (pdf: { numPages: number }) => {
    console.log('PDF loaded successfully with', pdf.numPages, 'pages');
    setHasError(false);
    setRetryCount(0);
    onLoadSuccess(pdf);
  };

  const handleLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      fileUrl,
      retryCount
    });
    setHasError(true);
    onLoadError(error);
  };

  const handleRetry = () => {
    console.log('Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
  };

  const options = {
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-destructive text-center mb-4">
          Failed to load PDF document.
        </p>
        <p className="text-sm text-muted-foreground text-center mb-4">
          This could be due to network issues or the file format.
        </p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 overflow-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        options={options}
        loading={
          <div className="flex items-center justify-center h-96">
            <BookOpen className="h-8 w-8 text-primary animate-pulse mr-2" />
            <span>Loading PDF... {retryCount > 0 && `(Attempt ${retryCount + 1})`}</span>
          </div>
        }
        error={null}
        key={`${fileUrl}-${retryCount}`}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          className="shadow-lg"
          renderTextLayer={true}
          renderAnnotationLayer={true}
          loading={
            <div className="flex items-center justify-center h-96">
              <BookOpen className="h-8 w-8 text-primary animate-pulse mr-2" />
              <span>Rendering page {pageNumber}...</span>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96">
              <p className="text-destructive">Failed to render page {pageNumber}</p>
            </div>
          }
        />
      </Document>
    </div>
  );
};

export default PDFViewer;
