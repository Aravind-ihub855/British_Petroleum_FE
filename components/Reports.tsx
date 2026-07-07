"use client";

import React, { useState } from "react";

interface ReportItem {
  id: string;
  title: string;
  description: string;
}

const reportsList: ReportItem[] = [
  {
    id: "rep-001",
    title: "Store-wise Stockout Report",
    description: "Evaluates historical and predicted stockout dates grouped by store outlet boundaries.",
  },
  {
    id: "rep-002",
    title: "Item-wise Stockout Report",
    description: "Analyses stock thresholds and supply run-out cycles on an individual product level.",
  },
  {
    id: "rep-003",
    title: "Location-wise Aggregate Report",
    description: "Regional inventory summary and aggregated risk maps by city (e.g. Mumbai, Pune).",
  },
  {
    id: "rep-004",
    title: "Consolidated Inventory Report",
    description: "Complete register of stock availability, safety counts, and valuation of assets.",
  },
  {
    id: "rep-005",
    title: "Vendor Performance Report",
    description: "Vendor rankings built on ECOT (Cost, Quality, and Delivery speed) parameter indices.",
  },
];

export default function Reports() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownload = (id: string, title: string, format: "PDF" | "CSV") => {
    if (downloadingId) return;

    setDownloadingId(`${id}-${format}`);
    // Simulate compilation delay for high-fidelity feel
    setTimeout(() => {
      setDownloadingId(null);
      setToastMessage(`Success: "${title} (Consolidated).${format.toLowerCase()}" downloaded successfully!`);
      // Hide toast after 3.5 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }, 1800);
  };

  return (
    <div className="space-y-6 relative text-left">
      
      {/* Dynamic Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-xl flex items-center gap-2.5 animate-slide-up border border-slate-800">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800">
          Reports Center
        </h2>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          Generate, compile, and download static analytical reporting registers.
        </p>
      </div>

      {/* Reports Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map((report) => {
          const isPdfDownloading = downloadingId === `${report.id}-PDF`;
          const isCsvDownloading = downloadingId === `${report.id}-CSV`;

          return (
            <div
              key={report.id}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition duration-150"
            >
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                    {report.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {report.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-slate-50 pt-3.5 mt-auto">
                <button
                  disabled={downloadingId !== null}
                  onClick={() => handleDownload(report.id, report.title, "PDF")}
                  className={`flex-grow bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-150 shadow-xs flex items-center justify-center gap-1.5 ${
                    downloadingId !== null ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isPdfDownloading ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Compiling PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                
                <button
                  disabled={downloadingId !== null}
                  onClick={() => handleDownload(report.id, report.title, "CSV")}
                  className={`flex-grow bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-150 shadow-xs flex items-center justify-center gap-1.5 ${
                    downloadingId !== null ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isCsvDownloading ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Compiling CSV...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
