import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Building, Download, Pill, Activity, FileText } from 'lucide-react';

export default function MedicalRecordDetail({ record, isBengali, onClose }) {
    const data = record.extracted_data || {};

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{record.document_name}</span>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(record.document_url, '_blank')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isBengali ? 'ডাউনলোড' : 'Download'}
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(record.record_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                        </div>
                        {data.doctor_name && (
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {data.doctor_name}
                            </div>
                        )}
                        {data.hospital_name && (
                            <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                {data.hospital_name}
                            </div>
                        )}
                    </div>

                    {data.summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {isBengali ? 'সারসংক্ষেপ' : 'Summary'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{data.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {data.diagnoses && data.diagnoses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    {isBengali ? 'ডায়াগনোসিস' : 'Diagnoses'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {data.diagnoses.map((diagnosis, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-emerald-600 mr-2">•</span>
                                            <span>{diagnosis}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {data.medications && data.medications.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Pill className="w-5 h-5" />
                                    {isBengali ? 'ঔষধ' : 'Medications'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.medications.map((med, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="font-semibold text-gray-900">{med.name}</div>
                                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                {med.dosage && <div>💊 {isBengali ? 'ডোজ' : 'Dosage'}: {med.dosage}</div>}
                                                {med.frequency && <div>⏰ {isBengali ? 'ফ্রিকোয়েন্সি' : 'Frequency'}: {med.frequency}</div>}
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
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {isBengali ? '🧪 টেস্ট রেজাল্ট' : '🧪 Test Results'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">{isBengali ? 'টেস্ট' : 'Test'}</th>
                                                <th className="text-left py-2">{isBengali ? 'মান' : 'Value'}</th>
                                                <th className="text-left py-2">{isBengali ? 'রেফারেন্স' : 'Reference'}</th>
                                                <th className="text-left py-2">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.test_results.map((test, idx) => (
                                                <tr key={idx} className="border-b">
                                                    <td className="py-2">{test.test_name}</td>
                                                    <td className="py-2">{test.value} {test.unit}</td>
                                                    <td className="py-2 text-gray-600">{test.reference_range}</td>
                                                    <td className="py-2">
                                                        <Badge className={
                                                            test.status === 'normal' ? 'bg-green-100 text-green-800' :
                                                            test.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}