import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Save } from 'lucide-react';

export default function PrescriptionEditor({ consultation, isBengali, onClose }) {
    const [medications, setMedications] = useState(
        consultation.prescription ? JSON.parse(consultation.prescription).medications : []
    );
    const [diagnosis, setDiagnosis] = useState(
        consultation.prescription ? JSON.parse(consultation.prescription).diagnosis : ''
    );
    const [instructions, setInstructions] = useState(
        consultation.prescription ? JSON.parse(consultation.prescription).instructions : ''
    );
    const [followUpDate, setFollowUpDate] = useState(
        consultation.prescription ? JSON.parse(consultation.prescription).followUpDate : ''
    );
    const [isSaving, setIsSaving] = useState(false);

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const updateMedication = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const prescriptionData = {
                diagnosis,
                medications,
                instructions,
                followUpDate,
                issuedDate: new Date().toISOString(),
                doctorId: consultation.doctor_id
            };

            await base44.entities.VideoConsultation.update(consultation.id, {
                prescription: JSON.stringify(prescriptionData)
            });

            onClose();
        } catch (error) {
            console.error('Failed to save prescription:', error);
            alert(isBengali ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save prescription');
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {isBengali ? '💊 প্রেসক্রিপশন তৈরি করুন' : '💊 Create Prescription'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                        <Label className="text-base font-semibold mb-2 block">
                            {isBengali ? 'রোগ নির্ণয়' : 'Diagnosis'}
                        </Label>
                        <Textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder={isBengali ? 'রোগ নির্ণয় লিখুন...' : 'Enter diagnosis...'}
                            rows={3}
                        />
                    </div>

                    {/* Medications */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-base font-semibold">
                                {isBengali ? 'ঔষধ' : 'Medications'}
                            </Label>
                            <Button onClick={addMedication} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-1" />
                                {isBengali ? 'ঔষধ যোগ করুন' : 'Add Medication'}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {medications.map((med, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <span className="font-semibold text-sm">
                                            {isBengali ? 'ঔষধ' : 'Medication'} {index + 1}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeMedication(index)}
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>

                                    <Input
                                        placeholder={isBengali ? 'ঔষধের নাম' : 'Medicine name'}
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder={isBengali ? 'ডোজ (যেমন: 500mg)' : 'Dosage (e.g., 500mg)'}
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        />
                                        <Input
                                            placeholder={isBengali ? 'ফ্রিকোয়েন্সি (যেমন: দিনে ২ বার)' : 'Frequency (e.g., 2x daily)'}
                                            value={med.frequency}
                                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder={isBengali ? 'সময়কাল (যেমন: ৭ দিন)' : 'Duration (e.g., 7 days)'}
                                            value={med.duration}
                                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                        />
                                        <Input
                                            placeholder={isBengali ? 'নির্দেশনা' : 'Instructions'}
                                            value={med.instructions}
                                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {medications.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    {isBengali ? 'কোনো ঔষধ যোগ করা হয়নি' : 'No medications added'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Instructions */}
                    <div>
                        <Label className="text-base font-semibold mb-2 block">
                            {isBengali ? 'অতিরিক্ত নির্দেশনা' : 'Additional Instructions'}
                        </Label>
                        <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder={isBengali ? 'খাদ্য, বিশ্রাম ইত্যাদি সম্পর্কিত পরামর্শ...' : 'Advice regarding diet, rest, etc...'}
                            rows={4}
                        />
                    </div>

                    {/* Follow-up */}
                    <div>
                        <Label className="text-base font-semibold mb-2 block">
                            {isBengali ? 'ফলো-আপ তারিখ' : 'Follow-up Date'}
                        </Label>
                        <Input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            {isBengali ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !diagnosis || medications.length === 0}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isBengali ? 'সংরক্ষণ করুন' : 'Save Prescription'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}