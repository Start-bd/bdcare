import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HospitalCard from '../components/hospitals/HospitalCard';
import HospitalFilters from '../components/hospitals/HospitalFilters';
import HospitalMap from '../components/hospitals/HospitalMap';
import { Loader2, WifiOff, AlertTriangle, Map } from 'lucide-react';

export default function HospitalsPage() {
    const [hospitals, setHospitals] = useState([]);
    const [filteredHospitals, setFilteredHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [offlineDataTimestamp, setOfflineDataTimestamp] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        district: "all",
        type: "all",
        specialization: "all",
        services: []
    });
    const [uniqueDistricts, setUniqueDistricts] = useState([]);
    const [uniqueSpecializations, setUniqueSpecializations] = useState([]);

    const loadUserData = useCallback(async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
        } catch (e) { /* Not logged in */ }
    }, []);

    const loadHospitals = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (isOffline) {
            console.log("App is offline. Loading from cache.");
            const cachedData = localStorage.getItem('cachedHospitals');
            if (cachedData) {
                const { timestamp, data } = JSON.parse(cachedData);
                setHospitals(data);
                setOfflineDataTimestamp(timestamp);
                setUniqueDistricts([...new Set(data.map(h => h.district).filter(Boolean))].sort());
                setUniqueSpecializations([...new Set(data.flatMap(h => h.specializations || []).filter(Boolean))].sort());
            } else {
                setError(isBengali ? 'আপনি অফলাইনে আছেন এবং কোনো ক্যাশে করা ডেটা নেই। ডেটা লোড করতে ইন্টারনেটের সাথে সংযোগ করুন।' : 'You are offline and no cached data is available. Connect to the internet to load data.');
            }
        } else {
            console.log("App is online. Fetching from network.");
            try {
                const fetchedHospitals = await base44.entities.Hospital.list('-updated_date', 500);
                setHospitals(fetchedHospitals);

                const cachePayload = {
                    timestamp: new Date().toISOString(),
                    data: fetchedHospitals
                };
                localStorage.setItem('cachedHospitals', JSON.stringify(cachePayload));
                setOfflineDataTimestamp(null);
                setUniqueDistricts([...new Set(fetchedHospitals.map(h => h.district).filter(Boolean))].sort());
                setUniqueSpecializations([...new Set(fetchedHospitals.flatMap(h => h.specializations || []).filter(Boolean))].sort());
            } catch (error) {
                console.error("Failed to fetch hospitals:", error);
                setError(isBengali ? 'হাসপাতালের ডেটা আনতে ব্যর্থ হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Failed to fetch hospital data. Please check your connection.');
                const cachedData = localStorage.getItem('cachedHospitals');
                if (cachedData) {
                    const { timestamp, data } = JSON.parse(cachedData);
                    setHospitals(data);
                    setOfflineDataTimestamp(timestamp);
                    setUniqueDistricts([...new Set(data.map(h => h.district).filter(Boolean))].sort());
                    setUniqueSpecializations([...new Set(data.flatMap(h => h.specializations || []).filter(Boolean))].sort());
                    setError(isBengali ? 'হাসপাতালের ডেটা আনতে ব্যর্থ হয়েছে। ক্যাশে করা ডেটা দেখানো হচ্ছে।' : 'Failed to fetch hospital data. Displaying cached data.');
                }
            }
        }
        setIsLoading(false);
    }, [isOffline, isBengali]);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        loadUserData();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [loadUserData]);
    
    useEffect(() => {
        loadHospitals();
    }, [loadHospitals]);
    
    // Effect to filter hospitals whenever 'hospitals' or 'filters' change
    useEffect(() => {
        let tempHospitals = [...hospitals];

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            tempHospitals = tempHospitals.filter(h => 
                (h.name && h.name.toLowerCase().includes(searchTerm)) ||
                (h.address && h.address.toLowerCase().includes(searchTerm))
            );
        }
        if (filters.district && filters.district !== 'all') {
            tempHospitals = tempHospitals.filter(h => h.district === filters.district);
        }
        if (filters.type && filters.type !== 'all') {
            tempHospitals = tempHospitals.filter(h => h.type === filters.type);
        }
        if (filters.specialization && filters.specialization !== 'all') {
            tempHospitals = tempHospitals.filter(h => h.specializations && h.specializations.includes(filters.specialization));
        }
        if (filters.services && filters.services.length > 0) {
            tempHospitals = tempHospitals.filter(h => {
                if (filters.services.includes('emergency')) {
                    if (h.has_emergency) return true;
                }
                if (filters.services.includes('ambulance')) {
                    if (h.has_ambulance) return true;
                }
                return false;
            });
        }

        setFilteredHospitals(tempHospitals);
    }, [filters, hospitals]);

    const handleMapView = (hospital) => {
        setSelectedHospital(hospital);
        setShowMap(true);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-800">
                                {isBengali ? 'হাসপাতাল খুঁজুন' : 'Find a Hospital'}
                            </CardTitle>
                            <CardDescription>
                                {isBengali ? 'আপনার কাছাকাছি হাসপাতাল এবং ক্লিনিক খুঁজুন।' : 'Search for hospitals and clinics near you.'}
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowMap(true)}
                            className="hover:bg-emerald-50 border-emerald-200"
                        >
                            <Map className="w-4 h-4 mr-2" />
                            {isBengali ? 'ম্যাপ দেখুন' : 'View Map'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <HospitalFilters 
                        filters={filters}
                        onFiltersChange={setFilters} 
                        isBengali={isBengali} 
                        districts={uniqueDistricts}
                        specializations={uniqueSpecializations}
                    />

                    {isOffline && offlineDataTimestamp && (
                        <Alert variant="destructive" className="mb-4 bg-yellow-100 border-yellow-300 text-yellow-800">
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

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {filteredHospitals.length > 0 ? (
                                filteredHospitals.map(hospital => (
                                    <HospitalCard 
                                        key={hospital.id} 
                                        hospital={hospital} 
                                        isBengali={isBengali}
                                        onMapView={handleMapView}
                                    />
                                ))
                            ) : (
                                !error && (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        <p>{isBengali ? 'কোনো হাসপাতাল খুঁজে পাওয়া যায়নি।' : 'No hospitals found.'}</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Map Modal */}
            {showMap && (
                <HospitalMap 
                    hospitals={filteredHospitals}
                    selectedHospital={selectedHospital}
                    onHospitalSelect={setSelectedHospital}
                    onClose={() => setShowMap(false)}
                    isBengali={isBengali}
                />
            )}
        </div>
    );
}