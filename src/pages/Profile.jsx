import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User as UserIcon, LogIn, Shield, Edit, Save, Loader2, X, WifiOff, Stethoscope } from 'lucide-react';
import DoctorProfileEditor from '../components/doctor/DoctorProfileEditor';
import DoctorReviews from '../components/doctor/DoctorReviews';
import DoctorClinicLocations from '../components/doctor/DoctorClinicLocations';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isBengali, setIsBengali] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [offlineDataTimestamp, setOfflineDataTimestamp] = useState(null);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadUser();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadUser = async () => {
        setIsLoading(true);
        
        if (isOffline) {
            // Load from cache when offline
            const cachedUser = localStorage.getItem('cachedUserProfile');
            if (cachedUser) {
                const { timestamp, data } = JSON.parse(cachedUser);
                setUser(data);
                setFormData(data);
                setOfflineDataTimestamp(timestamp);
                setIsBengali(data.preferred_language === 'bengali' || !data.preferred_language);
            }
        } else {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
                
                // Cache user profile data
                const cachePayload = {
                    timestamp: new Date().toISOString(),
                    data: currentUser
                };
                localStorage.setItem('cachedUserProfile', JSON.stringify(cachePayload));
                setOfflineDataTimestamp(null);
                
            } catch (error) {
                // Not logged in or error - try cache
                const cachedUser = localStorage.getItem('cachedUserProfile');
                if (cachedUser) {
                    const { timestamp, data } = JSON.parse(cachedUser);
                    setUser(data);
                    setFormData(data);
                    setOfflineDataTimestamp(timestamp);
                    setIsBengali(data.preferred_language === 'bengali' || !data.preferred_language);
                } else {
                    setUser(null);
                }
            }
        }
        setIsLoading(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (isOffline) {
            alert(isBengali ? 'অফলাইনে প্রোফাইল আপডেট করা যাবে না। ইন্টারনেট সংযোগ চেক করুন।' : 'Cannot update profile while offline. Please check your internet connection.');
            return;
        }

        setIsSaving(true);
        try {
            await User.updateMyUserData(formData);
            await loadUser(); // Reload fresh data
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile", error);
            alert(isBengali ? 'প্রোফাইল সংরক্ষণ করতে ব্যর্থ।' : 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
                <Card className="max-w-md w-full text-center shadow-2xl border-0">
                    <CardHeader>
                        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {isBengali ? 'স্বাস্থ্য এজেন্ট এ স্বাগতম' : 'Welcome to Health Agent'}
                        </CardTitle>
                        <p className="text-gray-600">
                            {isBengali ? 'আপনার প্রোফাইল দেখতে বা তৈরি করতে লগইন করুন।' : 'Login to view or create your profile.'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => User.login()}>
                            <LogIn className="w-5 h-5 mr-2" />
                            {isBengali ? 'লগইন / নিবন্ধন করুন' : 'Login / Register'}
                        </Button>
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>{isBengali ? 'আপনার তথ্য সুরক্ষিত' : 'Your Information is Secure'}</AlertTitle>
                            <AlertDescription>
                                {isBengali ? 'আমরা আপনার গোপনীয়তাকে সম্মান করি।' : 'We value your privacy and data security.'}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const ProfileField = ({ labelBn, labelEn, value, field, children }) => (
        <div className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-gray-600 font-medium">{isBengali ? labelBn : labelEn}</Label>
            <div className="col-span-2">
                {isEditing ? (
                    children
                ) : (
                    <p className="text-gray-800">{value || (isBengali ? 'প্রযোজ্য নয়' : 'N/A')}</p>
                )}
            </div>
        </div>
    );

    const isDoctor = user.user_type === 'doctor' || user.role === 'doctor';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {isOffline && offlineDataTimestamp && (
                    <Alert variant="destructive" className="mb-6 bg-yellow-100 border-yellow-300 text-yellow-800">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>{isBengali ? 'অফলাইন মোড' : 'Offline Mode'}</AlertTitle>
                        <AlertDescription>
                            {isBengali ? `আপনি অফলাইনে আছেন। প্রোফাইল আপডেট করতে ইন্টারনেট প্রয়োজন। সর্বশেষ তথ্য: ${new Date(offlineDataTimestamp).toLocaleDateString('bn-BD')}` : `You are offline. Internet required to update profile. Last updated: ${new Date(offlineDataTimestamp).toLocaleDateString()}`}
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/50">
                                    <UserIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                                    <p className="text-emerald-100">{user.email}</p>
                                </div>
                            </div>
                            <Button 
                                variant={isEditing ? "secondary" : "outline"} 
                                onClick={() => setIsEditing(!isEditing)} 
                                className={isEditing ? "" : "bg-transparent border-white text-white hover:bg-white/10"}
                                disabled={isOffline && !isEditing} // Allow cancel while offline
                            >
                                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                                {isEditing ? (isBengali ? 'বাতিল' : 'Cancel') : (isBengali ? 'সম্পাদনা' : 'Edit')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <CardTitle>{isBengali ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</CardTitle>
                        <div className="space-y-4">
                             <ProfileField labelBn="সম্পূর্ণ নাম" labelEn="Full Name" value={formData.full_name} field="full_name">
                                <Input value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} />
                            </ProfileField>
                            <ProfileField labelBn="ফোন নম্বর" labelEn="Phone" value={formData.phone} field="phone">
                                <Input value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                            </ProfileField>
                            <ProfileField labelBn="ঠিকানা" labelEn="Address" value={formData.address} field="address">
                                <Input value={formData.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
                            </ProfileField>
                            <ProfileField labelBn="রক্তের গ্রুপ" labelEn="Blood Group" value={formData.blood_group} field="blood_group">
                                <Select onValueChange={(v) => handleInputChange('blood_group', v)} defaultValue={formData.blood_group}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </ProfileField>
                             <ProfileField labelBn="পছন্দের ভাষা" labelEn="Preferred Language" value={formData.preferred_language} field="preferred_language">
                                <Select onValueChange={(v) => handleInputChange('preferred_language', v)} defaultValue={formData.preferred_language}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bengali">বাংলা</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </ProfileField>
                        </div>

                        <CardTitle>{isBengali ? 'জরুরি যোগাযোগ' : 'Emergency Contact'}</CardTitle>
                        <div className="space-y-4">
                           <ProfileField labelBn="নাম" labelEn="Name" value={formData.emergency_contact_name} field="emergency_contact_name">
                                <Input value={formData.emergency_contact_name || ''} onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)} />
                            </ProfileField>
                           <ProfileField labelBn="ফোন" labelEn="Phone" value={formData.emergency_contact_phone} field="emergency_contact_phone">
                                <Input value={formData.emergency_contact_phone || ''} onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)} />
                            </ProfileField>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleSave} disabled={isSaving || isOffline}>
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isBengali ? 'সংরক্ষণ করুন' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                        </CardContent>
                        </Card>

                        {isDoctor && (
                        <Card className="shadow-xl border-0 mt-6">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <Stethoscope className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">{isBengali ? 'ডাক্তার প্রোফাইল' : 'Doctor Profile'}</h2>
                                    <p className="text-blue-100 text-sm">{isBengali ? 'আপনার পেশাগত তথ্য পরিচালনা করুন' : 'Manage your professional information'}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DoctorProfileEditor 
                                user={user} 
                                isBengali={isBengali}
                                onUpdate={loadUser}
                            />
                        </CardContent>
                        </Card>
                        )}

                        {/* Clinic Locations - shown on doctor's own profile */}
                        {isDoctor && (
                            <DoctorClinicLocations 
                                doctor={user}
                                isBengali={isBengali}
                            />
                        )}

                        {/* Doctor Reviews - shown on doctor's profile */}
                        {isDoctor && (
                            <DoctorReviews 
                                doctorId={user.id}
                                isBengali={isBengali}
                                currentUser={user}
                            />
                        )}
                        </div>
                        </div>
                        );
                        }