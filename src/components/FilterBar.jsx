import React, { useMemo } from 'react';
import { Search, Filter, UserPlus } from 'lucide-react';

export default function FilterBar({ 
  searchQuery, 
  setSearchQuery, 
  selectedSpecialty, 
  setSelectedSpecialty, 
  specialties = [], 
  onAddClick 
}) {
  // Group specialties by sector for the filter dropdown
  const groupedSpecialties = useMemo(() => {
    return specialties.reduce((acc, spec) => {
      if (!acc[spec.sector]) {
        acc[spec.sector] = [];
      }
      acc[spec.sector].push(spec);
      return acc;
    }, {});
  }, [specialties]);

  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div className="form-group" style={{ flex: '1 1 300px' }}>
          <label className="form-label" htmlFor="search-input" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={14} color="var(--primary)" />
            Αναζήτηση Μαθητή (Όνομα ή Τηλέφωνο)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="search-input"
              type="text"
              className="form-input"
              placeholder="Πληκτρολογήστε όνομα ή τηλέφωνο..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search 
              size={18} 
              color="rgba(255,255,255,0.2)" 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
            />
          </div>
        </div>

        {/* Specialty Filter Dropdown */}
        <div className="form-group" style={{ flex: '1 1 300px' }}>
          <label className="form-label" htmlFor="specialty-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--secondary)" />
            Φιλτράρισμα ανά Ειδικότητα
          </label>
          <select
            id="specialty-filter"
            className="form-input"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">Όλες οι Ειδικότητες</option>
            {Object.keys(groupedSpecialties).map((sector) => (
              <optgroup key={sector} label={sector}>
                {groupedSpecialties[sector].map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Add Student Button */}
        <div style={{ flex: '0 0 auto' }}>
          <button 
            className="btn btn-primary" 
            onClick={onAddClick}
            style={{ width: '100%', minHeight: '46px' }}
          >
            <UserPlus size={18} />
            Νέος Σπουδαστής
          </button>
        </div>
      </div>
    </div>
  );
}
