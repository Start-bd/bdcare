import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  Heart, 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Shield
} from 'lucide-react';
import RiskQuestionForm from '../components/health-assessment/RiskQuestionForm';
import RiskResultsDashboard from '../components/health-assessment/RiskResultsDashboard';

export default function HealthRiskAssessmentPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [assessmentData, setAssessmentData] = useState({});
    const [riskResults, setRiskResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const assessmentSteps = [
        {
            id: 'personal_info',
            titleBn: 'ব্যক্তিগত তথ্য',
            titleEn: 'Personal Information',
            descBn: 'আপনার বয়স, লিঙ্গ এবং জীবনযাত্রার তথ্য',
            descEn: 'Your age, gender, and lifestyle information'
        },
        {
            id: 'family_history',
            titleBn: 'পারিবারিক ইতিহাস',
            titleEn: 'Family History',
            descBn: 'আপনার পরিবারের স্বাস্থ্য সমস্যার ইতিহাস',
            descEn: 'Your family history of health conditions'
        },
        {
            id: 'symptoms',
            titleBn: 'লক্ষণ ও অভ্যাস',
            titleEn: 'Symptoms & Habits',
            descBn: 'বর্তমান লক্ষণ এবং স্বাস্থ্যকর অভ্যাস',
            descEn: 'Current symptoms and health habits'
        },
        {
            id: 'results',
            titleBn: 'ফলাফল',
            titleEn: 'Results',
            descBn: 'আপনার ব্যক্তিগত স্বাস্থ্য ঝুঁকি মূল্যায়ন',
            descEn: 'Your personalized health risk assessment'
        }
    ];

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
                
                // Pre-populate with user data if available
                setAssessmentData({
                    age: currentUser.date_of_birth ? new Date().getFullYear() - new Date(currentUser.date_of_birth).getFullYear() : '',
                    gender: currentUser.gender || '',
                    existing_conditions: currentUser.medical_conditions || [],
                    medications: currentUser.medications || [],
                    family_history: currentUser.family_medical_history || [],
                    lifestyle_habits: currentUser.lifestyle_habits || {}
                });
            } catch (e) {
                // Not logged in, start with empty data
            }
        };
        loadUser();
    }, []);

    const analyzeHealthRisk = async () => {
        setIsAnalyzing(true);
        
        const prompt = `As an AI health assessment expert, analyze the following user profile and provide a comprehensive health risk assessment:

        Profile:
        - Age: ${assessmentData.age}
        - Gender: ${assessmentData.gender}
        - Existing Conditions: ${assessmentData.existing_conditions?.join(', ') || 'None'}
        - Family History: ${assessmentData.family_history?.join(', ') || 'None'}
        - Lifestyle: Smoking(${assessmentData.lifestyle_habits?.smoking || 'Unknown'}), Exercise(${assessmentData.lifestyle_habits?.exercise_frequency || 'Unknown'}), Alcohol(${assessmentData.lifestyle_habits?.alcohol || 'Unknown'})
        - Current Symptoms: ${assessmentData.current_symptoms?.join(', ') || 'None'}
        - Weight Status: ${assessmentData.weight_status || 'Unknown'}
        - Diet: ${assessmentData.diet_quality || 'Unknown'}

        Provide analysis in ${isBengali ? 'Bengali' : 'English'} language in this exact JSON format:
        {
          "overall_risk_score": 0-100,
          "risk_level": "Low|Moderate|High|Critical",
          "primary_concerns": [
            {
              "condition": "condition name",
              "risk_percentage": 0-100,
              "reasoning": "brief explanation"
            }
          ],
          "recommendations": [
            {
              "category": "Diet|Exercise|Medical|Lifestyle",
              "action": "specific actionable recommendation",
              "priority": "High|Medium|Low"
            }
          ],
          "next_steps": [
            "immediate action to take",
            "follow-up recommendation"
          ],
          "disclaimer": "medical disclaimer text"
        }`;

        try {
            const result = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_risk_score: { type: "number" },
                        risk_level: { type: "string" },
                        primary_concerns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    condition: { type: "string" },
                                    risk_percentage: { type: "number" },
                                    reasoning: { type: "string" }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    action: { type: "string" },
                                    priority: { type: "string" }
                                }
                            }
                        },
                        next_steps: {
                            type: "array",
                            items: { type: "string" }
                        },
                        disclaimer: { type: "string" }
                    }
                }
            });
            
            setRiskResults(result);
            setCurrentStep(3); // Move to results step
        } catch (error) {
            console.error('Risk analysis failed:', error);
            setRiskResults({ 
                error: isBengali ? 
                    'বিশ্লেষণ সম্পন্ন করতে ব্যর্থ। পরে আবার চেষ্টা করুন।' : 
                    'Failed to complete analysis. Please try again later.' 
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNext = () => {
        if (currentStep < assessmentSteps.length - 2) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep === assessmentSteps.length - 2) {
            analyzeHealthRisk();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateAssessmentData = (stepData) => {
        setAssessmentData({ ...assessmentData, ...stepData });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="mb-8 border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl md:text-3xl font-bold">
                                    {isBengali ? 'স্বাস্থ্য ঝুঁকি মূল্যায়ন' : 'Health Risk Assessment'}
                                </CardTitle>
                                <CardDescription className="text-purple-100">
                                    {isBengali ? 
                                        'AI-চালিত ব্যক্তিগত স্বাস্থ্য বিশ্লেষণ এবং সুপারিশ' : 
                                        'AI-powered personalized health analysis and recommendations'
                                    }
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Progress Indicator */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">
                                {isBengali ? 
                                    `ধাপ ${currentStep + 1} এর ${assessmentSteps.length}` : 
                                    `Step ${currentStep + 1} of ${assessmentSteps.length}`
                                }
                            </h3>
                            <Badge variant="outline">
                                {Math.round((currentStep / (assessmentSteps.length - 1)) * 100)}% {isBengali ? 'সম্পন্ন' : 'Complete'}
                            </Badge>
                        </div>
                        <Progress value={(currentStep / (assessmentSteps.length - 1)) * 100} className="h-2" />
                        <div className="flex justify-between mt-2">
                            {assessmentSteps.map((step, index) => (
                                <div key={step.id} className={`text-sm ${index <= currentStep ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                    {isBengali ? step.titleBn : step.titleEn}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-purple-600" />
                            {isBengali ? assessmentSteps[currentStep]?.titleBn : assessmentSteps[currentStep]?.titleEn}
                        </CardTitle>
                        <CardDescription>
                            {isBengali ? assessmentSteps[currentStep]?.descBn : assessmentSteps[currentStep]?.descEn}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentStep < 3 ? (
                            <RiskQuestionForm
                                step={assessmentSteps[currentStep].id}
                                data={assessmentData}
                                onDataChange={updateAssessmentData}
                                isBengali={isBengali}
                            />
                        ) : (
                            <RiskResultsDashboard
                                results={riskResults}
                                user={user}
                                isBengali={isBengali}
                                isLoading={isAnalyzing}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                {currentStep < 3 && (
                    <div className="flex justify-between">
                        <Button 
                            variant="outline" 
                            onClick={handleBack}
                            disabled={currentStep === 0}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {isBengali ? 'পূর্ববর্তী' : 'Previous'}
                        </Button>
                        
                        <Button 
                            onClick={handleNext}
                            disabled={isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isBengali ? 'বিশ্লেষণ করা হচ্ছে...' : 'Analyzing...'}
                                </>
                            ) : currentStep === assessmentSteps.length - 2 ? (
                                <>
                                    <Brain className="w-4 h-4 mr-2" />
                                    {isBengali ? 'ঝুঁকি বিশ্লেষণ করুন' : 'Analyze Risk'}
                                </>
                            ) : (
                                <>
                                    {isBengali ? 'পরবর্তী' : 'Next'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Privacy Notice */}
                <Alert className="mt-8 bg-blue-50 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                        {isBengali ? 'গোপনীয়তা সুরক্ষিত' : 'Privacy Protected'}
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                        {isBengali ? 
                            'আপনার সব তথ্য এনক্রিপ্ট করা এবং সুরক্ষিত। এই মূল্যায়ন শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে এবং পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।' :
                            'All your data is encrypted and secure. This assessment is for educational purposes only and is not a substitute for professional medical advice.'
                        }
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}