
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Eye, Sparkles, Users, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
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
          id,
          title,
          description,
          category,
          file_name,
          file_size,
          file_url,
          cover_image_url,
          created_at,
          user_id,
          is_downloadable,
          is_readable_online,
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
      setMagazines(data as Magazine[] || []);
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-primary mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32 mx-auto animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-24 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Modern Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-primary animate-float" />
                <Sparkles className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                ThizaGraphix
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="btn-modern">
                Dashboard
              </Button>
              <Button onClick={() => navigate('/auth')} className="btn-modern bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-responsive-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent leading-tight">
              Discover and Share Creative Magazines
            </h1>
            <p className="text-responsive-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore a vast collection of digital magazines created by talented artists from around the world.
              Share your favorites and connect with the creative community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="btn-modern bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-6 text-base sm:text-lg h-auto"
              >
                Get Started
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="btn-modern px-8 py-6 text-base sm:text-lg h-auto border-2"
              >
                Explore Magazines
                <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-60 pointer-events-none" />
      </section>

      {/* Modern Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: BookOpen, value: stats.totalMagazines, label: "Magazines Published", gradient: "from-blue-500 to-purple-600" },
              { icon: Users, value: stats.registeredUsers, label: "Registered Artists", gradient: "from-purple-500 to-pink-600" },
              { icon: FolderOpen, value: stats.totalCategories, label: "Categories", gradient: "from-pink-500 to-orange-600" }
            ].map((stat, index) => (
              <Card key={index} className="card-hover glass border-0 text-center">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center mb-4`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Featured Magazines */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-responsive-2xl font-bold">Latest Magazines</h2>
            <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
              Discover the latest creative works from talented artists around the world
            </p>
          </div>

          {magazines.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-responsive-lg font-semibold">No magazines yet</h3>
                  <p className="text-muted-foreground">Be the first to upload and share your creative work!</p>
                </div>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="btn-modern bg-gradient-to-r from-primary to-primary/80"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-auto-fit gap-6 sm:gap-8">
              {magazines.map((magazine) => (
                <Card key={magazine.id} className="card-hover glass border-0 overflow-hidden group">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {magazine.cover_image_url ? (
                      <img
                        src={magazine.cover_image_url}
                        alt={magazine.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-500">
                        <BookOpen className="h-16 w-16 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <h3 className="font-semibold text-responsive-base line-clamp-2 group-hover:text-primary transition-colors">
                      {magazine.title}
                    </h3>
                    {magazine.description && (
                      <p className="text-responsive-sm text-muted-foreground line-clamp-2">
                        {magazine.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-3 py-1 rounded-full border border-primary/20">
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
                          className="flex-1 btn-modern bg-gradient-to-r from-primary to-primary/80"
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
                          className="flex-1 btn-modern"
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

      {/* Modern CTA Section */}
      <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto space-y-8 text-white">
            <h2 className="text-responsive-2xl font-bold">
              Join Our Community of Creative Artists
            </h2>
            <p className="text-responsive-lg opacity-90 leading-relaxed">
              Showcase your work, connect with fellow artists, and inspire the world with your creativity.
              Sign up today and start sharing your digital magazines!
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-modern bg-white text-primary hover:bg-white/90 px-8 py-6 text-base sm:text-lg h-auto font-semibold"
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="glass border-t border-border/50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">ThizaGraphix</span>
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} ThizaGraphix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
