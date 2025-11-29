import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword: sendResetCode } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const result = await sendResetCode(email);
    setIsLoading(false);

    if (result.success) {
      setEmailSent(true);
      toast({
        title: 'Email sent!',
        description: 'Check your inbox for a 6-digit reset code.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Unable to send reset code',
        variant: 'destructive',
      });
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    if (!code || code.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      setIsValidating(false);
      return;
    }

    try {
      await authApi.validateResetCode(email, code);
      setCodeValidated(true);
      toast({
        title: 'Code validated!',
        description: 'Enter your new password below.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Invalid or expired reset code',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      setIsResetting(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      setIsResetting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      setIsResetting(false);
      return;
    }

    try {
      await authApi.resetPassword(email, code, newPassword);
      toast({
        title: 'Success!',
        description: 'Your password has been reset successfully.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Step 3: Reset Password Form (after code is validated)
  if (codeValidated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border/50">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Set new password</h1>
            </div>
            <p className="text-muted-foreground">
              Your code has been validated. Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Step 2: Validate Code (after email is sent)
  if (emailSent) {
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
              <h1 className="text-3xl font-bold">Enter reset code</h1>
            </div>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleValidateCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Reset Code</Label>
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

            <Button type="submit" className="w-full" disabled={isValidating}>
              {isValidating ? 'Validating...' : 'Validate code'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEmailSent(false);
                  setCode('');
                }}
                className="text-sm"
              >
                Use a different email
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Step 1: Enter Email
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
            <h1 className="text-3xl font-bold">Reset password</h1>
          </div>
          <p className="text-muted-foreground">
            Enter your email and we'll send you a 6-digit code to reset your password
          </p>
        </div>

        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset code'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
