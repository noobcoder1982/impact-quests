import React, { useState } from 'react';
import { X, Battery, Brain, Zap, TrendingUp } from 'lucide-react';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: TaskFeedback) => void;
  taskTitle: string;
}

export interface TaskFeedback {
  mentalDrain: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  focusQuality: 1 | 2 | 3 | 4 | 5;
  capacityForMore: 'yes' | 'maybe' | 'no';
  actualDifficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
}) => {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<Partial<TaskFeedback>>({});

  const mentalDrainOptions = [
    { value: 'very-low', emoji: '😊', label: 'Very Low', color: 'text-green-500' },
    { value: 'low', emoji: '🙂', label: 'Low', color: 'text-green-400' },
    { value: 'medium', emoji: '😐', label: 'Medium', color: 'text-yellow-500' },
    { value: 'high', emoji: '😓', label: 'High', color: 'text-orange-500' },
    { value: 'very-high', emoji: '😰', label: 'Very High', color: 'text-red-500' },
  ];

  const focusOptions = [
    { value: 1, emoji: '😵', label: 'Very Poor' },
    { value: 2, emoji: '😕', label: 'Poor' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Excellent' },
  ];

  const capacityOptions = [
    { value: 'yes', emoji: '💪', label: 'Yes, bring it on!', color: 'text-green-500' },
    { value: 'maybe', emoji: '🤔', label: 'Maybe one more', color: 'text-yellow-500' },
    { value: 'no', emoji: '😴', label: 'No, I need rest', color: 'text-red-500' },
  ];

  const difficultyOptions = [
    { value: 'easy', emoji: '😌', label: 'Easy' },
    { value: 'medium', emoji: '🤔', label: 'Medium' },
    { value: 'hard', emoji: '😅', label: 'Hard' },
    { value: 'very-hard', emoji: '😰', label: 'Very Hard' },
  ];

  const handleSubmit = () => {
    if (
      feedback.mentalDrain &&
      feedback.focusQuality &&
      feedback.capacityForMore &&
      feedback.actualDifficulty
    ) {
      onSubmit(feedback as TaskFeedback);
      // Reset
      setStep(1);
      setFeedback({});
    }
  };

  const handleSkip = () => {
    onClose();
    setStep(1);
    setFeedback({});
  };

  if (!isOpen) return null;

  const progress = (step / 4) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-border/50">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Battery className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Task Completed! 🎉</h2>
              <p className="text-sm text-muted-foreground">Help us track your energy</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-accent/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step} of 4
          </p>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <p className="text-sm text-muted-foreground mb-4">
            Task: <span className="font-medium text-foreground">{taskTitle}</span>
          </p>

          {/* Step 1: Mental Drain */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">How mentally drained are you?</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {mentalDrainOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFeedback({ ...feedback, mentalDrain: option.value as any });
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      feedback.mentalDrain === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{option.emoji}</span>
                      <div className="text-left flex-1">
                        <p className={`font-medium ${option.color}`}>{option.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Focus Quality */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">How focused did you feel?</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {focusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFeedback({ ...feedback, focusQuality: option.value as any });
                      setStep(3);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-110 ${
                      feedback.focusQuality === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 bg-accent/20'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">{option.emoji}</span>
                      <p className="text-xs font-medium">{option.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Capacity */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Can you take another task today?</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {capacityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFeedback({ ...feedback, capacityForMore: option.value as any });
                      setStep(4);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      feedback.capacityForMore === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 bg-accent/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{option.emoji}</span>
                      <div className="text-left flex-1">
                        <p className={`font-medium ${option.color}`}>{option.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Actual Difficulty */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">How difficult was this task?</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFeedback({ ...feedback, actualDifficulty: option.value as any });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      feedback.actualDifficulty === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 bg-accent/20'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">{option.emoji}</span>
                      <p className="font-medium">{option.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
          >
            Skip
          </button>
          {step === 4 && feedback.actualDifficulty && (
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Submit Feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionModal;

// Made with Bob
