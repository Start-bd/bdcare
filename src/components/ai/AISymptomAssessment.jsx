import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, AlertCircle, UserCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AISymptomAssessment({ isBengali, user }) {
    const [symptoms, setSymptoms] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [recommendedDoctors, setRecommendedDoctors] = useState([]);

    const analyzeSymptoms = async () => {
        if (!symptoms.trim()) return;

        setIsAnalyzing(true);
        try {
            // AI analysis of symptoms
            const aiResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a medical AI assistant helping with preliminary symptom assessment in ${isBengali ? 'Bengali and English' : 'English'}.

Patient's symptoms: ${symptoms}

Provide a structured assessment with:
1. Possible conditions (list 2-3 most likely based on symptoms)
2. Severity level (mild, moderate, severe, emergency)
3. Recommended medical specializations (e.g., General Physician, Cardiologist, Dermatologist)
4. Self-care advice
5. When to seek medical care urgency

Important: This is preliminary advice only, not a diagnosis. Always recommend consulting a doctor for accurate diagnosis.`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        possible_conditions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    probability: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        },
                        severity: {
                            type: 'string',
                            enum: ['mild', 'moderate', 'severe', 'emergency']
                        },
                        recommended_specializations: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        self_care_advice: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        urgency: { type: 'string' },
                        disclaimer: { type: 'string' }
                    }
                }
            });

            setAssessment(aiResponse);

            // Find doctors matching specializations from Doctor entity
            if (aiResponse.recommended_specializations?.length > 0) {
                const allDoctors = await base44.entities.Doctor.list('-rating', 50);
                const matched = allDoctors.filter(d =>
                    d.is_available &&
                    aiResponse.recommended_specializations.some(recSpec =>
                        d.specialty?.toLowerCase().includes(recSpec.toLowerCase().split(' ')[0]) ||
                        recSpec.toLowerCase().includes(d.specialty?.toLowerCase() || '')
                    )
                );
                setRecommendedDoctors(matched.slice(0, 3));
            }

            // Save consultation record
            if (user) {
                await base44.entities.AIConsultation.create({
                    user_message: symptoms,
                    ai_response: JSON.stringify(aiResponse),
                    language: isBengali ? 'bengali' : 'english',
                    symptoms: symptoms.split(',').map(s => s.trim()),
                    severity_assessment: aiResponse.severity,
                    follow_up_needed: aiResponse.severity !== 'mild'
                });
            }

        } catch (error) {
            console.error('Failed to analyze:', error);
            alert(isBengali ? 'বিশ্লেষণ ব্যর্থ হয়েছে' : 'Analysis failed');
        }
        setIsAnalyzing(false);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'emergency': return 'bg-red-100 text-red-800';
            case 'severe': return 'bg-orange-100 text-orange-800';
            case 'moderate': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-6 h-6" />
                        {isBengali ? '🤖 AI উপসর্গ মূল্যায়ন' : '🤖 AI Symptom Assessment'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {isBengali ? 'আপনার লক্ষণ বর্ণনা করুন' : 'Describe your symptoms'}
                        </label>
                        <Textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder={isBengali 
                                ? 'উদাহরণ: মাথাব্যথা, জ্বর, কাশি...'
                                : 'Example: headache, fever, cough...'}
                            rows={6}
                            className="text-base"
                        />
                    </div>

                    <Button
                        onClick={analyzeSymptoms}
                        disabled={isAnalyzing || !symptoms.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {isBengali ? 'বিশ্লেষণ চলছে...' : 'Analyzing...'}
                            </>
                        ) : (
                            <>
                                <Stethoscope className="w-5 h-5 mr-2" />
                                {isBengali ? 'AI দিয়ে বিশ্লেষণ করুন' : 'Analyze with AI'}
                            </>
                        )}
                    </Button>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            ℹ️ {isBengali 
                                ? 'এটি প্রাথমিক মূল্যায়ন মাত্র। সঠিক রোগ নির্ণয়ের জন্য ডাক্তারের পরামর্শ নিন।'
                                : 'This is a preliminary assessment. Consult a doctor for accurate diagnosis.'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {assessment && (
                <>
                    {/* Assessment Results */}
                    <Card className="shadow-xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {isBengali ? '📊 মূল্যায়ন ফলাফল' : '📊 Assessment Results'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Severity */}
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {isBengali ? 'গুরুত্বের মাত্রা' : 'Severity Level'}
                                </h3>
                                <Badge className={`${getSeverityColor(assessment.severity)} text-base px-4 py-2`}>
                                    {assessment.severity.toUpperCase()}
                                </Badge>
                            </div>

                            {/* Possible Conditions */}
                            <div>
                                <h3 className="font-semibold mb-3">
                                    {isBengali ? '🔍 সম্ভাব্য রোগ/সমস্যা' : '🔍 Possible Conditions'}
                                </h3>
                                <div className="space-y-3">
                                    {assessment.possible_conditions?.map((condition, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-lg">{condition.name}</h4>
                                                <Badge variant="outline">{condition.probability}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-700">{condition.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Self-care Advice */}
                            <div>
                                <h3 className="font-semibold mb-3">
                                    {isBengali ? '💊 স্ব-যত্ন পরামর্শ' : '💊 Self-care Advice'}
                                </h3>
                                <ul className="space-y-2">
                                    {assessment.self_care_advice?.map((advice, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-emerald-600 mt-1">✓</span>
                                            <span className="text-sm text-gray-700">{advice}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Urgency */}
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    {isBengali ? '⏰ চিকিৎসা নেওয়ার জরুরীতা' : '⏰ When to Seek Care'}
                                </h3>
                                <p className="text-sm text-gray-800">{assessment.urgency}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommended Doctors */}
                    {recommendedDoctors.length > 0 && (
                        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="w-6 h-6 text-blue-600" />
                                    {isBengali ? '👨‍⚕️ প্রস্তাবিত ডাক্তার' : '👨‍⚕️ Recommended Doctors'}
                                </CardTitle>
                                <p className="text-sm text-gray-600">
                                    {isBengali 
                                        ? 'আপনার লক্ষণের জন্য উপযুক্ত বিশেষজ্ঞ ডাক্তার'
                                        : 'Specialists suitable for your symptoms'}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recommendedDoctors.map((doctor) => (
                                    <div key={doctor.id} className="p-4 bg-white rounded-lg shadow border hover:shadow-lg transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg">{isBengali ? doctor.name_bn : doctor.name_en}</h4>
                                                <p className="text-sm text-blue-600">{doctor.specialty}</p>
                                            </div>
                                            {doctor.is_available && (
                                                <Badge className="bg-green-100 text-green-800">
                                                    {isBengali ? 'অনলাইন' : 'Online'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                            <span>{doctor.experience_years || 0} {isBengali ? 'বছর অভিজ্ঞতা' : 'yrs exp'}</span>
                                            {doctor.hospital && (
                                                <>
                                                    <span>•</span>
                                                    <span>{doctor.hospital}</span>
                                                </>
                                            )}
                                            {doctor.rating && <span>⭐ {doctor.rating?.toFixed(1)}</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={`${createPageUrl('SBDoctorProfile')}?id=${doctor.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full">
                                                    {isBengali ? 'প্রোফাইল দেখুন' : 'View Profile'}
                                                </Button>
                                            </Link>
                                            <Link to={`${createPageUrl('SBDoctorProfile')}?id=${doctor.id}&tab=book`} className="flex-1">
                                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {isBengali ? 'বুক করুন' : 'Book'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-center pt-2">
                                    <Link to={createPageUrl('Doctors')}>
                                        <Button variant="outline">
                                            {isBengali ? 'আরও ডাক্তার দেখুন' : 'View More Doctors'}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Disclaimer */}
                    <Card className="shadow-lg border-yellow-200 bg-yellow-50">
                        <CardContent className="p-4">
                            <p className="text-sm text-yellow-900">
                                <strong>⚠️ {isBengali ? 'গুরুত্বপূর্ণ দাবিত্যাগ:' : 'Important Disclaimer:'}</strong>
                                <br />
                                {assessment.disclaimer || (isBengali 
                                    ? 'এই AI মূল্যায়ন শুধুমাত্র তথ্যমূলক উদ্দেশ্যে। এটি পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়। সঠিক রোগ নির্ণয় এবং চিকিৎসার জন্য সবসময় একজন যোগ্য চিকিৎসকের সাথে পরামর্শ করুন।'
                                    : 'This AI assessment is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for accurate diagnosis and treatment.')}
                            </p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}