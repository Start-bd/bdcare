import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, Pill, Clock, User } from 'lucide-react';

export default function PrescriptionViewer({ consultation, isBengali, onClose }) {
    if (!consultation.prescription) return null;

    const prescription = JSON.parse(consultation.prescription);

    const printPrescription = () => {
        window.print();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-full">
                <DialogHeader className="print:mb-6">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        {isBengali ? 'প্রেসক্রিপশন' : 'Prescription'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 print:space-y-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg print:bg-white print:border">
                        <div>
                            <p className="text-sm text-gray-600">{isBengali ? 'রোগী' : 'Patient'}</p>
                            <p className="font-semibold">{consultation.patient_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{isBengali ? 'ডাক্তার' : 'Doctor'}</p>
                            <p className="font-semibold">{prescription.doctorId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{isBengali ? 'তারিখ' : 'Date'}</p>
                            <p className="font-semibold">
                                {new Date(prescription.issuedDate).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{isBengali ? 'পরামর্শ ধরন' : 'Consultation Type'}</p>
                            <p className="font-semibold">{consultation.consultation_type}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Diagnosis */}
                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-600" />
                            {isBengali ? 'রোগ নির্ণয়' : 'Diagnosis'}
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg print:bg-white print:border">
                            <p className="text-gray-800">{prescription.diagnosis}</p>
                        </div>
                    </div>

                    {/* Medications */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-emerald-600" />
                            {isBengali ? 'ঔষধপত্র' : 'Medications'}
                        </h3>
                        <div className="space-y-3">
                            {prescription.medications.map((med, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-white print:border-gray-400">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-lg">{index + 1}. {med.name}</h4>
                                        <Badge className="bg-blue-100 text-blue-800">{med.dosage}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                        <div>
                                            <span className="text-gray-600">{isBengali ? 'ফ্রিকোয়েন্সি:' : 'Frequency:'}</span>
                                            <span className="ml-2 font-medium">{med.frequency}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">{isBengali ? 'সময়কাল:' : 'Duration:'}</span>
                                            <span className="ml-2 font-medium">{med.duration}</span>
                                        </div>
                                    </div>
                                    {med.instructions && (
                                        <div className="mt-2 text-sm">
                                            <span className="text-gray-600">{isBengali ? 'নির্দেশনা:' : 'Instructions:'}</span>
                                            <span className="ml-2">{med.instructions}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Instructions */}
                    {prescription.instructions && (
                        <div>
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                {isBengali ? 'অতিরিক্ত নির্দেশনা' : 'Additional Instructions'}
                            </h3>
                            <div className="p-4 bg-amber-50 rounded-lg print:bg-white print:border">
                                <p className="text-gray-800 whitespace-pre-wrap">{prescription.instructions}</p>
                            </div>
                        </div>
                    )}

                    {/* Follow-up */}
                    {prescription.followUpDate && (
                        <div className="p-4 bg-green-50 rounded-lg print:bg-white print:border">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-semibold">
                                        {isBengali ? 'ফলো-আপ তারিখ' : 'Follow-up Date'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(prescription.followUpDate).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Note */}
                    <div className="pt-4 border-t text-center text-sm text-gray-500 print:border-gray-400">
                        <p>{isBengali ? '⚕️ এই প্রেসক্রিপশনটি ইলেকট্রনিক্যালি তৈরি এবং বৈধ' : '⚕️ This prescription is electronically generated and valid'}</p>
                        <p className="mt-1">{isBengali ? 'স্বাস্থ্য বন্ধু - ডিজিটাল হেলথকেয়ার প্ল্যাটফর্ম' : 'Shasthya Bondhu - Digital Healthcare Platform'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 print:hidden">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            {isBengali ? 'বন্ধ করুন' : 'Close'}
                        </Button>
                        <Button onClick={printPrescription} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            {isBengali ? '🖨️ প্রিন্ট করুন' : '🖨️ Print'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}