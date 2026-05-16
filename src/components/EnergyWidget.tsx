import React, { useEffect, useState } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';

interface EnergyData {
  energy: {
    current: number;
    max: number;
  };
  burnout: {
    score: number;
    risk: 'low' | 'medium' | 'high' | 'critical';
  };
  recommendations: string[];
}

const EnergyWidget: React.FC = () => {
  const navigate = useNavigate();
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async () => {
    try {
      const response = await apiRequest('/energy');
      setEnergyData(response.data);
    } catch (error) {
      console.error('Failed to fetch energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-32 bg-accent/20 rounded-lg" />
      </div>
    );
  }

  if (!energyData) return null;

  const { energy, burnout, recommendations } = energyData;
  const energyPercent = (energy.current / energy.max) * 100;

  // Determine color based on energy level
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
    if (energyPercent >= 70) return <BatteryFull className="w-6 h-6" />;
    if (energyPercent >= 40) return <BatteryMedium className="w-6 h-6" />;
    if (energyPercent >= 20) return <BatteryLow className="w-6 h-6" />;
    return <BatteryLow className="w-6 h-6 animate-pulse" />;
  };

  const getBurnoutRiskColor = () => {
    switch (burnout.risk) {
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'high':
        return 'text-orange-500 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-green-500 bg-green-500/10';
    }
  };

  const getBurnoutRiskLabel = () => {
    switch (burnout.risk) {
      case 'critical':
        return '🚨 Critical';
      case 'high':
        return '⚠️ High Risk';
      case 'medium':
        return '⚡ Moderate';
      default:
        return '✅ Healthy';
    }
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10 ${getEnergyColor()}`}>
            {getEnergyIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Energy Level</h3>
            <p className="text-sm text-muted-foreground">Your current capacity</p>
          </div>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-accent/30"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="url(#energyGradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - energyPercent / 100)}`}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={getEnergyGradient().split(' ')[0].replace('from-', 'stop-')} />
              <stop offset="100%" className={getEnergyGradient().split(' ')[1].replace('to-', 'stop-')} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getEnergyColor()}`}>
            {energy.current}
          </span>
          <span className="text-sm text-muted-foreground">/ {energy.max}</span>
        </div>
      </div>

      {/* Burnout Risk Indicator */}
      <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${getBurnoutRiskColor()}`}>
        <AlertTriangle className="w-4 h-4" />
        <div className="flex-1">
          <p className="text-sm font-medium">Burnout Risk</p>
          <p className="text-xs opacity-80">{getBurnoutRiskLabel()}</p>
        </div>
        <span className="text-lg font-bold">{burnout.score}/100</span>
      </div>

      {/* Quick Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Quick Tips</span>
          </div>
          <div className="space-y-1">
            {recommendations.slice(0, 2).map((rec, index) => (
              <p key={index} className="text-xs text-muted-foreground pl-6">
                • {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={() => navigate('/energy')}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors group"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default EnergyWidget;

// Made with Bob
