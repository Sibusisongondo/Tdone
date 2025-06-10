
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        console.log('Auth error:', result.error);
        
        // Handle specific error cases
        if (result.error.message === 'Email not confirmed') {
          toast({
            title: "Email confirmation required",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
        } else if (result.error.message === 'Invalid login credentials') {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        if (isLogin) {
          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
          navigate('/');
        } else {
          toast({
            title: "Success",
            description: "Account created! Please check your email to verify your account before signing in.",
          });
          setIsLogin(true); // Switch to login form
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">ThizaGraphix</h1>
          <p className="text-muted-foreground">Your gateway to amazing magazines</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Welcome back! Please sign in to your account.' 
                : 'Create a new account to get started.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
            
            {isLogin && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If you're testing, you can disable email confirmation in your Supabase dashboard under Authentication → Settings to speed up the login process.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
