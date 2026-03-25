import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Droplets, Search, MapPin, Phone, Loader2, Heart, WifiOff, AlertTriangle } from 'lucide-react';
import DonorMatcher from '../components/bloodbank/DonorMatcher';

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function BloodBankCard({ bank, isBengali }) {
  const lastUpdated = new Date(bank.last_updated);
  const hoursAgo = Math.floor((new Date() - lastUpdated) / (1000 * 60 * 60));

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{bank.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{bank.district}</span>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {bank.is_24_hour ? (isBengali ? '২৪ ঘন্টা' : '24/7') : bank.operating_hours}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {isBengali ? `${hoursAgo} ঘন্টা আগে আপডেট` : `Updated ${hoursAgo}h ago`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {Object.entries(bank.blood_inventory || {}).map(([group, units]) => {
            const displayGroup = group.replace('_positive', '+').replace('_negative', '-');
            const isLow = units < 5;
            const isEmpty = units === 0;
            
            return (
              <div key={group} className={`text-center p-3 rounded-lg border ${
                isEmpty ? 'bg-gray-100 border-gray-200' : 
                isLow ? 'bg-yellow-50 border-yellow-200' : 
                'bg-green-50 border-green-200'
              }`}>
                <p className={`font-bold text-lg ${
                  isEmpty ? 'text-gray-400' : 
                  isLow ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {displayGroup}
                </p>
                <p className={`text-sm ${
                  isEmpty ? 'text-gray-400' : 
                  isLow ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {units} {isBengali ? 'ইউনিট' : 'units'}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 hover:bg-red-50 border-red-200" asChild>
            <a href={`tel:${bank.phone}`}>
              <Phone className="w-4 h-4 mr-2" />
              {isBengali ? 'কল করুন' : 'Call'}
            </a>
          </Button>
          {bank.emergency_phone && (
            <Button variant="outline" className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100" asChild>
              <a href={`tel:${bank.emergency_phone}`}>
                <Heart className="w-4 h-4 mr-2" />
                {isBengali ? 'জরুরি' : 'Emergency'}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BloodBankPage() {
    const [bloodBanks, setBloodBanks] = useState([]);
    const [filteredBanks, setFilteredBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [districts, setDistricts] = useState([]);
    const [filters, setFilters] = useState({ district: 'all', bloodGroup: 'all', search: '' });
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [offlineDataTimestamp, setOfflineDataTimestamp] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        if (isOffline) {
            // Load from cache when offline
            const cachedData = localStorage.getItem('cachedBloodBanks');
            const cachedUser = localStorage.getItem('cachedUser');
            
            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                setBloodBanks(data);
                setFilteredBanks(data);
                setOfflineDataTimestamp(timestamp);
                setDistricts([...new Set(data.map(b => b.district))].sort());
            }
            
            if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                setIsBengali(userData.preferred_language === 'bengali' || !userData.preferred_language);
            }
        } else {
            try {
                const user = await base44.auth.me();
                setIsBengali(user.preferred_language === 'bengali' || !user.preferred_language);
                localStorage.setItem('cachedUser', JSON.stringify(user));
            } catch (e) { /* not logged in */ }
            
            try {
                const data = await base44.entities.BloodBank.list();
                setBloodBanks(data);
                setFilteredBanks(data);
                setDistricts([...new Set(data.map(b => b.district))].sort());
                
                // Cache the data
                const cachePayload = {
                    timestamp: new Date().toISOString(),
                    data: data
                };
                localStorage.setItem('cachedBloodBanks', JSON.stringify(cachePayload));
                setOfflineDataTimestamp(null);
            } catch (error) {
                console.error("Failed to load blood banks:", error);
                setError(isBengali ? 'ব্লাড ব্যাংকের ডেটা আনতে ব্যর্থ হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Failed to fetch blood bank data. Please check your connection.');
                // Fallback to cache
                const cachedData = localStorage.getItem('cachedBloodBanks');
                if (cachedData) {
                    const { timestamp, data } = JSON.parse(cachedData);
                    setBloodBanks(data);
                    setFilteredBanks(data);
                    setOfflineDataTimestamp(timestamp);
                    setDistricts([...new Set(data.map(b => b.district))].sort());
                }
            }
        }
        setIsLoading(false);
    }, [isOffline, isBengali, setBloodBanks, setFilteredBanks, setIsLoading, setError, setDistricts, setIsBengali, setOfflineDataTimestamp]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty dependency array, runs once on mount/unmount

    useEffect(() => {
        loadData(); // Call the memoized function
    }, [loadData]); // Dependency array includes loadData, runs when loadData changes (i.e., when isOffline or isBengali changes)

    useEffect(() => {
        let filtered = [...bloodBanks];
        if (filters.search) {
            const term = filters.search.toLowerCase();
            filtered = filtered.filter(b => b.name.toLowerCase().includes(term) || b.address.toLowerCase().includes(term));
        }
        if (filters.district !== 'all') {
            filtered = filtered.filter(b => b.district === filters.district);
        }
        if (filters.bloodGroup !== 'all') {
            const bgKey = filters.bloodGroup.replace('+', '_positive').replace('-', '_negative');
            filtered = filtered.filter(b => b.blood_inventory?.[bgKey] > 0);
        }
        setFilteredBanks(filtered);
    }, [filters, bloodBanks]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <Droplets className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {isBengali ? 'ব্লাড ব্যাংক এবং ডোনার নেটওয়ার্ক' : 'Blood Bank & Donor Network'}
                    </h1>
                    <p className="text-lg text-gray-600">{isBengali ? 'জীবন রক্ষাকারী রক্তের সেবা' : 'Life-saving blood services'}</p>
                </div>

                {isOffline && offlineDataTimestamp && (
                    <Alert variant="destructive" className="mb-6 bg-yellow-100 border-yellow-300 text-yellow-800">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>{isBengali ? 'অফলাইন মোড' : 'Offline Mode'}</AlertTitle>
                        <AlertDescription>
                            {isBengali ? `আপনি অফলাইনে আছেন। সর্বশেষ সংরক্ষিত তথ্য দেখানো হচ্ছে (${new Date(offlineDataTimestamp).toLocaleDateString('bn-BD')})।` : `You are offline. Showing data last saved on ${new Date(offlineDataTimestamp).toLocaleDateString()}.`}
                        </AlertDescription>
                    </Alert>
                )}
                
                {error && !isLoading && (
                    <Alert variant="destructive" className="my-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{isBengali ? 'একটি ত্রুটি ঘটেছে' : 'An Error Occurred'}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="directory" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="directory" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {isBengali ? 'ব্লাড ব্যাংক' : 'Blood Banks'}
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            {isBengali ? 'রক্ত খুঁজুন' : 'Find Blood'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="directory" className="space-y-6">
                        <Card className="p-6 shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                                <div className="md:col-span-2 relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input 
                                        placeholder={isBengali ? 'হাসপাতাল বা এলাকার নাম...' : 'Search by hospital or area...'}
                                        value={filters.search}
                                        onChange={e => setFilters({...filters, search: e.target.value})}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={filters.district} onValueChange={v => setFilters({...filters, district: v})}>
                                    <SelectTrigger><SelectValue placeholder={isBengali ? "জেলা নির্বাচন করুন" : "Select District"} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{isBengali ? 'সব জেলা' : 'All Districts'}</SelectItem>
                                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.bloodGroup} onValueChange={v => setFilters({...filters, bloodGroup: v})}>
                                    <SelectTrigger><SelectValue placeholder={isBengali ? "রক্তের গ্রুপ" : "Blood Group"} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{isBengali ? 'সব গ্রুপ' : 'All Groups'}</SelectItem>
                                        {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>

                        {isLoading ? (
                            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBanks.length > 0 ? filteredBanks.map(bank => (
                                    <BloodBankCard key={bank.id} bank={bank} isBengali={isBengali} />
                                )) : (
                                    !error && <p className="md:col-span-3 text-center text-gray-500 py-12">{isBengali ? 'কোনো ব্লাড ব্যাংক পাওয়া যায়নি।' : 'No blood banks found.'}</p>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="search">
                        <DonorMatcher isBengali={isBengali} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}