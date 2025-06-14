
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
  const [urlTestResult, setUrlTestResult] = React.useState<string>('');

  console.log('PDFViewer - Rendering with props:', {
    fileUrl,
    pageNumber,
    scale,
    retryCount,
    hasError
  });

  const handleLoadSuccess = (pdf: { numPages: number }) => {
    console.log('✅ PDF loaded successfully with', pdf.numPages, 'pages');
    setHasError(false);
    setRetryCount(0);
    setUrlTestResult('');
    onLoadSuccess(pdf);
  };

  const handleLoadError = (error: Error) => {
    console.error('❌ PDF loading error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
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
    console.log('🔄 Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setUrlTestResult('');
  };

  // Test URL accessibility with detailed logging
  const testUrl = React.useCallback(async () => {
    if (!fileUrl) {
      console.warn('⚠️ No file URL provided');
      setUrlTestResult('No file URL provided');
      return;
    }

    try {
      console.log('🔍 Testing URL accessibility:', fileUrl);
      
      // Try to parse the URL first
      const url = new URL(fileUrl);
      console.log('📍 Parsed URL:', {
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        search: url.search
      });

      // Test with HEAD request first
      const headResponse = await fetch(fileUrl, { 
        method: 'HEAD',
        mode: 'cors'
      });
      
      console.log('📡 HEAD response:', {
        status: headResponse.status,
        statusText: headResponse.statusText,
        headers: Object.fromEntries(headResponse.headers.entries()),
        ok: headResponse.ok
      });

      if (headResponse.ok) {
        setUrlTestResult(`URL accessible (${headResponse.status})`);
        
        // Check content type
        const contentType = headResponse.headers.get('content-type');
        console.log('📄 Content-Type:', contentType);
        
        if (contentType && !contentType.includes('pdf')) {
          console.warn('⚠️ Content-Type is not PDF:', contentType);
          setUrlTestResult(`Warning: Content-Type is ${contentType}, not PDF`);
        }
      } else {
        setUrlTestResult(`URL not accessible (${headResponse.status}: ${headResponse.statusText})`);
      }
    } catch (error) {
      console.error('❌ URL accessibility test failed:', error);
      setUrlTestResult(`URL test failed: ${error.message}`);
      
      // Try a different approach - test with GET request
      try {
        console.log('🔄 Trying GET request as fallback...');
        const getResponse = await fetch(fileUrl, { 
          method: 'GET',
          mode: 'no-cors' // This might work for CORS-restricted resources
        });
        console.log('📡 GET (no-cors) response:', getResponse);
        setUrlTestResult(`GET request completed (opaque response due to no-cors)`);
      } catch (getError) {
        console.error('❌ GET request also failed:', getError);
      }
    }
  }, [fileUrl]);

  React.useEffect(() => {
    if (fileUrl) {
      testUrl();
    }
  }, [fileUrl, testUrl, retryCount]);

  // Enhanced PDF.js options
  const options = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@3.11.174/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/`,
    enableXfa: true,
    withCredentials: false,
    // Add more options for better compatibility
    verbosity: 1, // Enable verbose logging
    isEvalSupported: false,
    disableWorker: false,
    disableAutoFetch: false,
    disableStream: false,
    disableFontFace: false,
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive text-center mb-2">
          Failed to load PDF document
        </h3>
        <div className="text-sm text-muted-foreground text-center mb-4 max-w-md space-y-2">
          <p>This could be due to:</p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Network connectivity issues</li>
            <li>CORS restrictions on the file server</li>
            <li>Invalid or corrupted PDF file</li>
            <li>Browser compatibility issues</li>
          </ul>
          {urlTestResult && (
            <div className="mt-3 p-2 bg-muted rounded text-xs">
              <strong>URL Test:</strong> {urlTestResult}
            </div>
          )}
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
            {urlTestResult && (
              <div className="mt-2 text-xs text-muted-foreground max-w-md text-center">
                {urlTestResult}
              </div>
            )}
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
