'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBrain, 
  FaRobot,
  FaChartLine,
  FaUsers,
  FaCar,
  FaDollarSign,
  FaSearch,
  FaFilter,
  FaDownload,
  FaLightbulb,
  FaBullseye,
  FaArrowUp,
  FaEye,
  FaHandshake
} from 'react-icons/fa';

interface LeadScore {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  score: number;
  confidence: number;
  factors: {
    budget: number;
    engagement: number;
    timeline: number;
    intent: number;
  };
  recommendations: string[];
  priority: 'hot' | 'warm' | 'cold';
  predictedCloseDate: string;
  estimatedValue: number;
}

interface PriceRecommendation {
  vehicleId: string;
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
  marketPosition: 'aggressive' | 'competitive' | 'premium';
  demandForecast: 'high' | 'medium' | 'low';
  competitorPrices: {
    min: number;
    max: number;
    average: number;
  };
}

interface MarketInsight {
  category: string;
  insight: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  actionItems: string[];
}

export default function AIInsightsDashboard() {
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [priceRecommendations, setPriceRecommendations] = useState<PriceRecommendation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leads');

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    try {
      // Mock AI-generated data - replace with actual AI API
      const mockLeadScores: LeadScore[] = [
        {
          id: '1',
          customerName: 'John Mukasa',
          email: 'john@example.com',
          phone: '+256701234567',
          score: 94,
          confidence: 88,
          factors: {
            budget: 85,
            engagement: 95,
            timeline: 92,
            intent: 98
          },
          recommendations: [
            'Schedule immediate test drive',
            'Offer financing options',
            'Show similar premium models',
            'Follow up within 2 hours'
          ],
          priority: 'hot',
          predictedCloseDate: '2024-02-15',
          estimatedValue: 35000
        },
        {
          id: '2',
          customerName: 'Sarah Nakato',
          email: 'sarah@example.com',
          phone: '+256702345678',
          score: 76,
          confidence: 82,
          factors: {
            budget: 70,
            engagement: 80,
            timeline: 65,
            intent: 88
          },
          recommendations: [
            'Send detailed vehicle information',
            'Provide payment calculator',
            'Nurture with weekly follow-ups',
            'Highlight safety features'
          ],
          priority: 'warm',
          predictedCloseDate: '2024-03-01',
          estimatedValue: 28000
        },
        {
          id: '3',
          customerName: 'Peter Ssemwanga',
          email: 'peter@example.com',
          phone: '+256703456789',
          score: 45,
          confidence: 75,
          factors: {
            budget: 30,
            engagement: 40,
            timeline: 55,
            intent: 55
          },
          recommendations: [
            'Focus on budget-friendly options',
            'Educational content about financing',
            'Long-term nurturing campaign',
            'Highlight value propositions'
          ],
          priority: 'cold',
          predictedCloseDate: '2024-04-15',
          estimatedValue: 18000
        }
      ];

      const mockPriceRecommendations: PriceRecommendation[] = [
        {
          vehicleId: 'toyota-camry-2020',
          currentPrice: 28000,
          recommendedPrice: 26500,
          confidence: 91,
          reasoning: [
            'Similar models selling 8% below current price',
            'High inventory levels in market',
            'Seasonal demand decrease',
            'Competitor pricing pressure'
          ],
          marketPosition: 'competitive',
          demandForecast: 'medium',
          competitorPrices: {
            min: 25000,
            max: 29500,
            average: 26800
          }
        },
        {
          vehicleId: 'honda-accord-2019',
          currentPrice: 25000,
          recommendedPrice: 27000,
          confidence: 86,
          reasoning: [
            'Limited supply of similar models',
            'High customer interest',
            'Recent price increases in segment',
            'Above-average condition rating'
          ],
          marketPosition: 'premium',
          demandForecast: 'high',
          competitorPrices: {
            min: 24000,
            max: 28500,
            average: 26200
          }
        }
      ];

      const mockMarketInsights: MarketInsight[] = [
        {
          category: 'Market Trends',
          insight: 'SUV demand has increased 23% in the last 30 days, while sedan interest decreased 12%',
          impact: 'positive',
          confidence: 89,
          actionItems: [
            'Increase SUV inventory allocation',
            'Adjust marketing focus to SUV models',
            'Consider sedan pricing adjustments'
          ]
        },
        {
          category: 'Customer Behavior',
          insight: 'Customers are spending 35% more time on financing pages, indicating payment sensitivity',
          impact: 'neutral',
          confidence: 84,
          actionItems: [
            'Promote flexible financing options',
            'Highlight low monthly payments',
            'Create financing education content'
          ]
        },
        {
          category: 'Competitive Analysis',
          insight: 'Main competitor reduced prices by 5% on Toyota models, affecting your market position',
          impact: 'negative',
          confidence: 92,
          actionItems: [
            'Review Toyota model pricing',
            'Enhance value propositions',
            'Consider promotional campaigns'
          ]
        }
      ];

      setLeadScores(mockLeadScores);
      setPriceRecommendations(mockPriceRecommendations);
      setMarketInsights(mockMarketInsights);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      case 'cold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <FaArrowUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <FaArrowUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default:
        return <FaChartLine className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <FaBrain className="text-purple-600" />
              <span>AI Insights Dashboard</span>
            </h1>
            <p className="text-gray-600">AI-powered recommendations for leads, pricing, and market intelligence</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <FaRobot className="w-4 h-4" />
              <span>Refresh AI Analysis</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <FaDownload className="w-4 h-4" />
              <span>Export Insights</span>
            </button>
          </div>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Lead Scores</p>
                <p className="text-2xl font-bold text-gray-900">{leadScores.length}</p>
              </div>
              <FaBullseye className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {leadScores.filter(l => l.priority === 'hot').length}
                </p>
              </div>
              <FaUsers className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Optimizations</p>
                <p className="text-2xl font-bold text-green-600">{priceRecommendations.length}</p>
              </div>
              <FaDollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Insights</p>
                <p className="text-2xl font-bold text-blue-600">{marketInsights.length}</p>
              </div>
              <FaLightbulb className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'leads', name: 'Lead Scoring', icon: FaBullseye },
            { id: 'pricing', name: 'Price Optimization', icon: FaDollarSign },
            { id: 'insights', name: 'Market Intelligence', icon: FaLightbulb }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Lead Scoring Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">AI Lead Scoring & Recommendations</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {leadScores.map((lead) => (
                <div key={lead.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{lead.customerName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(lead.priority)}`}>
                          {lead.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${getScoreColor(lead.score)}`}>
                          Score: {lead.score}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{lead.email}</span>
                        <span>{lead.phone}</span>
                        <span>Est. Value: ${lead.estimatedValue.toLocaleString()}</span>
                        <span>Close Date: {new Date(lead.predictedCloseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence: {lead.confidence}%</div>
                    </div>
                  </div>

                  {/* Scoring Factors */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {Object.entries(lead.factors).map(([factor, score]) => (
                      <div key={factor} className="text-center">
                        <div className="text-xs text-gray-500 capitalize mb-1">{factor}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium mt-1">{score}%</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaRobot className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">AI Recommendations</span>
                    </div>
                    <ul className="space-y-1">
                      {lead.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-purple-800 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <button className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600">
                      Contact Now
                    </button>
                    <button className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                      Schedule Follow-up
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">
                      View Full Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price Optimization Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {priceRecommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{rec.vehicleId}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rec.marketPosition === 'aggressive' ? 'bg-red-100 text-red-800' :
                    rec.marketPosition === 'competitive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.marketPosition}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Price Comparison */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Price</p>
                        <p className="text-xl font-bold text-gray-900">${rec.currentPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">AI Recommended</p>
                        <p className={`text-xl font-bold ${
                          rec.recommendedPrice > rec.currentPrice ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${rec.recommendedPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{rec.confidence}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Potential Impact:</span>
                        <span className={`font-medium ${
                          rec.recommendedPrice > rec.currentPrice ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {rec.recommendedPrice > rec.currentPrice ? '+' : ''}
                          ${(rec.recommendedPrice - rec.currentPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Market Context */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Market Analysis</h5>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center bg-gray-50 rounded p-2">
                        <p className="text-gray-600">Min</p>
                        <p className="font-bold">${rec.competitorPrices.min.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-2">
                        <p className="text-gray-600">Avg</p>
                        <p className="font-bold">${rec.competitorPrices.average.toLocaleString()}</p>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-2">
                        <p className="text-gray-600">Max</p>
                        <p className="font-bold">${rec.competitorPrices.max.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">AI Reasoning</h5>
                    <ul className="space-y-1">
                      {rec.reasoning.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                      Apply Recommendation
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">
                      View Vehicle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Intelligence Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketInsights.map((insight, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getImpactIcon(insight.impact)}
                    <h4 className="font-medium text-gray-900">{insight.category}</h4>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {insight.confidence}% confident
                  </span>
                </div>

                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {insight.insight}
                </p>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2 text-sm">Recommended Actions:</h5>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                    Take Action
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}