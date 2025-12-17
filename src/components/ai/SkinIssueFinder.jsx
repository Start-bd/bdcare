import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { CheckCircle, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react';

export default function SkinIssueFinder({ isBengali }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError(isBengali ? "অনুগ্রহ করে একটি ছবি আপলোড করুন।" : "Please upload an image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const { file_url } = await UploadFile({ file });

            const prompt = `You are a specialized AI health assistant with expertise in dermatology. Analyze the provided image of a skin condition from a user in Bangladesh.
            
            IMPORTANT SAFETY RULES:
            1. You ARE NOT a medical doctor and this is NOT a diagnosis.
            2. Your goal is to provide preliminary information and guide the user to seek professional help.
            3. Always begin your response with a clear disclaimer about consulting a real doctor.
            
            Based on the image, provide a response in ${isBengali ? 'Bengali' : 'English'} in the following JSON format:
            {
              "possible_issue": "A common name for the potential skin issue (e.g., 'Possible Fungal Infection like Ringworm' or 'Suspected Insect Bite Reaction'). Be cautious with your language.",
              "confidence": "Low|Medium|High",
              "description": "A brief, simple explanation of what this condition might be and its common causes.",
              "urgency": {
                "level": "Monitor|See Doctor Soon|Urgent",
                "reason": "A short explanation for the urgency level (e.g., 'While likely not serious, a proper diagnosis is needed' or 'Could be contagious and requires medical treatment')."
              },
              "basic_tips": [
                "A simple, safe, general tip (e.g., 'Avoid scratching the area').",
                "Another tip (e.g., 'Keep the area clean and dry.').",
                "A final tip (e.g., 'Wear loose-fitting clothing over the affected area.')."
              ],
              "disclaimer": "This is an AI analysis, not a medical diagnosis. For any health concerns, you must consult a qualified dermatologist for an accurate diagnosis and treatment."
            }`;

            const analysisResult = await InvokeLLM({
                prompt,
                file_urls: [file_url],
                response_json_schema: { /* Schema defined in prompt */ }
            });

            setResult(analysisResult);

        } catch (err) {
            console.error("Analysis failed:", err);
            setError(isBengali ? "বিশ্লেষণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getUrgencyBadge = (level) => {
        switch (level) {
            case 'Urgent': return <Badge variant="destructive">{isBengali ? '🚨 জরুরি' : '🚨 Urgent'}</Badge>;
            case 'See Doctor Soon': return <Badge className="bg-orange-500 text-white">{isBengali ? '🩺 ডাক্তার দেখান' : '🩺 See Doctor Soon'}</Badge>;
            case 'Monitor': return <Badge variant="secondary">{isBengali ? '👀 পর্যবেক্ষণ করুন' : '👀 Monitor'}</Badge>;
            default: return <Badge>{level}</Badge>;
        }
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">📸 {isBengali ? 'চর্ম সমস্যা পরীক্ষক' : 'Skin Issue Finder'}</CardTitle>
                    <CardDescription>{isBengali ? 'আপনার ত্বকের সমস্যার একটি ছবি আপলোড করুন এবং একটি প্রাথমিক AI বিশ্লেষণ পান।' : 'Upload a picture of your skin issue to get a preliminary AI analysis.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {preview ? (
                            <div className="relative group">
                                <img src={preview} alt="Preview" className="max-h-60 mx-auto rounded-md" />
                                <label htmlFor="skin-image-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isBengali ? 'অন্য ছবি দিন' : 'Change Image'}
                                </label>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                <label htmlFor="skin-image-upload" className="font-semibold text-emerald-600 cursor-pointer">
                                    {isBengali ? 'ছবি আপলোড করতে এখানে ক্লিক করুন' : 'Click here to upload an image'}
                                </label>
                                <p className="text-xs text-gray-500 mt-1">{isBengali ? 'PNG, JPG, JPEG' : 'PNG, JPG, JPEG'}</p>
                            </div>
                        )}
                        <Input id="skin-image-upload" type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
                    </div>

                    {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

                    <Button onClick={handleAnalyze} disabled={isLoading || !file} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                        {isLoading ? (isBengali ? 'বিশ্লেষণ করা হচ্ছে...' : 'Analyzing...') : (isBengali ? 'ছবি বিশ্লেষণ করুন' : 'Analyze Image')}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>{isBengali ? 'AI বিশ্লেষণ ফলাফল' : 'AI Analysis Result'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="font-bold">{isBengali ? 'গুরুত্বপূর্ণ সূচনা' : 'Important Disclaimer'}</AlertTitle>
                            <AlertDescription className="text-yellow-800">{result.disclaimer}</AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold">{isBengali ? 'সম্ভাব্য সমস্যা' : 'Possible Issue'}</h3>
                                <p>{result.possible_issue} <Badge variant="outline">{isBengali ? 'বিশ্বাস:' : 'Confidence:'} {result.confidence}</Badge></p>
                            </div>
                            <div>
                                <h3 className="font-semibold">{isBengali ? 'সতর্কতা' : 'Urgency'}</h3>
                                <div className="flex items-center gap-2">
                                    {getUrgencyBadge(result.urgency.level)}
                                    <span>- {result.urgency.reason}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold">{isBengali ? 'বর্ণনা' : 'Description'}</h3>
                                <p className="text-gray-700">{result.description}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">{isBengali ? 'প্রাথমিক টিপস' : 'Basic Tips'}</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {result.basic_tips.map((tip, index) => <li key={index}>{tip}</li>)}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}