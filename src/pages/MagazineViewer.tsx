import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMagazine } from "@/hooks/useMagazine";
import MagazineHeader from "@/components/MagazineHeader";
import MagazineInfo from "@/components/MagazineInfo";
import FlipBookViewer from "@/components/FlipBookViewer";

const MagazineViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { magazine, loading } = useMagazine(id);

  console.log('MagazineViewer - Current magazine:', magazine);
  console.log('MagazineViewer - Loading state:', loading);

  const onDocumentLoadSuccess = React.useCallback(({ numPages }: { numPages: number }) => {
    console.log('✅ FlipBook loaded successfully with', numPages, 'pages');
    toast({
      title: "FlipBook Loaded Successfully",
      description: `Flipbook loaded with ${numPages} pages`,
    });
  }, [toast]);

  const onDocumentLoadError = React.useCallback((error: Error) => {
    console.error('❌ FlipBook load error in MagazineViewer:', error);
    toast({
      title: "FlipBook Loading Error",
      description: "Unable to load the flipbook. Try opening the original file.",
      variant: "destructive",
    });
  }, [toast]);

  const handleCloseViewer = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground text-sm sm:text-base">Loading magazine...</p>
        </div>
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm sm:text-base">Magazine not found.</p>
          <Button onClick={() => navigate('/')} className="mt-4" size="sm">
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

  // If we have a file URL, show the fullscreen FlipBook immediately
  if (magazine.file_url) {
    return (
      <FlipBookViewer
        fileUrl={magazine.file_url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        onClose={handleCloseViewer}
      />
    );
  }

  // Fallback for when no file is available
  return (
    <div className="min-h-screen bg-background">
      <MagazineHeader onBackToHome={() => navigate('/')} />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl">
        {/* Magazine Info - Responsive */}
        <div className="mb-4 sm:mb-6">
          <MagazineInfo magazine={magazine} />
        </div>

        {/* No File Available Message */}
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="flex items-center justify-center h-64 sm:h-96">
              <div className="text-center p-4">
                <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">No file available for this magazine.</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Please contact support if you believe this is an error.
                </p>
                <Button onClick={() => navigate('/')} className="mt-4" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MagazineViewer;