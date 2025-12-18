import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Video, Calendar, FileText, Clock, User as UserIcon, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PrescriptionViewer from '../components/telemedicine/PrescriptionViewer';

export default function MyConsultationsPage() {
    const [user, setUser] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);

            const allConsultations = await base44.entities.VideoConsultation.list('-created_date', 100);
            const myConsultations = allConsultations.filter(c => c.patient_id === currentUser.id);
            setConsultations(myConsultations);
        } catch (error) {
            console.error('Failed to load:', error);
        }
        setIsLoading(false);
    };

    const upcomingConsultations = consultations.filter(c => 
        c.session_status === 'scheduled' && new Date(c.scheduled_time) > new Date()
    );
    const completedConsultations = consultations.filter(c => c.session_status === 'completed');
    const activeConsultations = consultations.filter(c => c.session_status === 'in_progress');

    const ConsultationCard = ({ consultation }) => {
        const statusColors = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        return (
            <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                                <h3 className="font-bold text-lg">
                                    {isBengali ? 'ডাক্তার:' : 'Doctor:'} {consultation.doctor_id}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(consultation.scheduled_time).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}
                            </div>
                        </div>
                        <Badge className={statusColors[consultation.session_status]}>
                            {consultation.session_status}
                        </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{isBengali ? 'ধরন:' : 'Type:'}</span>
                            <span>{consultation.consultation_type}</span>
                        </div>
                        {consultation.actual_start_time && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{isBengali ? 'সময়কাল:' : 'Duration:'}</span>
                                <span>
                                    {consultation.actual_end_time 
                                        ? Math.round((new Date(consultation.actual_end_time) - new Date(consultation.actual_start_time)) / 60000)
                                        : '...'
                                    } {isBengali ? 'মিনিট' : 'minutes'}
                                </span>
                            </div>
                        )}
                    </div>

                    {consultation.consultation_notes && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">{isBengali ? 'নোট:' : 'Notes:'}</span> {consultation.consultation_notes}
                            </p>
                        </div>
                    )}

                    {consultation.prescription && (
                        <Button
                            variant="outline"
                            className="w-full mb-2"
                            onClick={() => setSelectedPrescription(consultation)}
                        >
                            <Pill className="w-4 h-4 mr-2" />
                            {isBengali ? 'প্রেসক্রিপশন দেখুন' : 'View Prescription'}
                        </Button>
                    )}

                    {consultation.session_status === 'scheduled' && (
                        <Link to={createPageUrl(`Telemedicine?consultationId=${consultation.id}`)}>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                <Video className="w-4 h-4 mr-2" />
                                {isBengali ? 'কল জয়েন করুন' : 'Join Call'}
                            </Button>
                        </Link>
                    )}

                    {consultation.session_status === 'in_progress' && (
                        <Link to={createPageUrl(`Telemedicine?consultationId=${consultation.id}`)}>
                            <Button className="w-full bg-green-600 hover:bg-green-700 animate-pulse">
                                <Video className="w-4 h-4 mr-2" />
                                {isBengali ? 'কল চলছে - জয়েন করুন' : 'Call in Progress - Join'}
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        );
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {isBengali ? '🩺 আমার পরামর্শসমূহ' : '🩺 My Consultations'}
                    </h1>
                    <p className="text-gray-600">
                        {isBengali ? 'আপনার সব ভার্চুয়াল পরামর্শ এবং প্রেসক্রিপশন' : 'All your virtual consultations and prescriptions'}
                    </p>
                </div>

                {activeConsultations.length > 0 && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                {isBengali ? 'সক্রিয় কল' : 'Active Call'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {activeConsultations.map(c => <ConsultationCard key={c.id} consultation={c} />)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">
                            {isBengali ? 'আসন্ন' : 'Upcoming'} ({upcomingConsultations.length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            {isBengali ? 'ইতিহাস' : 'History'} ({completedConsultations.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-6">
                        {upcomingConsultations.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {isBengali ? 'কোনো আসন্ন পরামর্শ নেই' : 'No upcoming consultations'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingConsultations.map(c => <ConsultationCard key={c.id} consultation={c} />)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        {completedConsultations.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {isBengali ? 'কোনো সম্পন্ন পরামর্শ নেই' : 'No completed consultations'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {completedConsultations.map(c => <ConsultationCard key={c.id} consultation={c} />)}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {selectedPrescription && (
                <PrescriptionViewer
                    consultation={selectedPrescription}
                    isBengali={isBengali}
                    onClose={() => setSelectedPrescription(null)}
                />
            )}
        </div>
    );
}