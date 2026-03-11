import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Pill, Loader2, Shield, Share2, TrendingUp } from 'lucide-react';
import UploadMedicalRecord from '../components/medical/UploadMedicalRecord';
import MedicalRecordsList from '../components/medical/MedicalRecordsList';
import MedicationReminders from '../components/medical/MedicationReminders';
import SharedRecordsManager from '../components/medical/SharedRecordsManager';

export default function MedicalRecordsPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [recordStats, setRecordStats] = useState({ total: 0, shared: 0, medications: 0 });

    useEffect(() => { loadUser(); }, []);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            loadStats(currentUser.id);
        } catch (error) {}
        setIsLoading(false);
    };

    const loadStats = async (userId) => {
        try {
            const [records, meds] = await Promise.all([
                base44.entities.MedicalRecord.filter({ user_id: userId }, '-record_date', 200),
                base44.entities.MedicationReminder.filter({ user_id: userId, is_active: true }, '-created_date', 50)
            ]);
            const sharedCount = records.filter(r => r.shared_with_doctors && r.shared_with_doctors.length > 0).length;
            setRecordStats({ total: records.length, shared: sharedCount, medications: meds.length });
        } catch (e) {}
    };

    const handleUploadSuccess = () => {
        setShowUpload(false);
        setRefreshTrigger(prev => prev + 1);
        if (user) loadStats(user.id);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-emerald-50">
                <Card className="max-w-md w-full shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-8 h-8 text-emerald-600" />
                        </div>
                        <CardTitle className="text-xl">
                            {isBengali ? '🔐 লগইন প্রয়োজন' : '🔐 Login Required'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            {isBengali
                                ? 'আপনার মেডিকেল রেকর্ড দেখতে অনুগ্রহ করে লগইন করুন।'
                                : 'Please login to view and manage your secure medical records.'}
                        </p>
                        <Button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {isBengali ? 'লগইন করুন' : 'Login'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isBengali ? '📋 মেডিকেল রেকর্ড' : '📋 Medical Records'}
                        </h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            {isBengali ? 'সুরক্ষিত ও গোপনীয় — শুধুমাত্র আপনি এবং আপনার অনুমোদিত ডাক্তার দেখতে পারবেন' : 'Secure & private — only you and your authorized doctors can view these'}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowUpload(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {isBengali ? 'রেকর্ড আপলোড করুন' : 'Upload Record'}
                    </Button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white border-l-4 border-l-emerald-500">
                        <CardContent className="p-4 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{recordStats.total}</div>
                                <div className="text-xs text-gray-500">{isBengali ? 'মোট রেকর্ড' : 'Total Records'}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Share2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{recordStats.shared}</div>
                                <div className="text-xs text-gray-500">{isBengali ? 'ডাক্তারের সাথে শেয়ার' : 'Shared with Doctors'}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-purple-500">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Pill className="w-8 h-8 text-purple-500 flex-shrink-0" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{recordStats.medications}</div>
                                <div className="text-xs text-gray-500">{isBengali ? 'সক্রিয় ঔষধ' : 'Active Medications'}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="records" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg bg-white shadow-sm">
                        <TabsTrigger value="records" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {isBengali ? 'রেকর্ড' : 'Records'}
                        </TabsTrigger>
                        <TabsTrigger value="shared" className="flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            {isBengali ? 'শেয়ার' : 'Shared'}
                        </TabsTrigger>
                        <TabsTrigger value="medications" className="flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            {isBengali ? 'ঔষধ' : 'Medications'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="records">
                        <MedicalRecordsList
                            userId={user.id}
                            isBengali={isBengali}
                            refreshTrigger={refreshTrigger}
                            onRecordChanged={() => loadStats(user.id)}
                        />
                    </TabsContent>

                    <TabsContent value="shared">
                        <SharedRecordsManager
                            userId={user.id}
                            isBengali={isBengali}
                            refreshTrigger={refreshTrigger}
                        />
                    </TabsContent>

                    <TabsContent value="medications">
                        <MedicationReminders
                            userId={user.id}
                            isBengali={isBengali}
                            refreshTrigger={refreshTrigger}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {showUpload && (
                <UploadMedicalRecord
                    userId={user.id}
                    isBengali={isBengali}
                    onClose={() => setShowUpload(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
}