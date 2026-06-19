import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { FileSpreadsheet, Printer, Download, Filter, Search } from 'lucide-react';

type ReportType = 
  | 'customer-devices' 
  | 'expirations' 
  | 'expired' 
  | 'upcoming-renewals' 
  | 'sla-breaches' 
  | 'tickets-resolution';

export const Reports: React.FC = () => {
  const { devices, customers, tickets, renewalHistory } = useAppStore();
  const [reportType, setReportType] = useState<ReportType>('customer-devices');
  const [selectedCustId, setSelectedCustId] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<string>('All');

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Dynamic reports generator based on filters
  const getReportData = () => {
    let baseDevices = devices;
    if (selectedCustId !== 'All') {
      baseDevices = baseDevices.filter(d => d.customerId === selectedCustId);
    }
    if (selectedTerm !== 'All') {
      baseDevices = baseDevices.filter(d => d.licenseType === selectedTerm);
    }

    switch (reportType) {
      case 'customer-devices':
        return baseDevices.map(d => {
          const cust = customers.find(c => c.id === d.customerId);
          return {
            id: d.id,
            name: d.systemName,
            customer: cust?.name || 'Unknown',
            model: d.productModel,
            ip: d.ipAddress,
            expiry: d.licenseEndDate,
            status: d.status
          };
        });

      case 'expirations':
        return baseDevices
          .filter(d => d.licenseStatus !== 'Expired')
          .sort((a,b) => new Date(a.licenseEndDate).getTime() - new Date(b.licenseEndDate).getTime())
          .map(d => ({
            id: d.id,
            name: d.systemName,
            model: d.productModel,
            expiry: d.licenseEndDate,
            plan: d.licenseType,
            status: d.licenseStatus
          }));

      case 'expired':
        return baseDevices
          .filter(d => d.licenseStatus === 'Expired')
          .map(d => ({
            id: d.id,
            name: d.systemName,
            model: d.productModel,
            serial: d.serialNumber,
            expiredDate: d.licenseEndDate,
            lastRenewed: d.lastRenewalDate
          }));

      case 'upcoming-renewals':
        const today = new Date('2026-06-19');
        return baseDevices
          .filter(d => {
            const exp = new Date(d.licenseEndDate);
            const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 30;
          })
          .map(d => ({
            id: d.id,
            name: d.systemName,
            expiry: d.licenseEndDate,
            support: d.supportType,
            plan: d.licenseType
          }));

      case 'sla-breaches':
        return tickets
          .filter(t => t.slaStatus === 'Breached')
          .map(t => {
            const cust = customers.find(c => c.id === t.customerId);
            return {
              id: t.id,
              subject: t.subject,
              client: cust?.name || 'Unknown',
              priority: t.priority,
              status: t.status,
              created: t.createdDate
            };
          });

      case 'tickets-resolution':
        return tickets
          .filter(t => t.status === 'Resolved' || t.status === 'Closed')
          .map(t => {
            const cust = customers.find(c => c.id === t.customerId);
            return {
              id: t.id,
              subject: t.subject,
              client: cust?.name || 'Unknown',
              priority: t.priority,
              resolutionTime: t.resolutionTime || 'Closed'
            };
          });

      default:
        return [];
    }
  };

  const reportData = getReportData();

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    
    // Create CSV content
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row => 
      Object.values(row)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ADVGuard_Report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHeaders = () => {
    if (reportData.length === 0) return [];
    return Object.keys(reportData[0]).map(key => key.toUpperCase());
  };

  return (
    <div className="space-y-6 print:p-8 print:bg-white print:text-black">
      
      {/* Title block */}
      <div className="flex justify-between items-center print:border-b print:pb-4 border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white print:text-black tracking-tight">Audit Reporting Vault</h1>
          <p className="text-slate-400 text-xs print:text-slate-600">Export transaction history, equipment lifecycles and support desks statistics</p>
        </div>
        
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg text-xs font-bold transition shadow text-slate-350"
          >
            <Printer className="w-3.5 h-3.5" /> Print Layout
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Interactive controls - Hidden on Print */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-850 bg-slate-900/60 glass-panel print:hidden">
        <div>
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-205 focus:outline-none"
          >
            <option value="customer-devices">Customer-wise Device List</option>
            <option value="expirations">Active Device Expirations</option>
            <option value="expired">Expired Devices Audit</option>
            <option value="upcoming-renewals">30-Day Upcoming Renewals</option>
            <option value="sla-breaches">SLA Breach Audit Logs</option>
            <option value="tickets-resolution">Ticket Resolution Benchmarks</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Filter by Customer</label>
          <select
            value={selectedCustId}
            onChange={(e) => setSelectedCustId(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-205 focus:outline-none"
          >
            <option value="All">All Customer Accounts</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Filter by Plan Duration</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-850 p-2.5 rounded text-slate-205 focus:outline-none"
          >
            <option value="All">All Term Plans</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Yearly">Yearly</option>
            <option value="Lifetime">Lifetime</option>
          </select>
        </div>
      </div>

      {/* Render Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-900 glass-panel print:border-collapse print:bg-white print:text-black">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px] print:bg-slate-200 print:text-black print:border-black">
              {getHeaders().map((head, idx) => (
                <th key={idx} className="p-3 print:p-2">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 print:divide-black">
            {reportData.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-855/30 transition print:bg-white">
                {Object.values(row).map((val, cellIdx) => (
                  <td key={cellIdx} className="p-3 text-slate-300 print:p-2 print:text-black font-medium">{String(val)}</td>
                ))}
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr>
                <td colSpan={getHeaders().length || 5} className="p-8 text-center text-slate-500 italic print:text-slate-700">
                  No records matching current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Print Footer Summary */}
      <div className="hidden print:block text-[10px] text-slate-600 border-t border-slate-300 pt-4 mt-8 flex justify-between">
        <span>ADVGuard LicenseDesk Portal Report Audit Logs</span>
        <span>Generated Date: June 19, 2026</span>
      </div>

    </div>
  );
};
export default Reports;
