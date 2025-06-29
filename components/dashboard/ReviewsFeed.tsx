import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Review } from '../../types';
import { Icon } from '../ui/Icons';
import { GoogleGenAI } from "@google/genai";

const PlatformLogo: React.FC<{ platform: Review['platform'] }> = ({ platform }) => {
  const platformStyles = {
    Google: 'bg-blue-500 text-white',
    Yelp: 'bg-red-600 text-white',
    TripAdvisor: 'bg-green-500 text-white',
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${platformStyles[platform]}`}>
      {platform.charAt(0)}
    </div>
  );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name="star"
          viewBox='0 0 20 20'
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
    </div>
  );
};

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    setError('');
    setDraft('');
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key not found.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a professional and courteous customer service manager for a restaurant or hotel.
      Based on the following customer review, please draft a polite and helpful response.
      The review has a rating of ${review.rating} out of 5 stars.
      If the rating is low, be apologetic and offer to make things right. If the rating is high, be appreciative.
      Keep the response concise and friendly.

      Review content: "${review.content}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      
      setDraft(response.text.trim());

    } catch (e) {
      console.error(e);
      setError('Failed to generate response. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <li className="py-4">
      <div className="flex items-start space-x-3">
        <PlatformLogo platform={review.platform} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{review.author}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{review.timestamp}</p>
          </div>
          <StarRating rating={review.rating} />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {review.content}
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => console.log(`Responding to ${review.author}'s review.`)}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 px-3 py-1 rounded-full hover:bg-primary-200 dark:hover:bg-primary-500/30 transition-colors">
              Respond
            </button>
             <button 
              onClick={handleGenerateDraft}
              disabled={isGenerating}
              className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
              <Icon name="sparkles" className="h-3 w-3 mr-1.5 text-primary-500" />
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </button>
          </div>
          {error && <p className="text-xs text-danger-600 dark:text-danger-400 mt-2">{error}</p>}
          {draft && (
            <div className="mt-3 space-y-2">
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full h-24 p-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="AI-generated draft..."
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(draft)}
                  className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600"
                  title="Copy to clipboard"
                >
                  <Icon name="clipboard" className="h-4 w-4 mr-1"/>
                  Copy Draft
                </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};


interface ReviewsFeedProps {
  reviews: Review[];
}

export const ReviewsFeed: React.FC<ReviewsFeedProps> = ({ reviews }) => {
  return (
    <Card title="New Online Reviews" className="h-full">
      <ul className="divide-y divide-slate-200/80 dark:divide-slate-800 -mt-4">
        {reviews.map(review => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
    </Card>
  );
};