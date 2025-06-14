
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const useMagazine = (id: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error('❌ No magazine ID provided');
      navigate('/');
      return;
    }
    fetchMagazine();
  }, [id, navigate]);

  const fetchMagazine = async () => {
    try {
      console.log('🔍 Fetching magazine with ID:', id);
      
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error) {
        console.error('❌ Supabase error fetching magazine:', error);
        throw error;
      }

      if (!data) {
        console.warn('⚠️ No magazine found with ID:', id);
        toast({
          title: "Magazine Not Found",
          description: "The requested magazine could not be found.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      console.log('✅ Fetched magazine data:', {
        id: data.id,
        title: data.title,
        file_url: data.file_url,
        file_size: data.file_size,
        is_readable_online: data.is_readable_online,
        created_at: data.created_at
      });

      if (!data.is_readable_online) {
        console.warn('🚫 Magazine is not available for online reading:', data.id);
        toast({
          title: "Access Denied",
          description: "This magazine is not available for online reading.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!data.file_url) {
        console.warn('⚠️ Magazine has no file URL:', data.id);
        toast({
          title: "File Not Available",
          description: "This magazine does not have a file associated with it.",
          variant: "destructive",
        });
        // Don't navigate away, let the user see the magazine info
      } else {
        // Log detailed file URL information
        console.log('📄 File URL details:', {
          url: data.file_url,
          isValid: isValidUrl(data.file_url),
          protocol: getUrlProtocol(data.file_url),
          domain: getUrlDomain(data.file_url)
        });
      }

      setMagazine(data);
    } catch (error) {
      console.error('❌ Error fetching magazine:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        magazineId: id
      });
      
      toast({
        title: "Error",
        description: "Failed to load the magazine. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return { magazine, loading };
};

// Helper functions for URL validation and analysis
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function getUrlProtocol(url: string): string {
  try {
    return new URL(url).protocol;
  } catch (_) {
    return 'invalid';
  }
}

function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return 'invalid';
  }
}
