
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

export default function HospitalFilters({ filters = {}, onFiltersChange, isBengali, districts = [], specializations = [] }) {

  const handleServiceChange = (service, checked) => {
    const currentServices = filters.services || [];
    if (checked) {
      onFiltersChange({ ...filters, services: [...currentServices, service] });
    } else {
      onFiltersChange({ ...filters, services: currentServices.filter(s => s !== service) });
    }
  };

  return (
    <div className="mb-6 p-6 bg-white/50 rounded-xl shadow-md border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
        {/* Search */}
        <div className="relative sm:col-span-2 xl:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={isBengali ? "হাসপাতালের নাম বা এলাকা লিখুন..." : "Search hospitals or areas..."}
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            // No specific border/focus classes provided in outline, so reverting to default
          />
        </div>

        {/* District Filter */}
        <div>
          <Label htmlFor="district-filter" className="text-sm font-medium text-gray-700">
            {isBengali ? 'জেলা' : 'District'}
          </Label>
          <Select
            value={filters.district || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, district: value })}
          >
            <SelectTrigger id="district-filter">
              <SelectValue placeholder={isBengali ? "জেলা নির্বাচন করুন" : "Select District"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {isBengali ? "সব জেলা" : "All Districts"}
              </SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hospital Type */}
        <div>
          <Label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
            {isBengali ? 'ধরন' : 'Type'}
          </Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder={isBengali ? "ধরন নির্বাচন করুন" : "Select Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isBengali ? 'সব ধরন' : 'All Types'}</SelectItem>
              <SelectItem value="government">{isBengali ? 'সরকারি' : 'Government'}</SelectItem>
              <SelectItem value="private">{isBengali ? 'বেসরকারি' : 'Private'}</SelectItem>
              <SelectItem value="specialized">{isBengali ? 'বিশেষায়িত' : 'Specialized'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Specialization */}
        <div>
          <Label htmlFor="specialization-filter" className="text-sm font-medium text-gray-700">
            {isBengali ? 'বিশেষত্ব' : 'Specialization'}
          </Label>
          <Select
            value={filters.specialization || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, specialization: value })}
          >
            <SelectTrigger id="specialization-filter">
              <SelectValue placeholder={isBengali ? "বিশেষত্ব নির্বাচন করুন" : "Select Specialization"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {isBengali ? "সব বিশেষত্ব" : "All Specializations"}
              </SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services */}
      <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4 sm:gap-6">
        <Label className="text-sm font-medium text-gray-700">{isBengali ? 'সেবাসমূহ:' : 'Services:'}</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emergency-filter"
            checked={(filters.services || []).includes('emergency')}
            onCheckedChange={(checked) => handleServiceChange('emergency', checked)}
          />
          <Label htmlFor="emergency-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {isBengali ? 'জরুরি' : 'Emergency'}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ambulance-filter"
            checked={(filters.services || []).includes('ambulance')}
            onCheckedChange={(checked) => handleServiceChange('ambulance', checked)}
          />
          <Label htmlFor="ambulance-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {isBengali ? 'অ্যাম্বুলেন্স' : 'Ambulance'}
          </Label>
        </div>
      </div>
    </div>
  );
}
