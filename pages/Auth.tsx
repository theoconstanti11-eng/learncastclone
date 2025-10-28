import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Headphones } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StudyCastAppShell } from '@/components/layouts/StudyCastAppShell';

type AuthTabs = 'signin' | 'signup';

interface AuthProps {
  defaultTab?: AuthTabs;
}

const Auth = ({ defaultTab = 'signin' }: AuthProps) => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<AuthTabs>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setTab('signup');
    } else if (location.pathname.includes('login')) {
      setTab('signin');
    }
  }, [location.pathname]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      await signUp(email, password, fullName);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudyCastAppShell className="items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-3xl border border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full border border-white/30 bg-white/70 p-3 shadow-sm">
              <Headphones className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-slate-900">Welcome to StudyCast</CardTitle>
          <CardDescription className="text-slate-600">
            Your AI-powered study companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTabs)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                    title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-90" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <div className="space-y-2 text-sm text-muted-foreground">
              {tab === 'signin' ? (
                <p>
                  New here?{' '}
                  <Button variant="link" size="sm" className="px-0" onClick={() => navigate('/signup')}>
                    Create a StudyCast account
                  </Button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <Button variant="link" size="sm" className="px-0" onClick={() => navigate('/login')}>
                    Sign in instead
                  </Button>
                </p>
              )}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground"
                >
                  ← Back to Home
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </StudyCastAppShell>
  );
};

export default Auth;
