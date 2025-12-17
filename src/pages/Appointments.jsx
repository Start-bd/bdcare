import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import AppointmentBooking from '../components/appointments/AppointmentBooking';
import UserAppointmentsList from '../components/appointments/UserAppointmentsList';

export default function AppointmentsPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            } catch (e) { /* not logged in */ }
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const handleBookingSuccess = () => {
        setBookingSuccess(true);
        // Remove doctorId from URL and navigate to the appointments list
        setTimeout(() => {
            navigate('/Appointments');
            setBookingSuccess(false); // Reset for next time
        }, 3000);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8 flex items-center justify-center">
                <Alert>
                    <AlertTitle>{isBengali ? 'প্রবেশাধিকার প্রয়োজন' : 'Login Required'}</AlertTitle>
                    <AlertDescription>
                        {isBengali ? 'অ্যাপয়েন্টমেন্ট দেখতে বা বুক করতে অনুগ্রহ করে লগইন করুন।' : 'Please log in to view or book appointments.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (bookingSuccess) {
         return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8 flex items-center justify-center">
                <Alert variant="success" className="max-w-lg text-center bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-lg font-bold">{isBengali ? 'সফলভাবে বুক করা হয়েছে!' : 'Booking Successful!'}</AlertTitle>
                    <AlertDescription className="mt-2">
                        {isBengali ? 'আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে। আপনাকে আপনার অ্যাপয়েন্টমেন্ট তালিকায় নিয়ে যাওয়া হচ্ছে...' : 'Your appointment is confirmed. Redirecting you to your appointments list...'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
            {doctorId ? (
                <AppointmentBooking 
                    doctorId={doctorId} 
                    user={user} 
                    isBengali={isBengali} 
                    onBookingSuccess={handleBookingSuccess}
                />
            ) : (
                <UserAppointmentsList user={user} isBengali={isBengali} />
            )}
        </div>
    );
}