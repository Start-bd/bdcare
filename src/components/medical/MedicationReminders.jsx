import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Pill, Clock, Calendar, Plus, Bell } from 'lucide-react';
import AddMedicationReminder from './AddMedicationReminder';

export default function MedicationReminders({ userId, isBengali, refreshTrigger }) {
    const [medications, setMedications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        loadMedications();
    }, [userId, refreshTrigger]);

    const loadMedications = async () => {
        setIsLoading(true);
        try {
            const fetchedMeds = await base44.entities.MedicationReminder.filter(
                { user_id: userId },
                '-created_date',
                100
            );
            setMedications(fetchedMeds);
        } catch (error) {
            console.error('Failed to load medications:', error);
        }
        setIsLoading(false);
    };

    const toggleReminder = async (med) => {
        try {
            await base44.entities.MedicationReminder.update(med.id, {
                reminder_enabled: !med.reminder_enabled
            });
            loadMedications();
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
        }
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            once_daily: { bn: 'দিনে একবার', en: 'Once daily' },
            twice_daily: { bn: 'দিনে দুইবার', en: 'Twice daily' },
            three_times_daily: { bn: 'দিনে তিনবার', en: 'Three times daily' },
            four_times_daily: { bn: 'দিনে চারবার', en: 'Four times daily' },
            as_needed: { bn: 'প্রয়োজন অনুযায়ী', en: 'As needed' },
            custom: { bn: 'কাস্টম', en: 'Custom' }
        };
        return isBengali ? labels[frequency]?.bn : labels[frequency]?.en;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {isBengali ? '💊 ঔষধের রিমাইন্ডার' : '💊 Medication Reminders'}
                    </h2>
                    <Button 
                        onClick={() => setShowAdd(true)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isBengali ? 'যোগ করুন' : 'Add'}
                    </Button>
                </div>

                {medications.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                {isBengali ? 'কোনো রিমাইন্ডার নেই' : 'No Reminders Set'}
                            </h3>
                            <p className="text-gray-500">
                                {isBengali 
                                    ? 'ঔষধের রিমাইন্ডার যোগ করুন'
                                    : 'Add medication reminders to stay on track'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medications.map((med) => (
                            <Card key={med.id} className={!med.is_active ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Pill className="w-5 h-5 text-emerald-600" />
                                                {med.medication_name}
                                            </CardTitle>
                                            {med.dosage && (
                                                <p className="text-sm text-gray-600 mt-1">{med.dosage}</p>
                                            )}
                                        </div>
                                        <Switch
                                            checked={med.reminder_enabled}
                                            onCheckedChange={() => toggleReminder(med)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {getFrequencyLabel(med.frequency)}
                                    </div>
                                    
                                    {med.times && med.times.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {med.times.map((time, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {time}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(med.start_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                                        {med.end_date && ` - ${new Date(med.end_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}`}
                                    </div>

                                    {med.instructions && (
                                        <p className="text-sm text-gray-600 pt-2 border-t">
                                            ℹ️ {med.instructions}
                                        </p>
                                    )}

                                    {med.reminder_enabled && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                            <Bell className="w-3 h-3 mr-1" />
                                            {isBengali ? 'রিমাইন্ডার চালু' : 'Reminder Active'}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {showAdd && (
                <AddMedicationReminder
                    userId={userId}
                    isBengali={isBengali}
                    onClose={() => setShowAdd(false)}
                    onSuccess={() => {
                        setShowAdd(false);
                        loadMedications();
                    }}
                />
            )}
        </>
    );
}