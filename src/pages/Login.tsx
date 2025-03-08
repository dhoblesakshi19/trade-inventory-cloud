
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/context/AuthContext";

const Login = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<UserRole>("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password, activeTab);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-700 mb-2">Adish Trading Company</h1>
          <p className="text-gray-600">Inventory Management System</p>
        </div>

        <Tabs defaultValue="admin" onValueChange={(value) => setActiveTab(value as UserRole)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
            <TabsTrigger value="user">Staff Login</TabsTrigger>
          </TabsList>

          {["admin", "user"].map((role) => (
            <TabsContent key={role} value={role}>
              <Card>
                <CardHeader>
                  <CardTitle>{role === "admin" ? "Admin Login" : "Staff Login"}</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the {role === "admin" ? "admin" : "staff"} dashboard
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={role === "admin" ? "admin@adishtrading.com" : "user@adishtrading.com"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={role === "admin" ? "admin123" : "user123"}
                        required
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-brand-600 hover:bg-brand-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For demo purposes:</p>
          <p className="mt-1">
            Admin: admin@adishtrading.com / admin123
            <br />
            Staff: user@adishtrading.com / user123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
