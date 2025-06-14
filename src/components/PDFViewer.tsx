
import React from 'react';
import { BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileUrl: string;
  pageNumber?: number;
  scale?: number;
  onLoadSuccess?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: Error) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  onLoadSuccess,
  onLoadError
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  console.log('PDFViewer - Rendering with fileUrl:', fileUrl);

  const handleLoad = () => {
    console.log('✅ PDF iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
    // Call onLoadSuccess with a default value since we can't determine page count with iframe
    if (onLoadSuccess) {
      onLoadSuccess({ numPages: 1 });
    }
  };

  const handleError = () => {
    console.error('❌ PDF iframe failed to load');
    setIsLoading(false);
    setHasError(true);
    if (onLoadError) {
      onLoadError(new Error('Failed to load PDF in iframe'));
    }
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No PDF file available.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive text-center mb-2">
          Failed to load PDF document
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          The PDF could not be displayed in the browser viewer.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Loading PDF...</span>
          </div>
        </div>
      )}
      
      <iframe
        src={fileUrl}
        width="100%"
        height="800px"
        style={{ border: 'none', minHeight: '600px' }}
        onLoad={handleLoad}
        onError={handleError}
        title="PDF Viewer"
        className="w-full"
      />
      
      <div className="p-2 bg-muted/30 text-center">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Full Screen
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
