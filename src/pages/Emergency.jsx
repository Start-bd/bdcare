
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { EmergencyRequest } from '@/entities/EmergencyRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneCall, MapPin, Ambulance, Shield, Loader2, Send, MessageSquare, Video, Activity } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import LiveEmergencyChat from '../components/emergency/LiveEmergencyChat';
import EmergencyTracker from '../components/emergency/EmergencyTracker';
import VideoConsultation from '../components/emergency/VideoConsultation';
import { UserPreferences } from '@/entities/UserPreferences';
import { SendEmail } from '@/integrations/Core';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function EmergencyPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [activeRequest, setActiveRequest] = useState(null);
    const [formData, setFormData] = useState({ emergency_type: 'medical', description: '' });

    const emergencyHotlines = [
        { name: "National Emergency Service", nameBn: "জাতীয় জরুরি সেবা", number: "999", priority: "high" },
        { name: "Health Hotline", nameBn: "স্বাস্থ্য হটলাইন", number: "16263", priority: "medium" },
        { name: "Fire Service", nameBn: "ফায়ার সার্ভিস", number: "102", priority: "high" },
        { name: "Police", nameBn: "পুলিশ", number: "100", priority: "medium" },
        { name: "Ambulance Service", nameBn: "অ্যাম্বুলেন্স সেবা", number: "199", priority: "high" },
    ];
    
    const emergencyTypes = [
        { value: 'medical', labelBn: 'সাধারণ মেডিকেল', labelEn: 'General Medical' },
        { value: 'accident', labelBn: 'দুর্ঘটনা', labelEn: 'Accident' },
        { value: 'cardiac', labelBn: 'হৃদরোগ', labelEn: 'Cardiac' },
        { value: 'breathing', labelBn: 'শ্বাসকষ্ট', labelEn: 'Breathing' },
        { value: 'bleeding', labelBn: 'রক্তপাত', labelEn: 'Bleeding' },
        { value: 'other', labelBn: 'অন্যান্য', labelEn: 'Other' },
    ];

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData(prev => ({ 
                    ...prev, 
                    patient_name: currentUser.full_name || '', 
                    patient_phone: currentUser.phone || '' 
                }));
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            } catch (e) { /* Not logged in */ }
        };
        loadUser();
        
        // Get location automatically if possible
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    // Silently handle location errors on page load
                }
            );
        }
    }, []);
    
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(isBengali ? 'আপনার ব্রাউজার লোকেশন সমর্থন করে না।' : 'Geolocation is not supported by your browser.');
            return;
        }

        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError('');
            },
            (error) => {
                let errorMessage = isBengali ? 'অবস্থান অ্যাক্সেস করতে ব্যর্থ।' : 'Unable to retrieve location.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = isBengali ? 'অনুগ্রহ করে লোকেশন অনুমতি দিন।' : 'Please allow location access.';
                }
                setLocationError(errorMessage);
            }
        );
    };

    const handleSubmitRequest = async () => {
        if (!location) {
            setLocationError(isBengali ? 'অনুগ্রহ করে আপনার অবস্থান জানান।' : 'Please provide your location.');
            return;
        }
        
        setIsSubmitting(true);
        setSubmissionStatus(null);
        try {
            const requestData = {
                ...formData,
                latitude: location.latitude,
                longitude: location.longitude,
                location: `${location.latitude}, ${location.longitude}`,
                severity: formData.emergency_type === 'cardiac' || formData.emergency_type === 'breathing' ? 'critical' : 'high'
            };

            // Ensure patient name and phone are set for guest users
            if (!requestData.patient_name) requestData.patient_name = 'Guest User';
            if (!requestData.patient_phone) requestData.patient_phone = 'N/A';

            const request = await EmergencyRequest.create(requestData);
            
            setActiveRequest(request);
            setSubmissionStatus({ 
                type: 'success', 
                message: isBengali ? 
                    'আপনার অনুরোধ সফলভাবে জমা দেওয়া হয়েছে। জরুরি টিমের সাথে সংযুক্ত হচ্ছি...' : 
                    'Your request has been submitted successfully. Connecting you with emergency team...'
            });

            // --- Send Notification if user is logged in ---
            if (user) {
                const subject = isBengali ? 'জরুরি অনুরোধ প্রাপ্ত হয়েছে' : 'Emergency Request Received';
                const body = `
                    <p>${isBengali ? 'আমরা আপনার জরুরি সাহায্যের অনুরোধ পেয়েছি। আমাদের দল দ্রুত সাড়া দিচ্ছে।' : 'We have received your request for emergency assistance. Our team is responding.'}</p>
                    <p><strong>${isBengali ? 'ট্র্যাকিং আইডি:' : 'Tracking ID:'}</strong> ${request.id}</p>
                    <p>${isBengali ? 'জরুরি প্রয়োজনে, অবিলম্বে <b>৯৯৯</b> নম্বরে কল করুন।' : 'In a critical emergency, please call <b>999</b> immediately.'}</p>
                `;
                await sendNotification(user.id, 'emergency_alerts', subject, body, isBengali);
            }
            // --- End Notification ---

        } catch (error) {
            console.error("Emergency request failed:", error);
            setSubmissionStatus({ 
                type: 'error', 
                message: isBengali ? 
                    'অনুরোধ জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে হটলাইনে কল করুন।' : 
                    'Failed to submit request. Please call emergency hotlines.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Card className="border-2 border-red-500 shadow-2xl shadow-red-200 mb-8">
                    <CardHeader className="bg-red-500 text-white text-center p-8">
                        <Ambulance className="w-16 h-16 mx-auto mb-4" />
                        <CardTitle className="text-4xl font-bold">{isBengali ? 'জরুরি সেবা কেন্দ্র' : 'Emergency Services Center'}</CardTitle>
                        <p className="text-red-100 mt-2 text-lg">{isBengali ? 'আমরা ২৤/৭ আপনার পাশে আছি। শান্ত থাকুন এবং নিচের ধাপগুলো অনুসরণ করুন।' : 'We are here 24/7 to help. Stay calm and follow the steps below.'}</p>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="hotlines" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
                        <TabsTrigger value="hotlines" className="flex items-center gap-1">
                            <PhoneCall className="w-4 h-4" />
                            {isBengali ? 'হটলাইন' : 'Hotlines'}
                        </TabsTrigger>
                        <TabsTrigger value="request" className="flex items-center gap-1">
                            <Ambulance className="w-4 h-4" />
                            {isBengali ? 'অনুরোধ' : 'Request'}
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {isBengali ? 'চ্যাট' : 'Chat'}
                        </TabsTrigger>
                        <TabsTrigger value="track" className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {isBengali ? 'ট্র্যাক' : 'Track'}
                        </TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {isBengali ? 'ভিডিও' : 'Video'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hotlines">
                        <Card className="p-8">
                            <h3 className="text-2xl font-semibold mb-6 text-red-700 flex items-center gap-2">
                                <PhoneCall className="w-6 h-6" />
                                {isBengali ? 'জরুরি হটলাইন নম্বর' : 'Emergency Hotline Numbers'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {emergencyHotlines.map(line => (
                                    <Card key={line.number} className={`hover:shadow-lg transition-all duration-200 ${line.priority === 'high' ? 'border-red-300 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                                        <CardContent className="p-6 text-center">
                                            <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${line.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}>
                                                <PhoneCall className="w-6 h-6 text-white" />
                                            </div>
                                            <Button 
                                                size="lg" 
                                                variant="outline" 
                                                className={`w-full h-auto flex flex-col p-4 ${line.priority === 'high' ? 'border-red-300 hover:bg-red-100' : 'border-orange-300 hover:bg-orange-100'}`}
                                                asChild
                                            >
                                                <a href={`tel:${line.number}`}>
                                                    <span className={`font-bold text-2xl ${line.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`}>
                                                        {line.number}
                                                    </span>
                                                    <span className="text-sm text-gray-700 font-medium mt-2">
                                                        {isBengali ? line.nameBn : line.name}
                                                    </span>
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="request">
                        <Card className="p-8">
                            <h3 className="text-2xl font-semibold mb-6 text-red-700 flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                {isBengali ? 'জরুরি সাহায্যের অনুরোধ করুন' : 'Request Emergency Assistance'}
                            </h3>
                            
                            <div className="space-y-6 max-w-2xl">
                                <div className="space-y-4 p-6 bg-red-50/50 rounded-lg border border-red-100">
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium">{isBengali ? '১. আপনার অবস্থান জানান' : '1. Share Your Location'}</Label>
                                        <Button 
                                            onClick={handleGetLocation} 
                                            variant="outline" 
                                            className="w-full border-red-200 hover:bg-red-50"
                                            disabled={!!location}
                                        >
                                            <MapPin className="w-4 h-4 mr-2" /> 
                                            {location ? 
                                                (isBengali ? 'অবস্থান সংরক্ষিত ✓' : 'Location Saved ✓') :
                                                (isBengali ? 'আমার অবস্থান ব্যবহার করুন' : 'Use My Location')
                                            }
                                        </Button>
                                        {location && <p className="text-sm text-green-600">{isBengali ? 'অবস্থান সফলভাবে সেট করা হয়েছে।' : 'Location set successfully.'}</p>}
                                        {locationError && <p className="text-sm text-red-600">{locationError}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium">{isBengali ? '২. জরুরি অবস্থার ধরন' : '2. Type of Emergency'}</Label>
                                        <Select value={formData.emergency_type} onValueChange={v => setFormData({...formData, emergency_type: v})}>
                                            <SelectTrigger className="border-red-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {emergencyTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {isBengali ? type.labelBn : type.labelEn}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium">{isBengali ? '৩. সংক্ষিপ্ত বিবরণ' : '3. Brief Description'}</Label>
                                        <Textarea 
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})} 
                                            placeholder={isBengali ? 'জরুরি অবস্থা সম্পর্কে সংক্ষেপে বর্ণনা করুন...' : 'Briefly describe the emergency situation...'} 
                                            className="border-red-200 focus:border-red-500"
                                            rows={4}
                                        />
                                    </div>
                                    
                                    <Button 
                                        onClick={handleSubmitRequest} 
                                        disabled={isSubmitting || !location} 
                                        size="lg" 
                                        className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 mr-2" />
                                        )}
                                        {isBengali ? 'জরুরি অনুরোধ পাঠান' : 'Submit Emergency Request'}
                                    </Button>
                                </div>
                            </div>
                            
                            {submissionStatus && (
                                <Alert variant={submissionStatus.type === 'success' ? 'default' : 'destructive'} className={`mt-6 ${submissionStatus.type === 'success' ? 'bg-green-50 border-green-200' : ''}`}>
                                    <AlertTitle>{isBengali ? (submissionStatus.type === 'success' ? 'সফল' : 'ব্যর্থ') : (submissionStatus.type === 'success' ? 'Success' : 'Error')}</AlertTitle>
                                    <AlertDescription>{submissionStatus.message}</AlertDescription>
                                </Alert>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="chat">
                        {activeRequest ? (
                            <LiveEmergencyChat emergencyRequest={activeRequest} user={user} isBengali={isBengali} />
                        ) : (
                            <Card className="p-8 text-center">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {isBengali ? 'লাইভ চ্যাট উপলব্ধ নেই' : 'Live Chat Not Available'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {isBengali ? 'লাইভ চ্যাট ব্যবহার করতে প্রথমে একটি জরুরি অনুরোধ জমা দিন।' : 'Submit an emergency request first to access live chat.'}
                                </p>
                                <Button variant="outline" onClick={() => document.querySelector('[value="request"]').click()}>
                                    {isBengali ? 'জরুরি অনুরোধ করুন' : 'Make Emergency Request'}
                                </Button>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="track">
                        {activeRequest ? (
                            <EmergencyTracker emergencyRequest={activeRequest} isBengali={isBengali} />
                        ) : (
                            <Card className="p-8 text-center">
                                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {isBengali ? 'ট্র্যাকিং উপলব্ধ নেই' : 'Tracking Not Available'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {isBengali ? 'জরুরি সাড়া ট্র্যাক করতে প্রথমে একটি অনুরোধ জমা দিন।' : 'Submit an emergency request first to track response.'}
                                </p>
                                <Button variant="outline" onClick={() => document.querySelector('[value="request"]').click()}>
                                    {isBengali ? 'জরুরি অনুরোধ করুন' : 'Make Emergency Request'}
                                </Button>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="video">
                        {activeRequest ? (
                            <VideoConsultation emergencyRequest={activeRequest} user={user} isBengali={isBengali} />
                        ) : (
                            <Card className="p-8 text-center">
                                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    {isBengali ? 'ভিডিও পরামর্শ উপলব্ধ নেই' : 'Video Consultation Not Available'}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {isBengali ? 'ভিডিও পরামর্শের জন্য প্রথমে একটি জরুরি অনুরোধ জমা দিন।' : 'Submit an emergency request first to access video consultation.'}
                                </p>
                                <Button variant="outline" onClick={() => document.querySelector('[value="request"]').click()}>
                                    {isBengali ? 'জরুরি অনুরোধ করুন' : 'Make Emergency Request'}
                                </Button>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
