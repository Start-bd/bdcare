import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Heart, 
  Stethoscope, 
  MapPin, 
  Calendar, 
  Pill, 
  PhoneCall, 
  Droplets, 
  MessageSquare,
  Activity,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Users,
  Video,
  FileText,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AISymptomAssessment from "../components/ai/AISymptomAssessment";

// Patient Dashboard Component
function PatientDashboard({ user, isBengali, upcomingAppointments, onRefresh }) {
  const nextAppointment = upcomingAppointments[0];
  const [showAIDoctor, setShowAIDoctor] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isBengali) {
      if (hour < 12) return "সুপ্রভাত";
      if (hour < 17) return "শুভ দুপুর";
      return "শুভ সন্ধ্যা";
    } else {
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user.full_name}! 👋
          </h1>
          {nextAppointment ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-3">
              <p className="text-sm mb-1">{isBengali ? 'পরবর্তী অ্যাপয়েন্টমেন্ট' : 'Next Appointment'}</p>
              <p className="font-semibold">
                {nextAppointment.doctor_name} • {new Date(nextAppointment.appointment_date).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}
              </p>
            </div>
          ) : (
            <p className="text-emerald-100">{isBengali ? 'আজ কোনো অ্যাপয়েন্টমেন্ট নেই' : 'No appointments today'}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{isBengali ? '⚡ দ্রুত অ্যাক্সেস' : '⚡ Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => setShowAIDoctor(true)} variant="outline" className="h-24 flex flex-col gap-2">
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm">{isBengali ? 'AI ডাক্তার' : 'AI Doctor'}</span>
              </Button>
              <Link to={createPageUrl('Doctors')}>
                <Button variant="outline" className="h-24 w-full flex flex-col gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">{isBengali ? 'ডাক্তার খুঁজুন' : 'Find Doctor'}</span>
                </Button>
              </Link>
              <Link to={createPageUrl('Emergency')}>
                <Button variant="outline" className="h-24 w-full flex flex-col gap-2 border-red-200 hover:bg-red-50">
                  <PhoneCall className="w-6 h-6 text-red-600" />
                  <span className="text-sm">{isBengali ? 'জরুরি সেবা' : 'Emergency'}</span>
                </Button>
              </Link>
              <Link to={createPageUrl('MedicalRecords')}>
                <Button variant="outline" className="h-24 w-full flex flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">{isBengali ? 'মেডিকেল রেকর্ড' : 'Records'}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isBengali ? '📅 আসন্ন অ্যাপয়েন্টমেন্ট' : '📅 Upcoming Appointments'}</CardTitle>
              <Link to={createPageUrl('Appointments')}>
                <Button variant="ghost" size="sm">{isBengali ? 'সব দেখুন' : 'View All'}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{apt.doctor_name}</h4>
                        <p className="text-sm text-gray-600">{new Date(apt.appointment_date).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">{apt.reason}</p>
                      </div>
                      <Link to={createPageUrl('Appointments')}>
                        <Button size="sm">{isBengali ? 'বিস্তারিত' : 'Details'}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">{isBengali ? 'কোনো অ্যাপয়েন্টমেন্ট নেই' : 'No upcoming appointments'}</p>
                <Link to={createPageUrl('Doctors')}>
                  <Button>{isBengali ? 'ডাক্তার বুক করুন' : 'Book a Doctor'}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAIDoctor} onOpenChange={setShowAIDoctor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AISymptomAssessment isBengali={isBengali} user={user} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Doctor Dashboard Component
function DoctorDashboard({ user, isBengali }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointments, videoConsultations] = await Promise.all([
        base44.entities.Appointment.filter({ doctor_id: user.id, status: 'scheduled' }, 'appointment_date', 20).catch(() => []),
        base44.entities.VideoConsultation.filter({ doctor_id: user.id, session_status: 'scheduled' }, '-scheduled_time', 10).catch(() => [])
      ]);
      
      const todayApts = appointments.filter(apt => apt.appointment_date.startsWith(today));
      setTodayAppointments(todayApts);
      setConsultations(videoConsultations);
    } catch (error) {
      console.error('Failed to load:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            {isBengali ? 'স্বাগতম,' : 'Welcome,'} Dr. {user.full_name} 👨‍⚕️
          </h1>
          <p className="text-blue-100">
            {isBengali ? `আজ ${todayAppointments.length}টি অ্যাপয়েন্টমেন্ট` : `${todayAppointments.length} appointments today`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBengali ? "📅 আজকের সময়সূচী" : "📅 Today's Schedule"}</CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="p-3 border rounded-lg">
                      <p className="font-semibold">{apt.patient_name}</p>
                      <p className="text-sm text-gray-600">{new Date(apt.appointment_date).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">{isBengali ? 'আজ কোনো অ্যাপয়েন্টমেন্ট নেই' : 'No appointments today'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBengali ? "📞 টেলিমেডিসিন কল" : "📞 Telemedicine Calls"}</CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <div className="space-y-3">
                  {consultations.slice(0, 5).map((consult) => (
                    <div key={consult.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{consult.patient_id}</p>
                        <p className="text-sm text-gray-600">{new Date(consult.scheduled_time).toLocaleString()}</p>
                      </div>
                      <Link to={createPageUrl(`Telemedicine?consultationId=${consult.id}`)}>
                        <Button size="sm"><Video className="w-4 h-4 mr-2" /> {isBengali ? 'যোগদান' : 'Join'}</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">{isBengali ? 'কোনো পেন্ডিং কল নেই' : 'No pending calls'}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('DoctorConsultations')}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">{isBengali ? 'পরামর্শ' : 'Consultations'}</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Profile')}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">{isBengali ? 'প্রোফাইল' : 'Profile'}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ user, isBengali }) {
  const [metrics, setMetrics] = useState({ appointments: 0, emergencies: 0, hospitals: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const loadAdminMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointments, emergencies, hospitals] = await Promise.all([
        base44.entities.Appointment.list('-created_date', 1000).catch(() => []),
        base44.entities.EmergencyRequest.filter({ status: 'pending' }, '-created_date', 100).catch(() => []),
        base44.entities.Hospital.list('-created_date', 10000).catch(() => [])
      ]);

      setMetrics({
        appointments: appointments.filter(a => a.appointment_date.startsWith(today)).length,
        emergencies: emergencies.length,
        hospitals: hospitals.length
      });
    } catch (error) {
      console.error('Failed to load:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            {isBengali ? 'এডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
          </h1>
          <p className="text-purple-100">{isBengali ? 'সিস্টেম ওভারভিউ' : 'System Overview'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{isBengali ? 'আজকের অ্যাপয়েন্টমেন্ট' : 'Today\'s Appointments'}</p>
                  <p className="text-3xl font-bold">{metrics.appointments}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{isBengali ? 'জরুরি অনুরোধ' : 'Emergency Requests'}</p>
                  <p className="text-3xl font-bold text-red-600">{metrics.emergencies}</p>
                </div>
                <PhoneCall className="w-12 h-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{isBengali ? 'হাসপাতাল' : 'Hospitals'}</p>
                  <p className="text-3xl font-bold">{metrics.hospitals}</p>
                </div>
                <MapPin className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span className="text-sm">{isBengali ? 'ম্যানেজমেন্ট' : 'Management'}</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Analytics')}>
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">{isBengali ? 'অ্যানালিটিক্স' : 'Analytics'}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBengali, setIsBengali] = useState(true);
  const [showAIDoctor, setShowAIDoctor] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState({
    hospitals: 5816,
    doctors: 2500,
    bloodDonors: 23786
  });
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me().catch(() => null);
      if (currentUser) {
        setUser(currentUser);
        setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
        
        // Load user-specific data
        if (currentUser.user_type === 'patient' || !currentUser.user_type) {
          const appointments = await base44.entities.Appointment.filter(
            { patient_id: currentUser.id, status: 'scheduled' },
            'appointment_date',
            5
          ).catch(() => []);
          setUpcomingAppointments(appointments.filter(apt => new Date(apt.appointment_date) > new Date()));
        }
      }

      // Load real stats
      const [hospitals, users] = await Promise.all([
        base44.entities.Hospital.list('-created_date', 10000).catch(() => []),
        base44.entities.User.list('-created_date', 1000).catch(() => [])
      ]);
      
      const doctors = users.filter(u => u.user_type === 'doctor' || u.role === 'doctor');
      
      setStats({
        hospitals: hospitals.length || 5816,
        doctors: doctors.length || 2500,
        bloodDonors: 23786
      });
    } catch (error) {
      console.error('Failed to load:', error);
    }
    setIsLoading(false);
  };

  const quickActions = [
    {
      icon: Stethoscope,
      titleBn: 'ডাক্তার খুঁজুন',
      titleEn: 'Find Doctors',
      descBn: 'বিশেষজ্ঞ চিকিৎসক',
      descEn: 'Specialist Physicians',
      url: createPageUrl('Doctors'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      titleBn: 'হাসপাতাল',
      titleEn: 'Hospitals',
      descBn: '৫০০০+ হাসপাতাল',
      descEn: '5000+ Hospitals',
      url: createPageUrl('Hospitals'),
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Calendar,
      titleBn: 'অ্যাপয়েন্টমেন্ট',
      titleEn: 'Appointments',
      descBn: 'ডাক্তার বুক করুন',
      descEn: 'Book Doctor',
      url: createPageUrl('Appointments'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Pill,
      titleBn: 'ঔষধ চেকার',
      titleEn: 'Medicine Checker',
      descBn: 'ঔষধ যাচাই করুন',
      descEn: 'Verify Medicines',
      url: createPageUrl('MedicineChecker'),
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: PhoneCall,
      titleBn: 'জরুরি সেবা',
      titleEn: 'Emergency',
      descBn: '২৪/৭ সহায়তা',
      descEn: '24/7 Support',
      url: createPageUrl('Emergency'),
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: Droplets,
      titleBn: 'রক্তের ব্যাংক',
      titleEn: 'Blood Bank',
      descBn: 'রক্ত খুঁজুন',
      descEn: 'Find Blood',
      url: createPageUrl('BloodBank'),
      color: 'from-red-600 to-pink-600'
    }
  ];

  const features = [
    {
      icon: Shield,
      titleBn: 'যাচাইকৃত ডাক্তার',
      titleEn: 'Verified Doctors',
      descBn: 'সব ডাক্তার যাচাইকৃত এবং লাইসেন্সপ্রাপ্ত',
      descEn: 'All doctors are verified and licensed'
    },
    {
      icon: Clock,
      titleBn: '২৪/৭ উপলব্ধ',
      titleEn: '24/7 Available',
      descBn: 'যেকোনো সময় জরুরি সেবা পান',
      descEn: 'Get emergency services anytime'
    },
    {
      icon: Users,
      titleBn: 'বিশাল নেটওয়ার্ক',
      titleEn: 'Large Network',
      descBn: 'সারা বাংলাদেশের হাসপাতাল ও ডাক্তার',
      descEn: 'Hospitals and doctors across Bangladesh'
    },
    {
      icon: Heart,
      titleBn: 'বিনামূল্যে AI পরামর্শ',
      titleEn: 'Free AI Consultation',
      descBn: 'AI দিয়ে প্রাথমিক স্বাস্থ্য পরামর্শ',
      descEn: 'Preliminary health advice with AI'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-medium">{isBengali ? "লোড হচ্ছে..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} isBengali={isBengali} />;
    }
    if (user.user_type === 'doctor' || user.role === 'doctor') {
      return <DoctorDashboard user={user} isBengali={isBengali} />;
    }
    return <PatientDashboard user={user} isBengali={isBengali} upcomingAppointments={upcomingAppointments} onRefresh={loadData} />;
  }

  // Public landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-12">
            <div className="flex-1 mb-12 lg:mb-0">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Heart className="w-4 h-4 mr-2 inline" />
                {isBengali ? 'বাংলাদেশের প্রথম স্মার্ট হেলথ প্ল্যাটফর্ম' : "Bangladesh's First Smart Health Platform"}
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                {isBengali ? (
                  <>
                    BD Care
                    <br />
                    <span className="text-yellow-300">আপনার ডিজিটাল হেলথকেয়ার</span>
                  </>
                ) : (
                  <>
                    BD Care
                    <br />
                    <span className="text-yellow-300">Your Digital Healthcare</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                {isBengali 
                  ? '🏥 ডাক্তার, হাসপাতাল, জরুরি সেবা এবং স্বাস্থ্য পরামর্শ - সব এক জায়গায়। বিশেষজ্ঞ ডাক্তারদের সাথে যুক্ত হন, অ্যাপয়েন্টমেন্ট বুক করুন এবং তাৎক্ষণিক সাহায্য পান।'
                  : '🏥 Doctors, hospitals, emergency services, and health consultation - all in one place. Connect with specialist doctors, book appointments, and get instant help.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => setShowAIDoctor(true)}
                  className="bg-white text-emerald-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/50 transition-all hover:scale-105 text-lg px-8 py-6"
                >
                  <Stethoscope className="w-6 h-6 mr-2" />
                  {isBengali ? '🤖 AI ডাক্তার' : '🤖 AI Doctor'}
                </Button>
                
                <Link to={createPageUrl('Emergency')}>
                  <Button 
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-red-500/50 transition-all hover:scale-105 text-lg px-8 py-6"
                  >
                    <PhoneCall className="w-6 h-6 mr-2 animate-pulse" />
                    {isBengali ? '🚨 জরুরি সাহায্য' : '🚨 Emergency Help'}
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.hospitals.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">{isBengali ? 'হাসপাতাল' : 'Hospitals'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.doctors.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">{isBengali ? 'ডাক্তার' : 'Doctors'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.bloodDonors.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">{isBengali ? 'রক্তদাতা' : 'Donors'}</div>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="flex-1 max-w-md mx-auto">
              <div className="grid gap-4">
                {features.map((feature, idx) => (
                  <Card key={idx} className="bg-white/15 border-white/30 backdrop-blur-lg hover:bg-white/25 transition-all hover:scale-105">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{isBengali ? feature.titleBn : feature.titleEn}</h3>
                        <p className="text-sm text-white/80">{isBengali ? feature.descBn : feature.descEn}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {isBengali ? '🎯 দ্রুত সেবা অ্যাক্সেস' : '🎯 Quick Access to Services'}
          </h2>
          <p className="text-gray-600 text-lg">
            {isBengali ? 'আপনার প্রয়োজনীয় সেবা এক ক্লিকে' : 'Access the services you need in one click'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.url}>
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-lg overflow-hidden group cursor-pointer">
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900">
                        {isBengali ? action.titleBn : action.titleEn}
                      </h3>
                      <p className="text-sm text-gray-600">{isBengali ? action.descBn : action.descEn}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between group-hover:bg-gray-50">
                    {isBengali ? 'অ্যাক্সেস করুন' : 'Access Now'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isBengali ? '✨ কেন BD Care?' : '✨ Why BD Care?'}
            </h2>
            <p className="text-gray-600 text-lg">
              {isBengali ? 'বাংলাদেশের সবচেয়ে বিশ্বস্ত হেলথকেয়ার প্ল্যাটফর্ম' : "Bangladesh's Most Trusted Healthcare Platform"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                titleBn: 'সহজ ব্যবহার',
                titleEn: 'Easy to Use',
                descBn: 'সহজ ইন্টারফেস, সবার জন্য উপযোগী',
                descEn: 'Simple interface, suitable for everyone'
              },
              {
                icon: Shield,
                titleBn: 'নিরাপদ ও গোপনীয়',
                titleEn: 'Safe & Private',
                descBn: 'আপনার তথ্য সম্পূর্ণ সুরক্ষিত',
                descEn: 'Your data is completely secure'
              },
              {
                icon: Clock,
                titleBn: 'দ্রুত সেবা',
                titleEn: 'Fast Service',
                descBn: 'তাৎক্ষণিক প্রতিক্রিয়া ও সহায়তা',
                descEn: 'Instant response and support'
              },
              {
                icon: Heart,
                titleBn: 'বিনামূল্যে',
                titleEn: 'Free',
                descBn: 'কোনো লুকানো খরচ নেই',
                descEn: 'No hidden costs'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{isBengali ? item.titleBn : item.titleEn}</h3>
                <p className="text-gray-600">{isBengali ? item.descBn : item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isBengali ? '🚀 আজই শুরু করুন' : '🚀 Get Started Today'}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {isBengali 
              ? 'হাজারো মানুষ ইতিমধ্যে স্বাস্থ্য বন্ধু ব্যবহার করছেন। আপনিও যুক্ত হন!'
              : 'Thousands are already using Shasthya Bondhu. Join them today!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-white text-emerald-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6"
                >
                  {isBengali ? '📝 রেজিস্ট্রেশন করুন' : '📝 Sign Up'}
                </Button>
                <Button 
                  size="lg"
                  onClick={() => base44.auth.redirectToLogin()}
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  {isBengali ? '🔐 লগইন করুন' : '🔐 Login'}
                </Button>
              </>
            ) : (
              <Link to={createPageUrl('Dashboard')}>
                <Button 
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6"
                >
                  {isBengali ? '📊 ড্যাশবোর্ড দেখুন' : '📊 Go to Dashboard'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* AI Doctor Dialog */}
      <Dialog open={showAIDoctor} onOpenChange={setShowAIDoctor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AISymptomAssessment isBengali={isBengali} user={user} />
        </DialogContent>
      </Dialog>
    </div>
  );
}