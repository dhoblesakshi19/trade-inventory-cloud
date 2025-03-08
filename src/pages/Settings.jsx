
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, BellRing, Save } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    stockAlerts: true,
    saleNotifications: true,
    reportSummaries: false,
  });
  
  // Handle profile settings update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    if (profileSettings.password && profileSettings.password !== profileSettings.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would update the user profile via API
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = (e) => {
    e.preventDefault();
    
    // In a real app, this would update notification settings via API
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>
        
        <Tabs defaultValue="profile" className="max-w-3xl">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Manage your personal information and password
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                      placeholder="Your email address"
                      required
                    />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Change Password</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={profileSettings.password}
                        onChange={(e) => setProfileSettings({ ...profileSettings, password: e.target.value })}
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileSettings.confirmPassword}
                        onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Notification Settings Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellRing className="h-5 w-5 mr-2 text-blue-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Control how you receive alerts and notifications
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleNotificationUpdate}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-medium">Email Alerts</h3>
                      <p className="text-sm text-gray-500">Receive alerts via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailAlerts: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-medium">Low Stock Alerts</h3>
                      <p className="text-sm text-gray-500">Get notified when items are running low</p>
                    </div>
                    <Switch
                      checked={notificationSettings.stockAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, stockAlerts: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-medium">Sales Notifications</h3>
                      <p className="text-sm text-gray-500">Get notified for new sales</p>
                    </div>
                    <Switch
                      checked={notificationSettings.saleNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, saleNotifications: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <h3 className="font-medium">Weekly Report Summaries</h3>
                      <p className="text-sm text-gray-500">Receive weekly sales and inventory reports</p>
                    </div>
                    <Switch
                      checked={notificationSettings.reportSummaries}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, reportSummaries: checked })}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
