import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';

export default function AddMedicationReminder({ userId, isBengali, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        medication_name: '',
        dosage: '',
        frequency: 'once_daily',
        times: ['08:00'],
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        instructions: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const frequencies = [
        { value: 'once_daily', labelBn: 'দিনে একবার', labelEn: 'Once daily', timeSlots: 1 },
        { value: 'twice_daily', labelBn: 'দিনে দুইবার', labelEn: 'Twice daily', timeSlots: 2 },
        { value: 'three_times_daily', labelBn: 'দিনে তিনবার', labelEn: 'Three times daily', timeSlots: 3 },
        { value: 'four_times_daily', labelBn: 'দিনে চারবার', labelEn: 'Four times daily', timeSlots: 4 },
        { value: 'as_needed', labelBn: 'প্রয়োজন অনুযায়ী', labelEn: 'As needed', timeSlots: 0 }
    ];

    const handleFrequencyChange = (frequency) => {
        const freq = frequencies.find(f => f.value === frequency);
        const defaultTimes = ['08:00', '14:00', '20:00', '02:00'];
        setFormData({
            ...formData,
            frequency,
            times: freq.timeSlots > 0 ? defaultTimes.slice(0, freq.timeSlots) : []
        });
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData({ ...formData, times: newTimes });
    };

    const handleSave = async () => {
        if (!formData.medication_name || !formData.start_date) {
            return;
        }

        setIsSaving(true);
        try {
            await base44.entities.MedicationReminder.create({
                user_id: userId,
                ...formData,
                is_active: true,
                reminder_enabled: true
            });
            onSuccess();
        } catch (error) {
            console.error('Failed to save medication reminder:', error);
        }
        setIsSaving(false);
    };

    const selectedFreq = frequencies.find(f => f.value === formData.frequency);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isBengali ? '💊 ঔষধের রিমাইন্ডার যোগ করুন' : '💊 Add Medication Reminder'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>{isBengali ? 'ঔষধের নাম *' : 'Medication Name *'}</Label>
                        <Input 
                            value={formData.medication_name}
                            onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                            placeholder={isBengali ? 'যেমন: Paracetamol' : 'e.g., Paracetamol'}
                        />
                    </div>

                    <div>
                        <Label>{isBengali ? 'ডোজ' : 'Dosage'}</Label>
                        <Input 
                            value={formData.dosage}
                            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            placeholder={isBengali ? 'যেমন: ৫০০mg' : 'e.g., 500mg'}
                        />
                    </div>

                    <div>
                        <Label>{isBengali ? 'ফ্রিকোয়েন্সি *' : 'Frequency *'}</Label>
                        <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {frequencies.map(freq => (
                                    <SelectItem key={freq.value} value={freq.value}>
                                        {isBengali ? freq.labelBn : freq.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedFreq?.timeSlots > 0 && (
                        <div>
                            <Label>{isBengali ? 'সময়সমূহ' : 'Times'}</Label>
                            <div className="space-y-2 mt-2">
                                {formData.times.map((time, idx) => (
                                    <Input
                                        key={idx}
                                        type="time"
                                        value={time}
                                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{isBengali ? 'শুরুর তারিখ *' : 'Start Date *'}</Label>
                            <Input 
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>{isBengali ? 'শেষের তারিখ' : 'End Date'}</Label>
                            <Input 
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={formData.start_date}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>{isBengali ? 'নির্দেশনা' : 'Instructions'}</Label>
                        <Textarea 
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder={isBengali ? 'যেমন: খাবারের পরে খান' : 'e.g., Take after meals'}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            {isBengali ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={!formData.medication_name || !formData.start_date || isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            {isBengali ? 'সংরক্ষণ করুন' : 'Save'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}