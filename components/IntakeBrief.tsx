"use client";
import { useRef } from "react";

// Type declaration for html2pdf.js (avoids needing @types package)
declare const html2pdf: (element: HTMLElement, options?: object) => {
  save: () => void;
};

interface BriefData {
  clientName: string;
  contactPhone: string;
  serviceType: string;
  serviceSubType: string;
  factSummary: string;
  applicableRules: string[];
  deadlineDate: string;
  deadlineStatus: "safe" | "warning" | "expired";
  recommendedForum: string;
  urgency: "low" | "medium" | "high" | "critical";
  questionsForProfessional: string[];
}

interface Props {
  brief: BriefData;
  onBack: () => void;
}

const urgencyColors: Record<string, string> = {
  low:      "bg-gray-100 text-gray-700",
  medium:   "bg-yellow-100 text-yellow-800",
  high:     "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const deadlineColors: Record<string, string> = {
  safe:    "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
};

const urgencyLabel: Record<string, string> = {
  low:      "Low urgency",
  medium:   "Medium urgency",
  high:     "High urgency",
  critical: "CRITICAL — Act immediately",
};

const deadlineLabel: Record<string, string> = {
  safe:    "Within limitation period",
  warning: "Approaching deadline — act soon",
  expired: "Limitation period may have expired",
};

export default function IntakeBrief({ brief, onBack }: Props) {
  const briefRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function downloadPDF() {
    if (!briefRef.current) return;
    const options = {
      margin:      [10, 10, 10, 10],
      filename:    `intake-brief-${brief.clientName.replace(/\s+/g, "-")}.pdf`,
      image:       { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf(briefRef.current, options).save();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action bar — does NOT print */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to chat
        </button>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Brief content — this is what gets printed */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div ref={briefRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-900 text-white px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">
                  Client Intake Brief
                </p>
                <h1 className="text-xl font-semibold">
                  K.T. Dakappa &amp; Associates
                </h1>
                <p className="text-sm text-blue-200 mt-0.5">
                  DVG Road, Basavanagudi, Bangalore — 560004
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-300">Date</p>
                <p className="text-sm font-medium">{today}</p>
                <p className="text-xs text-blue-300 mt-1">Powered by AITurf</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${urgencyColors[brief.urgency]}`}>
                {urgencyLabel[brief.urgency]}
              </span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${deadlineColors[brief.deadlineStatus]}`}>
                {deadlineLabel[brief.deadlineStatus]}
              </span>
            </div>

            {/* Section 1: Client details */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Client Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {brief.clientName || "Not provided"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {brief.contactPhone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Classification */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Case Classification
              </h2>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Type</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-xs">
                    {brief.serviceType}
                  </span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">Sub-type</span>
                  <span className="text-sm text-gray-700 text-right max-w-xs">
                    {brief.serviceSubType}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Fact summary */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Fact Summary
              </h2>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {brief.factSummary}
                </p>
              </div>
            </div>

            {/* Section 4: Deadline and Forum */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Deadline Analysis
                </h2>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Limitation deadline</p>
                  <p className="text-sm font-medium text-gray-900">
                    {brief.deadlineDate || "See advocate"}
                  </p>
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${deadlineColors[brief.deadlineStatus]}`}>
                    {brief.deadlineStatus}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Recommended Forum
                </h2>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {brief.recommendedForum}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Applicable laws */}
            {brief.applicableRules?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Applicable Laws / Rules
                </h2>
                <div className="flex flex-wrap gap-2">
                  {brief.applicableRules.map((rule, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-100"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Questions for advocate */}
            {brief.questionsForProfessional?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Questions for the Advocate
                </h2>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-2">
                  {brief.questionsForProfessional.map((q, i) => (
                    <div key={i} className="flex gap-2 text-sm text-amber-900">
                      <span className="font-medium flex-shrink-0">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                DISCLAIMER: This intake brief was generated by AITurf, an AI-assisted
                client intake tool. It does not constitute legal advice. The information
                collected is for the exclusive use of the advocate to prepare for a
                client consultation. All details should be verified with the client
                directly.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
