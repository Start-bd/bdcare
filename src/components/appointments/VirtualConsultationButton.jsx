import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VirtualConsultationButton({ appointment, isBengali }) {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const createOrJoinConsultation = async () => {
        setIsCreating(true);
        try {
            // Check if consultation already exists
            const existing = await base44.entities.VideoConsultation.filter(
                { appointment_id: appointment.id },
                '-created_date',
                1
            );

            let consultationId;
            
            if (existing.length > 0) {
                consultationId = existing[0].id;
            } else {
                // Create new consultation
                const newConsultation = await base44.entities.VideoConsultation.create({
                    patient_id: appointment.patient_id,
                    doctor_id: appointment.doctor_id,
                    appointment_id: appointment.id,
                    consultation_type: 'routine',
                    scheduled_time: appointment.appointment_date,
                    session_status: 'scheduled'
                });
                consultationId = newConsultation.id;
            }

            // Navigate to telemedicine page
            navigate(createPageUrl(`Telemedicine?consultationId=${consultationId}`));
        } catch (error) {
            console.error('Failed to create consultation:', error);
        }
        setIsCreating(false);
    };

    return (
        <>
            <Button 
                onClick={() => setShowDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
            >
                <Video className="w-4 h-4 mr-2" />
                {isBengali ? 'ভার্চুয়াল পরামর্শ' : 'Virtual Consultation'}
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isBengali ? 'ভার্চুয়াল পরামর্শ শুরু করুন' : 'Start Virtual Consultation'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {isBengali 
                                ? 'আপনি ডাক্তারের সাথে ভিডিও কলের মাধ্যমে পরামর্শ নিতে পারবেন।'
                                : 'You can consult with the doctor via video call.'}
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2">
                                {isBengali ? '📅 অ্যাপয়েন্টমেন্ট' : '📅 Appointment'}
                            </p>
                            <p className="font-medium">{appointment.doctor_name}</p>
                            <p className="text-sm text-gray-600">
                                {new Date(appointment.appointment_date).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}
                            </p>
                        </div>
                        <Button 
                            onClick={createOrJoinConsultation}
                            disabled={isCreating}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Video className="w-4 h-4 mr-2" />
                            )}
                            {isBengali ? 'কল শুরু করুন' : 'Start Call'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}