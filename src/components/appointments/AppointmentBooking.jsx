import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import { Appointment } from '@/entities/Appointment';
import { UserPreferences } from '@/entities/UserPreferences';
import { SendEmail } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Loader2, Calendar, Clock, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import { addDays, format, set, startOfDay, isEqual } from 'date-fns';

/**
 * Sends a notification to a user based on their preferences.
 * @param {string} userId - The ID of the user to notify.
 * @param {string} preferenceKey - The key in notification_preferences to check (e.g., 'appointment_reminders').
 * @param {string} subject - The email subject.
 * @param {string} body - The email body (can be HTML).
 * @param {boolean} isBengali - Whether to use Bengali titles.
 */
async function sendNotification(userId, preferenceKey, subject, body, isBengali) {
  try {
    const userToNotify = await User.get(userId);
    if (!userToNotify || !userToNotify.email) {
      console.error("Notification failed: User not found or has no email.", userId);
      return;
    }

    const userPrefsList = await UserPreferences.filter({ user_id: userId }, '-created_date', 1);
    const userPrefs = userPrefsList.length > 0 ? userPrefsList[0] : null;

    const canSend = userPrefs ? userPrefs.notification_preferences?.[preferenceKey] !== false : true;
    
    if (canSend) {
      await SendEmail({
        to: userToNotify.email,
        subject: `[${isBengali ? 'স্বাস্থ্য এজেন্ট' : 'Health Agent'}] ${subject}`,
        body: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${isBengali ? 'নমস্কার' : 'Hello'} ${userToNotify.full_name},</h2>
            ${body}
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">
              ${isBengali 
                ? 'আপনি এই ইমেলটি পেয়েছেন কারণ আপনি স্বাস্থ্য এজেন্ট অ্যাপে বিজ্ঞপ্তি সক্রিয় করেছেন। আপনি আপনার অ্যাপের সেটিংস থেকে এই পছন্দগুলি পরিচালনা করতে পারেন।' 
                : 'You received this email because you have notifications enabled in the Health Agent app. You can manage these preferences in your app settings.'}
            </p>
            <p style="font-size: 12px; color: #888;"><strong>স্বাস্থ্য এজেন্ট - Shasthya Bondhu</strong></p>
          </div>
        `
      });
      console.log(`Notification sent to ${userToNotify.email}`);
    } else {
      console.log(`Notification skipped for ${userToNotify.email} due to user preferences.`);
    }
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}


const generateTimeSlots = (date, bookedSlots) => {
    const slots = [];
    const now = new Date();
    const startHour = 9;
    const endHour = 17;
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const slotTime = set(date, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
            if (slotTime > now && !bookedSlots.some(booked => isEqual(new Date(booked), slotTime))) {
                slots.push(slotTime);
            }
        }
    }
    return slots;
};

export default function AppointmentBooking({ doctorId, user, isBengali, onBookingSuccess }) {
    const [doctor, setDoctor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingReason, setBookingReason] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);

    useEffect(() => {
        const fetchDoctorAndSchedule = async () => {
            setIsLoading(true);
            try {
                const doc = await User.get(doctorId);
                setDoctor(doc);

                const appointments = await Appointment.filter({ doctor_id: doctorId, status: 'scheduled' });
                const bookedTimestamps = appointments.map(app => new Date(app.appointment_date));
                setBookedSlots(bookedTimestamps);

                const dates = [];
                for (let i = 0; i < 7; i++) {
                    dates.push(startOfDay(addDays(new Date(), i)));
                }
                setAvailableDates(dates);

            } catch (error) {
                console.error("Error fetching doctor/schedule:", error);
            }
            setIsLoading(false);
        };
        fetchDoctorAndSchedule();
    }, [doctorId]);

    useEffect(() => {
        if (selectedDate) {
            setAvailableSlots(generateTimeSlots(selectedDate, bookedSlots));
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, bookedSlots]);
    
    const handleBooking = async () => {
        if (!selectedSlot || !bookingReason) {
            alert(isBengali ? 'অনুগ্রহ করে সময় এবং কারণ নির্বাচন করুন।' : 'Please select a time slot and provide a reason.');
            return;
        }

        setIsBooking(true);
        try {
            const newAppointment = await Appointment.create({
                patient_id: user.id,
                doctor_id: doctor.id,
                patient_name: user.full_name,
                doctor_name: doctor.full_name,
                appointment_date: selectedSlot.toISOString(),
                reason: bookingReason,
                status: 'scheduled'
            });

            // Auto-create video consultation for this appointment
            await base44.entities.VideoConsultation.create({
                patient_id: user.id,
                doctor_id: doctor.id,
                appointment_id: newAppointment.id,
                consultation_type: 'routine',
                scheduled_time: selectedSlot.toISOString(),
                session_status: 'scheduled'
            });
            
            setBookingStatus({ success: true, message: isBengali ? 'অ্যাপয়েন্টমেন্ট সফলভাবে বুক করা হয়েছে!' : 'Appointment booked successfully!' });
            
            const subject = isBengali ? 'অ্যাপয়েন্টমেন্ট নিশ্চিতকরণ' : 'Appointment Confirmation';
            const body = `<p>${isBengali ? 'আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে।' : 'Your appointment is confirmed.'}</p><ul><li><strong>${isBengali ? 'ডাক্তার:' : 'Doctor:'}</strong> ${doctor.full_name}</li><li><strong>${isBengali ? 'তারিখ:' : 'Date:'}</strong> ${format(selectedSlot, 'PPP')}</li><li><strong>${isBengali ? 'সময়:' : 'Time:'}</strong> ${format(selectedSlot, 'p')}</li></ul>`;
            await sendNotification(user.id, 'appointment_reminders', subject, body, isBengali);
            await sendNotification(doctor.id, 'appointment_reminders', `New Appointment with ${user.full_name}`, body, isBengali);

            setTimeout(() => onBookingSuccess(), 2000);

        } catch (error) {
            console.error("Booking failed:", error);
            setBookingStatus({ success: false, message: isBengali ? 'বুকিং ব্যর্থ হয়েছে।' : 'Booking failed. Please try again.' });
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!doctor) return <p>{isBengali ? 'ডাক্তার পাওয়া যায়নি।' : 'Doctor not found.'}</p>;

    return (
        <Card className="max-w-3xl mx-auto shadow-xl">
            <CardHeader className="text-center">
                <UserIcon className="w-16 h-16 mx-auto bg-gray-100 p-3 rounded-full text-blue-600" />
                <CardTitle className="text-2xl">{isBengali ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book an Appointment'}</CardTitle>
                <CardDescription className="text-lg">{isBengali ? 'এর সাথে' : 'with'} <span className="font-bold">{doctor.full_name}</span> ({doctor.doctor_specialization})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
                {bookingStatus && (
                    <Alert variant={bookingStatus.success ? "success" : "destructive"}>
                        {bookingStatus.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <AlertTitle>{bookingStatus.message}</AlertTitle>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label className="font-semibold text-lg flex items-center gap-2"><Calendar className="w-5 h-5" /> {isBengali ? '১. একটি তারিখ নির্বাচন করুন' : '1. Select a Date'}</Label>
                    <div className="flex gap-2 overflow-x-auto p-2">
                        {availableDates.map(date => (
                            <Button 
                                key={date.toISOString()}
                                variant={selectedDate && isEqual(date, selectedDate) ? "default" : "outline"}
                                onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                                className="flex flex-col h-auto p-3"
                            >
                                <span className="font-bold text-lg">{format(date, 'd')}</span>
                                <span className="text-xs">{format(date, 'MMM')}</span>
                                <span className="text-xs">{format(date, 'EEE')}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {selectedDate && (
                    <div className="space-y-2">
                        <Label className="font-semibold text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> {isBengali ? '২. একটি সময় নির্বাচন করুন' : '2. Select a Time Slot'}</Label>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {availableSlots.length > 0 ? availableSlots.map(slot => (
                                <Button 
                                    key={slot.toISOString()}
                                    variant={selectedSlot && isEqual(slot, selectedSlot) ? 'default' : 'outline'}
                                    onClick={() => setSelectedSlot(slot)}
                                >
                                    {format(slot, 'p')}
                                </Button>
                            )) : <p className="text-gray-500 col-span-full">{isBengali ? 'এই তারিখে কোনো স্লট উপলব্ধ নেই।' : 'No slots available on this date.'}</p>}
                        </div>
                    </div>
                )}

                {selectedSlot && (
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="font-semibold text-lg">{isBengali ? '৩. পরিদর্শনের কারণ' : '3. Reason for Visit'}</Label>
                        <Textarea 
                            id="reason"
                            placeholder={isBengali ? 'সংক্ষেপে আপনার সমস্যা লিখুন...' : 'Briefly describe your issue...'}
                            value={bookingReason}
                            onChange={(e) => setBookingReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                )}
                
                <Button onClick={handleBooking} disabled={isBooking || !selectedSlot || !bookingReason} className="w-full" size="lg">
                    {isBooking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isBengali ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন' : 'Confirm Appointment'}
                </Button>
            </CardContent>
        </Card>
    );
}