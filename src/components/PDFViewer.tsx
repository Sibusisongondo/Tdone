
import React from 'react';
import { Document, Page } from 'react-pdf';
import { BookOpen, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
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
  const [pdfBlob, setPdfBlob] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  console.log('PDFViewer - Rendering with props:', {
    fileUrl,
    pageNumber,
    scale,
    retryCount,
    hasError
  });

  // Fetch PDF as blob for better compatibility
  const fetchPdfAsBlob = React.useCallback(async () => {
    if (!fileUrl) return;

    try {
      setIsLoading(true);
      console.log('🔄 Fetching PDF as blob from:', fileUrl);
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('📄 Response content-type:', contentType);

      const blob = await response.blob();
      console.log('✅ PDF blob created:', {
        size: blob.size,
        type: blob.type
      });

      const blobUrl = URL.createObjectURL(blob);
      setPdfBlob(blobUrl);
      setHasError(false);
      
    } catch (error) {
      console.error('❌ Failed to fetch PDF as blob:', error);
      setHasError(true);
      onLoadError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl, onLoadError]);

  React.useEffect(() => {
    fetchPdfAsBlob();
    
    // Cleanup blob URL when component unmounts or fileUrl changes
    return () => {
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
      }
    };
  }, [fetchPdfAsBlob, fileUrl]);

  const handleLoadSuccess = (pdf: { numPages: number }) => {
    console.log('✅ PDF loaded successfully with', pdf.numPages, 'pages');
    setHasError(false);
    setRetryCount(0);
    onLoadSuccess(pdf);
  };

  const handleLoadError = (error: Error) => {
    console.error('❌ PDF.js loading error:', error);
    setHasError(true);
    onLoadError(error);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setPdfBlob(null);
    fetchPdfAsBlob();
  };

  // Enhanced PDF.js options
  const options = React.useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@3.11.174/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/`,
    enableXfa: true,
    verbosity: 1,
  }), []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <BookOpen className="h-8 w-8 text-primary animate-pulse mb-2" />
        <span className="text-sm text-muted-foreground">
          Loading PDF... {retryCount > 0 && `(Attempt ${retryCount + 1})`}
        </span>
      </div>
    );
  }

  if (hasError || !pdfBlob) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive text-center mb-2">
          Failed to load PDF document
        </h3>
        <div className="text-sm text-muted-foreground text-center mb-4 max-w-md space-y-2">
          <p>This could be due to:</p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>CORS restrictions on Supabase storage</li>
            <li>PDF.js compatibility issues</li>
            <li>Network connectivity issues</li>
            <li>Invalid or corrupted PDF file</li>
          </ul>
          {fileUrl && (
            <div className="mt-2 p-2 bg-muted rounded text-xs break-all">
              <strong>File URL:</strong> {fileUrl}
            </div>
          )}
        </div>
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
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 overflow-auto bg-gray-50 min-h-96">
      <Document
        file={pdfBlob}
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
