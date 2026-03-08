import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  Heart,
  MapPin,
  MessageSquare,
  PhoneCall,
  Droplets,
  User as UserIcon,
  Globe,
  Shield,
  Bell,
  Stethoscope,
  Activity,
  Pill,
  ClipboardCheck,
  Settings as SettingsIcon,
  TrendingUp } from
"lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger } from
"@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OfflineIndicator from "../components/OfflineIndicator";

const navigationItems = [
{
  title: "স্বাস্থ্য সহায়ক",
  titleEn: "Health Agent",
  url: createPageUrl("Dashboard"),
  icon: Heart,
  color: "text-emerald-600"
},
{
  title: "হাসপাতাল",
  titleEn: "Hospitals",
  url: createPageUrl("Hospitals"),
  icon: MapPin,
  color: "text-blue-600"
},
{
  title: "ডাক্তার",
  titleEn: "Doctors",
  url: createPageUrl("Doctors"),
  icon: Stethoscope,
  color: "text-cyan-600"
},
{
  title: "ঔষধ চেকার",
  titleEn: "Medicine Checker",
  url: createPageUrl("MedicineChecker"),
  icon: Pill,
  color: "text-green-600"
},
{
  title: "চর্ম পরীক্ষক",
  titleEn: "Skin Checker",
  url: createPageUrl("SkinChecker"),
  icon: Activity,
  color: "text-pink-600"
},
{
  title: "জরুরি সেবা",
  titleEn: "Emergency",
  url: createPageUrl("Emergency"),
  icon: PhoneCall,
  color: "text-red-600"
},
{
  title: "রক্তের ব্যাংক",
  titleEn: "Blood Bank",
  url: createPageUrl("BloodBank"),
  icon: Droplets,
  color: "text-red-500"
},
{
  title: "স্বাস্থ্য ফোরাম",
  titleEn: "Health Forum",
  url: createPageUrl("Forum"),
  icon: MessageSquare,
  color: "text-purple-600"
}];


const aiTools = [
{
  title: "ড্রাগ চেকার",
  titleEn: "Drug Checker",
  url: createPageUrl("DrugInteractionChecker"),
  icon: Pill,
  color: "text-green-600"
},
{
  title: "ঝুঁকি মূল্যায়ন",
  titleEn: "Risk Assessment",
  url: createPageUrl("HealthRiskAssessment"),
  icon: ClipboardCheck,
  color: "text-orange-600"
}];


const insightsTools = [
{
  title: "হেলথ অ্যানালিটিক্স",
  titleEn: "Health Analytics",
  url: createPageUrl("Analytics"),
  icon: TrendingUp,
  color: "text-indigo-600"
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBengali, setIsBengali] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState({
    hospitals: 5816,
    bloodDonors: 23786,
    districts: 64
  });

  // ── PWA Service Worker registration ──────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }, []);

  // ── html lang attribute ───────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.lang = isBengali ? 'bn' : 'en';
  }, [isBengali]);

  useEffect(() => {
    // Inject Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-L5X940R7JN';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-L5X940R7JN');
    `;
    document.head.appendChild(script2);

    loadUser();
    loadRealTimeStats();

    // Update stats every 30 seconds
    const interval = setInterval(loadRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: currentPageName
      });
    }
  }, [location, currentPageName]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsBengali(currentUser.preferred_language === 'bengali' || currentUser.preferred_language === 'both');
    } catch (error) {

      // User not logged in or error occurred
    }setIsLoading(false);
  };

  const loadRealTimeStats = async () => {
    try {
      // This would ideally come from a real-time analytics endpoint
      // For now, we'll simulate with some variation
      const baseStats = { hospitals: 5816, bloodDonors: 23786, districts: 64 };
      const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10 variation

      setRealTimeStats({
        hospitals: baseStats.hospitals + variation,
        bloodDonors: baseStats.bloodDonors + Math.floor(Math.random() * 100),
        districts: baseStats.districts
      });
    } catch (error) {

      // Keep existing stats on error
    }};

  const toggleLanguage = () => {
    setIsBengali(!isBengali);
  };

  // SEO metadata based on current page
  const getPageMetadata = () => {
    const pageTitles = {
      Dashboard: {
        titleBn: "ড্যাশবোর্ড - BD Care | AI চালিত স্বাস্থ্যসেবা প্ল্যাটফর্ম",
        titleEn: "Dashboard - BD Care | AI-Powered Healthcare Platform Bangladesh",
        descBn: "বাংলাদেশের প্রথম AI চালিত স্বাস্থ্যসেবা প্ল্যাটফর্ম। বিনামূল্যে স্বাস্থ্য পরামর্শ, হাসপাতাল খুঁজুন, ডাক্তারদের সাথে সংযুক্ত হন এবং জরুরি সেবা পান।",
        descEn: "Bangladesh's first AI-powered healthcare platform. Get free health consultations, find hospitals, connect with doctors, and access emergency services 24/7."
      },
      Hospitals: {
        titleBn: "হাসপাতাল খুঁজুন - ৫০০০+ হাসপাতাল | BD Care",
        titleEn: "Find Hospitals - 5000+ Hospitals in Bangladesh | BD Care",
        descBn: "বাংলাদেশের সব জেলায় ৫০০০+ হাসপাতালের তথ্য। সরকারি, বেসরকারি এবং বিশেষায়িত হাসপাতাল খুঁজুন, রিভিউ দেখুন এবং সরাসরি যোগাযোগ করুন।",
        descEn: "Find 5000+ hospitals across Bangladesh. Search government, private, and specialized hospitals, view ratings, and contact directly."
      },
      Emergency: {
        titleBn: "জরুরি সেবা ২৪/৭ - তাৎক্ষণিক সাহায্য | BD Care",
        titleEn: "Emergency Services 24/7 - Immediate Help | BD Care",
        descBn: "২৪ ঘণ্টা জরুরি স্বাস্থ্যসেবা। অ্যাম্বুলেন্স, জরুরি হটলাইন, লাইভ ডাক্তার পরামর্শ এবং রিয়েল-টাইম ট্র্যাকিং।",
        descEn: "24/7 emergency healthcare services. Ambulance, emergency hotlines, live doctor consultation, and real-time tracking."
      },
      BloodBank: {
        titleBn: "ব্লাড ব্যাংক - রক্তের প্রয়োজন? | BD Care",
        titleEn: "Blood Bank - Need Blood? | BD Care",
        descBn: "সারা বাংলাদেশে ব্লাড ব্যাংক এবং রক্তদাতা খুঁজুন। রিয়েল-টাইম রক্তের মজুদ তথ্য এবং তাৎক্ষণিক সহায়তা।",
        descEn: "Find blood banks and donors across Bangladesh. Real-time blood inventory and immediate assistance."
      },
      Doctors: {
        titleBn: "ডাক্তার খুঁজুন - বিশেষজ্ঞ চিকিৎসক | BD Care",
        titleEn: "Find Doctors - Specialist Physicians | BD Care",
        descBn: "বাংলাদেশের সেরা ডাক্তারদের খুঁজুন। অনলাইন অ্যাপয়েন্টমেন্ট, ভিডিও পরামর্শ এবং বিশেষজ্ঞ চিকিৎসা।",
        descEn: "Find the best doctors in Bangladesh. Online appointments, video consultations, and specialist care."
      },
      MedicineChecker: {
        titleBn: "ঔষধ চেকার - ঔষধ যাচাই করুন | BD Care",
        titleEn: "Medicine Checker - Verify Medicines | BD Care",
        descBn: "AI দিয়ে ঔষধ যাচাই করুন। ছবি আপলোড করে ঔষধের তথ্য, ডোজ এবং পার্শ্ব প্রতিক্রিয়া জানুন।",
        descEn: "Verify medicines with AI. Upload image to get medicine information, dosage, and side effects."
      },
      Forum: {
        titleBn: "স্বাস্থ্য ফোরাম - প্রশ্ন করুন | স্বাস্থ্য বন্ধু",
        titleEn: "Health Forum - Ask Questions | Shasthya Bondhu",
        descBn: "স্বাস্থ্য সম্পর্কিত প্রশ্ন করুন এবং ডাক্তারদের থেকে উত্তর পান। কমিউনিটির সাথে অভিজ্ঞতা শেয়ার করুন।",
        descEn: "Ask health questions and get answers from doctors. Share experiences with the community."
      }
    };

    const currentPage = pageTitles[currentPageName] || pageTitles.Dashboard;

    // Update document title and meta tags
    document.title = isBengali ? currentPage.titleBn : currentPage.titleEn;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = isBengali ? currentPage.descBn : currentPage.descEn;

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = "Bangladesh healthcare, স্বাস্থ্যসেবা বাংলাদেশ, hospital Bangladesh, doctor Bangladesh, emergency medical services, blood bank, AI doctor, telemedicine Bangladesh, হাসপাতাল, ডাক্তার, জরুরি সেবা";

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = isBengali ? currentPage.titleBn : currentPage.titleEn;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = isBengali ? currentPage.descBn : currentPage.descEn;

    return currentPage;
  };

  // Update meta tags when page or language changes
  useEffect(() => {
    getPageMetadata();
  }, [currentPageName, isBengali]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-medium">স্বাস্থ্য এজেন্ট লোড হচ্ছে...</p>
        </div>
      </div>);

  }

  return (
    <div>
      <style>{`
        .bangladesh-gradient {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        }
        .cultural-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpolygon points='10 0 20 10 10 20 0 10'/%3E%3C/g%3E%3C/svg%3E");
        }
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
      
      <OfflineIndicator isBengali={isBengali} />

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-emerald-50">
          <Sidebar className="border-r border-emerald-100 bg-white/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-emerald-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bangladesh-gradient cultural-pattern flex items-center justify-center shadow-lg">
                  <Heart className="text-slate-500 lucide lucide-heart h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-emerald-800">
                    {isBengali ? "BD Care" : "BD Care"}
                  </h1>
                  <p className="text-xs text-emerald-600">
                    {isBengali ? "স্বাস্থ্য বন্ধু | AI সহায়ক" : "Shasthya Bondhu | AI Assistant"}
                  </p>
                </div>
              </div>

              {user &&
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'doctor' &&
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {isBengali ? "চিকিৎসক" : "Doctor"}
                    </Badge>
                }
                  {user.role === 'admin' &&
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {isBengali ? "এডমিন" : "Admin"}
                    </Badge>
                }
                </div>
              }

              {!user &&
              <Button
                onClick={() => navigate(createPageUrl("Profile"))}
                className="w-full bangladesh-gradient text-white hover:opacity-90">

                  {isBengali ? "লগইন করুন" : "Login"}
                </Button>
              }
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase px-3">
                  {isBengali ? "প্রধান সেবা" : "Main Services"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) =>
                    <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="hover:bg-emerald-50 hover:text-emerald-700 transition-all">

                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            <span className="font-medium">
                              {isBengali ? item.title : item.titleEn}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase px-3 mt-2">
                  {isBengali ? "AI টুলস" : "AI Tools"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {aiTools.map((item) =>
                    <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="hover:bg-purple-50 hover:text-purple-700 transition-all">

                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            <span className="font-medium">
                              {isBengali ? item.title : item.titleEn}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase px-3 mt-2">
                  {isBengali ? "ইনসাইটস" : "Insights"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {insightsTools.map((item) =>
                    <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="hover:bg-indigo-50 hover:text-indigo-700 transition-all">

                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                            <span className="font-medium">
                              {isBengali ? item.title : item.titleEn}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {user &&
              <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase px-3 mt-2">
                    {isBengali ? "একাউন্ট" : "Account"}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to={createPageUrl("Profile")} className="flex items-center gap-3 px-3 py-2">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                            <span>{isBengali ? "প্রোফাইল" : "Profile"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to={createPageUrl("Appointments")} className="flex items-center gap-3 px-3 py-2">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span>{isBengali ? "অ্যাপয়েন্টমেন্ট" : "Appointments"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to={createPageUrl("Settings")} className="flex items-center gap-3 px-3 py-2">
                            <SettingsIcon className="h-5 w-5 text-gray-600" />
                            <span>{isBengali ? "সেটিংস" : "Settings"}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              }
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-100 p-4 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="w-full justify-start gap-2 border-emerald-200 hover:bg-emerald-50">

                  <Globe className="h-4 w-4" />
                  <span className="text-sm">
                    {isBengali ? "English" : "বাংলা"}
                  </span>
                </Button>
                
                <div className="text-xs text-gray-600 space-y-1 px-2">
                  <div className="flex justify-between">
                    <span>{isBengali ? "হাসপাতাল" : "Hospitals"}:</span>
                    <span className="font-semibold text-emerald-700">{realTimeStats.hospitals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isBengali ? "রক্তদাতা" : "Blood Donors"}:</span>
                    <span className="font-semibold text-red-600">{realTimeStats.bloodDonors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isBengali ? "জেলা" : "Districts"}:</span>
                    <span className="font-semibold text-blue-600">{realTimeStats.districts}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2 pt-2 border-t border-emerald-200">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">
                    {isBengali ? "সুরক্ষিত ও গোপনীয়" : "Secure & Private"}
                  </span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-emerald-50">
            {/* Mobile Header */}
            <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 px-6 py-4 md:hidden shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-emerald-700" />
                  <div className="h-10 w-10 rounded-lg bangladesh-gradient cultural-pattern flex items-center justify-center shadow">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-emerald-800">
                      BD Care
                    </h1>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  className="text-emerald-700">

                  <Globe className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>);

}