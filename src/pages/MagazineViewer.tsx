
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_size: number | null;
  file_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  user_id: string;
  is_readable_online: boolean | null;
}

const MagazineViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    fetchMagazine();
  }, [id, navigate]);

  const fetchMagazine = async () => {
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data.is_readable_online) {
        toast({
          title: "Access Denied",
          description: "This magazine is not available for online reading.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setMagazine(data);
    } catch (error) {
      console.error('Error fetching magazine:', error);
      toast({
        title: "Error",
        description: "Failed to load the magazine.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <img src="/lovable-uploads/db348a0f-07e7-4e82-971d-f8103cc16cb3.png" alt="Be Inspired Logo" className="h-6 w-6" />
                <h1 className="text-xl font-bold text-primary">Be Inspired</h1>
              </div>
            </div>
            
            {/* PDF Controls */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                {Math.round(zoom * 100)}%
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Magazine Info */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{magazine.title}</CardTitle>
            {magazine.description && (
              <p className="text-muted-foreground">{magazine.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Category: {magazine.category}</span>
              <span>Size: {magazine.file_size ? (magazine.file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}</span>
            </div>
          </CardHeader>
        </Card>

        {/* PDF Viewer - Universal Compatibility */}
        <Card>
          <CardContent className="p-0">
            {magazine.file_url ? (
              <div className="w-full overflow-auto">
                {/* Try multiple fallback methods */}
                <div className="w-full min-h-[80vh]">
                  {/* Primary: Modern browsers with embed */}
                  <embed
                    src={`${magazine.file_url}#view=FitH&zoom=${Math.round(zoom * 100)}&toolbar=0&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-[80vh] min-h-[600px] block"
                    style={{ 
                      border: 'none',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      width: `${100 / zoom}%`,
                      height: `${80 / zoom}vh`
                    }}
                    onError={(e) => {
                      // Hide the embed and show iframe fallback
                      (e.target as HTMLElement).style.display = 'none';
                      const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.style.display = 'block';
                      }
                    }}
                  />
                  
                  {/* Secondary: iframe fallback */}
                  <iframe
                    id="pdf-iframe"
                    src={`${magazine.file_url}#view=FitH&zoom=${Math.round(zoom * 100)}&toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-[80vh] min-h-[600px] border-0 hidden"
                    title={magazine.title}
                    style={{ 
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      width: `${100 / zoom}%`,
                      height: `${80 / zoom}vh`
                    }}
                    onError={(e) => {
                      // Hide the iframe and show Google Docs viewer
                      (e.target as HTMLElement).style.display = 'none';
                      const googleViewer = document.getElementById('google-viewer') as HTMLIFrameElement;
                      if (googleViewer) {
                        googleViewer.style.display = 'block';
                      }
                    }}
                  />
                  
                  {/* Tertiary: Google Docs Viewer (works on most mobile browsers) */}
                  <iframe
                    id="google-viewer"
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(magazine.file_url)}&embedded=true`}
                    className="w-full h-[80vh] min-h-[600px] border-0 hidden"
                    title={magazine.title}
                    style={{ 
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      width: `${100 / zoom}%`,
                      height: `${80 / zoom}vh`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Unable to load PDF viewer.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Instructions */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg md:hidden">
          <p className="text-sm text-muted-foreground text-center">
            📱 On mobile: Use pinch-to-zoom and scroll to navigate the magazine. 
            Use the zoom controls above for better reading experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagazineViewer;
