
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
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
  is_downloadable: boolean | null;
  is_readable_online: boolean | null;
}

const MagazineViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleDownload = () => {
    if (magazine?.file_url && magazine.is_downloadable) {
      window.open(magazine.file_url, '_blank');
    } else {
      toast({
        title: "Download Not Available",
        description: "This magazine is not available for download.",
        variant: "destructive",
      });
    }
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-primary">ThizaGraphix</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {magazine.is_downloadable && (
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
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

        {/* PDF Viewer */}
        <Card>
          <CardContent className="p-0">
            {magazine.file_url ? (
              <iframe
                src={`${magazine.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-[80vh] border-0"
                title={magazine.title}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Unable to load PDF viewer.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MagazineViewer;
