import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadMedicalRecord({ userId, isBengali, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [recordType, setRecordType] = useState('lab_report');
    const [recordDate, setRecordDate] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const recordTypes = [
        { value: 'lab_report', labelBn: 'ল্যাব রিপোর্ট', labelEn: 'Lab Report' },
        { value: 'prescription', labelBn: 'প্রেসক্রিপশন', labelEn: 'Prescription' },
        { value: 'imaging', labelBn: 'ইমেজিং (X-Ray, MRI)', labelEn: 'Imaging (X-Ray, MRI)' },
        { value: 'diagnosis', labelBn: 'ডায়াগনোসিস', labelEn: 'Diagnosis' },
        { value: 'vaccination', labelBn: 'টিকাকরণ', labelEn: 'Vaccination' },
        { value: 'hospital_discharge', labelBn: 'হাসপাতাল ডিসচার্জ', labelEn: 'Hospital Discharge' },
        { value: 'other', labelBn: 'অন্যান্য', labelEn: 'Other' }
    ];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(selectedFile.type)) {
                setError(isBengali ? 'শুধুমাত্র PDF বা ছবি (JPG, PNG) আপলোড করুন' : 'Only PDF or images (JPG, PNG) allowed');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError(isBengali ? 'ফাইল সাইজ ১০MB এর বেশি হতে পারবে না' : 'File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !recordType || !recordDate) {
            setError(isBengali ? 'সব তথ্য পূরণ করুন' : 'Please fill all fields');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // Upload file
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            setIsProcessing(true);
            setIsUploading(false);

            // Extract data using AI
            const prompt = `You are a medical data extraction AI. Analyze this medical document and extract structured information.

Document Type: ${recordType}
Date: ${recordDate}

Extract the following information in ${isBengali ? 'Bengali' : 'English'}:
1. Diagnoses/Conditions mentioned
2. Medications prescribed (name, dosage, frequency, duration)
3. Test results with values and reference ranges
4. Doctor's name and hospital name if mentioned
5. Brief summary of the document

Be thorough and accurate. If information is not found, return empty arrays/null values.`;

            const extractedData = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        diagnoses: { type: "array", items: { type: "string" } },
                        medications: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    dosage: { type: "string" },
                                    frequency: { type: "string" },
                                    duration: { type: "string" }
                                }
                            }
                        },
                        test_results: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    test_name: { type: "string" },
                                    value: { type: "string" },
                                    unit: { type: "string" },
                                    reference_range: { type: "string" },
                                    status: { type: "string" }
                                }
                            }
                        },
                        doctor_name: { type: "string" },
                        hospital_name: { type: "string" },
                        summary: { type: "string" }
                    }
                }
            });

            // Create medical record
            await base44.entities.MedicalRecord.create({
                user_id: userId,
                record_type: recordType,
                document_url: file_url,
                document_name: file.name,
                record_date: recordDate,
                extracted_data: extractedData,
                tags: [recordType]
            });

            // Create medication reminders if medications found
            if (extractedData.medications && extractedData.medications.length > 0) {
                for (const med of extractedData.medications) {
                    const frequency = med.frequency?.toLowerCase().includes('twice') ? 'twice_daily' :
                                    med.frequency?.toLowerCase().includes('three') ? 'three_times_daily' :
                                    med.frequency?.toLowerCase().includes('four') ? 'four_times_daily' : 'once_daily';

                    await base44.entities.MedicationReminder.create({
                        user_id: userId,
                        medication_name: med.name,
                        dosage: med.dosage,
                        frequency,
                        start_date: recordDate,
                        instructions: med.duration || '',
                        is_active: true
                    });
                }
            }

            onSuccess();
        } catch (err) {
            console.error('Upload error:', err);
            setError(isBengali ? 'আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Upload className="w-6 h-6 text-emerald-600" />
                        {isBengali ? 'মেডিকেল রেকর্ড আপলোড করুন' : 'Upload Medical Record'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label>{isBengali ? 'রেকর্ডের ধরন' : 'Record Type'}</Label>
                        <Select value={recordType} onValueChange={setRecordType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {recordTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {isBengali ? type.labelBn : type.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>{isBengali ? 'রেকর্ডের তারিখ' : 'Record Date'}</Label>
                        <Input 
                            type="date" 
                            value={recordDate} 
                            onChange={(e) => setRecordDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div>
                        <Label>{isBengali ? 'ডকুমেন্ট আপলোড করুন (PDF বা ছবি)' : 'Upload Document (PDF or Image)'}</Label>
                        <div className="mt-2 flex items-center gap-4">
                            <Input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={isUploading || isProcessing}
                            />
                            {file && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {isBengali ? 'সর্বোচ্চ সাইজ: ১০MB' : 'Max size: 10MB'}
                        </p>
                    </div>

                    {isProcessing && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertDescription>
                                {isBengali 
                                    ? '🤖 AI আপনার ডকুমেন্ট বিশ্লেষণ করছে... অনুগ্রহ করে অপেক্ষা করুন।'
                                    : '🤖 AI is analyzing your document... Please wait.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={isUploading || isProcessing}>
                            {isBengali ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button 
                            onClick={handleUpload} 
                            disabled={!file || !recordType || !recordDate || isUploading || isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {(isUploading || isProcessing) ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {isUploading ? (isBengali ? 'আপলোড হচ্ছে...' : 'Uploading...') :
                             isProcessing ? (isBengali ? 'বিশ্লেষণ হচ্ছে...' : 'Processing...') :
                             (isBengali ? 'আপলোড ও বিশ্লেষণ করুন' : 'Upload & Analyze')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}