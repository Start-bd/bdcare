import React, { useState, useEffect, useCallback } from 'react';
import { DiseaseOutbreak } from '@/entities/DiseaseOutbreak';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldAlert, 
  MapPin, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Info,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DiseaseMonitoring({ isBengali }) {
    const [outbreaks, setOutbreaks] = useState([]);
    const [filteredOutbreaks, setFilteredOutbreaks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedAlertLevel, setSelectedAlertLevel] = useState('all');
    const [districts, setDistricts] = useState([]);

    const loadOutbreaks = useCallback(async () => {
        try {
            const data = await DiseaseOutbreak.list('-updated_date', 100);
            setOutbreaks(data);
            const uniqueDistricts = [...new Set(data.map(o => o.district))].sort();
            setDistricts(uniqueDistricts);
        } catch (error) {
            console.error('Error loading outbreaks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const filterOutbreaks = useCallback(() => {
        let filtered = outbreaks;
        
        if (selectedDistrict !== 'all') {
            filtered = filtered.filter(o => o.district === selectedDistrict);
        }
        
        if (selectedAlertLevel !== 'all') {
            filtered = filtered.filter(o => o.alert_level === selectedAlertLevel);
        }
        
        setFilteredOutbreaks(filtered);
    }, [outbreaks, selectedDistrict, selectedAlertLevel]);

    useEffect(() => {
        loadOutbreaks();
        // Refresh data every 2 minutes for real-time monitoring
        const interval = setInterval(loadOutbreaks, 120000);
        return () => clearInterval(interval);
    }, [loadOutbreaks]);

    useEffect(() => {
        filterOutbreaks();
    }, [filterOutbreaks]);

    const getAlertColor = (level) => {
        const colors = {
            'emergency': 'bg-red-100 text-red-800 border-red-200',
            'warning': 'bg-orange-100 text-orange-800 border-orange-200',
            'advisory': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'watch': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getAlertIcon = (level) => {
        switch (level) {
            case 'emergency': return <AlertTriangle className="w-4 h-4" />;
            case 'warning': return <ShieldAlert className="w-4 h-4" />;
            case 'advisory': return <Info className="w-4 h-4" />;
            case 'watch': return <Eye className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getAlertText = (level) => {
        const textMap = {
            'emergency': isBengali ? 'জরুরি' : 'Emergency',
            'warning': isBengali ? 'সতর্কতা' : 'Warning',
            'advisory': isBengali ? 'পরামর্শ' : 'Advisory',
            'watch': isBengali ? 'নিরীক্ষণ' : 'Watch'
        };
        return textMap[level] || level;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            {isBengali ? 'রোগের প্রাদুর্ভাব নিরীক্ষণ' : 'Disease Outbreak Monitoring'}
                        </CardTitle>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={loadOutbreaks}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={isBengali ? "জেলা নির্বাচন করুন" : "Select District"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সব জেলা' : 'All Districts'}</SelectItem>
                                {districts.map(district => (
                                    <SelectItem key={district} value={district}>{district}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedAlertLevel} onValueChange={setSelectedAlertLevel}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={isBengali ? "সতর্কতার স্তর" : "Alert Level"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সব স্তর' : 'All Levels'}</SelectItem>
                                <SelectItem value="emergency">🔴 {isBengali ? 'জরুরি' : 'Emergency'}</SelectItem>
                                <SelectItem value="warning">🟠 {isBengali ? 'সতর্কতা' : 'Warning'}</SelectItem>
                                <SelectItem value="advisory">🟡 {isBengali ? 'পরামর্শ' : 'Advisory'}</SelectItem>
                                <SelectItem value="watch">🔵 {isBengali ? 'নিরীক্ষণ' : 'Watch'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOutbreaks.length > 0 ? filteredOutbreaks.map(outbreak => (
                                <Alert key={outbreak.id} className={getAlertColor(outbreak.alert_level)}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            {getAlertIcon(outbreak.alert_level)}
                                            <div className="flex-1">
                                                <AlertTitle className="flex items-center gap-2">
                                                    {outbreak.disease_name}
                                                    <Badge className={getAlertColor(outbreak.alert_level)}>
                                                        {getAlertText(outbreak.alert_level)}
                                                    </Badge>
                                                </AlertTitle>
                                                <AlertDescription className="mt-2 space-y-2">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{outbreak.district}, {outbreak.upazila}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            <span>{outbreak.case_count} {isBengali ? 'টি কেস' : 'cases'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="w-4 h-4" />
                                                            <span>{(outbreak.confidence_score * 100).toFixed(0)}% {isBengali ? 'নিশ্চিততা' : 'confidence'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {outbreak.symptoms_pattern && outbreak.symptoms_pattern.length > 0 && (
                                                        <div>
                                                            <p className="font-medium text-sm mb-1">{isBengali ? 'সাধারণ লক্ষণ:' : 'Common symptoms:'}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {outbreak.symptoms_pattern.map((symptom, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {symptom}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {outbreak.prevention_measures && outbreak.prevention_measures.length > 0 && (
                                                        <div>
                                                            <p className="font-medium text-sm mb-1">{isBengali ? 'প্রতিরোধের উপায়:' : 'Prevention measures:'}</p>
                                                            <ul className="text-sm space-y-1">
                                                                {outbreak.prevention_measures.slice(0, 2).map((measure, idx) => (
                                                                    <li key={idx} className="flex items-start gap-1">
                                                                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                                                                        {measure}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </AlertDescription>
                                            </div>
                                        </div>
                                    </div>
                                </Alert>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>{isBengali ? 'বর্তমানে কোনো সক্রিয় প্রাদুর্ভাব নেই।' : 'No active outbreaks detected.'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}