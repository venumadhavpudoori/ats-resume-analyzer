'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Send, Sparkles, Copy, Check, MessageSquareQuote } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalysisResult, BulletRewriteResponse } from '@/types/api';
import ScoreGauge from '@/components/analysis/ScoreGauge';
import KeywordTag from '@/components/analysis/KeywordTag';
import RewriteModal from '@/components/analysis/RewriteModal';

export default function AnalysisPage() {
  const { id } = useParams();
  const [atsData, setAtsData] = useState<any>(null);
  const [fullAnalysis, setFullAnalysis] = useState<AnalysisResult | null>(null);
  const [jd, setJd] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // AI Rewrite State
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<BulletRewriteResponse | null>(null);

  useEffect(() => {
    fetchAtsScore();
  }, [id]);

  async function fetchAtsScore() {
    try {
      const data = await api.resumes.getAtsScore(id as string);
      setAtsData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFullAnalysis() {
    if (!jd) return;
    setIsAnalyzing(true);
    try {
      const data = await api.resumes.analyze(id as string, { job_description: jd });
      setFullAnalysis(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleRewrite() {
    if (!selectedBullet) return;
    setIsRewriting(true);
    setRewriteResult(null);
    try {
      const result = await api.ai.rewriteBullet({
        original_text: selectedBullet,
        job_description: jd || "General professional optimization",
        context: atsData?.raw_text || "Professional resume"
      });
      setRewriteResult(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRewriting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header & ATS Score */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis Dashboard</h1>
          <p className="text-slate-500">Detailed breakdown of your resume's performance</p>
        </div>
        <div className="flex gap-12">
          <ScoreGauge score={atsData?.ats_score || 0} label="ATS Compatibility" />
          {fullAnalysis && (
            <ScoreGauge score={fullAnalysis.match_score} label="Job Match" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: JD Input & Match Scoring */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Match Analysis
            </h3>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full h-64 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
            <button
              onClick={handleFullAnalysis}
              disabled={isAnalyzing || !jd}
              className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-blue-300"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
            </button>
          </div>

          {fullAnalysis && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Keyword Gaps</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase mb-2">Matched</p>
                  <div className="flex flex-wrap gap-2">
                    {fullAnalysis.keyword_gaps.matched.map((kw, i) => (
                      <KeywordTag key={i} text={kw} type="matched" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase mb-2">Missing</p>
                  <div className="flex flex-wrap gap-2">
                    {fullAnalysis.keyword_gaps.missing.map((kw, i) => (
                      <KeywordTag key={i} text={kw} type="missing" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Breakdown & AI Rewrite */}
        <div className="lg:col-span-2 space-y-6">
          {/* ATS Breakdown */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">ATS Compatibility Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {atsData?.ats_breakdown && Object.entries(atsData.ats_breakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700 capitalize">{key.replace('_', ' ')}</span>
                    <span className={`text-sm font-bold ${value.score < 50 ? 'text-red-500' : 'text-green-600'}`}>
                      {value.score}/25
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{value.explanation || 'No issues found.'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Rewrite Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">AI-Powered Optimization</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                <Sparkles className="h-3 w-3" />
                GPT-4 Powered
              </div>
            </div>

            <div className="space-y-4">
              {atsData?.parsed_content?.structured_content?.experience ? (
                <div className="space-y-3">
                  {atsData.parsed_content.structured_content.experience.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                    <div
                      key={i}
                      onClick={() => setSelectedBullet(bullet)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        selectedBullet === bullet
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquareQuote className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                      <p className="text-sm text-slate-700 leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                  <p>No experience bullets found to rewrite.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RewriteModal
        isOpen={!!selectedBullet}
        onClose={() => {
          setSelectedBullet(null);
          setRewriteResult(null);
        }}
        originalText={selected,bullet || ''}
        suggestedText={rewriteResult?.suggested_text}
        reasoning={rewriteResult?.reasoning}
        missingInfo={rewriteResult?.missing_info}
        isLoading={isRewriting}
        onRewrite={async (text) => {
          await handleRewrite();
        }}
      />
    </div>
  );
}
