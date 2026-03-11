import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Download, Eye, Calendar, User, Building, Trash2, Share2, Search, Filter } from 'lucide-react';
import MedicalRecordDetail from './MedicalRecordDetail';
import ShareRecordDialog from './ShareRecordDialog';

const TYPE_LABELS = {
    lab_report:         { bn: 'ল্যাব রিপোর্ট',    en: 'Lab Report' },
    prescription:       { bn: 'প্রেসক্রিপশন',     en: 'Prescription' },
    imaging:            { bn: 'ইমেজিং',            en: 'Imaging' },
    diagnosis:          { bn: 'ডায়াগনোসিস',        en: 'Diagnosis' },
    vaccination:        { bn: 'টিকাকরণ',           en: 'Vaccination' },
    hospital_discharge: { bn: 'ডিসচার্জ',          en: 'Discharge' },
    other:              { bn: 'অন্যান্য',           en: 'Other' }
};

const TYPE_COLORS = {
    lab_report:         'bg-blue-100 text-blue-800 border-blue-200',
    prescription:       'bg-green-100 text-green-800 border-green-200',
    imaging:            'bg-purple-100 text-purple-800 border-purple-200',
    diagnosis:          'bg-red-100 text-red-800 border-red-200',
    vaccination:        'bg-yellow-100 text-yellow-800 border-yellow-200',
    hospital_discharge: 'bg-gray-100 text-gray-800 border-gray-200',
    other:              'bg-slate-100 text-slate-800 border-slate-200'
};

const TYPE_ICONS = {
    lab_report: '🧪', prescription: '💊', imaging: '🩻',
    diagnosis: '🩺', vaccination: '💉', hospital_discharge: '🏥', other: '📄'
};

export default function MedicalRecordsList({ userId, isBengali, refreshTrigger, onRecordChanged }) {
    const [records, setRecords] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [shareRecord, setShareRecord] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => { loadRecords(); }, [userId, refreshTrigger]);

    useEffect(() => {
        let result = records;
        if (typeFilter !== 'all') result = result.filter(r => r.record_type === typeFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(r =>
                r.document_name?.toLowerCase().includes(q) ||
                r.extracted_data?.doctor_name?.toLowerCase().includes(q) ||
                r.extracted_data?.hospital_name?.toLowerCase().includes(q) ||
                r.extracted_data?.summary?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [records, search, typeFilter]);

    const loadRecords = async () => {
        setIsLoading(true);
        try {
            const fetched = await base44.entities.MedicalRecord.filter({ user_id: userId }, '-record_date', 200);
            setRecords(fetched);
        } catch (e) {}
        setIsLoading(false);
    };

    const handleDelete = async (record) => {
        if (!confirm(isBengali ? 'এই রেকর্ড মুছে ফেলবেন?' : 'Delete this record permanently?')) return;
        setDeletingId(record.id);
        try {
            await base44.entities.MedicalRecord.delete(record.id);
            setRecords(prev => prev.filter(r => r.id !== record.id));
            onRecordChanged?.();
        } catch (e) {}
        setDeletingId(null);
    };

    const handleShareSuccess = () => {
        setShareRecord(null);
        loadRecords();
        onRecordChanged?.();
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
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder={isBengali ? 'রেকর্ড খুঁজুন...' : 'Search records...'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder={isBengali ? 'সব ধরন' : 'All Types'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{isBengali ? 'সব ধরন' : 'All Types'}</SelectItem>
                        {Object.entries(TYPE_LABELS).map(([val, labels]) => (
                            <SelectItem key={val} value={val}>{isBengali ? labels.bn : labels.en}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {filtered.length === 0 ? (
                <Card className="text-center py-16 bg-white">
                    <CardContent>
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {records.length === 0
                                ? (isBengali ? 'কোনো রেকর্ড নেই' : 'No Records Yet')
                                : (isBengali ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No Results Found')}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {records.length === 0
                                ? (isBengali ? 'উপরের বাটন দিয়ে আপনার প্রথম রেকর্ড আপলোড করুন' : 'Upload your first record using the button above')
                                : (isBengali ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করুন' : 'Try changing your search or filter')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((record) => (
                        <Card key={record.id} className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-100 group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{TYPE_ICONS[record.record_type] || '📄'}</span>
                                            <Badge className={`${TYPE_COLORS[record.record_type]} text-xs border`}>
                                                {isBengali ? TYPE_LABELS[record.record_type]?.bn : TYPE_LABELS[record.record_type]?.en}
                                            </Badge>
                                            {record.shared_with_doctors?.length > 0 && (
                                                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                                                    <Share2 className="w-3 h-3 mr-1" />
                                                    {isBengali ? 'শেয়ার' : 'Shared'}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-sm font-semibold text-gray-800 truncate" title={record.document_name}>
                                            {record.document_name}
                                        </CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-0">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                    {record.record_date
                                        ? new Date(record.record_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                        : '—'}
                                </div>
                                {record.extracted_data?.doctor_name && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                        {record.extracted_data.doctor_name}
                                    </div>
                                )}
                                {record.extracted_data?.hospital_name && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                        {record.extracted_data.hospital_name}
                                    </div>
                                )}
                                {record.extracted_data?.summary && (
                                    <p className="text-xs text-gray-500 line-clamp-2 pt-1 border-t border-gray-50">
                                        {record.extracted_data.summary}
                                    </p>
                                )}

                                <div className="flex gap-1.5 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs h-8"
                                        onClick={() => setSelectedRecord(record)}
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                        {isBengali ? 'দেখুন' : 'View'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => setShareRecord(record)}
                                        title={isBengali ? 'ডাক্তারের সাথে শেয়ার করুন' : 'Share with doctor'}
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-8"
                                        onClick={() => window.open(record.document_url, '_blank')}
                                        title={isBengali ? 'ডাউনলোড করুন' : 'Download'}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(record)}
                                        disabled={deletingId === record.id}
                                        title={isBengali ? 'মুছুন' : 'Delete'}
                                    >
                                        {deletingId === record.id
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Trash2 className="w-3.5 h-3.5" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedRecord && (
                <MedicalRecordDetail
                    record={selectedRecord}
                    isBengali={isBengali}
                    onClose={() => setSelectedRecord(null)}
                    onShare={() => { setSelectedRecord(null); setShareRecord(selectedRecord); }}
                />
            )}

            {shareRecord && (
                <ShareRecordDialog
                    record={shareRecord}
                    isBengali={isBengali}
                    onClose={() => setShareRecord(null)}
                    onSuccess={handleShareSuccess}
                />
            )}
        </>
    );
}