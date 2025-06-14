
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadFormData {
  title: string;
  description: string;
  category: string;
  file: FileList | null;
  coverImage: FileList | null;
}

interface UploadDialogProps {
  triggerButton?: React.ReactNode;
}

const UploadDialog = ({ triggerButton }: UploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<UploadFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      file: null,
      coverImage: null,
    },
  });

  const categories = ["Technology", "Design", "Business", "Science", "Health", "Travel"];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        form.setValue("file", event.target.files);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        event.target.value = "";
      }
    }
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedCoverImage(file);
        form.setValue("coverImage", event.target.files);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        event.target.value = "";
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("file", null);
    const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const removeCoverImage = () => {
    setSelectedCoverImage(null);
    form.setValue("coverImage", null);
    const coverInput = document.getElementById("cover-upload") as HTMLInputElement;
    if (coverInput) coverInput.value = "";
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!user || !selectedFile) {
      toast({
        title: "Error",
        description: "Please make sure you're logged in and have selected a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload PDF file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('magazines')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded PDF
      const { data: urlData } = supabase.storage
        .from('magazines')
        .getPublicUrl(fileName);

      let coverImageUrl = null;

      // Upload cover image if provided
      if (selectedCoverImage) {
        const coverExt = selectedCoverImage.name.split('.').pop();
        const coverFileName = `covers/${user.id}/${Date.now()}.${coverExt}`;
        
        const { error: coverUploadError } = await supabase.storage
          .from('magazines')
          .upload(coverFileName, selectedCoverImage);

        if (coverUploadError) {
          console.error('Cover image upload error:', coverUploadError);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('magazines')
            .getPublicUrl(coverFileName);
          coverImageUrl = coverUrlData.publicUrl;
        }
      }

      // Save magazine metadata to database - only readable online, no downloads
      const { error: dbError } = await supabase
        .from('magazines')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_url: urlData.publicUrl,
          cover_image_url: coverImageUrl,
          is_downloadable: false,
          is_readable_online: true,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Magazine uploaded successfully!",
        description: `"${data.title}" has been added to the ${data.category} category and is available for online reading.`,
      });
      
      // Reset form and close dialog
      form.reset();
      setSelectedFile(null);
      setSelectedCoverImage(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your magazine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Magazine</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Magazine</DialogTitle>
          <DialogDescription>
            Upload a PDF magazine to share with the Be Inspired community. Your magazine will be available for online reading only.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Magazine Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter magazine title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the magazine..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              rules={{ required: "Please select a category" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={field.value === category ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => field.onChange(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="cover-upload">Cover Image (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                {selectedCoverImage ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <Image className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">{selectedCoverImage.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedCoverImage.size / (1024 * 1024)).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCoverImage}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a cover image for your magazine
                    </p>
                    <Input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("cover-upload")?.click()}
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdf-upload">PDF File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("pdf-upload")?.click()}
                    >
                      Choose PDF File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📖 Your magazine will be available for online reading only. Readers can view your content directly in their browsers on any device, including mobile.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedFile || isUploading}>
                {isUploading ? "Uploading..." : "Upload Magazine"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
