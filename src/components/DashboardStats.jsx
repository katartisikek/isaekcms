import React from 'react';
import { 
  Users, 
  Euro, 
  UserPlus, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

export default function DashboardStats({ students = [], specialties = [], sections = [], teacherReports = [] }) {
  // 1. Calculate metrics
  const totalStudents = students.length;
  const currentYear = new Date().getFullYear();
  
  const currentYearEnrollments = students.filter(s => {
    const dateStr = s.created_at || s.createdAt;
    if (dateStr) {
      return new Date(dateStr).getFullYear() === currentYear;
    }
    return s.year === '1ο Έτος';
  }).length;

  const totalUnpaid = students.reduce((sum, s) => sum + parseFloat(s.totalDebt || 0), 0);
  const totalPaid = students.reduce((sum, s) => sum + parseFloat(s.paidAmount || 0), 0);
  const totalExpected = totalUnpaid + totalPaid;
  const unpaidPercentage = totalExpected > 0 ? Math.round((totalUnpaid / totalExpected) * 100) : 0;

  const totalSections = sections.length;
  const totalReports = teacherReports.length;

  // 2. Aggregate student distribution by Sector based on specialties
  const sectorCounts = {};
  students.forEach(student => {
    const specialty = specialties.find(s => s.id === student.specialtyId);
    const sectorName = specialty ? specialty.sector : 'Λοιποί Τομείς';
    sectorCounts[sectorName] = (sectorCounts[sectorName] || 0) + 1;
  });

  // Convert to array format for Recharts and map to shorter names
  const chartData = Object.entries(sectorCounts).map(([sector, count]) => {
    // Simplify "Τομέας Πληροφορικής" -> "Πληροφορική" for better chart labels
    const shortName = sector.replace(/^Τομέας\s+/, '');
    return {
      name: shortName,
      fullName: sector,
      'Σπουδαστές': count,
    };
  }).sort((a, b) => b['Σπουδαστές'] - a['Σπουδαστές']); // Sort from highest to lowest

  // 3. Aggregate student distribution by current Section
  const sectionCounts = {};
  
  // Ensure all sections are represented even if empty
  sections.forEach(section => {
    sectionCounts[section.name] = 0;
  });

  students.forEach(student => {
    if (student.sectionId) {
      const section = sections.find(s => s.id === student.sectionId);
      if (section) {
        sectionCounts[section.name] += 1;
      }
    } else {
      const unassignedLabel = "Νέοι / Χωρίς Τμήμα";
      sectionCounts[unassignedLabel] = (sectionCounts[unassignedLabel] || 0) + 1;
    }
  });

  const sectionChartData = Object.entries(sectionCounts).map(([name, count]) => {
    const shortName = name.length > 20 ? name.substring(0, 17) + '...' : name;
    return {
      name: shortName,
      fullName: name,
      'Σπουδαστές': count,
    };
  }).sort((a, b) => b['Σπουδαστές'] - a['Σπουδαστές']);

  // Modern soft gradient colors for the cards and charts
  const barColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="dashboard-analytics-panel">
      {/* Metrics widgets grid */}
      <div className="analytics-widgets-container">
        {/* Widget 1: Συνολικές Εγγραφές */}
        <div className="metric-card widget-blue">
          <div className="metric-card-content">
            <p className="metric-label">Συνολικές Εγγραφές</p>
            <h3 className="metric-value">{totalStudents}</h3>
            <span className="metric-subtext">Εγγεγραμμένοι το {currentYear}: {currentYearEnrollments}</span>
          </div>
          <div className="metric-icon-box">
            <Users size={28} />
          </div>
        </div>

        {/* Widget 2: Οικονομική Εικόνα (Συνολικά Αναμενόμενα Έσοδα) */}
        <div className="metric-card widget-green">
          <div className="metric-card-content">
            <p className="metric-label">Συνολικά Αναμενόμενα Έσοδα</p>
            <h3 className="metric-value">
              {totalExpected.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
            </h3>
            <div className="metric-badge-extension">
              <span className="extension-paid">Εξοφλήσεις: {totalPaid.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</span>
              <span className="extension-separator">|</span>
              <span className="extension-unpaid" title={`Υπόλοιπο: ${totalUnpaid.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}`}>
                Οφειλές: {unpaidPercentage}%
              </span>
            </div>
          </div>
          <div className="metric-icon-box">
            <Euro size={28} />
          </div>
        </div>

        {/* Widget 3: Συνολικά Τμήματα */}
        <div className="metric-card widget-purple">
          <div className="metric-card-content">
            <p className="metric-label">Συνολικά Τμήματα</p>
            <h3 className="metric-value">{totalSections}</h3>
            <span className="metric-subtext-badge">Ενεργά τμήματα κατάρτισης</span>
          </div>
          <div className="metric-icon-box">
            <UserPlus size={28} />
          </div>
        </div>

        {/* Widget 4: Αναφορές Καθηγητών */}
        <div className="metric-card widget-orange" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <div className="metric-card-content">
            <p className="metric-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Αναφορές Καθηγητών</p>
            <h3 className="metric-value">{totalReports}</h3>
            <span className="metric-subtext-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Υποβεβλημένες δηλώσεις</span>
          </div>
          <div className="metric-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <CheckCircle size={28} />
          </div>
        </div>
      </div>

      {/* Charts Wrapper */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '380px' }}>
        
        {/* Chart 1: Sector Distribution */}
        <div className="analytics-chart-container" style={{ flex: 'none', minWidth: 'auto' }}>
          <h4 className="chart-title">
            <Activity size={14} className="chart-title-icon" />
            <span>Κατανομή Σπουδαστών ανά Τομέα Σπουδών</span>
          </h4>
          
          {chartData.length === 0 ? (
            <div className="chart-empty-state">
              <span>Δεν υπάρχουν δεδομένα σπουδαστών για εμφάνιση γραφήματος.</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="chart-custom-tooltip">
                            <p className="tooltip-title">{data.fullName}</p>
                            <p className="tooltip-value">
                              Σπουδαστές: <strong>{data['Σπουδαστές']}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Σπουδαστές" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={barColors[index % barColors.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Section Distribution */}
        <div className="analytics-chart-container" style={{ flex: 'none', minWidth: 'auto' }}>
          <h4 className="chart-title">
            <Users size={14} className="chart-title-icon" style={{ color: '#8b5cf6' }} />
            <span>Κατανομή Σπουδαστών ανά Τρέχον Τμήμα</span>
          </h4>
          
          {sectionChartData.length === 0 ? (
            <div className="chart-empty-state">
              <span>Δεν υπάρχουν δεδομένα σπουδαστών για εμφάνιση γραφήματος.</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="chart-custom-tooltip">
                            <p className="tooltip-title">{data.fullName}</p>
                            <p className="tooltip-value">
                              Σπουδαστές: <strong>{data['Σπουδαστές']}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Σπουδαστές" radius={[4, 4, 0, 0]}>
                    {sectionChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={barColors[(index + 2) % barColors.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
