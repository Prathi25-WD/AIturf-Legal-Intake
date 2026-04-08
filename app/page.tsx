import Link from "next/link";
import { brandConfig } from "@/lib/professions/legal/brandConfig";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Describe your legal matter
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Our AI assistant will ask you a few focused questions
                  about your situation — in English or Kannada.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Get your case classified instantly
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  The assistant identifies the type of matter, checks
                  limitation deadlines, and recommends the correct court
                  or forum.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Download your intake brief
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  A structured PDF brief is generated automatically so
                  Dakappa sir can review your case before you meet.
                </p>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href="/chat"
            className="inline-block bg-blue-700 text-white text-base font-medium px-8 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Start Consultation
          </Link>

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

