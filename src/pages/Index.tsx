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
  artist_name?: string | null;
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
      console.log('Starting to fetch magazines...');
      
      // First fetch magazines
      const { data: magazinesData, error: magazinesError } = await supabase
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
          is_readable_online
        `)
        .order('created_at', { ascending: false });

      if (magazinesError) {
        console.error('Error fetching magazines:', magazinesError);
        throw magazinesError;
      }

      console.log('Magazines fetched:', magazinesData?.length || 0);

      if (!magazinesData || magazinesData.length === 0) {
        setMagazines([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(magazinesData.map(mag => mag.user_id))];
      console.log('Unique user IDs:', userIds);

      // Fetch all profiles at once
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, artist_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without artist names rather than failing completely
      }

      console.log('Profiles fetched:', profilesData?.length || 0);

      // Create a map of user_id to artist_name for quick lookup
      const artistNameMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          artistNameMap.set(profile.id, profile.artist_name);
        });
      }

      // Combine magazines with artist names
      const magazinesWithArtists = magazinesData.map(magazine => ({
        ...magazine,
        artist_name: artistNameMap.get(magazine.user_id) || null
      }));

      console.log('Final magazines with artists:', magazinesWithArtists.map(m => ({ title: m.title, artist: m.artist_name })));
      
      setMagazines(magazinesWithArtists);

    } catch (error) {
      console.error('Error in fetchMagazines:', error);
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

  const handleMagazineAction = (magazine: Magazine) => {
    if (magazine.is_readable_online) {
      navigate(`/magazine/${magazine.id}`);
    } else {
      toast({
        title: "Not Available",
        description: "This magazine is not available for online reading.",
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <img src="/lovable-uploads/db348a0f-07e7-4e82-971d-f8103cc16cb3.png" alt="Be Inspired Logo" className="h-16 w-16 sm:h-24 sm:w-24 mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 sm:h-4 bg-muted rounded w-24 sm:w-32 mx-auto animate-pulse" />
            <div className="h-2 sm:h-3 bg-muted/60 rounded w-16 sm:w-24 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Modern Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <img src="/lovable-uploads/db348a0f-07e7-4e82-971d-f8103cc16cb3.png" alt="Be Inspired Logo" className="h-8 w-8 sm:h-10 sm:w-10 animate-float" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 animate-pulse" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Be Inspired
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="btn-modern text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Button>
              <Button onClick={() => navigate('/auth')} className="btn-modern bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 xl:py-32 overflow-hidden px-3 sm:px-0">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent leading-tight">
              Discover and Share Creative Magazines
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Explore a vast collection of digital magazines created by talented artists from around the world.
              Share your favorites and connect with the creative community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="btn-modern bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg h-auto w-full sm:w-auto"
              >
                Get Started
                <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/magazines')}
                className="btn-modern px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg h-auto border-2 w-full sm:w-auto"
              >
                Explore Magazines
                <BookOpen className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-60 pointer-events-none" />
      </section>

      {/* Modern Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 px-3 sm:px-0">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: BookOpen, value: stats.totalMagazines, label: "Magazines Published", gradient: "from-blue-500 to-purple-600" },
              { icon: Users, value: stats.registeredUsers, label: "Registered Artists", gradient: "from-purple-500 to-pink-600" },
              { icon: FolderOpen, value: stats.totalCategories, label: "Categories", gradient: "from-pink-500 to-orange-600" }
            ].map((stat, index) => (
              <Card key={index} className="card-hover glass border-0 text-center">
                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{stat.value}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Featured Magazines */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 px-3 sm:px-0">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">Latest Magazines</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
              Discover the latest creative works from talented artists around the world
            </p>
          </div>

          {magazines.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="max-w-md mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold">No magazines yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Be the first to upload and share your creative work!</p>
                </div>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="btn-modern bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                        <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {magazine.title}
                    </h3>
                    {magazine.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {magazine.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-2 sm:px-3 py-1 rounded-full border border-primary/20">
                        {magazine.category}
                      </span>
                      <button 
                        onClick={() => navigateToArtist(magazine.user_id)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-20 sm:max-w-none"
                        title={magazine.artist_name || 'Unknown Artist'}
                      >
                        by {magazine.artist_name || 'Unknown Artist'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {magazine.is_readable_online && (
                        <Button 
                          size="sm" 
                          className="flex-1 btn-modern bg-gradient-to-r from-primary to-primary/80 text-xs sm:text-sm py-1 sm:py-2"
                          onClick={() => handleMagazineAction(magazine)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="hidden xs:inline">Read</span>
                          <span className="xs:hidden">Read</span>
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
      <section className="py-12 sm:py-16 lg:py-20 xl:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
              Join Our Community of Creative Artists
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 leading-relaxed px-2 sm:px-0">
              Showcase your work, connect with fellow artists, and inspire the world with your creativity.
              Sign up today and start sharing your digital magazines!
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-modern bg-white text-primary hover:bg-white/90 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base lg:text-lg h-auto font-semibold w-full sm:w-auto"
            >
              Get Started
              <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="glass border-t border-border/50 py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <img src="/lovable-uploads/db348a0f-07e7-4e82-971d-f8103cc16cb3.png" alt="Be Inspired Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-base sm:text-lg font-semibold text-primary">Be Inspired</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Be Inspired. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;