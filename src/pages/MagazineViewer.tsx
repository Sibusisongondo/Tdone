
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useMagazine } from "@/hooks/useMagazine";
import MagazineHeader from "@/components/MagazineHeader";
import MagazineInfo from "@/components/MagazineInfo";
import PDFControls from "@/components/PDFControls";
import PDFViewer from "@/components/PDFViewer";

// Set up PDF.js worker with proper URL
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const MagazineViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { magazine, loading } = useMagazine(id);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  console.log('MagazineViewer - Current magazine:', magazine);
  console.log('MagazineViewer - Loading state:', loading);
  console.log('MagazineViewer - PDF.js version:', pdfjs.version);
  console.log('MagazineViewer - Worker source:', pdfjs.GlobalWorkerOptions.workerSrc);

  const onDocumentLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ Document loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setPageNumber(1);
    toast({
      title: "PDF Loaded Successfully",
      description: `Document loaded with ${numPages} pages`,
    });
  }, [toast]);

  const onDocumentLoadError = React.useCallback((error: Error) => {
    console.error('❌ Document load error in MagazineViewer:', error);
    
    let errorMessage = "Unable to load the PDF document.";
    
    if (error.message.includes('worker') || error.message.includes('Worker')) {
      errorMessage = "PDF worker initialization failed. Please refresh and try again.";
    } else if (error.message.includes('CORS')) {
      errorMessage = "CORS error: The PDF file cannot be loaded due to cross-origin restrictions.";
    } else if (error.message.includes('PDF')) {
      errorMessage = "Invalid PDF file or corrupted document.";
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = "Network error: Cannot fetch the PDF file.";
    }
    
    toast({
      title: "PDF Loading Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading magazine...</p>
        </div>
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Magazine not found.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering MagazineViewer with magazine:', {
    id: magazine.id,
    title: magazine.title,
    file_url: magazine.file_url,
    file_size: magazine.file_size,
    is_readable_online: magazine.is_readable_online
  });

  return (
    <div className="min-h-screen bg-background">
      <MagazineHeader onBackToHome={() => navigate('/')}>
        <PDFControls
          scale={scale}
          pageNumber={pageNumber}
          numPages={numPages}
          onZoomIn={() => setScale(prev => Math.min(prev + 0.2, 3))}
          onZoomOut={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
          onResetZoom={() => setScale(1.0)}
          onPrevPage={() => setPageNumber(prev => Math.max(prev - 1, 1))}
          onNextPage={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
        />
      </MagazineHeader>

      <div className="container mx-auto px-4 py-6">
        <MagazineInfo magazine={magazine} />

        <Card>
          <CardContent className="p-0">
            {magazine.file_url ? (
              <div className="w-full">
                <PDFControls
                  scale={scale}
                  pageNumber={pageNumber}
                  numPages={numPages}
                  onZoomIn={() => setScale(prev => Math.min(prev + 0.2, 3))}
                  onZoomOut={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
                  onResetZoom={() => setScale(1.0)}
                  onPrevPage={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  onNextPage={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                />

                <PDFViewer
                  fileUrl={magazine.file_url}
                  pageNumber={pageNumber}
                  scale={scale}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No PDF file available for this magazine.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please contact support if you believe this is an error.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            📖 Use the Previous/Next buttons or swipe gestures to navigate pages. 
            Use zoom controls for better reading experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagazineViewer;
