import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { refreshUser, user, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      await authApi.verifyEmail(code);
      
      // Refresh user data to get updated verification status
      await refreshUser();
      
      toast({
        title: 'Email verified!',
        description: 'Your email has been successfully verified.',
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid or expired verification code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      toast({
        title: 'Code resent!',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend verification code',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  // Check if already verified
  if (user?.is_email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border/50">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Email Already Verified!</h1>
              <p className="text-muted-foreground">
                Your email address is already verified.
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border/50">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Verify your email</h1>
          </div>
          <p className="text-muted-foreground">
            We've sent a 6-digit code to <strong>{user?.email || 'your email'}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pl-10 text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter the 6-digit code from your email</p>
          </div>

          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify email'}
          </Button>

          <div className="flex flex-col gap-2 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending || isVerifying}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isResending ? 'Resending...' : 'Resend code'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/')}
              disabled={isVerifying}
              className="text-sm"
            >
              Skip for now
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmail;
