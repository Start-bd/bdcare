import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Heart } from 'lucide-react';

export default function GuidedHealthConsultation({ isBengali, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [showResult, setShowResult] = useState(false);

    const steps = [
        {
            id: 'urgency',
            titleBn: '🚨 এটি কি জরুরি সমস্যা?',
            titleEn: '🚨 Is this an urgent problem?',
            descBn: 'প্রথমে বলুন আপনার সমস্যাটি কতটা জরুরি',
            descEn: 'First, tell us how urgent your problem is',
            options: [
                { value: 'emergency', labelBn: '🆘 খুবই জরুরি - এখনই সাহায্য দরকার', labelEn: '🆘 Very urgent - need help now', color: 'bg-red-500' },
                { value: 'urgent', labelBn: '⚠️ জরুরি - আজকেই দেখাতে হবে', labelEn: '⚠️ Urgent - need to see doctor today', color: 'bg-orange-500' },
                { value: 'normal', labelBn: '📝 সাধারণ - পরামর্শ চাই', labelEn: '📝 Normal - want advice', color: 'bg-blue-500' },
                { value: 'prevention', labelBn: '🛡️ প্রতিরোধ - স্বাস্থ্য টিপস চাই', labelEn: '🛡️ Prevention - want health tips', color: 'bg-green-500' }
            ]
        },
        {
            id: 'age_group',
            titleBn: '👤 এই সমস্যা কার জন্য?',
            titleEn: '👤 Who is this problem for?',
            descBn: 'বয়সের গ্রুপ নির্বাচন করুন',
            descEn: 'Select the age group',
            options: [
                { value: 'child', labelBn: '👶 শিশু (০-১২ বছর)', labelEn: '👶 Child (0-12 years)' },
                { value: 'teen', labelBn: '🧒 কিশোর (১৩-১৭ বছর)', labelEn: '🧒 Teen (13-17 years)' },
                { value: 'adult', labelBn: '👨 প্রাপ্তবয়স্ক (১৮-৫৯ বছর)', labelEn: '👨 Adult (18-59 years)' },
                { value: 'elderly', labelBn: '👴 বয়স্ক (৬০+ বছর)', labelEn: '👴 Elderly (60+ years)' }
            ]
        },
        {
            id: 'main_concern',
            titleBn: '🎯 মূল সমস্যা কোনটি?',
            titleEn: '🎯 What is the main problem?',
            descBn: 'সবচেয়ে বড় সমস্যাটি বেছে নিন',
            descEn: 'Choose the main concern',
            options: [
                { value: 'fever', labelBn: '🌡️ জ্বর ও সর্দি-কাশি', labelEn: '🌡️ Fever & cold/cough' },
                { value: 'stomach', labelBn: '🤢 পেটের সমস্যা', labelEn: '🤢 Stomach problems' },
                { value: 'pain', labelBn: '😣 ব্যথা (মাথা/শরীর)', labelEn: '😣 Pain (head/body)' },
                { value: 'breathing', labelBn: '😤 শ্বাসকষ্ট', labelEn: '😤 Breathing problems' },
                { value: 'skin', labelBn: '🩹 চর্মরোগ', labelEn: '🩹 Skin problems' },
                { value: 'mental', labelBn: '😰 মানসিক সমস্যা', labelEn: '😰 Mental health' },
                { value: 'other', labelBn: '❓ অন্য কিছু', labelEn: '❓ Something else' }
            ]
        },
        {
            id: 'duration',
            titleBn: '⏰ কতদিন ধরে এই সমস্যা?',
            titleEn: '⏰ How long has this been a problem?',
            descBn: 'সমস্যা শুরুর সময় জানান',
            descEn: 'Tell us when the problem started',
            options: [
                { value: 'today', labelBn: '📅 আজকেই শুরু', labelEn: '📅 Started today' },
                { value: 'few_days', labelBn: '📆 কয়েকদিন ধরে', labelEn: '📆 Few days' },
                { value: 'week', labelBn: '📋 এক সপ্তাহ ধরে', labelEn: '📋 About a week' },
                { value: 'long', labelBn: '📊 অনেকদিন ধরে', labelEn: '📊 Long time' }
            ]
        },
        {
            id: 'severity',
            titleBn: '📊 সমস্যাটি কতটা কষ্টকর?',
            titleEn: '📊 How severe is the problem?',
            descBn: 'কষ্টের মাত্রা বলুন',
            descEn: 'Rate the severity',
            options: [
                { value: 'mild', labelBn: '😊 হালকা - তেমন সমস্যা নেই', labelEn: '😊 Mild - not much trouble' },
                { value: 'moderate', labelBn: '😐 মাঝারি - কিছুটা অস্বস্তি', labelEn: '😐 Moderate - some discomfort' },
                { value: 'severe', labelBn: '😰 তীব্র - অনেক কষ্ট', labelEn: '😰 Severe - much pain/discomfort' },
                { value: 'unbearable', labelBn: '😭 অসহ্য - একদম সহ্য হচ্ছে না', labelEn: '😭 Unbearable - cannot tolerate' }
            ]
        }
    ];

    const handleOptionSelect = (stepId, value) => {
        setResponses(prev => ({ ...prev, [stepId]: value }));
        
        // If it's emergency, show immediate action
        if (stepId === 'urgency' && value === 'emergency') {
            setShowResult(true);
            return;
        }
        
        // Move to next step
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowResult(true);
        }
    };

    const goBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const restart = () => {
        setCurrentStep(0);
        setResponses({});
        setShowResult(false);
    };

    if (showResult) {
        return <ResultScreen responses={responses} isBengali={isBengali} onRestart={restart} />;
    }

    const currentStepData = steps[currentStep];

    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-emerald-600" />
                    <Badge variant="outline" className="px-3 py-1">
                        {isBengali ? `ধাপ ${currentStep + 1}/${steps.length}` : `Step ${currentStep + 1}/${steps.length}`}
                    </Badge>
                </div>
                <CardTitle className="text-xl">
                    {isBengali ? currentStepData.titleBn : currentStepData.titleEn}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                    {isBengali ? currentStepData.descBn : currentStepData.descEn}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {currentStepData.options.map((option) => (
                        <Button
                            key={option.value}
                            variant="outline"
                            size="lg"
                            onClick={() => handleOptionSelect(currentStepData.id, option.value)}
                            className={`p-6 h-auto text-left justify-start hover:bg-emerald-50 border-2 hover:border-emerald-300 ${
                                option.color ? `hover:${option.color} hover:text-white` : ''
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base font-medium">
                                    {isBengali ? option.labelBn : option.labelEn}
                                </span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </Button>
                    ))}
                </div>
                
                {currentStep > 0 && (
                    <div className="flex justify-center pt-4">
                        <Button variant="ghost" onClick={goBack} className="text-gray-500">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {isBengali ? 'পেছনে যান' : 'Go Back'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ResultScreen({ responses, isBengali, onRestart }) {
    const getRecommendation = () => {
        const { urgency, main_concern, severity } = responses;
        
        if (urgency === 'emergency') {
            return {
                level: 'emergency',
                icon: '🚨',
                titleBn: 'তাৎক্ষণিক সাহায্য নিন!',
                titleEn: 'Get Immediate Help!',
                actionBn: 'এখনই ৯৯৯ নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যান',
                actionEn: 'Call 999 now or go to nearest hospital',
                color: 'bg-red-500'
            };
        }
        
        if (urgency === 'urgent' || severity === 'unbearable') {
            return {
                level: 'urgent',
                icon: '⚠️',
                titleBn: 'দ্রুত ডাক্তার দেখান',
                titleEn: 'See Doctor Soon',
                actionBn: 'আজকেই বা কালকে ডাক্তারের কাছে যান',
                actionEn: 'Visit doctor today or tomorrow',
                color: 'bg-orange-500'
            };
        }
        
        return {
            level: 'normal',
            icon: '💡',
            titleBn: 'সাধারণ পরামর্শ',
            titleEn: 'General Advice',
            actionBn: 'কয়েকদিন বিশ্রাম নিন, পানি বেশি খান। উন্নতি না হলে ডাক্তার দেখান',
            actionEn: 'Rest for few days, drink more water. If no improvement, see doctor',
            color: 'bg-blue-500'
        };
    };

    const recommendation = getRecommendation();

    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full ${recommendation.color} flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-3xl">{recommendation.icon}</span>
                </div>
                <CardTitle className="text-xl">
                    {isBengali ? recommendation.titleBn : recommendation.titleEn}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-center text-gray-700 font-medium">
                        {isBengali ? recommendation.actionBn : recommendation.actionEn}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        📞 {isBengali ? 'ডাক্তার খুঁজুন' : 'Find Doctor'}
                    </Button>
                    <Button size="lg" variant="outline">
                        🏥 {isBengali ? 'হাসপাতাল খুঁজুন' : 'Find Hospital'}
                    </Button>
                </div>
                
                <div className="text-center">
                    <Button variant="ghost" onClick={onRestart}>
                        🔄 {isBengali ? 'নতুন করে শুরু করুন' : 'Start Over'}
                    </Button>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                        ⚠️ {isBengali ? 
                            'এটি শুধু প্রাথমিক পরামর্শ। গুরুতর সমস্যার জন্য অবশ্যই ডাক্তার দেখান।' :
                            'This is preliminary advice only. For serious problems, please consult a doctor.'
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}