import React, { useState, useEffect } from 'react';
import { BloodBank } from '@/entities/BloodBank';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Droplets, 
  MapPin, 
  Phone, 
  Clock, 
  Search,
  Heart,
  AlertCircle
} from 'lucide-react';

const bloodCompatibility = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
};

export default function DonorMatcher({ isBengali }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [user, setUser] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState({
    bloodGroup: '',
    district: '',
    urgency: 'normal'
  });
  const [matches, setMatches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (currentUser.blood_group) {
        setSearchCriteria(prev => ({ ...prev, bloodGroup: currentUser.blood_group }));
      }
    } catch (e) { /* Not logged in */ }

    const banks = await BloodBank.list();
    setBloodBanks(banks);
  };

  const searchForBlood = () => {
    setIsSearching(true);
    
    // Filter blood banks based on criteria
    const filteredBanks = bloodBanks.filter(bank => {
      // Check district filter
      if (searchCriteria.district && bank.district !== searchCriteria.district) {
        return false;
      }

      // Check blood availability
      const bgKey = searchCriteria.bloodGroup.replace('+', '_positive').replace('-', '_negative');
      const availability = bank.blood_inventory?.[bgKey] || 0;
      
      return availability > 0;
    });

    // Sort by availability and distance (mock distance for now)
    const sortedBanks = filteredBanks.sort((a, b) => {
      const aAvailability = a.blood_inventory?.[searchCriteria.bloodGroup.replace('+', '_positive').replace('-', '_negative')] || 0;
      const bAvailability = b.blood_inventory?.[searchCriteria.bloodGroup.replace('+', '_positive').replace('-', '_negative')] || 0;
      return bAvailability - aAvailability;
    });

    setMatches(sortedBanks);
    setIsSearching(false);
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || colors.normal;
  };

  const createEmergencyRequest = async (bloodBank) => {
    // This would integrate with messaging or notification system
    alert(isBengali ? 
      `${bloodBank.name} এ জরুরি রক্তের অনুরোধ পাঠানো হয়েছে।` : 
      `Emergency blood request sent to ${bloodBank.name}.`
    );
  };

  const districts = [...new Set(bloodBanks.map(b => b.district))].sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-red-600" />
            {isBengali ? 'রক্ত খুঁজুন' : 'Find Blood'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBengali ? 'রক্তের গ্রুপ' : 'Blood Group'}
              </label>
              <Select 
                value={searchCriteria.bloodGroup} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, bloodGroup: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBengali ? 'গ্রুপ নির্বাচন করুন' : 'Select group'} />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBengali ? 'জেলা' : 'District'}
              </label>
              <Select 
                value={searchCriteria.district} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, district: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isBengali ? 'জেলা নির্বাচন করুন' : 'Select district'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>{isBengali ? 'সব জেলা' : 'All districts'}</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isBengali ? 'জরুরিত্ব' : 'Urgency'}
              </label>
              <Select 
                value={searchCriteria.urgency} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, urgency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{isBengali ? 'সাধারণ' : 'Normal'}</SelectItem>
                  <SelectItem value="urgent">{isBengali ? 'জরুরি' : 'Urgent'}</SelectItem>
                  <SelectItem value="emergency">{isBengali ? 'অতি জরুরি' : 'Emergency'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={searchForBlood} 
            disabled={!searchCriteria.bloodGroup || isSearching}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Droplets className="w-4 h-4 mr-2" />
            {isBengali ? 'রক্ত খুঁজুন' : 'Search for Blood'}
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {isBengali ? 'পাওয়া গেছে' : 'Available'} ({matches.length})
            </h3>
            <Badge className={getUrgencyColor(searchCriteria.urgency)}>
              {isBengali ?
                { normal: 'সাধারণ', urgent: 'জরুরি', emergency: 'অতি জরুরি' }[searchCriteria.urgency] :
                searchCriteria.urgency.toUpperCase()
              }
            </Badge>
          </div>

          <div className="grid gap-4">
            {matches.map((bank) => {
              const bgKey = searchCriteria.bloodGroup.replace('+', '_positive').replace('-', '_negative');
              const availability = bank.blood_inventory?.[bgKey] || 0;
              
              return (
                <Card key={bank.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{bank.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{bank.district}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="bg-red-50 border-red-200">
                            <Droplets className="w-3 h-3 mr-1 text-red-500" />
                            {availability} {isBengali ? 'ইউনিট উপলব্ধ' : 'units available'}
                          </Badge>
                          {bank.is_24_hour && (
                            <Badge variant="outline" className="bg-blue-50 border-blue-200">
                              <Clock className="w-3 h-3 mr-1 text-blue-500" />
                              {isBengali ? '২৪ ঘন্টা' : '24/7'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${bank.phone}`}>
                            <Phone className="w-4 h-4 mr-1" />
                            {isBengali ? 'কল করুন' : 'Call'}
                          </a>
                        </Button>
                        {searchCriteria.urgency === 'emergency' && (
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => createEmergencyRequest(bank)}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {isBengali ? 'জরুরি অনুরোধ' : 'Emergency Request'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {matches.length === 0 && searchCriteria.bloodGroup && !isSearching && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isBengali ? 
              'দুঃখিত, এই মুহূর্তে কোনো রক্ত পাওয়া যাচ্ছে না। অনুগ্রহ করে জরুরি হটলাইনে যোগাযোগ করুন।' :
              'Sorry, no blood is currently available. Please contact emergency hotlines.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency contact info */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">
              {isBengali ? 'জরুরি যোগাযোগ' : 'Emergency Contacts'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">National Emergency:</span> 999
            </div>
            <div>
              <span className="font-medium">Health Hotline:</span> 16263
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}