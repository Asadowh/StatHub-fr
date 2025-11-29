import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, User, Shield, LogOut, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatHeight } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { toast } = useToast();
  const { user, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitPasswordChange = async (values: z.infer<typeof passwordSchema>) => {
    const result = await changePassword(values.currentPassword, values.newPassword);
    
    if (!result.success) {
      toast({
        title: "❌ Error",
        description: result.error || "Failed to change password",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    toast({
      title: "✅ Password Changed Successfully!",
      description: "Your password has been updated. Please log in again with your new password.",
      duration: 5000,
    });
    form.reset();
    setIsChangingPassword(false);
    
    // User will be logged out automatically by changePassword function
    // Wait a moment then redirect to login
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const handleCancelPasswordChange = () => {
    form.reset();
    setIsChangingPassword(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  const handleSendVerification = async () => {
    try {
      await authApi.resendVerificationEmail();
      toast({
        title: "📧 Verification Email Sent",
        description: "Please check your inbox and click the verification link.",
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to send verification email",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                {user?.email || 'Not set'}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Username</Label>
              <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                @{user?.username || 'Not set'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nationality</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                  {user?.nationality || 'Not set'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Position</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                  {user?.favorite_position || 'Not set'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Jersey Number</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                  {user?.jersey_number || 'Not set'}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Height</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md cursor-default">
                  {user?.height ? (
                    <>
                      <span className="text-foreground">{formatHeight(user.height.toString()).split('(')[0].trim()}</span>
                      {' '}
                      <span className="text-muted-foreground">
                        ({formatHeight(user.height.toString()).split('(')[1]?.replace(')', '') || ''})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Security</h2>
          </div>

          {!isChangingPassword ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Current Password</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md text-foreground cursor-default">
                  ••••••••
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Security Status</Label>
                <div className="px-3 py-2 bg-background border border-border rounded-md text-muted-foreground cursor-default">
                  Account secured with password
                </div>
              </div>

              <Button 
                onClick={() => setIsChangingPassword(true)}
                className="mt-4"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitPasswordChange)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Re-enter new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelPasswordChange}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </Card>

        {/* Account Verification Section */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Account Verification</h2>
          </div>

          <div className="space-y-6">
            {/* Email Verification */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Email Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {user?.is_email_verified ? (
                      <span className="text-green-500">Verified ✅</span>
                    ) : (
                      <span className="text-yellow-500">Not Verified ⏳</span>
                    )}
                  </p>
                </div>
              </div>
              {!user?.is_email_verified && (
                <Button onClick={handleSendVerification} size="sm">
                  Send Verification Link
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
