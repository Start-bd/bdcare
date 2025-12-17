import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  Activity,
  Loader2,
  Download,
  Share2
} from 'lucide-react';

export default function RiskResultsDashboard({ results, user, isBengali, isLoading }) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                    {isBengali ? 'আপনার স্বাস্থ্য ঝুঁকি বিশ্লেষণ করা হচ্ছে...' : 'Analyzing your health risks...'}
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                    {isBengali ? 
                        'এআই আপনার সব তথ্য পর্যালোচনা করে একটি ব্যক্তিগত মূল্যায়ন তৈরি করছে।' :
                        'AI is reviewing all your information to create a personalized assessment.'
                    }
                </p>
            </div>
        );
    }

    if (results?.error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{isBengali ? 'ত্রুটি' : 'Error'}</AlertTitle>
                <AlertDescription>{results.error}</AlertDescription>
            </Alert>
        );
    }

    if (!results) {
        return (
            <div className="text-center py-8 text-gray-500">
                {isBengali ? 'কোন ফলাফল পাওয়া যায়নি।' : 'No results available.'}
            </div>
        );
    }

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            {/* Overall Risk Score */}
            <Card className={`border-2 ${getRiskColor(results.risk_level)}`}>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRiskColor(results.risk_level)}`}>
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {isBengali ? 'সামগ্রিক স্বাস্থ্য ঝুঁকি' : 'Overall Health Risk'}
                            </h2>
                            <p className="text-sm opacity-75">
                                {isBengali ? 'আপনার ব্যক্তিগত ঝুঁকি মূল্যায়ন' : 'Your personalized risk assessment'}
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-4xl font-bold">{results.overall_risk_score}/100</div>
                            <Badge className={`mt-2 ${getRiskColor(results.risk_level)}`}>
                                {results.risk_level} {isBengali ? 'ঝুঁকি' : 'Risk'}
                            </Badge>
                        </div>
                        <div className="w-32">
                            <Progress value={results.overall_risk_score} className="h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Primary Concerns */}
            {results.primary_concerns && results.primary_concerns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            {isBengali ? 'প্রধান স্বাস্থ্য ঝুঁকিসমূহ' : 'Primary Health Concerns'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {results.primary_concerns.map((concern, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-lg">{concern.condition}</h4>
                                        <Badge variant="outline">{concern.risk_percentage}% {isBengali ? 'ঝুঁকি' : 'risk'}</Badge>
                                    </div>
                                    <Progress value={concern.risk_percentage} className="h-2 mb-3" />
                                    <p className="text-gray-700">{concern.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            {isBengali ? 'ব্যক্তিগত সুপারিশ' : 'Personalized Recommendations'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {results.recommendations.map((rec, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{rec.category}</span>
                                            <Badge className={getPriorityColor(rec.priority)}>
                                                {rec.priority} {isBengali ? 'অগ্রাধিকার' : 'priority'}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-700">{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Next Steps */}
            {results.next_steps && results.next_steps.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            {isBengali ? 'পরবর্তী পদক্ষেপ' : 'Next Steps'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {results.next_steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-700 flex-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {isBengali ? 'রিপোর্ট ডাউনলোড করুন' : 'Download Report'}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    {isBengali ? 'ডাক্তারের সাথে শেয়ার করুন' : 'Share with Doctor'}
                </Button>
            </div>

            {/* Medical Disclaimer */}
            {results.disclaimer && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{isBengali ? 'চিকিৎসা দাবিত্যাগ' : 'Medical Disclaimer'}</AlertTitle>
                    <AlertDescription>{results.disclaimer}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}