
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
      console.error('No magazine ID provided');
      navigate('/');
      return;
    }
    fetchMagazine();
  }, [id, navigate]);

  const fetchMagazine = async () => {
    try {
      console.log('Fetching magazine with ID:', id);
      
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching magazine:', error);
        throw error;
      }

      console.log('Fetched magazine data:', data);

      if (!data.is_readable_online) {
        console.warn('Magazine is not available for online reading:', data.id);
        toast({
          title: "Access Denied",
          description: "This magazine is not available for online reading.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!data.file_url) {
        console.warn('Magazine has no file URL:', data.id);
        toast({
          title: "File Not Available",
          description: "This magazine does not have a file associated with it.",
          variant: "destructive",
        });
      }

      setMagazine(data);
    } catch (error) {
      console.error('Error fetching magazine:', error);
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
