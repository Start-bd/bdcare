import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Heart, RefreshCw, Loader2, WifiOff } from 'lucide-react';

export default function PersonalizedHealthInsights({ user: propUser, isBengali }) {
    const [user, setUser] = useState(propUser);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [cachedInsightsTimestamp, setCachedInsightsTimestamp] = useState(null);

    const generateInsights = useCallback(async (currentUser) => {
        if (!currentUser) {
            setInsights([isBengali ? "লগইন করে ব্যক্তিগত টিপস পান।" : "Login to get personalized tips."]);
            setIsLoading(false);
            return;
        }

        const userProfile = `
        - Age: ${currentUser.date_of_birth ? new Date().getFullYear() - new Date(currentUser.date_of_birth).getFullYear() : 'N/A'}
        - Gender: ${currentUser.gender || 'N/A'}
        - Conditions: ${currentUser.medical_conditions?.join(', ') || 'None'}
        - Medications: ${currentUser.medications?.join(', ') || 'None'}
        - Lifestyle: Smoking(${currentUser.lifestyle_habits?.smoking || 'N/A'}), Exercise(${currentUser.lifestyle_habits?.exercise_frequency || 'N/A'})
        `;

        const prompt = `As a friendly AI health coach for a user in Bangladesh, generate 3 personalized, actionable health tips for today.
        User Profile:
        ${userProfile}
        
        Rules:
        - Tips must be highly relevant to the user's profile.
        - Tips must be simple and easy to follow.
        - Respond in ${isBengali ? 'Bengali' : 'English'}.
        - Provide the response in a JSON object with a key "tips" which is an array of strings.
        
        Example for a user with Diabetes: "Remember to check your blood sugar before lunch."
        Example for an active user: "Great job with your exercise routine! Try incorporating some stretching today."
        `;

        try {
            const result = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        tips: { type: "array", items: { type: "string" } }
                    }
                }
            });
            
            setInsights(result.tips);
            setCachedInsightsTimestamp(null);
            
            // Cache the insights
            const cachePayload = {
                timestamp: new Date().toISOString(),
                data: result.tips
            };
            localStorage.setItem('cachedHealthInsights', JSON.stringify(cachePayload));
            
        } catch (error) {
            console.error("Failed to generate insights:", error);
            // Try to load cached insights on error
            const cachedInsights = localStorage.getItem('cachedHealthInsights');
            if (cachedInsights) {
                const { timestamp, data } = JSON.parse(cachedInsights);
                setInsights(data);
                setCachedInsightsTimestamp(timestamp);
            } else {
                setInsights([isBengali ? "আজকের জন্য টিপস লোড করা যায়নি।" : "Could not load tips for today."]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isBengali]);
    
    const loadUserDataAndGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        
        if (isOffline) {
            // Load cached insights when offline
            const cachedUser = localStorage.getItem('cachedUser');
            const cachedInsights = localStorage.getItem('cachedHealthInsights');
            
            if (cachedUser) {
                setUser(JSON.parse(cachedUser));
            }
            
            if (cachedInsights) {
                const { timestamp, data } = JSON.parse(cachedInsights);
                setInsights(data);
                setCachedInsightsTimestamp(timestamp);
            } else {
                setInsights([isBengali ? "অফলাইনে নতুন টিপস তৈরি করা যাবে না।" : "Cannot generate new tips while offline."]);
            }
        } else {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                localStorage.setItem('cachedUser', JSON.stringify(currentUser));
                await generateInsights(currentUser);
            } catch (e) {
                // Not logged in or error - try cached insights
                const cachedInsights = localStorage.getItem('cachedHealthInsights');
                if (cachedInsights) {
                    const { timestamp, data } = JSON.parse(cachedInsights);
                    setInsights(data);
                    setCachedInsightsTimestamp(timestamp);
                } else {
                    setInsights([isBengali ? "লগইন করে ব্যক্তিগত টিপস পান।" : "Login to get personalized tips."]);
                }
            }
        }
        setIsLoading(false);
    }, [isOffline, isBengali, generateInsights]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (propUser) {
            setUser(propUser);
            generateInsights(propUser);
        } else {
            loadUserDataAndGenerateInsights();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [propUser, generateInsights, loadUserDataAndGenerateInsights]);

    const handleRefresh = () => {
        if (isOffline) {
            alert(isBengali ? 'নতুন টিপস পেতে ইন্টারনেট সংযোগ প্রয়োজন।' : 'Internet connection required for new tips.');
            return;
        }
        setIsLoading(true);
        generateInsights(user);
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lightbulb className="w-6 h-6 text-yellow-300" />
                            <CardTitle>{isBengali ? 'আপনার জন্য স্বাস্থ্য টিপস' : 'Personalized Health Insights'}</CardTitle>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRefresh} 
                            disabled={isLoading || isOffline} 
                            className="text-white hover:bg-white/20"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isOffline && cachedInsightsTimestamp && (
                            <Alert className="mb-4 bg-yellow-100/10 border-yellow-300/30 text-yellow-100">
                                <WifiOff className="h-4 w-4" />
                                <AlertDescription>
                                    {isBengali ? `অফলাইন - সর্বশেষ টিপস: ${new Date(cachedInsightsTimestamp).toLocaleDateString('bn-BD')}` : `Offline - Last tips: ${new Date(cachedInsightsTimestamp).toLocaleDateString()}`}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                <p>{isBengali ? 'আপনার জন্য টিপস তৈরি করা হচ্ছে...' : 'Generating tips for you...'}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {insights && insights.map((tip, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                                        <div className="w-8 h-8 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                                            <Heart className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}