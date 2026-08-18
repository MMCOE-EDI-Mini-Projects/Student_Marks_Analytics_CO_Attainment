import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, Calendar, Check, X, RotateCcw, HelpCircle, BookOpen } from 'lucide-react';
import { Quiz, StudentAttempt } from '../../types';

interface QuizResultModalProps {
  quiz: Quiz;
  attempt: StudentAttempt;
  onClose: () => void;
  onRetake?: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  quiz,
  attempt,
  onClose,
  onRetake,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formattedDate = new Date(attempt.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {quiz.subjectCode} • Assessment Report
            </span>
            <h3 className="text-base font-bold text-white leading-tight mt-0.5">
              {quiz.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Summary Score Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 ${
                  attempt.passed
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                }`}
              >
                {attempt.scorePercentage}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      attempt.passed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {attempt.passed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Needs Improvement
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Passing: {quiz.passingMarks} Marks)
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900 mt-1">
                  Score: {attempt.totalScore} / {attempt.maxScore} Marks
                </div>
                <div className="text-xs text-slate-500">
                  Student: <strong>{attempt.studentName}</strong> ({attempt.studentRoll})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shrink-0">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Taken</span>
                <span className="font-semibold text-slate-800">{formatTime(attempt.timeSpentSeconds)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted</span>
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Detailed Question Analysis ({quiz.questions.length} Questions)
            </h4>

            <div className="space-y-4">
              {quiz.questions.map((q, idx) => {
                const answer = attempt.answers.find((a) => a.questionId === q.id);
                const isCorrect = answer?.isCorrect || false;
                const selectedOptId = answer?.selectedOptionId;
                const correctOpt = q.options.find((opt) => opt.isCorrect);

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4.5 space-y-3 transition-colors ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-900">
                          {q.text}
                        </h5>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {answer?.marksObtained || 0} / {q.marks} Marks
                      </span>
                    </div>

                    {/* Options List */}
                    <div className="space-y-1.5 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isStudentPick = selectedOptId === opt.id;
                        const isTheCorrectAnswer = opt.isCorrect;
                        const letter = String.fromCharCode(65 + optIdx);

                        let style = 'bg-white border-slate-200 text-slate-700';
                        if (isTheCorrectAnswer) {
                          style = 'bg-emerald-100/80 border-emerald-300 text-emerald-950 font-medium';
                        } else if (isStudentPick && !isTheCorrectAnswer) {
                          style = 'bg-rose-100/80 border-rose-300 text-rose-950 line-through';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px] text-slate-500">{letter}.</span>
                              <span>{opt.text}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isTheCorrectAnswer && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              )}
                              {isStudentPick && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isTheCorrectAnswer
                                      ? 'bg-emerald-200/80 text-emerald-800'
                                      : 'bg-rose-200/80 text-rose-800'
                                  }`}
                                >
                                  Your Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="ml-8 p-3 bg-white/80 border border-slate-200/80 rounded-lg text-xs text-slate-600">
                        <strong className="text-indigo-600 font-semibold">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Completed on {formattedDate}
          </div>

          <div className="flex items-center gap-3">
            {onRetake && (
              <button
                type="button"
                onClick={onRetake}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Close Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
