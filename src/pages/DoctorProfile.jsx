import React, { useState, useEffect, lazy, Suspense } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, MapPin, Calendar, Award, GraduationCap, Languages, Stethoscope } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import BmdcBadge from '../components/ui/BmdcBadge';

const DoctorReviews         = lazy(() => import('../components/doctor/DoctorReviews'));
const DoctorClinicLocations = lazy(() => import('../components/doctor/DoctorClinicLocations'));

export default function DoctorProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const doctorId = params.get('doctorId');
    
    const [doctor, setDoctor] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);

    useEffect(() => {
        loadData();
    }, [doctorId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [user, doctorData, reviewsData] = await Promise.all([
                base44.auth.me().catch(() => null),
                base44.entities.User.filter({ id: doctorId }, '-created_date', 1),
                base44.entities.DoctorReview.filter({ doctor_id: doctorId }, '-created_date', 100)
            ]);

            if (user) {
                setCurrentUser(user);
                setIsBengali(user.preferred_language === 'bengali' || !user.preferred_language);
            }

            if (doctorData[0]) {
                setDoctor(doctorData[0]);
            }

            setReviews(reviewsData);
            if (reviewsData.length > 0) {
                const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
                setAverageRating(avg);
            }
        } catch (error) {
            console.error('Failed to load doctor profile:', error);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-bold mb-2">
                            {isBengali ? 'ডাক্তার খুঁজে পাওয়া যায়নি' : 'Doctor Not Found'}
                        </h2>
                        <Button onClick={() => navigate(createPageUrl('Doctors'))}>
                            {isBengali ? 'ডাক্তার তালিকায় ফিরে যান' : 'Back to Doctors'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const specs = doctor.doctor_specializations?.length > 0 
        ? doctor.doctor_specializations 
        : (doctor.doctor_specialization ? [doctor.doctor_specialization] : []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="shadow-xl border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white/50">
                                <Stethoscope className="w-16 h-16 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold">{doctor.full_name}</h1>
                                    {doctor.verification_status === 'verified' && (
                                        <Shield className="w-6 h-6 text-white" title={isBengali ? 'যাচাইকৃত ডাক্তার' : 'Verified Doctor'} />
                                    )}
                                </div>
                                {specs.length > 0 && (
                                    <p className="text-xl mb-3 text-blue-100">{specs[0]}</p>
                                )}
                                <div className="flex items-center gap-4 mb-3">
                                    {averageRating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-5 h-5 text-yellow-300 fill-current" />
                                            <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                                            <span className="text-blue-100 text-sm">({reviews.length} {isBengali ? 'রিভিউ' : 'reviews'})</span>
                                        </div>
                                    )}
                                    {doctor.years_experience > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Award className="w-5 h-5" />
                                            <span className="font-medium">{doctor.years_experience} {isBengali ? 'বছর অভিজ্ঞতা' : 'years exp'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {specs.map((spec, idx) => (
                                        <Badge key={idx} className="bg-white/20 text-white border-white/30">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button 
                                    onClick={() => navigate(createPageUrl(`Appointments?doctorId=${doctor.id}`))}
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50"
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    {isBengali ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment'}
                                </Button>
                                {doctor.consultation_fee && (
                                    <div className="text-center bg-white/20 rounded-lg p-2">
                                        <p className="text-sm text-blue-100">{isBengali ? 'পরামর্শ ফি' : 'Consultation Fee'}</p>
                                        <p className="text-xl font-bold">৳{doctor.consultation_fee}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Education & Experience */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                {isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Education & Qualifications'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {doctor.education?.length > 0 ? (
                                doctor.education.map((edu, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                        <GraduationCap className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                        <p className="text-sm">{edu}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">{isBengali ? 'তথ্য উপলব্ধ নেই' : 'No information available'}</p>
                            )}
                            
                            {doctor.doctor_license_number && (
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-sm text-gray-600">{isBengali ? 'লাইসেন্স নম্বর' : 'License Number'}</p>
                                    <p className="font-medium">{doctor.doctor_license_number}</p>
                                </div>
                            )}
                            
                            {doctor.hospital_name && (
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-sm text-gray-600">{isBengali ? 'হাসপাতাল' : 'Hospital Affiliation'}</p>
                                    <p className="font-medium">{doctor.hospital_name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Languages & Specializations */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Languages className="w-5 h-5 text-green-600" />
                                {isBengali ? 'ভাষা ও বিশেষত্ব' : 'Languages & Specializations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    {isBengali ? 'ভাষা' : 'Languages Spoken'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {doctor.languages_spoken?.map((lang, idx) => (
                                        <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                            {specs.length > 1 && (
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        {isBengali ? 'বিশেষত্ব' : 'Areas of Specialization'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {specs.map((spec, idx) => (
                                            <Badge key={idx} className="bg-blue-100 text-blue-700">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Clinic Locations */}
                <DoctorClinicLocations doctor={doctor} isBengali={isBengali} />

                {/* Reviews Section */}
                <DoctorReviews 
                    doctorId={doctor.id}
                    isBengali={isBengali}
                    currentUser={currentUser}
                    onReviewAdded={loadData}
                />
            </div>
        </div>
    );
}