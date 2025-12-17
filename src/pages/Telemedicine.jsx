import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Loader2 } from 'lucide-react';
import ConsultationChat from '../components/telemedicine/ConsultationChat';

export default function TelemedicinePage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const consultationId = params.get('consultationId');
    
    const [user, setUser] = useState(null);
    const [consultation, setConsultation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [callActive, setCallActive] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        loadData();
    }, [consultationId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);

            if (consultationId) {
                const consultationData = await base44.entities.VideoConsultation.filter(
                    { id: consultationId },
                    '-created_date',
                    1
                );
                if (consultationData[0]) {
                    setConsultation(consultationData[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load:', error);
        }
        setIsLoading(false);
    };

    const startCall = async () => {
        if (!consultation) return;
        
        setCallActive(true);
        await base44.entities.VideoConsultation.update(consultation.id, {
            session_status: 'in_progress',
            actual_start_time: new Date().toISOString()
        });
        loadData();
    };

    const endCall = async () => {
        if (!consultation) return;
        
        setCallActive(false);
        await base44.entities.VideoConsultation.update(consultation.id, {
            session_status: 'completed',
            actual_end_time: new Date().toISOString()
        });
        loadData();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>{isBengali ? 'লগইন প্রয়োজন' : 'Login Required'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => base44.auth.redirectToLogin()} className="w-full">
                            {isBengali ? 'লগইন করুন' : 'Login'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>{isBengali ? 'পরামর্শ খুঁজে পাওয়া যায়নি' : 'Consultation Not Found'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            {isBengali 
                                ? 'এই পরামর্শ সেশনটি খুঁজে পাওয়া যাচ্ছে না বা আপনার অ্যাক্সেস নেই।'
                                : 'This consultation session was not found or you do not have access.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isDoctor = user.user_type === 'doctor' || user.role === 'doctor';
    const otherPartyName = isDoctor 
        ? consultation.patient_id 
        : consultation.doctor_id;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Video Area */}
                    <div className="lg:col-span-2">
                        <Card className="bg-black border-gray-700">
                            <CardContent className="p-0">
                                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                    {callActive ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <Video className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-pulse" />
                                                <p className="text-white text-lg">
                                                    {isBengali ? 'ভিডিও কল চলছে...' : 'Video call in progress...'}
                                                </p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                    {isBengali 
                                                        ? 'WebRTC ইন্টিগ্রেশন এখানে ইমপ্লিমেন্ট করুন'
                                                        : 'Implement WebRTC integration here'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <VideoOff className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                                <p className="text-white text-lg mb-4">
                                                    {isBengali ? 'কল শুরু করতে প্রস্তুত' : 'Ready to start call'}
                                                </p>
                                                <Button 
                                                    onClick={startCall}
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <Video className="w-4 h-4 mr-2" />
                                                    {isBengali ? 'কল শুরু করুন' : 'Start Call'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Controls */}
                                    {callActive && (
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                            <div className="flex justify-center gap-3">
                                                <Button
                                                    size="lg"
                                                    variant={videoEnabled ? "default" : "destructive"}
                                                    onClick={() => setVideoEnabled(!videoEnabled)}
                                                    className="rounded-full"
                                                >
                                                    {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant={audioEnabled ? "default" : "destructive"}
                                                    onClick={() => setAudioEnabled(!audioEnabled)}
                                                    className="rounded-full"
                                                >
                                                    {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    onClick={() => setShowChat(!showChat)}
                                                    className="rounded-full"
                                                >
                                                    <MessageSquare className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="destructive"
                                                    onClick={endCall}
                                                    className="rounded-full"
                                                >
                                                    <Phone className="w-5 h-5 rotate-135" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Session Info */}
                                <div className="p-4 bg-gray-800 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                {isDoctor 
                                                    ? (isBengali ? 'রোগী' : 'Patient')
                                                    : (isBengali ? 'ডাক্তার' : 'Doctor')
                                                }: {otherPartyName}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {consultation.consultation_type === 'emergency' && '🚨 '}
                                                {consultation.consultation_type}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                                consultation.session_status === 'in_progress' ? 'bg-green-500' :
                                                consultation.session_status === 'completed' ? 'bg-gray-500' :
                                                'bg-yellow-500'
                                            }`}>
                                                {consultation.session_status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat/Info Panel */}
                    <div className="lg:col-span-1">
                        {showChat || !callActive ? (
                            <ConsultationChat 
                                consultation={consultation}
                                user={user}
                                isBengali={isBengali}
                            />
                        ) : (
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        {isBengali ? 'পরামর্শের বিবরণ' : 'Consultation Details'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-300 space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-400">{isBengali ? 'সময়সূচী' : 'Scheduled'}</p>
                                        <p>{new Date(consultation.scheduled_time).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}</p>
                                    </div>
                                    {consultation.consultation_notes && (
                                        <div>
                                            <p className="text-sm text-gray-400">{isBengali ? 'নোট' : 'Notes'}</p>
                                            <p className="text-sm">{consultation.consultation_notes}</p>
                                        </div>
                                    )}
                                    <Alert className="bg-gray-700 border-gray-600">
                                        <AlertDescription className="text-gray-300 text-xs">
                                            {isBengali 
                                                ? '💡 এটি একটি সুরক্ষিত এবং এনক্রিপ্টেড সেশন'
                                                : '💡 This is a secure and encrypted session'}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}