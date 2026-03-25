import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Camera, 
  AlertTriangle, 
  Shield,
  Loader2,
  Eye,
  Activity
} from 'lucide-react';

export default function SkinCheckerPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            } catch (e) { /* Not logged in */ }
        };
        loadUser();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const analyzeSkin = async () => {
        if (!file) {
            alert(isBengali ? "অনুগ্রহ করে চর্মের ছবি আপলোড করুন।" : "Please upload a skin image.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        const prompt = `You are a specialized AI health assistant with expertise in dermatology for Bangladesh. Analyze the provided image of a skin condition.
        
        IMPORTANT SAFETY RULES:
        1. You ARE NOT a medical doctor and this is NOT a diagnosis
        2. This is for educational and preliminary information only
        3. Always emphasize the need for professional medical consultation
        4. Consider common skin conditions in Bangladesh's tropical climate
        
        Analyze the skin condition and provide response in ${isBengali ? 'Bengali' : 'English'} in this JSON format:
        {
          "possible_issue": "A general description of what this might be (e.g., 'Possible Fungal Infection', 'Suspected Allergic Reaction', 'Possible Insect Bite')",
          "confidence": "Low|Medium|High",
          "description": "Simple explanation of what this condition typically is and common causes in Bangladesh context",
          "urgency": {
            "level": "Monitor|See Doctor Soon|Urgent",
            "reason": "Clear explanation for urgency level"
          },
          "common_causes": [
            "Possible cause 1 (consider Bangladesh climate/environment)",
            "Possible cause 2",
            "Possible cause 3"
          ],
          "basic_tips": [
            "Safe, general care tip (e.g., 'Keep the area clean and dry')",
            "Another safe tip (e.g., 'Avoid scratching')",
            "Third tip (e.g., 'Wear loose cotton clothing')"
          ],
          "when_to_see_doctor": "Clear guidance on when professional help is needed",
          "disclaimer": "This is AI analysis for educational purposes only, not medical diagnosis. Always consult a dermatologist for proper diagnosis and treatment."
        }
        
        Focus on common skin issues in Bangladesh: fungal infections, heat rash, insect bites, allergic reactions, bacterial infections, etc.`;

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const analysisResult = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        possible_issue: { type: "string" },
                        confidence: { type: "string" },
                        description: { type: "string" },
                        urgency: {
                            type: "object",
                            properties: {
                                level: { type: "string" },
                                reason: { type: "string" }
                            }
                        },
                        common_causes: { type: "array", items: { type: "string" } },
                        basic_tips: { type: "array", items: { type: "string" } },
                        when_to_see_doctor: { type: "string" },
                        disclaimer: { type: "string" }
                    }
                }
            });
            setResult(analysisResult);
        } catch (error) {
            console.error("Skin analysis failed:", error);
            setResult({ 
                error: isBengali ? "বিশ্লেষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Analysis failed. Please try again." 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getUrgencyBadge = (level) => {
        switch (level) {
            case 'Urgent': return <Badge variant="destructive">🚨 {isBengali ? 'জরুরি' : 'Urgent'}</Badge>;
            case 'See Doctor Soon': return <Badge className="bg-orange-500 text-white">🩺 {isBengali ? 'ডাক্তার দেখান' : 'See Doctor Soon'}</Badge>;
            case 'Monitor': return <Badge className="bg-blue-500 text-white">👁️ {isBengali ? 'নজরে রাখুন' : 'Monitor'}</Badge>;
            default: return <Badge variant="secondary">{level}</Badge>;
        }
    };

    const getConfidenceBadge = (confidence) => {
        const colors = {
            'High': 'bg-green-100 text-green-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[confidence] || 'bg-gray-100 text-gray-800'}>{confidence}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-pink-500 to-orange-600 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">🩹 {isBengali ? 'চর্ম সমস্যা নির্ণয়কারী' : 'Skin Issue Finder'}</CardTitle>
                                <CardDescription className="text-pink-100">
                                    📸 {isBengali ? 'চর্মের ছবি তুলুন এবং সম্ভাব্য সমস্যা জানুন' : 'Take a photo of skin condition and get insights'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-pink-600" />
                            📷 {isBengali ? 'চর্মের ছবি আপলোড করুন' : 'Upload Skin Image'}
                        </CardTitle>
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <Shield className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-800">⚠️ {isBengali ? 'গোপনীয়তা ও নিরাপত্তা' : 'Privacy & Safety'}</AlertTitle>
                            <AlertDescription className="text-yellow-700">
                                {isBengali ? 
                                    'এটি শুধুমাত্র প্রাথমিক তথ্যের জন্য। গুরুতর বা অব্যাহত সমস্যার জন্য অবশ্যই চর্মরোগ বিশেষজ্ঞ দেখান।' :
                                    'This is for preliminary information only. For serious or persistent issues, please consult a dermatologist.'
                                }
                            </AlertDescription>
                        </Alert>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border-2 border-dashed border-pink-300 rounded-lg p-8 text-center">
                            {preview ? (
                                <div className="relative group">
                                    <img src={preview} alt="Skin preview" className="max-h-60 mx-auto rounded-md shadow-md" />
                                    <label htmlFor="skin-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                        📸 {isBengali ? 'অন্য ছবি নিন' : 'Take Another Photo'}
                                    </label>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-pink-600" />
                                    </div>
                                    <label htmlFor="skin-upload" className="font-semibold text-pink-600 cursor-pointer text-lg">
                                        📱 {isBengali ? 'চর্মের ছবি তুলুন বা আপলোড করুন' : 'Take Photo or Upload Skin Image'}
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">📋 {isBengali ? 'স্পষ্ট আলোতে কাছ থেকে ছবি তুলুন' : 'Take clear, close-up photo in good lighting'}</p>
                                </div>
                            )}
                            <Input id="skin-upload" type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
                        </div>

                        <Button 
                            onClick={analyzeSkin} 
                            disabled={isAnalyzing || !file} 
                            size="lg"
                            className="w-full bg-pink-600 hover:bg-pink-700"
                        >
                            {isAnalyzing ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Eye className="w-5 h-5 mr-2" />
                            )}
                            🔍 {isAnalyzing ? 
                                (isBengali ? 'বিশ্লেষণ করা হচ্ছে...' : 'Analyzing...') :
                                (isBengali ? 'চর্মের অবস্থা বিশ্লেষণ করুন' : 'Analyze Skin Condition')
                            }
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                📊 {isBengali ? 'বিশ্লেষণ ফলাফল' : 'Analysis Result'}
                                {result.confidence && getConfidenceBadge(result.confidence)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="bg-red-50 border-red-200">
                                <Shield className="h-4 w-4 text-red-600" />
                                <AlertTitle className="text-red-800">⚠️ {isBengali ? 'গুরুত্বপূর্ণ সতর্কতা' : 'Important Disclaimer'}</AlertTitle>
                                <AlertDescription className="text-red-700">
                                    {result.disclaimer}
                                </AlertDescription>
                            </Alert>

                            {result.error ? (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{result.error}</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h3 className="font-semibold text-blue-900 mb-2">🎯 {isBengali ? 'সম্ভাব্য সমস্যা' : 'Possible Issue'}</h3>
                                            <p className="text-lg font-bold text-blue-800">{result.possible_issue}</p>
                                            <p className="text-sm text-blue-600 mt-2">{result.description}</p>
                                        </div>

                                        <div className="p-4 bg-orange-50 rounded-lg">
                                            <h3 className="font-semibold text-orange-900 mb-2">⏰ {isBengali ? 'জরুরি মাত্রা' : 'Urgency Level'}</h3>
                                            {getUrgencyBadge(result.urgency?.level)}
                                            <p className="text-sm text-orange-700 mt-2">{result.urgency?.reason}</p>
                                        </div>

                                        <div className="p-4 bg-yellow-50 rounded-lg">
                                            <h3 className="font-semibold text-yellow-900 mb-2">🔍 {isBengali ? 'সম্ভাব্য কারণ' : 'Possible Causes'}</h3>
                                            <ul className="space-y-1">
                                                {result.common_causes?.map((cause, index) => (
                                                    <li key={index} className="text-yellow-800 text-sm">• {cause}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h3 className="font-semibold text-green-900 mb-2">💡 {isBengali ? 'প্রাথমিক পরিচর্যা' : 'Basic Care Tips'}</h3>
                                            <ul className="space-y-1">
                                                {result.basic_tips?.map((tip, index) => (
                                                    <li key={index} className="text-green-800 text-sm">• {tip}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <h3 className="font-semibold text-purple-900 mb-2">👨‍⚕️ {isBengali ? 'কখন ডাক্তার দেখাবেন' : 'When to See Doctor'}</h3>
                                            <p className="text-purple-800 text-sm">{result.when_to_see_doctor}</p>
                                        </div>

                                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                            <h3 className="font-semibold text-red-900 mb-2">🚨 {isBengali ? 'জরুরি সংকেত' : 'Emergency Signs'}</h3>
                                            <p className="text-red-800 text-sm">
                                                {isBengali ? 
                                                    'যদি সমস্যা দ্রুত ছড়ায়, তীব্র ব্যথা হয়, জ্বর আসে বা সংক্রমণের লক্ষণ দেখা দেয় তাহলে অবিলম্বে ডাক্তার দেখান।' :
                                                    'If the condition spreads rapidly, causes severe pain, fever, or signs of infection, see a doctor immediately.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}