
import React from 'react';
import { Document, Page } from 'react-pdf';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
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
  console.log('PDFViewer - Retry Count:', retryCount);

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
      retryCount,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    setHasError(true);
    onLoadError(error);
  };

  const handleRetry = () => {
    console.log('Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
  };

  // More robust PDF.js options
  const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@3.11.174/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/`,
    enableXfa: true,
    withCredentials: false,
  };

  // Test if the URL is accessible
  const testUrl = React.useCallback(async () => {
    try {
      console.log('Testing URL accessibility:', fileUrl);
      const response = await fetch(fileUrl, { 
        method: 'HEAD',
        mode: 'cors'
      });
      console.log('URL test response status:', response.status);
      console.log('URL test response headers:', Object.fromEntries(response.headers.entries()));
    } catch (error) {
      console.error('URL accessibility test failed:', error);
    }
  }, [fileUrl]);

  React.useEffect(() => {
    if (fileUrl) {
      testUrl();
    }
  }, [fileUrl, testUrl]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive text-center mb-2">
          Failed to load PDF document
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
          This could be due to:
          <br />• Network connectivity issues
          <br />• CORS restrictions on the file server
          <br />• Invalid or corrupted PDF file
          <br />• Browser compatibility issues
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again {retryCount > 0 && `(Attempt ${retryCount + 1})`}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 overflow-auto bg-gray-50 min-h-96">
      <Document
        file={fileUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        options={options}
        loading={
          <div className="flex flex-col items-center justify-center h-96">
            <BookOpen className="h-8 w-8 text-primary animate-pulse mb-2" />
            <span className="text-sm text-muted-foreground">
              Loading PDF... {retryCount > 0 && `(Attempt ${retryCount + 1})`}
            </span>
          </div>
        }
        error={null}
        key={`${fileUrl}-${retryCount}`}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          className="shadow-lg mx-auto"
          renderTextLayer={true}
          renderAnnotationLayer={true}
          loading={
            <div className="flex items-center justify-center h-96 bg-white shadow-lg">
              <div className="text-center">
                <BookOpen className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
                <span className="text-sm text-muted-foreground">
                  Rendering page {pageNumber}...
                </span>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96 bg-white shadow-lg">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive text-sm">Failed to render page {pageNumber}</p>
              </div>
            </div>
          }
        />
      </Document>
    </div>
  );
};

export default PDFViewer;
