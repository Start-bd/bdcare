import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pill, 
  Camera, 
  Upload, 
  Search, 
  AlertTriangle,
  Shield,
  Loader2,
  Eye
} from 'lucide-react';

export default function MedicineCheckerPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('scanner');
    const [searchQuery, setSearchQuery] = useState('');

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

    const analyzeMedicine = async () => {
        if (!file) {
            alert(isBengali ? "অনুগ্রহ করে ঔষধের ছবি আপলোড করুন।" : "Please upload a medicine image.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        const prompt = `You are an AI medicine identification assistant for Bangladesh. Analyze the provided image of a medicine/medication.

        SAFETY FIRST - IMPORTANT RULES:
        1. You are NOT a doctor or pharmacist
        2. This is only for identification and educational purposes
        3. Always advise consulting healthcare professionals
        4. Focus on common medicines available in Bangladesh
        5. Be very careful with dosage information - only provide general guidance

        Look for:
        - Medicine name (both generic and brand names common in Bangladesh)
        - Visible text on packaging/tablets
        - Shape, color, markings on pills/tablets
        - Manufacturing details if visible

        Provide response in ${isBengali ? 'Bengali' : 'English'} in this JSON format:
        {
          "identified": true/false,
          "medicine_name": "Primary medicine name identified",
          "generic_name": "Generic/scientific name if different",
          "brand_names": ["Common brand names in Bangladesh"],
          "medicine_type": "Tablet/Capsule/Syrup/Injection/Cream/etc",
          "primary_uses": [
            "Main medical condition it treats",
            "Secondary use",
            "Another common use"
          ],
          "common_dosage": "General adult dosage info (e.g., '1 tablet twice daily' - but emphasize doctor consultation)",
          "side_effects": [
            "Common side effect 1",
            "Common side effect 2"
          ],
          "warnings": [
            "Important warning 1",
            "Important warning 2"
          ],
          "storage": "How to store this medicine",
          "confidence": "Low|Medium|High",
          "disclaimer": "This is AI identification only. Always consult a doctor or pharmacist before taking any medicine. Verify with healthcare provider for proper dosage and suitability."
        }

        If you cannot identify the medicine clearly, set "identified": false and provide general safety advice.`;

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const analysisResult = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        identified: { type: "boolean" },
                        medicine_name: { type: "string" },
                        generic_name: { type: "string" },
                        brand_names: { type: "array", items: { type: "string" } },
                        medicine_type: { type: "string" },
                        primary_uses: { type: "array", items: { type: "string" } },
                        common_dosage: { type: "string" },
                        side_effects: { type: "array", items: { type: "string" } },
                        warnings: { type: "array", items: { type: "string" } },
                        storage: { type: "string" },
                        confidence: { type: "string" },
                        disclaimer: { type: "string" }
                    }
                }
            });
            setResult(analysisResult);
        } catch (error) {
            console.error("Medicine analysis failed:", error);
            setResult({ 
                identified: false, 
                error: isBengali ? "বিশ্লেষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Analysis failed. Please try again." 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const searchMedicine = async () => {
        if (!searchQuery.trim()) {
            alert(isBengali ? "অনুগ্রহ করে ঔষধের নাম লিখুন।" : "Please enter a medicine name.");
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        const prompt = `You are providing information about a medicine that a user in Bangladesh is asking about: "${searchQuery}"

        Provide comprehensive information in ${isBengali ? 'Bengali' : 'English'} about this medicine in JSON format:
        {
          "identified": true/false,
          "medicine_name": "Medicine name",
          "generic_name": "Generic name",
          "brand_names": ["Common brand names in Bangladesh"],
          "medicine_type": "Type of medicine",
          "primary_uses": ["List of what this medicine treats"],
          "common_dosage": "General dosage information",
          "side_effects": ["Common side effects"],
          "warnings": ["Important warnings and contraindications"],
          "storage": "Storage instructions",
          "confidence": "High",
          "disclaimer": "Always consult healthcare provider before taking medicines"
        }`;

        try {
            const searchResult = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        identified: { type: "boolean" },
                        medicine_name: { type: "string" },
                        generic_name: { type: "string" },
                        brand_names: { type: "array", items: { type: "string" } },
                        medicine_type: { type: "string" },
                        primary_uses: { type: "array", items: { type: "string" } },
                        common_dosage: { type: "string" },
                        side_effects: { type: "array", items: { type: "string" } },
                        warnings: { type: "array", items: { type: "string" } },
                        storage: { type: "string" },
                        confidence: { type: "string" },
                        disclaimer: { type: "string" }
                    }
                }
            });
            setResult(searchResult);
        } catch (error) {
            console.error("Medicine search failed:", error);
            setResult({ 
                identified: false, 
                error: isBengali ? "অনুসন্ধান ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" : "Search failed. Please try again." 
            });
        } finally {
            setIsAnalyzing(false);
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <Pill className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">💊 {isBengali ? 'ঔষধ পরীক্ষক' : 'Medicine Checker'}</CardTitle>
                                <CardDescription className="text-green-100">
                                    📱 {isBengali ? 'ঔষধের ছবি তুলুন বা নাম লিখুন - জানুন এটি কিসের জন্য ব্যবহার হয়' : 'Scan medicine or search by name - know what it\'s used for'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="scanner" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            📷 {isBengali ? 'ছবি তুলুন' : 'Scan Image'}
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            🔍 {isBengali ? 'নাম খুঁজুন' : 'Search Name'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scanner">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-green-600" />
                                    📸 {isBengali ? 'ঔষধের ছবি আপলোড করুন' : 'Upload Medicine Image'}
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    ⚠️ {isBengali ? 'নিরাপত্তার জন্য: অজানা ঔষধ খাওয়ার আগে অবশ্যই ডাক্তারের পরামর্শ নিন' : 'For safety: Always consult a doctor before taking unknown medicines'}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                                    {preview ? (
                                        <div className="relative group">
                                            <img src={preview} alt="Medicine preview" className="max-h-60 mx-auto rounded-md shadow-md" />
                                            <label htmlFor="medicine-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                                📷 {isBengali ? 'অন্য ছবি নিন' : 'Take Another Photo'}
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <Upload className="w-8 h-8 text-green-600" />
                                            </div>
                                            <label htmlFor="medicine-upload" className="font-semibold text-green-600 cursor-pointer text-lg">
                                                📱 {isBengali ? 'ঔষধের ছবি তুলুন বা আপলোড করুন' : 'Take Photo or Upload Medicine Image'}
                                            </label>
                                            <p className="text-sm text-gray-500 mt-2">📋 {isBengali ? 'PNG, JPG, JPEG ফরম্যাট সমর্থিত' : 'PNG, JPG, JPEG formats supported'}</p>
                                        </div>
                                    )}
                                    <Input id="medicine-upload" type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleFileChange} />
                                </div>

                                <Button 
                                    onClick={analyzeMedicine} 
                                    disabled={isAnalyzing || !file} 
                                    size="lg"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Eye className="w-5 h-5 mr-2" />
                                    )}
                                    🔍 {isAnalyzing ? 
                                        (isBengali ? 'ঔষধ চিহ্নিত করা হচ্ছে...' : 'Identifying Medicine...') :
                                        (isBengali ? 'ঔষধ চিহ্নিত করুন' : 'Identify Medicine')
                                    }
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="search">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="w-5 h-5 text-blue-600" />
                                    🔍 {isBengali ? 'ঔষধের নাম দিয়ে খুঁজুন' : 'Search by Medicine Name'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={isBengali ? 'ঔষধের নাম লিখুন (যেমন: Napa, Ace)' : 'Enter medicine name (e.g., Paracetamol, Aspirin)'}
                                        className="text-lg"
                                        onKeyPress={(e) => e.key === 'Enter' && searchMedicine()}
                                    />
                                    <Button 
                                        onClick={searchMedicine} 
                                        disabled={isAnalyzing || !searchQuery.trim()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {result && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                📋 {isBengali ? 'ঔষধের তথ্য' : 'Medicine Information'}
                                {result.confidence && getConfidenceBadge(result.confidence)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="bg-red-50 border-red-200">
                                <Shield className="h-4 w-4 text-red-600" />
                                <AlertTitle className="text-red-800">⚠️ {isBengali ? 'গুরুত্বপূর্ণ নিরাপত্তা সতর্কতা' : 'Important Safety Warning'}</AlertTitle>
                                <AlertDescription className="text-red-700">
                                    {result.disclaimer}
                                </AlertDescription>
                            </Alert>

                            {result.identified ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h3 className="font-semibold text-blue-900 mb-2">💊 {isBengali ? 'ঔষধের নাম' : 'Medicine Name'}</h3>
                                            <p className="text-lg font-bold text-blue-800">{result.medicine_name}</p>
                                            {result.generic_name && result.generic_name !== result.medicine_name && (
                                                <p className="text-sm text-blue-600">🧬 {isBengali ? 'জেনেরিক:' : 'Generic:'} {result.generic_name}</p>
                                            )}
                                            {result.brand_names?.length > 0 && (
                                                <p className="text-sm text-blue-600">🏷️ {isBengali ? 'ব্র্যান্ড:' : 'Brands:'} {result.brand_names.join(', ')}</p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h3 className="font-semibold text-green-900 mb-2">🎯 {isBengali ? 'কিসের জন্য ব্যবহার হয়' : 'What it\'s used for'}</h3>
                                            <ul className="space-y-1">
                                                {result.primary_uses?.map((use, index) => (
                                                    <li key={index} className="text-green-800">• {use}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {result.common_dosage && (
                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                <h3 className="font-semibold text-yellow-900 mb-2">💊 {isBengali ? 'সাধারণ ডোজ' : 'Common Dosage'}</h3>
                                                <p className="text-yellow-800">{result.common_dosage}</p>
                                                <p className="text-xs text-yellow-700 mt-1">⚠️ {isBengali ? 'ডাক্তারের পরামর্শ ছাড়া ডোজ পরিবর্তন করবেন না' : 'Do not change dosage without doctor consultation'}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {result.side_effects?.length > 0 && (
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <h3 className="font-semibold text-orange-900 mb-2">⚠️ {isBengali ? 'পার্শ্বপ্রতিক্রিয়া' : 'Side Effects'}</h3>
                                                <ul className="space-y-1">
                                                    {result.side_effects.map((effect, index) => (
                                                        <li key={index} className="text-orange-800 text-sm">• {effect}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {result.warnings?.length > 0 && (
                                            <div className="p-4 bg-red-50 rounded-lg">
                                                <h3 className="font-semibold text-red-900 mb-2">🚨 {isBengali ? 'সতর্কতা' : 'Warnings'}</h3>
                                                <ul className="space-y-1">
                                                    {result.warnings.map((warning, index) => (
                                                        <li key={index} className="text-red-800 text-sm">• {warning}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {result.storage && (
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 mb-2">🏠 {isBengali ? 'সংরক্ষণ' : 'Storage'}</h3>
                                                <p className="text-gray-800 text-sm">{result.storage}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>{isBengali ? 'ঔষধ চিহ্নিত করা যায়নি' : 'Medicine Not Identified'}</AlertTitle>
                                    <AlertDescription>
                                        {result.error || (isBengali ? 
                                            'ছবি স্পষ্ট নয় বা ঔষধটি চিহ্নিত করা যায়নি। অনুগ্রহ করে আরও স্পষ্ট ছবি নিন বা ডাক্তার/ফার্মাসিস্টের সাহায্য নিন।' :
                                            'Image not clear or medicine not recognized. Please take a clearer photo or consult a doctor/pharmacist.'
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}