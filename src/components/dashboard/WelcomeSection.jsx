import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WelcomeSection({ user, isBengali }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isBengali) {
      if (hour < 12) return "🌅 সুপ্রভাত";
      if (hour < 17) return "☀️ শুভ দুপুর";
      return "🌆 শুভ সন্ধ্যা";
    } else {
      if (hour < 12) return "🌅 Good Morning";
      if (hour < 17) return "☀️ Good Afternoon";
      return "🌆 Good Evening";
    }
  };

  const features = [
    {
      icon: Heart,
      titleBn: "💬 বিনামূল্যে স্বাস্থ্য পরামর্শ",
      titleEn: "💬 Free Health Consultation",
      descBn: "🤖 AI চালিত স্বাস্থ্য সহায়ক",
      descEn: "🤖 AI-powered health assistant"
    },
    {
      icon: Shield,
      titleBn: "🚨 জরুরি সেবা ২৪/৭",
      titleEn: "🚨 Emergency Services 24/7",
      descBn: "⚡ তাৎক্ষণিক সাহায্য",
      descEn: "⚡ Immediate assistance"
    },
    {
      icon: Users,
      titleBn: "👨‍⚕️ ডাক্তারদের নেটওয়ার্ক",
      titleEn: "👨‍⚕️ Doctor Network",
      descBn: "🩺 বিশেষজ্ঞ চিকিৎসকদের সাথে যোগাযোগ",
      descEn: "🩺 Connect with specialists"
    }
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div className="relative p-8 lg:p-12 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-white font-semibold text-sm tracking-wide">
                  {isBengali ? "বাংলাদেশের প্রথম স্মার্ট হেলথ প্ল্যাটফর্ম" : "Bangladesh's First Smart Health Platform"}
                </span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
              {getGreeting()}
              {user && (
                <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent text-3xl lg:text-4xl font-bold mt-3 animate-fade-in">
                  👋 {user.full_name || (isBengali ? "প্রিয় ব্যবহারকারী" : "Dear User")}
                </span>
              )}
            </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed font-light">
                {isBengali ? 
                  "🏥 আপনার স্বাস্থ্যসেবার সব সমাধান এক জায়গায়। বিশেষজ্ঞ ডাক্তার, হাসপাতালের তথ্য এবং জরুরি সেবা। 💊" :
                  "🏥 Your complete healthcare solution in one place. Expert doctors, hospital information, and emergency services. 💊"
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Emergency")}>
                  <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-2xl hover:shadow-red-500/50 transition-all hover:scale-105 border-2 border-red-400">
                    <Heart className="w-5 h-5 mr-2 animate-pulse" />
                    🚨 {isBengali ? "জরুরি সাহায্য" : "Emergency Help"}
                  </Button>
                </Link>
                
                <Link to={createPageUrl("Dashboard")}>
                  <Button size="lg" className="w-full sm:w-auto bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 shadow-xl hover:scale-105 transition-all">
                    <Sparkles className="w-5 h-5 mr-2" />
                    🤖 {isBengali ? "AI ডাক্তারের সাথে কথা বলুন" : "Talk to AI Doctor"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-white/15 border-white/30 backdrop-blur-lg hover:bg-white/25 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <feature.icon className="w-7 h-7 text-white drop-shadow-lg" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">
                            {isBengali ? feature.titleBn : feature.titleEn}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {isBengali ? feature.descBn : feature.descEn}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}