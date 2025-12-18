import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Video, Calendar, User as UserIcon, FileText, Clock, Pill, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PrescriptionEditor from '../components/telemedicine/PrescriptionEditor';
import PrescriptionViewer from '../components/telemedicine/PrescriptionViewer';

export default function DoctorConsultationsPage() {
    const [user, setUser] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);
    const [editingConsultation, setEditingConsultation] = useState(null);
    const [viewingConsultation, setViewingConsultation] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);

            if (currentUser.user_type !== 'doctor' && currentUser.role !== 'doctor') {
                return;
            }

            const allConsultations = await base44.entities.VideoConsultation.list('-scheduled_time', 100);
            const myConsultations = allConsultations.filter(c => c.doctor_id === currentUser.id);
            setConsultations(myConsultations);
        } catch (error) {
            console.error('Failed to load:', error);
        }
        setIsLoading(false);
    };

    const todayConsultations = consultations.filter(c => {
        const scheduleDate = new Date(c.scheduled_time).toDateString();
        return scheduleDate === new Date().toDateString() && c.session_status !== 'cancelled';
    });

    const upcomingConsultations = consultations.filter(c => 
        c.session_status === 'scheduled' && 
        new Date(c.scheduled_time) > new Date() &&
        new Date(c.scheduled_time).toDateString() !== new Date().toDateString()
    );

    const completedConsultations = consultations.filter(c => c.session_status === 'completed');

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
                                    {isBengali ? 'রোগী:' : 'Patient:'} {consultation.patient_id}
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
                            <p className="text-sm text-gray-700">{consultation.consultation_notes}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {consultation.prescription ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setViewingConsultation(consultation)}
                                >
                                    <Pill className="w-4 h-4 mr-2" />
                                    {isBengali ? 'প্রেসক্রিপশন দেখুন' : 'View Prescription'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingConsultation(consultation)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setEditingConsultation(consultation)}
                            >
                                <Pill className="w-4 h-4 mr-2" />
                                {isBengali ? 'প্রেসক্রিপশন তৈরি করুন' : 'Create Prescription'}
                            </Button>
                        )}

                        {(consultation.session_status === 'scheduled' || consultation.session_status === 'in_progress') && (
                            <Link to={createPageUrl(`Telemedicine?consultationId=${consultation.id}`)}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Video className="w-4 h-4 mr-2" />
                                    {isBengali ? 'জয়েন' : 'Join'}
                                </Button>
                            </Link>
                        )}
                    </div>
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

    if (!user || (user.user_type !== 'doctor' && user.role !== 'doctor')) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>{isBengali ? 'শুধুমাত্র ডাক্তারদের জন্য' : 'Doctors Only'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            {isBengali ? 'এই পেজটি শুধুমাত্র যাচাইকৃত ডাক্তারদের জন্য।' : 'This page is for verified doctors only.'}
                        </p>
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
                        {isBengali ? '👨‍⚕️ আমার পরামর্শ সেবা' : '👨‍⚕️ My Consultations'}
                    </h1>
                    <p className="text-gray-600">
                        {isBengali ? 'আপনার সব ভার্চুয়াল পরামর্শ সেশন পরিচালনা করুন' : 'Manage all your virtual consultation sessions'}
                    </p>
                </div>

                {todayConsultations.length > 0 && (
                    <Card className="mb-6 border-emerald-200 bg-emerald-50">
                        <CardHeader>
                            <CardTitle className="text-emerald-800">
                                {isBengali ? '📅 আজকের পরামর্শ' : '📅 Today\'s Consultations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {todayConsultations.map(c => <ConsultationCard key={c.id} consultation={c} />)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">
                            {isBengali ? 'আসন্ন' : 'Upcoming'} ({upcomingConsultations.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            {isBengali ? 'সম্পন্ন' : 'Completed'} ({completedConsultations.length})
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

                    <TabsContent value="completed" className="mt-6">
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

            {editingConsultation && (
                <PrescriptionEditor
                    consultation={editingConsultation}
                    isBengali={isBengali}
                    onClose={() => {
                        setEditingConsultation(null);
                        loadData();
                    }}
                />
            )}

            {viewingConsultation && (
                <PrescriptionViewer
                    consultation={viewingConsultation}
                    isBengali={isBengali}
                    onClose={() => setViewingConsultation(null)}
                />
            )}
        </div>
    );
}