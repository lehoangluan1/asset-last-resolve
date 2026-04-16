import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { demoAccounts } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Please enter both username and password'); return; }
    const result = login(username, password);
    if (!result.success) { setError(result.error || 'Login failed'); return; }
    toast.success('Welcome back!');
  };

  const quickLogin = (u: string, p: string) => {
    setUsername(u); setPassword(p);
    const result = login(u, p);
    if (result.success) toast.success('Welcome back!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary mb-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Asset Management</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">Click to sign in instantly</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {demoAccounts.map(a => (
              <button
                key={a.username}
                onClick={() => quickLogin(a.username, a.password)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{a.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.label}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{a.role}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
