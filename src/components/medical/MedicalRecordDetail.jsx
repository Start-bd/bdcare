import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Building, Download, Pill, Activity, FileText, Share2 } from 'lucide-react';

const STATUS_COLORS = {
    normal: 'bg-green-100 text-green-800',
    abnormal: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
};

export default function MedicalRecordDetail({ record, isBengali, onClose, onShare }) {
    const data = record.extracted_data || {};

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{record.document_name}</span>
                        </DialogTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {onShare && (
                                <Button variant="outline" size="sm" onClick={onShare} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    {isBengali ? 'শেয়ার করুন' : 'Share'}
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => window.open(record.document_url, '_blank')}>
                                <Download className="w-4 h-4 mr-2" />
                                {isBengali ? 'ডাউনলোড' : 'Download'}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {record.record_date
                                ? new Date(record.record_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '—'}
                        </div>
                        {data.doctor_name && (
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {data.doctor_name}
                            </div>
                        )}
                        {data.hospital_name && (
                            <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2 text-gray-400" />
                                {data.hospital_name}
                            </div>
                        )}
                        {record.shared_with_doctors?.length > 0 && (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                <Share2 className="w-3 h-3 mr-1" />
                                {isBengali ? `${record.shared_with_doctors.length} জন ডাক্তারের সাথে শেয়ার` : `Shared with ${record.shared_with_doctors.length} doctor(s)`}
                            </Badge>
                        )}
                    </div>

                    {data.summary && (
                        <Card className="border-emerald-100">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    {isBengali ? 'সারসংক্ষেপ' : 'Summary'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {data.diagnoses && data.diagnoses.length > 0 && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                                    <Activity className="w-4 h-4 text-red-500" />
                                    {isBengali ? 'ডায়াগনোসিস' : 'Diagnoses'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ul className="space-y-1.5">
                                    {data.diagnoses.map((d, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {data.medications && data.medications.length > 0 && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                                    <Pill className="w-4 h-4 text-green-600" />
                                    {isBengali ? 'ঔষধ' : 'Medications'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {data.medications.map((med, i) => (
                                        <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-100">
                                            <div className="font-semibold text-gray-900 text-sm">{med.name}</div>
                                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                                {med.dosage && <div>💊 {isBengali ? 'ডোজ' : 'Dose'}: {med.dosage}</div>}
                                                {med.frequency && <div>⏰ {isBengali ? 'ফ্রিকোয়েন্সি' : 'Freq'}: {med.frequency}</div>}
                                                {med.duration && <div>📅 {isBengali ? 'সময়কাল' : 'Duration'}: {med.duration}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {data.test_results && data.test_results.length > 0 && (
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm text-gray-700">
                                    🧪 {isBengali ? 'টেস্ট রেজাল্ট' : 'Test Results'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">{isBengali ? 'টেস্ট' : 'Test'}</th>
                                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">{isBengali ? 'মান' : 'Value'}</th>
                                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">{isBengali ? 'রেফারেন্স' : 'Reference'}</th>
                                                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.test_results.map((test, i) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    <td className="py-2 px-3 font-medium text-gray-800">{test.test_name}</td>
                                                    <td className="py-2 px-3 text-gray-700">{test.value} {test.unit}</td>
                                                    <td className="py-2 px-3 text-gray-500 text-xs">{test.reference_range}</td>
                                                    <td className="py-2 px-3">
                                                        <Badge className={`${STATUS_COLORS[test.status] || 'bg-gray-100 text-gray-800'} text-xs`}>
                                                            {test.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!data.summary && !data.diagnoses?.length && !data.medications?.length && !data.test_results?.length && (
                        <div className="text-center py-6 text-gray-400">
                            <p className="text-sm">{isBengali ? 'AI বিশ্লেষণ পাওয়া যায়নি' : 'No AI analysis available for this record'}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}