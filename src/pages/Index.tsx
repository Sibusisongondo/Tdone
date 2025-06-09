
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Bookmark, TrendingUp, Users, Star } from "lucide-react";

const Index = () => {
  const featuredMagazines = [
    {
      id: 1,
      title: "Tech Innovations Today",
      description: "Exploring the latest in technology and digital transformation",
      category: "Technology",
      rating: 4.8,
      readers: "12.5K",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Design Quarterly",
      description: "Modern design trends and creative inspiration",
      category: "Design",
      rating: 4.9,
      readers: "8.2K",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Business Insider Weekly",
      description: "Business strategies and market insights",
      category: "Business",
      rating: 4.7,
      readers: "15.3K",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop"
    }
  ];

  const categories = [
    { name: "Technology", count: 45, icon: "💻" },
    { name: "Design", count: 32, icon: "🎨" },
    { name: "Business", count: 28, icon: "💼" },
    { name: "Science", count: 21, icon: "🔬" },
    { name: "Health", count: 19, icon: "🏥" },
    { name: "Travel", count: 16, icon: "✈️" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">ThizaGraphix</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Browse</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Categories</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Popular</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button>Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing <span className="text-primary">Magazines</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your gateway to the world's best digital magazines. Read, explore, and get inspired.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search magazines..." 
                className="pl-10"
              />
            </div>
            <Button size="lg" className="px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">500+</span>
              </div>
              <p className="text-muted-foreground">Digital Magazines</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">50K+</span>
              </div>
              <p className="text-muted-foreground">Active Readers</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Star className="h-8 w-8 text-primary mr-2" />
                <span className="text-3xl font-bold">4.8</span>
              </div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Magazines */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">Featured Magazines</h3>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMagazines.map((magazine) => (
              <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={magazine.image} 
                    alt={magazine.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{magazine.category}</Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span>{magazine.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1">{magazine.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{magazine.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{magazine.readers} readers</span>
                    </div>
                    <Button size="sm">Read Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card key={category.name} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h4 className="font-semibold mb-1">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.count} magazines</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="text-3xl font-bold">Trending This Week</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">#1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">AI Revolution Monthly</h4>
                  <p className="text-sm text-muted-foreground">The future of artificial intelligence</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">Technology</Badge>
                    <span className="text-sm text-muted-foreground">25K reads</span>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-secondary">#2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Creative Minds Quarterly</h4>
                  <p className="text-sm text-muted-foreground">Inspiring creative professionals worldwide</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">Design</Badge>
                    <span className="text-sm text-muted-foreground">18K reads</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ThizaGraphix</span>
              </div>
              <p className="text-muted-foreground">Your gateway to the world's best digital magazines.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Browse</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">All Magazines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Featured</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Popular</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">New Releases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Design</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Business</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Science</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ThizaGraphix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
