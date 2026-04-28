import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetUserSettings, useSaveUserSettings } from '../hooks/useQueries';
import { useTheme } from 'next-themes';
import { User, Palette, Shield, Bell, Check, Moon, Sun } from 'lucide-react';
import { Variant_dark_light, type UserSettings } from '../backend';

export default function SettingsPage() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userSettings } = useGetUserSettings();
  const saveProfile = useSaveCallerUserProfile();
  const saveSettings = useSaveUserSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    showNotifications: true,
    showAnalytics: true,
    showBudgetWarnings: true,
    showSavingsTips: true,
    enableAIInsights: true,
  });

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userSettings) {
      setNotifications({
        showNotifications: userSettings.showNotifications,
        showAnalytics: userSettings.showAnalytics,
        showBudgetWarnings: userSettings.showBudgetWarnings,
        showSavingsTips: userSettings.showSavingsTips,
        enableAIInsights: userSettings.enableAIInsights,
      });
    }
  }, [userSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    await saveProfile.mutateAsync({
      ...userProfile,
      name,
      email,
    });
  };

  const handleSaveSettings = async () => {
    const settings: UserSettings = {
      theme: theme === 'dark' ? Variant_dark_light.dark : Variant_dark_light.light,
      ...notifications,
    };

    await saveSettings.mutateAsync(settings);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account, preferences, and security</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="display">
            <Palette className="mr-2 h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal information and identity details</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {userProfile && (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Member since</span>
                      <span className="text-muted-foreground">{formatDate(userProfile.memberSince)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verification</span>
                <Badge className="bg-primary hover:bg-primary/90">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Customize how FinanceWise AI looks and feels</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-medium">Theme Mode</h3>
                <p className="mb-4 text-sm text-muted-foreground">Choose your preferred color scheme for the application</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-4 rounded-lg border-2 p-6 transition-colors ${
                      theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                      <Sun className="h-8 w-8 text-gray-900" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Light Mode</div>
                      <div className="text-xs text-muted-foreground">Bright and clean interface</div>
                    </div>
                    {theme === 'light' && <Check className="h-5 w-5 text-primary" />}
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-4 rounded-lg border-2 p-6 transition-colors ${
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
                      <Moon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Dark Mode</div>
                      <div className="text-xs text-muted-foreground">Easy on the eyes</div>
                    </div>
                    {theme === 'dark' && <Check className="h-5 w-5 text-primary" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics Visibility</div>
                  <div className="text-sm text-muted-foreground">Show detailed analytics and charts on your dashboard</div>
                </div>
                <Switch
                  checked={notifications.showAnalytics}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, showAnalytics: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90" disabled={saveSettings.isPending}>
                {saveSettings.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your account security and authentication settings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-muted/50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Internet Identity Authentication</h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Your account is secured using Internet Identity, a blockchain-based authentication system that provides secure,
                  anonymous login without passwords.
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Passwordless authentication</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Blockchain-secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Privacy-focused</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Multi-device support</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Principal ID</h3>
                <div className="rounded-lg bg-muted p-4">
                  <code className="break-all text-xs">{identity?.getPrincipal().toString()}</code>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This is your unique identifier on the Internet Computer blockchain. Keep it safe and never share it with anyone you don't trust.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">End-to-End Encryption</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All data is encrypted at rest and in transit</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">Blockchain Security</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Powered by Internet Computer Protocol</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="font-semibold">Security Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication</span>
                    <Badge className="bg-primary hover:bg-primary/90">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>

              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Control how and when you receive notifications</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive notifications about your financial activities</div>
                </div>
                <Switch
                  checked={notifications.showNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, showNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Budget Warnings</div>
                  <div className="text-sm text-muted-foreground">Get alerts when you're approaching your budget limits</div>
                </div>
                <Switch
                  checked={notifications.showBudgetWarnings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, showBudgetWarnings: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Savings Tips</div>
                  <div className="text-sm text-muted-foreground">Receive AI-powered financial insights and recommendations</div>
                </div>
                <Switch
                  checked={notifications.showSavingsTips}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, showSavingsTips: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">AI Insights</div>
                  <div className="text-sm text-muted-foreground">Receive AI-powered financial insights and recommendations</div>
                </div>
                <Switch
                  checked={notifications.enableAIInsights}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, enableAIInsights: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90" disabled={saveSettings.isPending}>
                {saveSettings.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
