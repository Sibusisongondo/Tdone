
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, FileText, Trash2, Calendar, Users, Download, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UploadDialog from "@/components/UploadDialog";

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
  is_downloadable: boolean | null;
  is_readable_online: boolean | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMagazines();
  }, [user, navigate]);

  const fetchMagazines = async () => {
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMagazines(data || []);
    } catch (error) {
      console.error('Error fetching magazines:', error);
      toast({
        title: "Error",
        description: "Failed to load your magazines.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDelete = async (magazineId: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('magazines')
        .remove([fileName]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('magazines')
        .delete()
        .eq('id', magazineId);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Magazine deleted",
        description: "Your magazine has been deleted successfully.",
      });

      // Refresh the magazines list
      fetchMagazines();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the magazine.",
        variant: "destructive",
      });
    }
  };

  const handleMagazineAction = (magazine: Magazine) => {
    if (magazine.is_readable_online && magazine.file_url) {
      navigate(`/magazine/${magazine.id}`);
    } else if (magazine.is_downloadable && magazine.file_url) {
      window.open(magazine.file_url, '_blank');
    }
  };

  const getActionButtonText = (magazine: Magazine) => {
    if (magazine.is_readable_online) return "Read Online";
    if (magazine.is_downloadable) return "Download";
    return "View";
  };

  const getActionIcon = (magazine: Magazine) => {
    if (magazine.is_readable_online) return <Eye className="h-4 w-4" />;
    if (magazine.is_downloadable) return <Download className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <BookOpen className="h-8 w-8 text-primary mr-2" />
                <h1 className="text-2xl font-bold text-primary">ThizaGraphix</h1>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <UploadDialog />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your uploaded magazines and view your reading statistics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Magazines</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{magazines.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {magazines.filter(mag => 
                  new Date(mag.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(magazines.map(mag => mag.category)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Magazines List */}
        <Card>
          <CardHeader>
            <CardTitle>My Magazines</CardTitle>
            <CardDescription>
              All magazines you've uploaded to ThizaGraphix
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your magazines...</p>
              </div>
            ) : magazines.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't uploaded any magazines yet.
                </p>
                <UploadDialog />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {magazines.map((magazine) => (
                  <Card key={magazine.id} className="hover:shadow-md transition-shadow">
                    {/* Cover Image */}
                    <div className="aspect-video overflow-hidden bg-muted/30 flex items-center justify-center">
                      {magazine.cover_image_url ? (
                        <img 
                          src={magazine.cover_image_url} 
                          alt={magazine.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{magazine.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(magazine.id, magazine.file_name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{magazine.title}</CardTitle>
                      {magazine.description && (
                        <CardDescription className="line-clamp-2">
                          {magazine.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>File size:</span>
                          <span>{formatFileSize(magazine.file_size)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uploaded:</span>
                          <span>{formatDate(magazine.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Readable online:</span>
                          <Badge variant={magazine.is_readable_online ? "default" : "secondary"} className="text-xs">
                            {magazine.is_readable_online ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Downloadable:</span>
                          <Badge variant={magazine.is_downloadable ? "default" : "secondary"} className="text-xs">
                            {magazine.is_downloadable ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      {magazine.file_url && (
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleMagazineAction(magazine)}
                          >
                            {getActionIcon(magazine)}
                            <span className="ml-2">{getActionButtonText(magazine)}</span>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
