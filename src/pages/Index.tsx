
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ShareButton";

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
  profiles?: {
    artist_name: string | null;
  } | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMagazines: 0,
    registeredUsers: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    fetchMagazines();
    fetchStats();
  }, []);

  const fetchMagazines = async () => {
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select(`
          *,
          profiles (
            artist_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched magazines:', data);
      setMagazines(data || []);
    } catch (error) {
      console.error('Error fetching magazines:', error);
      toast({
        title: "Error",
        description: "Failed to load magazines.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: magazinesCount, error: magazinesError } = await supabase
        .from('magazines')
        .select('*', { count: 'exact' });

      if (magazinesError) {
        throw magazinesError;
      }

      const { data: usersCount, error: usersError } = await supabase
        .rpc('get_registered_users_count');

      if (usersError) {
        throw usersError;
      }

      const totalCategories = 5;

      setStats({
        totalMagazines: magazinesCount?.length || 0,
        registeredUsers: usersCount || 0,
        totalCategories: totalCategories,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMagazineAction = (magazine: Magazine, action: 'view' | 'download') => {
    if (action === 'view' && magazine.is_readable_online) {
      navigate(`/magazine/${magazine.id}`);
    } else if (action === 'download' && magazine.is_downloadable && magazine.file_url) {
      window.open(magazine.file_url, '_blank');
    } else {
      toast({
        title: "Action Not Available",
        description: `This magazine is not available for ${action === 'view' ? 'online reading' : 'download'}.`,
        variant: "destructive",
      });
    }
  };

  const navigateToArtist = (artistId: string, magazineId?: string) => {
    if (magazineId) {
      navigate(`/artist/${artistId}/magazine/${magazineId}`);
    } else {
      navigate(`/artist/${artistId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading magazines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">ThizaGraphix</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            Discover and Share Creative Magazines
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-12">
            Explore a vast collection of digital magazines created by talented artists from around the world.
            Share your favorites and connect with the creative community.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              Explore Magazines
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50 z-[-1]" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary">{stats.totalMagazines}</h3>
              <p className="text-muted-foreground">Magazines Published</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">{stats.registeredUsers}</h3>
              <p className="text-muted-foreground">Registered Artists</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">{stats.totalCategories}</h3>
              <p className="text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Magazines */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Magazines</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the latest creative works from talented artists around the world
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading magazines...</p>
            </div>
          ) : magazines.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No magazines yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to upload and share your creative work!</p>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {magazines.map((magazine) => (
                <Card key={magazine.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {magazine.cover_image_url ? (
                      <img
                        src={magazine.cover_image_url}
                        alt={magazine.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <BookOpen className="h-16 w-16 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {magazine.title}
                    </h3>
                    {magazine.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {magazine.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {magazine.category}
                      </span>
                      <button 
                        onClick={() => navigateToArtist(magazine.user_id)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        by {magazine.profiles?.artist_name || 'Artist'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {magazine.is_readable_online && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleMagazineAction(magazine, 'view')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Read
                        </Button>
                      )}
                      {magazine.is_downloadable && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleMagazineAction(magazine, 'download')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                      <ShareButton 
                        magazineId={magazine.id}
                        artistId={magazine.user_id}
                        title={magazine.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join Our Community of Creative Artists
          </h2>
          <p className="text-lg max-w-3xl mx-auto mb-12">
            Showcase your work, connect with fellow artists, and inspire the world with your creativity.
            Sign up today and start sharing your digital magazines!
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} ThizaGraphix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
