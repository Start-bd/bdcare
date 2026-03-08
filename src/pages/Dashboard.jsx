import React, { useState, useEffect, lazy, Suspense } from "react";
import { User } from "@/entities/User";
import SEOHead from "../components/seo/SEOHead";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import QuickActions from "../components/dashboard/QuickActions";
import HealthStats from "../components/dashboard/HealthStats";

const PersonalizedHealthInsights = lazy(() => import("../components/dashboard/PersonalizedHealthInsights"));

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBengali, setIsBengali] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsBengali(currentUser.preferred_language === 'bengali' || currentUser.preferred_language === 'both');
    } catch (error) {
      // User not logged in
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-medium">
            {isBengali ? "লোড হচ্ছে..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <WelcomeSection user={user} isBengali={isBengali} />
      <PersonalizedHealthInsights user={user} isBengali={isBengali} />
      <QuickActions isBengali={isBengali} />
      <HealthStats isBengali={isBengali} />
    </div>
  );
}