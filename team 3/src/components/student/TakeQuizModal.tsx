import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Send, X, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, Student, StudentAttempt, StudentAnswer } from '../../types';

interface TakeQuizModalProps {
  quiz: Quiz;
  student: Student;
  onClose: () => void;
  onSubmit: (attempt: StudentAttempt) => void;
}

export const TakeQuizModal: React.FC<TakeQuizModalProps> = ({
  quiz,
  student,
  onClose,
  onSubmit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.timeLimitMinutes * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const questions = quiz.questions;
  const currentQuestion = questions[currentIdx];

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleClearAnswer = () => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const calculateResults = (): StudentAttempt => {
    const timeSpentSeconds = Math.min(
      quiz.timeLimitMinutes * 60,
      Math.floor((Date.now() - startTimeRef.current) / 1000)
    );

    const answers: StudentAnswer[] = questions.map((q) => {
      const selectedOptionId = selectedAnswers[q.id] || null;
      const correctOption = q.options.find((opt) => opt.isCorrect);
      const isCorrect = selectedOptionId !== null && selectedOptionId === correctOption?.id;
      const marksObtained = isCorrect ? q.marks : 0;

      return {
        questionId: q.id,
        selectedOptionId,
        isCorrect,
        marksObtained,
      };
    });

    const totalScore = answers.reduce((sum, a) => sum + a.marksObtained, 0);
    const maxScore = quiz.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const passed = totalScore >= quiz.passingMarks;

    return {
      id: `att-${quiz.id}-${student.id}-${Date.now()}`,
      quizId: quiz.id,
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.rollNo,
      division: student.division,
      batch: student.batch,
      startedAt: new Date(startTimeRef.current).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
      totalScore,
      maxScore,
      scorePercentage,
      passed,
      answers,
    };
  };

  const finalizeSubmission = () => {
    setIsSubmitting(true);
    const attempt = calculateResults();

    if (attempt.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      onSubmit(attempt);
    }, 400);
  };

  const handleAutoSubmit = () => {
    finalizeSubmission();
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isTimerLow = timeLeftSeconds <= 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">
              {quiz.subjectCode} • {quiz.title}
            </span>
            <div className="text-xs text-slate-300">
              Student: <span className="font-semibold text-white">{student.name}</span> ({student.rollNo})
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                isTimerLow
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-indigo-300 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time Left: {formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Exit Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Question Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-500">
                ({currentQuestion.marks} Marks)
              </span>
            </div>

            {/* Question Quick Palette */}
            <div className="flex flex-wrap items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!selectedAnswers[q.id];
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
              {currentQuestion.text}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, optIndex) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                const letter = String.fromCharCode(65 + optIndex);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAnswer}
              disabled={!selectedAnswers[currentQuestion.id]}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear Choice
            </button>
            <span className="text-xs text-slate-500">
              Answered: <strong>{answeredCount}</strong> / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Submit Assessment?</h4>
                <p className="text-xs text-slate-500">
                  You have answered {answeredCount} of {questions.length} questions.
                </p>
              </div>
            </div>

            {answeredCount < questions.length && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You have <strong>{questions.length - answeredCount} unanswered</strong> questions. Once submitted, you cannot change your answers.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Answering
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={finalizeSubmission}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? 'Grading...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
