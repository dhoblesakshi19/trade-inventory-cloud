
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-brand-700 mb-6">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-gray-500 mb-8">
          The page might have been moved or deleted, or you might have mistyped the URL.
        </p>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            {isAuthenticated ? "Return to Dashboard" : "Return to Login"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
