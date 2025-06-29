import React, { useState, useEffect } from 'react';
import { Scorecard } from '../components/dashboard/Scorecard';
import { ActionItems } from '../components/dashboard/ActionItems';
import { ReviewsFeed } from '../components/dashboard/ReviewsFeed';
import { MOCK_SCORECARD_DATA, MOCK_REVIEWS } from '../constants';
import { User, Asset, ActionItem, ScorecardMetric } from '../types';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icons';
import { GoogleGenAI } from "@google/genai";

interface BriefingData {
  greeting: string;
  keySuccess: {
    title: string;
    details: string;
  };
  focusArea: {
    title: string;
    details: string;
  };
}

const SmDashboard: React.FC<{
  currentUser: User;
  selectedAsset?: Asset;
  actionItems: ActionItem[];
  onToggleActionItem: (id: string) => void;
}> = ({ currentUser, selectedAsset, actionItems, onToggleActionItem }) => {
  const [isShimmering, setIsShimmering] = useState(false);
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Simulate dynamic data based on selected asset
  const dynamicMetrics = MOCK_SCORECARD_DATA.map(m => {
    if (!selectedAsset) return m;
    const hash = selectedAsset.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const newSales = 5000 + (hash % 500);
    const newLabor = 28 + (hash % 7);
    switch (m.id) {
      case 'sales':
        return { ...m, value: `$${newSales.toLocaleString()}` };
      case 'labor':
        return { ...m, value: `${newLabor.toFixed(1)}%` };
      default:
        return m;
    }
  });

  const handleGenerateBriefing = async () => {
    setIsGeneratingSummary(true);
    setBriefingData(null);
    setSummaryError('');
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const metricsForPrompt = dynamicMetrics.map(m => `- ${m.name}: ${m.value} (Target: ${m.target})`).join('\n');
      const prompt = `You are an assistant for a manager at a location named "${selectedAsset?.name || 'this location'}".
      Generate a concise, professional, and encouraging daily briefing based on these performance metrics:
      ${metricsForPrompt}
      
      Start with a brief, positive opening. Then, highlight one key success and one area for focus.
      Please provide the response as a valid JSON object with the following structure: 
      { 
        "greeting": "A short, encouraging opening sentence.",
        "keySuccess": { "title": "Title of the success", "details": "Details about the success." },
        "focusArea": { "title": "Title of the area for focus", "details": "Details about the focus area." }
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData = JSON.parse(jsonStr);
      setBriefingData(parsedData);

    } catch (e: any) {
      console.error(e);
      setSummaryError(e.message || 'Failed to generate summary. The model may have returned an invalid format.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      setIsShimmering(true);
      setBriefingData(null);
      const timer = setTimeout(() => setIsShimmering(false), 700);
      return () => clearTimeout(timer);
    }
  }, [selectedAsset]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {currentUser.firstName}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          You are viewing the dashboard for: <span className="font-semibold text-primary-600">{selectedAsset?.name || 'No Asset Selected'}</span>
        </p>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
        {/* Main column */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          <Card title="AI Daily Briefing" action={
             <button 
              onClick={handleGenerateBriefing}
              disabled={isGeneratingSummary}
              className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
              <Icon name="sparkles" className="h-4 w-4 mr-1.5 text-primary-500" />
              {isGeneratingSummary ? 'Generating...' : 'Generate Daily Briefing'}
            </button>
          }>
            <div className={`transition-opacity duration-300 min-h-[10rem] ${isShimmering ? 'opacity-50' : 'opacity-100'}`}>
                {isGeneratingSummary && (
                   <div className="flex justify-center items-center h-full">
                      <Icon name="arrow-path" className="h-6 w-6 animate-spin text-primary-500"/>
                   </div>
                )}
                {summaryError && <p className="text-sm text-danger-600 dark:text-danger-400 mt-2 text-center">{summaryError}</p>}
                
                {!isGeneratingSummary && briefingData && (
                  <div className="space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 text-center font-medium">{briefingData.greeting}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-success-50 dark:bg-success-500/10 border-l-4 border-success-400">
                          <div className="flex items-center gap-2">
                            <Icon name="check-circle" className="h-5 w-5 text-success-500"/>
                            <h4 className="font-semibold text-success-800 dark:text-success-200">{briefingData.keySuccess.title}</h4>
                          </div>
                          <p className="mt-1 text-sm text-success-700 dark:text-success-300 pl-7">{briefingData.keySuccess.details}</p>
                      </div>
                       <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-500/10 border-l-4 border-warning-400">
                          <div className="flex items-center gap-2">
                            <Icon name="exclamation-triangle" className="h-5 w-5 text-warning-500"/>
                            <h4 className="font-semibold text-warning-800 dark:text-warning-200">{briefingData.focusArea.title}</h4>
                          </div>
                          <p className="mt-1 text-sm text-warning-700 dark:text-warning-300 pl-7">{briefingData.focusArea.details}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!isGeneratingSummary && !briefingData && !summaryError && (
                  <div className="text-center py-4 flex flex-col items-center justify-center h-full">
                    <Icon name="sparkles" className="h-8 w-8 text-slate-400 mb-2"/>
                    <p className="text-slate-500 text-sm">Click "Generate Daily Briefing" for an AI-powered summary.</p>
                  </div>
                )}
            </div>
          </Card>
          <div className={`transition-opacity duration-300 ${isShimmering ? 'opacity-50' : 'opacity-100'}`}>
            <Scorecard metrics={dynamicMetrics} />
          </div>
          <ActionItems items={actionItems} onToggle={onToggleActionItem} />
        </div>
        {/* Right sidebar */}
        <div className="lg:col-span-1 xl:col-span-1">
          <ReviewsFeed reviews={MOCK_REVIEWS} />
        </div>
      </div>
    </>
  );
};

export default SmDashboard;