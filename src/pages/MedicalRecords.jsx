import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Pill, Loader2 } from 'lucide-react';
import UploadMedicalRecord from '../components/medical/UploadMedicalRecord';
import MedicalRecordsList from '../components/medical/MedicalRecordsList';
import MedicationReminders from '../components/medical/MedicationReminders';

export default function MedicalRecordsPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
        } catch (error) {
            // Not logged in
        }
        setIsLoading(false);
    };

    const handleUploadSuccess = () => {
        setShowUpload(false);
        setRefreshTrigger(prev => prev + 1);
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
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isBengali ? '🔐 লগইন প্রয়োজন' : '🔐 Login Required'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            {isBengali 
                                ? 'আপনার মেডিকেল রেকর্ড দেখতে অনুগ্রহ করে লগইন করুন।'
                                : 'Please login to view your medical records.'}
                        </p>
                        <Button 
                            onClick={() => base44.auth.redirectToLogin()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isBengali ? 'লগইন করুন' : 'Login'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isBengali ? '📋 মেডিকেল রেকর্ড' : '📋 Medical Records'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isBengali 
                                ? 'AI দিয়ে আপনার স্বাস্থ্য রেকর্ড ম্যানেজ করুন'
                                : 'Manage your health records with AI'}
                        </p>
                    </div>
                    <Button 
                        onClick={() => setShowUpload(true)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {isBengali ? 'আপলোড করুন' : 'Upload'}
                    </Button>
                </div>

                <Tabs defaultValue="records" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="records" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {isBengali ? 'রেকর্ডসমূহ' : 'Records'}
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

                {showUpload && (
                    <UploadMedicalRecord
                        userId={user.id}
                        isBengali={isBengali}
                        onClose={() => setShowUpload(false)}
                        onSuccess={handleUploadSuccess}
                    />
                )}
            </div>
        </div>
    );
}