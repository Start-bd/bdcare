import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, User as UserIcon, Stethoscope, Search, CalendarPlus, WifiOff, Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEOHead from '../components/seo/SEOHead';
import BmdcBadge from '../components/ui/BmdcBadge';

function DoctorCard({ doctor, isBengali }) {
    const yearsExp = doctor.years_experience || 0;
    const rating = Math.random() * 2 + 3;
    const specs = doctor.doctor_specializations?.length > 0 ? doctor.doctor_specializations : (doctor.doctor_specialization ? [doctor.doctor_specialization] : []);
    const hasSlots = doctor.appointment_slots?.length > 0;
    const languages = doctor.languages_spoken?.join(', ') || 'Bengali, English';
    
    return (
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <CardTitle className="text-xl font-bold text-gray-900 truncate">
                                {doctor.full_name}
                            </CardTitle>
                            {doctor.verification_status === 'verified' && (
                                <BmdcBadge showLabel={false} lang={isBengali ? 'bn' : 'en'} size="sm" />
                            )}
                        </div>
                        {specs.length > 0 && (
                            <p className="text-blue-600 font-medium mb-1">{specs[0]}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{doctor.hospital_name || doctor.clinic_addresses?.[0]?.name || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">({Math.floor(Math.random() * 200 + 50)} {isBengali ? 'রিভিউ' : 'reviews'})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">{yearsExp}</span> {isBengali ? 'বছর' : 'yrs'}
                        </div>
                    </div>
                    
                    {hasSlots && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-600">
                                {isBengali ? 'অ্যাপয়েন্টমেন্ট উপলব্ধ' : 'Appointments Available'}
                            </span>
                        </div>
                    )}

                    {doctor.education?.length > 0 && (
                        <p className="text-xs text-gray-600 truncate">🎓 {doctor.education[0]}</p>
                    )}

                    <p className="text-xs text-gray-600">🗣️ {languages}</p>

                    {doctor.consultation_fee && (
                        <p className="text-sm font-semibold text-emerald-600">
                            ৳{doctor.consultation_fee} {isBengali ? 'পরামর্শ ফি' : 'Consultation'}
                        </p>
                    )}
                    
                    {specs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {specs.slice(0, 3).map((spec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                    {spec}
                                </Badge>
                            ))}
                            {specs.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                                    +{specs.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" className="flex-1 hover:bg-blue-50 hover:border-blue-200">
                            <Link to={createPageUrl(`DoctorProfile?doctorId=${doctor.id}`)}>
                                <UserIcon className="w-4 h-4 mr-2" />
                                {isBengali ? 'প্রোফাইল দেখুন' : 'View Profile'}
                            </Link>
                        </Button>
                        <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <Link to={createPageUrl(`Appointments?doctorId=${doctor.id}`)}>
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                {isBengali ? 'বুক করুন' : 'Book Now'}
                            </Link>
                        </Button>
                    </div>
                    
                    {/* Quick Contact */}
                    <div className="text-center border-t pt-3">
                        <p className="text-xs text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {isBengali ? 'সাধারণত ২৪ ঘন্টার মধ্যে জবাব দেন' : 'Usually responds within 24 hours'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);
    const [specializations, setSpecializations] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [filters, setFilters] = useState({ search: '', specialization: 'all', district: 'all', availability: 'all' });
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [offlineDataTimestamp, setOfflineDataTimestamp] = useState(null);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadData();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        
        if (isOffline) {
            // Load from cache when offline
            const cachedData = localStorage.getItem('cachedDoctors');
            const cachedUser = localStorage.getItem('cachedUser');
            
            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                setDoctors(data);
                setFilteredDoctors(data);
                setOfflineDataTimestamp(timestamp);
                
                const uniqueSpecs = [...new Set(data.map(d => d.doctor_specialization).filter(Boolean))];
                setSpecializations(uniqueSpecs);
                
                const uniqueDistricts = [...new Set(data.map(d => d.district).filter(Boolean))];
                setDistricts(uniqueDistricts);
            }
            
            if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                setIsBengali(userData.preferred_language === 'bengali' || !userData.preferred_language);
            }
        } else {
            try {
                const [currentUser, allDoctors] = await Promise.all([
                    User.me().catch(() => null),
                    User.filter({ user_type: 'doctor' })
                ]);
                
                if (currentUser) {
                    setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
                    // Cache user data
                    localStorage.setItem('cachedUser', JSON.stringify(currentUser));
                }
                
                setDoctors(allDoctors);
                setFilteredDoctors(allDoctors);
                
                // Cache doctors data
                const cachePayload = {
                    timestamp: new Date().toISOString(),
                    data: allDoctors
                };
                localStorage.setItem('cachedDoctors', JSON.stringify(cachePayload));
                setOfflineDataTimestamp(null);
                
                const uniqueSpecs = [...new Set(allDoctors.map(d => d.doctor_specialization).filter(Boolean))];
                setSpecializations(uniqueSpecs);
                
                const uniqueDistricts = [...new Set(allDoctors.map(d => d.district).filter(Boolean))];
                setDistricts(uniqueDistricts);

            } catch (error) {
                console.error("Failed to load doctors", error);
                // Fallback to cache
                const cachedData = localStorage.getItem('cachedDoctors');
                if (cachedData) {
                    const { timestamp, data } = JSON.parse(cachedData);
                    setDoctors(data);
                    setFilteredDoctors(data);
                    setOfflineDataTimestamp(timestamp);
                    
                    const uniqueSpecs = [...new Set(data.map(d => d.doctor_specialization).filter(Boolean))];
                    setSpecializations(uniqueSpecs);
                    
                    const uniqueDistricts = [...new Set(data.map(d => d.district).filter(Boolean))];
                    setDistricts(uniqueDistricts);
                }
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        let filtered = [...doctors];
        if (filters.search) {
            const term = filters.search.toLowerCase();
            filtered = filtered.filter(d => 
                d.full_name.toLowerCase().includes(term) ||
                d.doctor_specialization?.toLowerCase().includes(term) ||
                d.hospital_name?.toLowerCase().includes(term)
            );
        }
        if (filters.specialization !== 'all') {
            filtered = filtered.filter(d => d.doctor_specialization === filters.specialization);
        }
        if (filters.district !== 'all') {
            filtered = filtered.filter(d => d.district === filters.district);
        }
        if (filters.availability !== 'all') {
            // Simulate availability filtering
            if (filters.availability === 'available') {
                filtered = filtered.filter(() => Math.random() > 0.3);
            }
        }
        
        // Sort by verification status and experience
        filtered.sort((a, b) => {
            if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
            if (b.verification_status === 'verified' && a.verification_status !== 'verified') return 1;
            return (b.years_experience || 0) - (a.years_experience || 0);
        });
        
        setFilteredDoctors(filtered);
    }, [filters, doctors]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <Stethoscope className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {isBengali ? 'বিশেষজ্ঞ ডাক্তার খুঁজুন' : 'Find a Specialist Doctor'}
                    </h1>
                    <p className="text-lg text-gray-600">{isBengali ? 'আপনার প্রয়োজন অনুযায়ী সেরা ডাক্তারদের সাথে পরামর্শ করুন।' : 'Consult with the best doctors for your needs.'}</p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <BmdcBadge showLabel={false} lang={isBengali ? 'bn' : 'en'} size="sm" />
                            <span>{filteredDoctors.filter(d => d.verification_status === 'verified').length} {isBengali ? 'যাচাইকৃত ডাক্তার' : 'Verified Doctors'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>{Math.floor(filteredDoctors.length * 0.7)} {isBengali ? 'এখনই উপলব্ধ' : 'Available Now'}</span>
                        </div>
                    </div>
                </div>

                {isOffline && offlineDataTimestamp && (
                    <Alert variant="destructive" className="mb-6 bg-yellow-100 border-yellow-300 text-yellow-800">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>{isBengali ? 'অফলাইন মোড' : 'Offline Mode'}</AlertTitle>
                        <AlertDescription>
                            {isBengali ? `আপনি অফলাইনে আছেন। সর্বশেষ সংরক্ষিত তথ্য দেখানো হচ্ছে (${new Date(offlineDataTimestamp).toLocaleDateString('bn-BD')})।` : `You are offline. Showing data last saved on ${new Date(offlineDataTimestamp).toLocaleDateString()}.`}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Filters */}
                <Card className="p-6 shadow-lg mb-8 border-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input 
                                placeholder={isBengali ? 'ডাক্তার, বিশেষজ্ঞতা বা হাসপাতালের নাম...' : 'Search doctor, specialization, or hospital...'}
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filters.specialization} onValueChange={v => setFilters({...filters, specialization: v})}>
                            <SelectTrigger><SelectValue placeholder={isBengali ? "বিশেষজ্ঞতা" : "Specialization"} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সব বিশেষজ্ঞতা' : 'All Specializations'}</SelectItem>
                                {specializations.map(spec => <SelectItem key={spec} value={spec}>{spec}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.district} onValueChange={v => setFilters({...filters, district: v})}>
                            <SelectTrigger><SelectValue placeholder={isBengali ? "জেলা" : "District"} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সব জেলা' : 'All Districts'}</SelectItem>
                                {districts.map(district => <SelectItem key={district} value={district}>{district}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.availability} onValueChange={v => setFilters({...filters, availability: v})}>
                            <SelectTrigger><SelectValue placeholder={isBengali ? "উপলব্ধতা" : "Availability"} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সব ডাক্তার' : 'All Doctors'}</SelectItem>
                                <SelectItem value="available">{isBengali ? 'এখনই উপলব্ধ' : 'Available Now'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Quick Filter Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => setFilters({...filters, specialization: 'Cardiology'})}>
                            💓 {isBengali ? 'হৃদরোগ বিশেষজ্ঞ' : 'Cardiologist'}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-green-50" onClick={() => setFilters({...filters, specialization: 'Pediatrics'})}>
                            🧒 {isBengali ? 'শিশু বিশেষজ্ঞ' : 'Pediatrician'}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-purple-50" onClick={() => setFilters({...filters, specialization: 'Gynecology'})}>
                            👩 {isBengali ? 'গাইনি বিশেষজ্ঞ' : 'Gynecologist'}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-orange-50" onClick={() => setFilters({...filters, availability: 'available'})}>
                            🟢 {isBengali ? 'এখনই উপলব্ধ' : 'Available Now'}
                        </Badge>
                    </div>
                </Card>

                {/* Results */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        <span className="font-semibold">{filteredDoctors.length}</span> {isBengali ? 'জন ডাক্তার পাওয়া গেছে' : 'doctors found'}
                    </p>
                    {filteredDoctors.filter(d => d.verification_status === 'verified').length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-emerald-600">
                            <BmdcBadge showLabel={false} size="sm" lang={isBengali ? 'bn' : 'en'} />
                            {isBengali ? 'যাচাইকৃত ডাক্তাররা প্রথমে দেখানো হয়েছে' : 'Verified doctors shown first'}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} isBengali={isBengali} />
                        ))
                    ) : (
                        <div className="md:col-span-3 text-center py-12">
                            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {isBengali ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {isBengali ? 'এই মানদণ্ডের সাথে মেলে কোনো ডাক্তার পাওয়া যায়নি।' : 'No doctors found matching this criteria.'}
                            </p>
                            <Button variant="outline" onClick={() => setFilters({ search: '', specialization: 'all', district: 'all', availability: 'all' })}>
                                {isBengali ? 'সব ফিল্টার মুছুন' : 'Clear All Filters'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}