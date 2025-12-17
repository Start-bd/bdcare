import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pill, AlertTriangle, CheckCircle, Brain, Plus, X, Loader2 } from 'lucide-react';

export default function DrugInteractionCheckerPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [medications, setMedications] = useState([]);
    const [currentMed, setCurrentMed] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
                if (currentUser.medications && currentUser.medications.length > 0) {
                    setMedications(currentUser.medications);
                }
            } catch (e) { /* Not logged in */ }
        };
        loadUser();
    }, []);

    const addMedication = () => {
        if (currentMed && !medications.includes(currentMed)) {
            setMedications([...medications, currentMed]);
            setCurrentMed('');
        }
    };

    const removeMedication = (medToRemove) => {
        setMedications(medications.filter(med => med !== medToRemove));
    };

    const analyzeInteractions = async () => {
        if (medications.length < 2) {
            alert(isBengali ? "অনুগ্রহ করে কমপক্ষে ২টি ঔষধ যোগ করুন।" : "Please add at least 2 medications.");
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);

        const prompt = `As an expert clinical pharmacologist, analyze the following list of medications for potential drug-drug interactions: ${medications.join(', ')}.
        
        Provide a detailed report in the following JSON format. If there are no interactions, return an empty array for "interactions".
        {
          "summary": "A brief, one-sentence summary of the findings in ${isBengali ? 'Bengali' : 'English'}.",
          "interactions": [
            {
              "medications_involved": ["Drug A", "Drug B"],
              "severity": "Major|Moderate|Minor|Unknown",
              "description": "A clear, easy-to-understand explanation of the interaction in ${isBengali ? 'Bengali' : 'English'}.",
              "recommendation": "Actionable advice for the patient, like 'Consult your doctor' or 'Monitor for these symptoms', in ${isBengali ? 'Bengali' : 'English'}."
            }
          ],
          "disclaimer": "A standard medical disclaimer in ${isBengali ? 'Bengali' : 'English'} stating this is not a substitute for professional medical advice."
        }`;

        try {
            const result = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        interactions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    medications_involved: { type: "array", items: { type: "string" } },
                                    severity: { type: "string" },
                                    description: { type: "string" },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        disclaimer: { type: "string" }
                    }
                }
            });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Interaction analysis failed:", error);
            setAnalysisResult({ error: isBengali ? "বিশ্লেষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Analysis failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity.toLowerCase()) {
            case 'major': return <Badge variant="destructive">{isBengali ? 'গুরুতর' : 'Major'}</Badge>;
            case 'moderate': return <Badge className="bg-orange-500 text-white">{isBengali ? 'মাঝারি' : 'Moderate'}</Badge>;
            case 'minor': return <Badge className="bg-yellow-500 text-white">{isBengali ? 'সামান্য' : 'Minor'}</Badge>;
            default: return <Badge variant="secondary">{isBengali ? 'অজানা' : 'Unknown'}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Pill className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{isBengali ? 'ঔষধের মিথস্ক্রিয়া পরীক্ষক' : 'Drug Interaction Checker'}</CardTitle>
                                <CardDescription>{isBengali ? 'নিরাপদে ঔষধ সেবন করুন। সম্ভাব্য মিথস্ক্রিয়া পরীক্ষা করুন।' : 'Use medications safely. Check for potential interactions.'}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="text-sm font-medium">{isBengali ? 'ঔষধ যোগ করুন' : 'Add Medication'}</label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={currentMed}
                                    onChange={(e) => setCurrentMed(e.target.value)}
                                    placeholder={isBengali ? 'ঔষধের নাম (যেমন, Napa)' : 'Medication name (e.g., Aspirin)'}
                                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                                />
                                <Button onClick={addMedication}>
                                    <Plus className="w-4 h-4 mr-1" /> {isBengali ? 'যোগ' : 'Add'}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{isBengali ? 'আপনার ঔষধের তালিকা' : 'Your Medication List'}</label>
                            <div className="flex flex-wrap gap-2 p-4 min-h-[80px] bg-gray-50 rounded-lg border">
                                {medications.length === 0 ? (
                                    <p className="text-gray-500 text-sm">{isBengali ? 'পরীক্ষা করতে ঔষধ যোগ করুন...' : 'Add medications to check...'}</p>
                                ) : (
                                    medications.map(med => (
                                        <Badge key={med} className="text-lg py-1 px-3">
                                            {med}
                                            <button onClick={() => removeMedication(med)} className="ml-2">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={analyzeInteractions}
                            disabled={medications.length < 2 || isLoading}
                            size="lg"
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Brain className="w-5 h-5 mr-2" />
                            )}
                            {isBengali ? 'মিথস্ক্রিয়া বিশ্লেষণ করুন' : 'Analyze Interactions'}
                        </Button>
                    </CardContent>
                </Card>

                {analysisResult && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>{isBengali ? 'বিশ্লেষণ ফলাফল' : 'Analysis Result'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant={analysisResult.interactions?.length > 0 ? "destructive" : "default"} className={analysisResult.interactions?.length === 0 ? "bg-green-50 border-green-200" : ""}>
                                {analysisResult.interactions?.length > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                <AlertTitle>{analysisResult.summary}</AlertTitle>
                            </Alert>

                            {analysisResult.interactions && analysisResult.interactions.map((interaction, index) => (
                                <div key={index} className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold">{interaction.medications_involved.join(' + ')}</h4>
                                        {getSeverityBadge(interaction.severity)}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2"><strong className="font-medium">{isBengali ? 'বর্ণনা:' : 'Description:'}</strong> {interaction.description}</p>
                                    <p className="text-sm text-gray-600 mt-1"><strong className="font-medium">{isBengali ? 'সুপারিশ:' : 'Recommendation:'}</strong> {interaction.recommendation}</p>
                                </div>
                            ))}

                            {analysisResult.disclaimer && (
                                <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs text-yellow-800">{analysisResult.disclaimer}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}