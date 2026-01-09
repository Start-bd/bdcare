import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, FileText, Calendar, Download } from 'lucide-react';

export default function PostCallSummary({ consultation, user, isBengali, onComplete }) {
    const [notes, setNotes] = useState(consultation.consultation_notes || '');
    const [prescription, setPrescription] = useState(consultation.prescription || '');
    const [followUpRequired, setFollowUpRequired] = useState(consultation.follow_up_required || false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isDoctor = user.user_type === 'doctor' || user.role === 'doctor';

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await base44.entities.VideoConsultation.update(consultation.id, {
                consultation_notes: notes,
                prescription: prescription,
                follow_up_required: followUpRequired
            });
            setSaved(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (error) {
            console.error('Failed to save summary:', error);
        }
        setIsSaving(false);
    };

    const generateReport = () => {
        const report = `
=== ${isBengali ? 'পরামর্শ সারাংশ' : 'Consultation Summary'} ===
${isBengali ? 'তারিখ' : 'Date'}: ${new Date(consultation.actual_start_time).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}
${isBengali ? 'সময়কাল' : 'Duration'}: ${Math.round((new Date(consultation.actual_end_time) - new Date(consultation.actual_start_time)) / 60000)} ${isBengali ? 'মিনিট' : 'minutes'}

${isBengali ? 'পরামর্শ নোট' : 'Consultation Notes'}:
${notes}

${prescription ? `\n${isBengali ? 'প্রেসক্রিপশন' : 'Prescription'}:\n${prescription}\n` : ''}

${isBengali ? 'ফলো-আপ প্রয়োজন' : 'Follow-up Required'}: ${followUpRequired ? (isBengali ? 'হ্যাঁ' : 'Yes') : (isBengali ? 'না' : 'No')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consultation-summary-${consultation.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (saved) {
        return (
            <Card className="max-w-2xl mx-auto shadow-xl">
                <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Save className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">
                        {isBengali ? 'সফলভাবে সংরক্ষিত!' : 'Successfully Saved!'}
                    </h2>
                    <p className="text-gray-600">
                        {isBengali 
                            ? 'পরামর্শ সারাংশ সংরক্ষণ করা হয়েছে।'
                            : 'Consultation summary has been saved.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    {isBengali ? 'পরামর্শ সারাংশ' : 'Consultation Summary'}
                </CardTitle>
                <p className="text-blue-100 text-sm">
                    {isBengali 
                        ? 'পরামর্শ সম্পন্ন হয়েছে। অনুগ্রহ করে সারাংশ সম্পূর্ণ করুন।'
                        : 'Consultation completed. Please complete the summary.'}
                </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Session Info */}
                <Alert>
                    <Calendar className="w-4 h-4" />
                    <AlertDescription>
                        <div className="flex justify-between">
                            <span>{isBengali ? 'শুরু' : 'Started'}: {new Date(consultation.actual_start_time).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}</span>
                            <span>{isBengali ? 'সমাপ্ত' : 'Ended'}: {new Date(consultation.actual_end_time).toLocaleString(isBengali ? 'bn-BD' : 'en-US')}</span>
                        </div>
                        <div className="mt-2">
                            <strong>{isBengali ? 'সময়কাল' : 'Duration'}:</strong> {Math.round((new Date(consultation.actual_end_time) - new Date(consultation.actual_start_time)) / 60000)} {isBengali ? 'মিনিট' : 'minutes'}
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Notes (Required for Doctor) */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-lg font-semibold">
                        {isBengali ? '📝 পরামর্শ নোট' : '📝 Consultation Notes'}
                        {isDoctor && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={isBengali 
                            ? 'রোগীর অবস্থা, লক্ষণ, পরামর্শ ইত্যাদি লিখুন...'
                            : 'Patient condition, symptoms, recommendations, etc...'}
                        rows={6}
                        disabled={!isDoctor}
                        className="resize-none"
                    />
                </div>

                {/* Prescription (Doctor only) */}
                {isDoctor && (
                    <div className="space-y-2">
                        <Label htmlFor="prescription" className="text-lg font-semibold">
                            {isBengali ? '💊 প্রেসক্রিপশন' : '💊 Prescription'}
                        </Label>
                        <Textarea
                            id="prescription"
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            placeholder={isBengali 
                                ? 'ঔষধ, ডোজ, নির্দেশনা লিখুন...'
                                : 'Medications, dosage, instructions...'}
                            rows={8}
                            className="resize-none font-mono"
                        />
                    </div>
                )}

                {/* Follow-up */}
                {isDoctor && (
                    <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                        <Checkbox 
                            id="followup"
                            checked={followUpRequired}
                            onCheckedChange={setFollowUpRequired}
                        />
                        <Label htmlFor="followup" className="cursor-pointer">
                            {isBengali 
                                ? '🔄 ফলো-আপ অ্যাপয়েন্টমেন্ট প্রয়োজন'
                                : '🔄 Follow-up appointment required'}
                        </Label>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    {isDoctor ? (
                        <>
                            <Button 
                                onClick={handleSave}
                                disabled={isSaving || !notes.trim()}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                size="lg"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {isBengali ? 'সংরক্ষণ করুন' : 'Save Summary'}
                            </Button>
                            {notes && (
                                <Button 
                                    onClick={generateReport}
                                    variant="outline"
                                    size="lg"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    {isBengali ? 'ডাউনলোড' : 'Download'}
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            {consultation.consultation_notes ? (
                                <Button 
                                    onClick={generateReport}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    size="lg"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    {isBengali ? 'সারাংশ ডাউনলোড করুন' : 'Download Summary'}
                                </Button>
                            ) : (
                                <Alert className="flex-1">
                                    <AlertDescription>
                                        {isBengali 
                                            ? 'ডাক্তার শীঘ্রই সারাংশ প্রদান করবেন।'
                                            : 'Doctor will provide the summary shortly.'}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button 
                                onClick={onComplete}
                                variant="outline"
                                size="lg"
                            >
                                {isBengali ? 'বন্ধ করুন' : 'Close'}
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}