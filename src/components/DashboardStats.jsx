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

export default function DashboardStats({ students = [], specialties = [] }) {
  // 1. Calculate metrics
  const totalStudents = students.length;
  const totalDebt = students.reduce((sum, s) => sum + parseFloat(s.totalDebt || 0), 0);
  const activeLeadsPlaceholder = 18; // Placeholder count for future leads integration

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
            <span className="metric-subtext">Εγγεγραμμένοι σπουδαστές φέτος</span>
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
              {totalDebt.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
            </h3>
            {/* Future extension indicator: Paid vs. Unpaid */}
            <div className="metric-badge-extension">
              <span className="extension-paid">Εξοφλήσεις: €0,00</span>
              <span className="extension-separator">|</span>
              <span className="extension-unpaid" title="Εκκρεμεί η σύνδεση με το σύστημα πληρωμών">
                Οφειλές: 100%
              </span>
            </div>
          </div>
          <div className="metric-icon-box">
            <Euro size={28} />
          </div>
        </div>

        {/* Widget 3: Ενεργοί Υποψήφιοι (Leads) */}
        <div className="metric-card widget-purple">
          <div className="metric-card-content">
            <p className="metric-label">Ενεργοί Υποψήφιοι (Leads)</p>
            <h3 className="metric-value">{activeLeadsPlaceholder}</h3>
            <span className="metric-subtext-badge">Placeholder • Future Leads Coll.</span>
          </div>
          <div className="metric-icon-box">
            <UserPlus size={28} />
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="analytics-chart-container">
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
    </div>
  );
}
