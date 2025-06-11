
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Bookmark, TrendingUp, Users, Star, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import UploadDialog from "@/components/UploadDialog";

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_size: number | null;
  file_url: string | null;
  created_at: string;
  user_id: string;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  // Fetch all magazines from the database
  const { data: magazines = [], isLoading } = useQuery({
    queryKey: ['magazines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching magazines:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Get categories from real data
  const categories = magazines.reduce((acc: { [key: string]: number }, magazine) => {
    acc[magazine.category] = (acc[magazine.category] || 0) + 1;
    return acc;
  }, {});

  const categoryList = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    icon: getCategoryIcon(name)
  }));

  function getCategoryIcon(category: string) {
    const icons: { [key: string]: string } = {
      'Technology': '💻',
      'Design': '🎨',
      'Business': '💼',
      'Science': '🔬',
      'Health': '🏥',
      'Travel': '✈️',
      'Education': '📚',
      'Entertainment': '🎬',
      'Sports': '⚽',
      'Food': '🍽️'
    };
    return icons[category] || '📖';
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <h1 className="text-xl md:text-2xl font-bold text-primary">ThizaGraphix</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#browse" className="text-muted-foreground hover:text-primary transition-colors">Browse</a>
              <a href="#categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</a>
              <a href="#trending" className="text-muted-foreground hover:text-primary transition-colors">Popular</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user && <UploadDialog />}
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleDashboardClick} size="sm">
                    Dashboard
                  </Button>
                  <span className="text-sm text-muted-foreground hidden lg:block">
                    {user.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut} size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={handleAuthClick}>Sign In</Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col space-y-4 mb-4">
                <a href="#browse" className="text-muted-foreground hover:text-primary transition-colors">Browse</a>
                <a href="#categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</a>
                <a href="#trending" className="text-muted-foreground hover:text-primary transition-colors">Popular</a>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              </nav>
              <div className="flex flex-col space-y-2">
                {user && <UploadDialog />}
                {user ? (
                  <>
                    <Button variant="outline" onClick={handleDashboardClick} className="w-full">
                      Dashboard
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAuthClick} className="w-full">Sign In</Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Discover Amazing <span className="text-primary">Magazines</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Your gateway to the world's best digital magazines. Read, explore, and get inspired.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto px-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search magazines..." 
                className="pl-10"
              />
            </div>
            <Button size="lg" className="px-6 md:px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2" />
                <span className="text-2xl md:text-3xl font-bold">{magazines.length}+</span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">Digital Magazines</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2" />
                <span className="text-2xl md:text-3xl font-bold">50K+</span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">Active Readers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2" />
                <span className="text-2xl md:text-3xl font-bold">4.8</span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Magazines */}
      <section className="py-8 md:py-16" id="browse">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center md:text-left">
              {magazines.length > 0 ? 'Latest Magazines' : 'No Magazines Yet'}
            </h3>
            {user && magazines.length === 0 && (
              <div className="text-center md:text-right">
                <UploadDialog />
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-muted-foreground">Loading magazines...</p>
            </div>
          ) : magazines.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4 text-sm md:text-base px-4">
                {user 
                  ? "You haven't uploaded any magazines yet. Be the first to share your content!" 
                  : "No magazines available yet. Sign in to upload the first magazine!"}
              </p>
              {!user && (
                <Button onClick={handleAuthClick}>Sign In to Upload</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {magazines.slice(0, 6).map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden bg-muted/30 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
                  </div>
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{magazine.category}</Badge>
                      <div className="flex items-center space-x-1 text-xs md:text-sm text-muted-foreground">
                        <Star className="h-3 w-3 md:h-4 md:w-4 fill-current text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-base md:text-lg">{magazine.title}</CardTitle>
                    {magazine.description && (
                      <CardDescription className="line-clamp-2 text-xs md:text-sm">{magazine.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(magazine.created_at)}
                      </div>
                      {magazine.file_url && (
                        <Button 
                          size="sm" 
                          onClick={() => window.open(magazine.file_url!, '_blank')}
                          className="text-xs px-3 py-1"
                        >
                          Read Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categoryList.length > 0 && (
        <section className="py-8 md:py-16 bg-muted/30" id="categories">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categoryList.map((category) => (
                <Card key={category.name} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 md:p-6">
                    <div className="text-2xl md:text-3xl mb-2">{category.icon}</div>
                    <h4 className="font-semibold mb-1 text-sm md:text-base">{category.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">{category.count} magazines</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {magazines.length > 0 && (
        <section className="py-8 md:py-16" id="trending">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 mb-6 md:mb-8">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold">Most Recent</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {magazines.slice(0, 2).map((magazine, index) => (
                <Card key={magazine.id} className="p-4 md:p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg md:text-2xl font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base line-clamp-1">{magazine.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {magazine.description || "No description available"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-xs">{magazine.category}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(magazine.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t py-8 md:py-12" id="about">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <span className="text-lg md:text-xl font-bold">ThizaGraphix</span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">Your gateway to the world's best digital magazines.</p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-sm md:text-base">Browse</h4>
              <ul className="space-y-2 text-muted-foreground text-xs md:text-sm">
                <li><a href="#browse" className="hover:text-primary transition-colors">All Magazines</a></li>
                <li><a href="#categories" className="hover:text-primary transition-colors">Categories</a></li>
                <li><a href="#trending" className="hover:text-primary transition-colors">Popular</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">New Releases</a></li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-sm md:text-base">Categories</h4>
              <ul className="space-y-2 text-muted-foreground text-xs md:text-sm">
                {categoryList.slice(0, 4).map((category) => (
                  <li key={category.name}>
                    <a href="#categories" className="hover:text-primary transition-colors">{category.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-sm md:text-base">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-xs md:text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-6 md:mt-8 pt-6 md:pt-8 text-center text-muted-foreground text-xs md:text-sm">
            <p>&copy; 2024 ThizaGraphix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
