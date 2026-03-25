import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BarChart2, ShieldAlert } from 'lucide-react';
import DiseaseMonitoring from '../components/analytics/DiseaseMonitoring';
import HealthInsights from '../components/analytics/HealthInsights';

export default function AnalyticsPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            } catch (e) {
                // Not logged in, default to Bengali
            }
            setIsLoading(false);
        };
        loadUser();
    }, []);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Card className="mb-8 border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BarChart2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {isBengali ? 'হেলথ অ্যানালিটিক্স' : 'Health Analytics'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'বাংলাদেশের স্বাস্থ্য প্রবণতা এবং রোগের প্রাদুর্ভাব নিরীক্ষণ করুন।' : 'Monitor health trends and disease outbreaks in Bangladesh.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="outbreaks" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="outbreaks">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            {isBengali ? 'রোগের প্রাদুর্ভাব' : 'Disease Outbreaks'}
                        </TabsTrigger>
                        <TabsTrigger value="trends">
                            <BarChart2 className="w-4 h-4 mr-2" />
                            {isBengali ? 'স্বাস্থ্য প্রবণতা' : 'Health Trends'}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="outbreaks" className="mt-6">
                        <DiseaseMonitoring isBengali={isBengali} />
                    </TabsContent>
                    <TabsContent value="trends" className="mt-6">
                        <HealthInsights isBengali={isBengali} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}