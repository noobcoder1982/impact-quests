import React, { useEffect, useState } from 'react';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Zap,
  Clock,
  Calendar,
  Shield,
  Activity,
  Coffee,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface EnergyHistory {
  value: number;
  timestamp: string;
  reason: string;
}

interface EnergyData {
  energy: {
    current: number;
    max: number;
    lastUpdated: string;
    history: EnergyHistory[];
  };
  burnout: {
    score: number;
    risk: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  focus: {
    score: number;
  };
  workload: {
    capacity: number;
    recommended: number;
    restNeeded: boolean;
  };
  activityPatterns: {
    averageTasksPerDay: number;
    averageWorkHours: number;
    peakProductivityHours: number[];
    restDays: string[];
    lastActive: string;
  };
  trustScore: number;
  recommendations: string[];
}

const EnergyDashboardPage: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [takingRest, setTakingRest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusResponse, historyResponse] = await Promise.all([
        apiRequest('/energy'),
        apiRequest('/energy/history?days=7'),
      ]);
      setEnergyData(statusResponse.data);
      setHistoryData(historyResponse.data);
    } catch (error) {
      console.error('Failed to fetch energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeRest = async () => {
    setTakingRest(true);
    try {
      await apiRequest('/energy/rest', {
        method: 'POST',
        body: JSON.stringify({ hours: 8 }),
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to record rest:', error);
    } finally {
      setTakingRest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-32 bg-accent/20 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-accent/20 rounded-xl" />
            <div className="h-64 bg-accent/20 rounded-xl" />
            <div className="h-64 bg-accent/20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!energyData) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load energy data</p>
      </div>
    );
  }

  const { energy, burnout, focus, workload, activityPatterns, trustScore, recommendations } = energyData;
  const energyPercent = (energy.current / energy.max) * 100;

  const getEnergyColor = () => {
    if (energyPercent >= 70) return 'text-green-500';
    if (energyPercent >= 40) return 'text-yellow-500';
    if (energyPercent >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getEnergyGradient = () => {
    if (energyPercent >= 70) return 'from-green-500 to-green-600';
    if (energyPercent >= 40) return 'from-yellow-500 to-yellow-600';
    if (energyPercent >= 20) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getEnergyIcon = () => {
    if (energyPercent >= 70) return <BatteryFull className="w-8 h-8" />;
    if (energyPercent >= 40) return <BatteryMedium className="w-8 h-8" />;
    if (energyPercent >= 20) return <BatteryLow className="w-8 h-8" />;
    return <BatteryLow className="w-8 h-8 animate-pulse" />;
  };

  const getTrendIcon = () => {
    if (!historyData?.statistics?.trend) return <Minus className="w-4 h-4" />;
    if (historyData.statistics.trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (historyData.statistics.trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getBurnoutRiskColor = () => {
    switch (burnout.risk) {
      case 'critical': return 'bg-red-500/10 border-red-500/50 text-red-500';
      case 'high': return 'bg-orange-500/10 border-orange-500/50 text-orange-500';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500';
      default: return 'bg-green-500/10 border-green-500/50 text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Energy Management</h1>
            <p className="text-muted-foreground">Monitor your productivity and prevent burnout</p>
          </div>
          {workload.restNeeded && (
            <button
              onClick={handleTakeRest}
              disabled={takingRest}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Coffee className="w-5 h-5" />
              {takingRest ? 'Recording...' : 'Take Rest'}
            </button>
          )}
        </div>

        {/* Main Energy Display */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Circular Progress */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="none"
                    className="text-accent/30"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="url(#mainEnergyGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 110}`}
                    strokeDashoffset={`${2 * Math.PI * 110 * (1 - energyPercent / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="mainEnergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={energyPercent >= 70 ? '#22c55e' : energyPercent >= 40 ? '#eab308' : energyPercent >= 20 ? '#f97316' : '#ef4444'} />
                      <stop offset="100%" stopColor={energyPercent >= 70 ? '#16a34a' : energyPercent >= 40 ? '#ca8a04' : energyPercent >= 20 ? '#ea580c' : '#dc2626'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`mb-2 ${getEnergyColor()}`}>
                    {getEnergyIcon()}
                  </div>
                  <span className={`text-6xl font-bold ${getEnergyColor()}`}>
                    {energy.current}
                  </span>
                  <span className="text-xl text-muted-foreground">/ {energy.max}</span>
                  <span className="text-sm text-muted-foreground mt-2">Energy Level</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Burnout Risk</span>
                </div>
                <p className="text-3xl font-bold">{burnout.score}/100</p>
                <p className={`text-sm mt-1 ${getBurnoutRiskColor()}`}>
                  {burnout.risk.toUpperCase()}
                </p>
              </div>

              <div className="bg-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Focus Score</span>
                </div>
                <p className="text-3xl font-bold">{focus.score}/100</p>
                <p className="text-sm text-muted-foreground mt-1">Concentration</p>
              </div>

              <div className="bg-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Workload</span>
                </div>
                <p className="text-3xl font-bold">{workload.recommended}</p>
                <p className="text-sm text-muted-foreground mt-1">Recommended tasks</p>
              </div>

              <div className="bg-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">Trust Score</span>
                </div>
                <p className="text-3xl font-bold">{trustScore}/100</p>
                <p className="text-sm text-muted-foreground mt-1">Reliability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Energy History Chart */}
        {historyData && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Energy History (7 Days)</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon()}
                  <span className="text-sm text-muted-foreground">
                    Trend: {historyData.statistics.trend}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">{historyData.statistics.average}</p>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-2">
              {energy.history.slice(-7).map((entry, index) => {
                const date = new Date(entry.timestamp);
                const percent = (entry.value / energy.max) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                    <div className="h-3 bg-accent/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          percent >= 70 ? 'from-green-500 to-green-600' :
                          percent >= 40 ? 'from-yellow-500 to-yellow-600' :
                          percent >= 20 ? 'from-orange-500 to-orange-600' :
                          'from-red-500 to-red-600'
                        } transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations and Burnout Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Recommendations</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                  <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Burnout Factors */}
          <div className={`border-2 rounded-xl p-6 ${getBurnoutRiskColor()}`}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-xl font-bold">Burnout Analysis</h2>
            </div>
            {burnout.factors.length > 0 ? (
              <div className="space-y-3">
                {burnout.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    <span className="text-lg">⚠️</span>
                    <p className="text-sm">{factor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-80">No burnout factors detected. Keep up the good work! 🎉</p>
            )}
          </div>
        </div>

        {/* Activity Patterns */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Activity Patterns</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Tasks/Day</p>
              <p className="text-3xl font-bold">{activityPatterns.averageTasksPerDay.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Peak Hours</p>
              <div className="flex flex-wrap gap-2">
                {activityPatterns.peakProductivityHours?.length > 0 ? (
                  activityPatterns.peakProductivityHours.map((hour) => (
                    <span key={hour} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {hour}:00
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Not enough data</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Last Active</p>
              <p className="text-lg font-medium">
                {activityPatterns.lastActive
                  ? new Date(activityPatterns.lastActive).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboardPage;

// Made with Bob
