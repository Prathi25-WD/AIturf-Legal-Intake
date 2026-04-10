import Link from "next/link";
import { brandConfig } from "@/lib/professions/legal/brandConfig";

export default function Home() {
  return (
    <div style={{ background: "var(--bg-page)" }} className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: "var(--olive-dark)", color: "#F5F0E8" }} className="text-xs font-semibold px-2 py-1 rounded">
            AITurf
          </div>
          <span className="text-gray-400 text-sm">|</span>
          <span className="text-sm font-medium text-gray-800">
            {brandConfig.firmName}
          </span>
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">
          AI-powered client intake
        </span>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-xl">

          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
            Powered by AITurf
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Welcome to {brandConfig.firmName}
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Tell us about your legal matter and we will prepare a
            structured brief for the advocate before your consultation.
          </p>

          {/* Three bullet points */}
           <div
              className="rounded-2xl p-6 mb-8 max-w-2xl mx-auto text-left shadow-md border border-[#e8e4dc]"
              style={{ background: "#F8F5F0" }}
            >

  <div className="space-y-6">

    {/* Step 1 */}
    <div className="flex items-center gap-4">
      <div
        className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 mt-1"
        style={{ background: "var(--olive-dark)", color: "#fff" }}
      >
        1
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Describe your legal matter
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Our AI assistant will ask a few focused questions — in English or Kannada.
        </p>
      </div>
    </div>

    {/* Step 2 */}
    <div className="flex items-center gap-4">
      <div
        className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 mt-1"
        style={{ background: "var(--olive-dark)", color: "#fff" }}
      >
        2
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Get your case classified instantly
        </p>
        <p className="text-sm text-gray-600 mt-1">
          The assistant identifies the matter, checks deadlines, and suggests the right court.
        </p>
      </div>
    </div>

    {/* Step 3 */}
    <div className="flex items-center gap-4">
      <div
        className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 mt-1"
        style={{ background: "var(--olive-dark)", color: "#fff" }}
      >
        3
      </div>
      <div>
        <p className="font-semibold text-gray-900">
          Download your intake brief
        </p>
        <p className="text-sm text-gray-600 mt-1">
          A structured PDF is generated so Dakappa sir can review before your meeting.
        </p>
      </div>
    </div>

  </div>
</div>

          {/* CTA button */}
          <div className="flex justify-center mt-5">
            <Link
              href="/chat"
              className="flex items-center justify-center w-[200px] h-[50px] rounded-xl bg-[var(--olive-dark)] text-[#F5F0E8] text-sm font-semibold hover:opacity-90"
            >
              Start Consultation
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Available 24 hours a day, 7 days a week
          </p>

        </div>
      </main>

      {/* Firm info footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-6">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {brandConfig.firmName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {brandConfig.address}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Office hours: {brandConfig.hours}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 max-w-xs">
            <p className="text-xs text-amber-800 leading-relaxed">
              {brandConfig.disclaimer}
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

