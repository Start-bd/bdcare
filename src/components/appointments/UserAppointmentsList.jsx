import React, { useState, useEffect } from 'react';
import { Appointment } from '@/entities/Appointment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, User, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import VirtualConsultationButton from './VirtualConsultationButton';

function AppointmentCard({ appointment, isDoctor, isBengali, onCancel }) {
    const isUpcoming = new Date(appointment.appointment_date) > new Date();
    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500"/>
                    <p className="font-bold">
                        {isBengali ? 'সঙ্গে:' : 'With:'} {isDoctor ? appointment.patient_name : appointment.doctor_name}
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(appointment.appointment_date), 'PPP p')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 pl-6">{isBengali ? 'কারণ:' : 'Reason:'} {appointment.reason}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                <Badge className={statusColors[appointment.status]}>{appointment.status}</Badge>
                {isUpcoming && appointment.status === 'scheduled' && (
                    <div className="flex flex-col gap-2 w-full">
                        <VirtualConsultationButton appointment={appointment} isBengali={isBengali} />
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onCancel(appointment.id)}>
                            <X className="w-4 h-4 mr-1" />{isBengali ? 'বাতিল' : 'Cancel'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UserAppointmentsList({ user, isBengali }) {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const query = user.user_type === 'doctor' 
                ? { doctor_id: user.id }
                : { patient_id: user.id };
            const userAppointments = await Appointment.filter(query, '-appointment_date');
            setAppointments(userAppointments);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
            setError(isBengali ? "অ্যাপয়েন্টমেন্ট লোড করতে ব্যর্থ।" : "Failed to load appointments.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const handleCancel = async (appointmentId) => {
        if (!confirm(isBengali ? "আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্টটি বাতিল করতে চান?" : "Are you sure you want to cancel this appointment?")) return;
        
        try {
            await Appointment.update(appointmentId, { status: 'cancelled' });
            fetchAppointments(); // Refresh list
        } catch (err) {
            alert(isBengali ? 'বাতিল করতে ব্যর্থ।' : 'Failed to cancel.');
        }
    };
    
    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    const upcomingAppointments = appointments.filter(app => new Date(app.appointment_date) >= new Date() && app.status === 'scheduled');
    const pastAppointments = appointments.filter(app => new Date(app.appointment_date) < new Date() || app.status !== 'scheduled');

    return (
        <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl">{isBengali ? 'আমার অ্যাপয়েন্টমেন্ট' : 'My Appointments'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={fetchAppointments}>
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>
                <CardDescription>{isBengali ? 'আপনার আসন্ন এবং অতীত অ্যাপয়েন্টমেন্ট পরিচালনা করুন।' : 'Manage your upcoming and past appointments.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <div>
                    <h3 className="text-lg font-semibold mb-3">{isBengali ? 'আসন্ন' : 'Upcoming'}</h3>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingAppointments.map(app => (
                                <AppointmentCard key={app.id} appointment={app} isDoctor={user.user_type === 'doctor'} isBengali={isBengali} onCancel={handleCancel} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{isBengali ? 'কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই।' : 'You have no upcoming appointments.'}</p>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">{isBengali ? 'অতীত' : 'Past'}</h3>
                    {pastAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {pastAppointments.map(app => (
                                <AppointmentCard key={app.id} appointment={app} isDoctor={user.user_type === 'doctor'} isBengali={isBengali} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{isBengali ? 'কোনো অতীত অ্যাপয়েন্টমেন্ট নেই।' : 'You have no past appointments.'}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}