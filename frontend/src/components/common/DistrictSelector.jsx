import React from 'react';
import { MapPin } from 'lucide-react';

const DISTRICTS = [
  { id: 1, name: "Bangalore" },
  { id: 2, name: "Mysore" },
  { id: 3, name: "Hubli" },
  { id: 4, name: "Mangalore" },
  { id: 5, name: "Belgaum" },
  { id: 6, name: "Gulbarga" },
  { id: 7, name: "Davanagere" },
  { id: 8, name: "Bellary" },
  { id: 9, name: "Bijapur" },
  { id: 10, name: "Shimoga" },
];

export default function DistrictSelector({ selectedDistrict, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <MapPin className="absolute left-3 text-primary z-10" size={18} />
      <select
        className="pl-10 pr-8 py-2 bg-surface border border-outline-variant rounded-full text-sm font-semibold text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
        value={selectedDistrict}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {DISTRICTS.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <div className="absolute right-3 pointer-events-none">
        <svg className="w-4 h-4 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
}
