import React, { useState, useRef } from 'react';
import { 
  X, Download, Printer, FileSpreadsheet, RefreshCw, 
  CheckCircle2, ArrowLeft, FileText, ExternalLink, Calendar, ShieldCheck 
} from 'lucide-react';
import { LeaveRecord, LeaveQuota, Language } from '../types/leave';
import { LeaveSummary } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaves: LeaveRecord[];
  summary: Record<string, LeaveSummary>;
  quota: LeaveQuota;
  lang: Language;
  onResetData: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  leaves,
  summary,
  quota,
  lang,
  onResetData,
}) => {
  const t = getTranslation(lang);
  const [viewMode, setViewMode] = useState<'options' | 'preview'>('options');
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalAllowed = (quota.annual || 0) + (quota.casual || 0) + (quota.sick || 0);
  const totalTaken = (summary.annual?.taken || 0) + (summary.casual?.taken || 0) + (summary.sick?.taken || 0);
  const totalRemaining = Math.max(0, totalAllowed - totalTaken);
  const todayDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Generate Excel/CSV
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Start Date', 'End Date', 'Category', 'Duration Type', 'Days Count', 'Reason', 'Status', 'Applied Date'];
    const rows = leaves.map(l => [
      l.id,
      l.startDate,
      l.endDate,
      l.category,
      l.duration,
      l.daysCount,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      l.status,
      l.appliedDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leave_Report_${quota.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Standalone Printable HTML string
  const generateReportHTML = (): string => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Leave Statement - Year ${quota.year}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      line-height: 1.5;
      background: #fff;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 5px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .meta-box {
      text-align: right;
      font-size: 12px;
      color: #475569;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 25px;
    }
    .stat-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
      text-align: center;
    }
    .stat-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .stat-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 12px;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-annual { background: #dcfce7; color: #166534; }
    .badge-casual { background: #dbeafe; color: #1e40af; }
    .badge-sick { background: #ffe4e6; color: #9f1239; }
    .badge-special { background: #f3e8ff; color: #6b21a8; }
    .signatures {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 40%;
      border-top: 1px solid #64748b;
      padding-top: 8px;
      font-size: 12px;
      color: #334155;
    }
    @media print {
      body { padding: 15px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Official Leave Summary Statement</h1>
      <p class="subtitle">Personal Leave & Balance Management Record &bull; Year ${quota.year}</p>
    </div>
    <div class="meta-box">
      <div><strong>Date:</strong> ${todayDateStr}</div>
      <div><strong>Document ID:</strong> LMS-${quota.year}-${Math.floor(Date.now() / 1000)}</div>
      <div><strong>Status:</strong> Certified Record</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-title">Annual Leave</div>
      <div class="stat-value">${summary.annual?.remaining ?? quota.annual}</div>
      <div class="stat-sub">Taken: ${summary.annual?.taken ?? 0} / ${quota.annual} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Casual Leave</div>
      <div class="stat-value">${summary.casual?.remaining ?? quota.casual}</div>
      <div class="stat-sub">Taken: ${summary.casual?.taken ?? 0} / ${quota.casual} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Sick Leave</div>
      <div class="stat-value">${summary.sick?.remaining ?? quota.sick}</div>
      <div class="stat-sub">Taken: ${summary.sick?.taken ?? 0} / ${quota.sick} days</div>
    </div>
    <div class="stat-card" style="border-color: #6366f1; background: #eef2ff;">
      <div class="stat-title" style="color: #4338ca;">Total Remaining</div>
      <div class="stat-value" style="color: #4338ca;">${totalRemaining}</div>
      <div class="stat-sub">Total Taken: ${totalTaken} / ${totalAllowed} days</div>
    </div>
  </div>

  <h3 style="font-size: 14px; margin-bottom: 10px; color: #0f172a; text-transform: uppercase;">
    Detailed Leave Records (${quota.year})
  </h3>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Category</th>
        <th>Duration</th>
        <th style="text-align: center;">Days</th>
        <th>Reason / Notes</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${leaves.length === 0 ? `
        <tr>
          <td colspan="6" style="text-align: center; padding: 25px; color: #94a3b8;">
            No leave records found for the year ${quota.year}.
          </td>
        </tr>
      ` : leaves.map(l => `
        <tr>
          <td><strong>${l.startDate}</strong>${l.endDate && l.endDate !== l.startDate ? ' → ' + l.endDate : ''}</td>
          <td><span class="badge badge-${l.category}">${l.category}</span></td>
          <td>${l.duration === 'full' ? 'Full Day' : l.duration === 'half_morning' ? 'Morning Half (0.5)' : l.duration === 'half_evening' ? 'Afternoon Half (0.5)' : 'Multiple Days'}</td>
          <td style="text-align: center; font-weight: 700;">${l.daysCount}</td>
          <td>${l.reason || '-'}</td>
          <td><span style="color: #166534; font-weight: 600;">Taken</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sign-box">
      <strong>Employee Signature:</strong>
      <br><br><br>
      Date: ________________________
    </div>
    <div class="sign-box">
      <strong>Authorized Manager / HR Signature:</strong>
      <br><br><br>
      Date: ________________________
    </div>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
    Generated securely by My Leave Tracker &bull; Confidential
  </div>
</body>
</html>`;
  };

  // Robust Iframe Print Engine (solves iframe restriction issues)
  const handlePrintDocument = () => {
    const htmlContent = generateReportHTML();
    setPrintSuccessMsg('Opening print dialogue...');

    try {
      // Create hidden iframe dedicated to printing
      const existingIframe = document.getElementById('leave-print-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'leave-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setPrintSuccessMsg('Print dialog sent! (You can also choose "Save as PDF")');
          } catch (e) {
            console.warn('Iframe print error, falling back to window.print', e);
            window.print();
          }

          setTimeout(() => {
            if (document.getElementById('leave-print-iframe')) {
              document.getElementById('leave-print-iframe')?.remove();
            }
          }, 3000);
        }, 500);

        return;
      }
    } catch (err) {
      console.error('Print engine error:', err);
    }

    // Direct fallback
    window.print();
  };

  // Download Standalone HTML report
  const handleDownloadHTMLReport = () => {
    const htmlContent = generateReportHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Official_Leave_Report_${quota.year}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setPrintSuccessMsg('Report downloaded! Open file in any browser to view or print as PDF.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`bg-white rounded-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all ${
          viewMode === 'preview' ? 'max-w-4xl max-h-[92vh]' : 'max-w-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 no-print">
          <div className="flex items-center gap-2">
            {viewMode === 'preview' && (
              <button
                onClick={() => setViewMode('options')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors mr-1 cursor-pointer"
                title="Back to options"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                {viewMode === 'preview' ? `Official Statement Preview (${quota.year})` : t.exportReport}
              </h3>
              <p className="text-xs text-slate-500">
                {viewMode === 'preview' 
                  ? 'Ready to print or save as PDF' 
                  : 'Download or print official leave records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification toast */}
        {printSuccessMsg && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-2 text-xs text-indigo-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {printSuccessMsg}
            </span>
            <button 
              onClick={() => setPrintSuccessMsg(null)}
              className="text-indigo-600 hover:text-indigo-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* View Mode 1: Main Options Hub */}
        {viewMode === 'options' ? (
          <div className="p-6 space-y-4 text-xs">
            {/* Summary Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {quota.year} Leave Balance Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>• {t.annualLeave}: <strong>{summary.annual?.taken || 0} / {quota.annual}</strong> {t.days}</div>
                <div>• {t.casualLeave}: <strong>{summary.casual?.taken || 0} / {quota.casual}</strong> {t.days}</div>
                <div>• {t.sickLeave}: <strong>{summary.sick?.taken || 0} / {quota.sick}</strong> {t.days}</div>
                <div>• Total Remaining: <strong className="text-emerald-700">{totalRemaining}</strong> {t.days}</div>
              </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: Print Official Report */}
              <button
                onClick={() => setViewMode('preview')}
                className="p-4 rounded-xl border-2 border-indigo-200 hover:border-indigo-600 bg-indigo-50/30 hover:bg-indigo-50/80 text-left transition-all flex flex-col items-start gap-2 group cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-indigo-950 group-hover:text-indigo-700 block text-sm">
                    Print Official Report
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Printable statement & PDF with signature lines
                  </span>
                </div>
              </button>

              {/* Option B: Excel / CSV Download */}
              <button
                onClick={handleDownloadCSV}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-left transition-all flex flex-col items-start gap-2 group cursor-pointer shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 group-hover:text-emerald-700 block text-sm">
                    Excel / CSV Download
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Export raw spreadsheet table (.csv)
                  </span>
                </div>
              </button>
            </div>

            {/* Reset sample data */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500">
              <span className="text-[11px]">
                Reset sample data:
              </span>
              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-600 font-medium">Load samples?</span>
                  <button
                    onClick={() => {
                      onResetData();
                      onClose();
                    }}
                    className="text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-0.5 rounded font-bold cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[11px] text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Samples</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* View Mode 2: Interactive Formal Report Preview & Direct Print */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-100/90 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Official Statement for Year <strong>{quota.year}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                {/* Download standalone HTML/PDF file */}
                <button
                  onClick={handleDownloadHTMLReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-all cursor-pointer"
                  title="Download HTML file you can open and print anytime"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download File (.html)</span>
                </button>

                {/* Print Now Button */}
                <button
                  onClick={handlePrintDocument}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* Document Preview Sheet */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-200/50">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 max-w-3xl mx-auto space-y-6 text-slate-800 font-sans print-only">
                
                {/* Statement Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
                      Official Leave Summary Statement
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Personal Leave & Balance Management Record &bull; Year {quota.year}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <p><strong>Date:</strong> {todayDateStr}</p>
                    <p><strong>Reference:</strong> LMS-{quota.year}-{Math.floor(Date.now() / 1000)}</p>
                    <p className="text-emerald-700 font-bold">Status: Certified Record</p>
                  </div>
                </div>

                {/* Summary Quota Cards */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Annual Leave</span>
                    <span className="text-xl font-black text-slate-900">{summary.annual?.remaining ?? quota.annual}</span>
                    <span className="block text-[10px] text-slate-500">Taken: {summary.annual?.taken ?? 0} / {quota.annual}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Casual Leave</span>
                    <span className="text-xl font-black text-slate-900">{summary.casual?.remaining ?? quota.casual}</span>
                    <span className="block text-[10px] text-slate-500">Taken: {summary.casual?.taken ?? 0} / {quota.casual}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Sick Leave</span>
                    <span className="text-xl font-black text-slate-900">{summary.sick?.remaining ?? quota.sick}</span>
                    <span className="block text-[10px] text-slate-500">Taken: {summary.sick?.taken ?? 0} / {quota.sick}</span>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <span className="block text-[10px] font-bold text-indigo-700 uppercase">Total Remaining</span>
                    <span className="text-xl font-black text-indigo-900">{totalRemaining}</span>
                    <span className="block text-[10px] text-indigo-600">Taken: {totalTaken} / {totalAllowed}</span>
                  </div>
                </div>

                {/* Leaves Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Detailed Leave Entries ({quota.year})
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Duration</th>
                          <th className="px-3 py-2 text-center">Days</th>
                          <th className="px-3 py-2">Reason</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaves.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                              No leave records found for {quota.year}.
                            </td>
                          </tr>
                        ) : (
                          leaves.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-semibold">
                                {l.startDate}
                                {l.endDate && l.endDate !== l.startDate ? ` → ${l.endDate}` : ''}
                              </td>
                              <td className="px-3 py-2 uppercase font-bold text-[10px]">
                                {l.category}
                              </td>
                              <td className="px-3 py-2 text-slate-600">
                                {l.duration === 'full' ? 'Full Day (1.0)' : l.duration === 'half_morning' ? 'Morning Half (0.5)' : l.duration === 'half_evening' ? 'Afternoon Half (0.5)' : 'Multiple Days'}
                              </td>
                              <td className="px-3 py-2 text-center font-bold">{l.daysCount}</td>
                              <td className="px-3 py-2 text-slate-700 max-w-xs truncate">{l.reason || '-'}</td>
                              <td className="px-3 py-2 text-emerald-700 font-semibold">Taken</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signature Blocks */}
                <div className="pt-8 flex justify-between items-end text-xs text-slate-700">
                  <div className="w-56 border-t border-slate-400 pt-2">
                    <p className="font-bold">Employee Signature</p>
                    <p className="text-[11px] text-slate-400 mt-4">Date: ________________________</p>
                  </div>

                  <div className="w-56 border-t border-slate-400 pt-2">
                    <p className="font-bold">Authorized Manager / HR</p>
                    <p className="text-[11px] text-slate-400 mt-4">Date: ________________________</p>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100">
                  Official Statement generated by My Leave Tracker &bull; Confidential &bull; Year {quota.year}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
