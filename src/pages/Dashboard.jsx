import React, { useState, useEffect, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
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
      const currentUser = await base44.auth.me();
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
    <>
      <SEOHead
        title="BD Care – AI Healthcare Platform Bangladesh | স্বাস্থ্য বন্ধু"
        titleBn="BD Care – AI স্বাস্থ্যসেবা প্ল্যাটফর্ম বাংলাদেশ | স্বাস্থ্য বন্ধু"
        description="Bangladesh's #1 telemedicine platform. Find doctors, book appointments, emergency care, blood bank, AI health assistant — all in one place."
        descriptionBn="বাংলাদেশের ১ নম্বর টেলিমেডিসিন প্ল্যাটফর্ম। ডাক্তার খুঁজুন, অ্যাপয়েন্টমেন্ট নিন, জরুরি সেবা, ব্লাড ব্যাংক, AI স্বাস্থ্য সহায়ক — সব এক জায়গায়।"
        lang={isBengali ? 'bn' : 'en'}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <WelcomeSection user={user} isBengali={isBengali} />
        <Suspense fallback={<div className="h-48 mx-8 rounded-xl bg-white/50 animate-pulse my-4" />}>
          <PersonalizedHealthInsights user={user} isBengali={isBengali} />
        </Suspense>
        <QuickActions isBengali={isBengali} />
        <HealthStats isBengali={isBengali} />
      </div>
    </>
  );
}