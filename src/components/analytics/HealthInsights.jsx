import React, { useState, useEffect } from 'react';
import { HealthAnalytics } from '@/entities/HealthAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HealthInsights({ isBengali }) {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [district, setDistrict] = useState('all');
    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const data = await HealthAnalytics.list('', 1000); // Fetch a sample
                setAnalyticsData(data);
                const uniqueDistricts = [...new Set(data.map(item => item.district))].sort();
                setDistricts(uniqueDistricts);
            } catch (error) {
                console.error('Failed to fetch health analytics:', error);
            }
            setIsLoading(false);
        };
        fetchAnalytics();
    }, []);

    const filteredData = district === 'all' ? analyticsData : analyticsData.filter(d => d.district === district);

    const symptomData = filteredData
        .flatMap(item => item.symptoms || [])
        .reduce((acc, symptom) => {
            acc[symptom] = (acc[symptom] || 0) + 1;
            return acc;
        }, {});

    const topSymptoms = Object.entries(symptomData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, [isBengali ? 'ঘটনা' : 'count']: value }));

    const ageGroupData = filteredData
        .reduce((acc, item) => {
            if(item.age_group) acc[item.age_group] = (acc[item.age_group] || 0) + 1;
            return acc;
        }, {});
    
    const ageGroupChartData = Object.entries(ageGroupData).map(([name, value]) => ({name, value}));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{isBengali ? 'জেলা অনুযায়ী ফিল্টার করুন' : 'Filter by District'}</CardTitle>
                        <Select value={district} onValueChange={setDistrict}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{isBengali ? 'সকল জেলা' : 'All Districts'}</SelectItem>
                                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{isBengali ? 'সবচেয়ে বেশি রিপোর্ট করা লক্ষণ' : 'Top Reported Symptoms'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topSymptoms} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={isBengali ? 'ঘটনা' : 'count'} fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{isBengali ? 'বয়স গোষ্ঠী অনুযায়ী বিতরণ' : 'Age Group Distribution'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                           <PieChart>
                                <Pie data={ageGroupChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                     {ageGroupChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}