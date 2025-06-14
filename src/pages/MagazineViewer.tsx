
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMagazine } from "@/hooks/useMagazine";
import MagazineHeader from "@/components/MagazineHeader";
import MagazineInfo from "@/components/MagazineInfo";
import PDFViewer from "@/components/PDFViewer";

const MagazineViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { magazine, loading } = useMagazine(id);

  console.log('MagazineViewer - Current magazine:', magazine);
  console.log('MagazineViewer - Loading state:', loading);

  const onDocumentLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ Document loaded successfully with', numPages, 'pages');
    toast({
      title: "PDF Loaded Successfully",
      description: `Document loaded with ${numPages} pages`,
    });
  }, [toast]);

  const onDocumentLoadError = React.useCallback((error: Error) => {
    console.error('❌ Document load error in MagazineViewer:', error);
    toast({
      title: "PDF Loading Error",
      description: "Unable to load the PDF document. Try opening in a new tab.",
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
      <MagazineHeader onBackToHome={() => navigate('/')} />

      <div className="container mx-auto px-4 py-6">
        <MagazineInfo magazine={magazine} />

        <Card>
          <CardContent className="p-0">
            {magazine.file_url ? (
              <PDFViewer
                fileUrl={magazine.file_url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
              />
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
            📖 Use the toolbar above the document for navigation, zoom, and other controls. 
            The viewer includes search, page navigation, and full-screen options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagazineViewer;
