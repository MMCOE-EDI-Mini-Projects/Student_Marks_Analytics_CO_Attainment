import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Calendar, Clock, Layers } from 'lucide-react';
import { Quiz, DivisionId, BatchId, QuizAssignment } from '../../types';

interface AssignQuizFormProps {
  quizzes: Quiz[];
  preSelectedQuizId?: string;
  onAssignQuiz: (quizId: string, assignments: QuizAssignment[], dueDate: string, dueTime: string, shuffle: boolean, instantResults: boolean) => void;
}

export const AssignQuizForm: React.FC<AssignQuizFormProps> = ({
  quizzes,
  preSelectedQuizId,
  onAssignQuiz,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    preSelectedQuizId || (quizzes.length > 0 ? quizzes[0].id : '')
  );

  const [divA, setDivA] = useState(true);
  const [divB, setDivB] = useState(false);

  const [batchA, setBatchA] = useState(true);
  const [batchB, setBatchB] = useState(true);
  const [batchC, setBatchC] = useState(true);

  const [dueDate, setDueDate] = useState('2026-08-30');
  const [dueTime, setDueTime] = useState('23:59');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [instantResults, setInstantResults] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

  const handleAssign = () => {
    setErrorMsg(null);

    if (!selectedQuizId) {
      setErrorMsg('Please select a curated quiz to assign.');
      return;
    }

    if (!divA && !divB) {
      setErrorMsg('Please select at least one target division (Division A or Division B).');
      return;
    }

    const selectedBatches: BatchId[] = [];
    if (batchA) selectedBatches.push('BATCH_A');
    if (batchB) selectedBatches.push('BATCH_B');
    if (batchC) selectedBatches.push('BATCH_C');

    if (selectedBatches.length === 0) {
      setErrorMsg('Please select at least one target batch.');
      return;
    }

    if (!dueDate) {
      setErrorMsg('Please specify a due date for the assessment.');
      return;
    }

    const assignments: QuizAssignment[] = [];
    if (divA) {
      assignments.push({ division: 'DIV_A', batches: selectedBatches });
    }
    if (divB) {
      assignments.push({ division: 'DIV_B', batches: selectedBatches });
    }

    onAssignQuiz(selectedQuizId, assignments, dueDate, dueTime, shuffleQuestions, instantResults);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-600" />
          Assign Assessment to Student Batches
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select the curated quiz, target student divisions, batch groups, and deadlines.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Quiz & Target Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Curated Quiz to Assign *
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 font-medium"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.subjectCode} - {q.title} ({q.questions.length} Qs, {q.timeLimitMinutes} Mins, {q.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          {selectedQuiz && (
            <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-lg text-xs text-slate-700 space-y-1">
              <div className="font-bold text-indigo-900">{selectedQuiz.title}</div>
              <div className="text-slate-600">
                Course: <strong>{selectedQuiz.subjectCode} - {selectedQuiz.subjectName}</strong> • {selectedQuiz.questions.length} Questions • {selectedQuiz.timeLimitMinutes} Minutes Duration • Passing Marks: {selectedQuiz.passingMarks}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Division / Class *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  divA ? 'bg-indigo-50/70 border-indigo-300 font-semibold text-indigo-950' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={divA}
                  onChange={(e) => setDivA(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Division A (60 Students)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  divB ? 'bg-indigo-50/70 border-indigo-300 font-semibold text-indigo-950' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={divB}
                  onChange={(e) => setDivB(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Division B (60 Students)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Batches *
            </label>
            <div className="flex flex-wrap gap-2">
              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer ${
                  batchA ? 'bg-indigo-50/70 border-indigo-300 font-semibold text-indigo-950' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={batchA}
                  onChange={(e) => setBatchA(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Batch A (Roll 1-20)</span>
              </label>

              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer ${
                  batchB ? 'bg-indigo-50/70 border-indigo-300 font-semibold text-indigo-950' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={batchB}
                  onChange={(e) => setBatchB(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Batch B (Roll 21-40)</span>
              </label>

              <label
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs cursor-pointer ${
                  batchC ? 'bg-indigo-50/70 border-indigo-300 font-semibold text-indigo-950' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={batchC}
                  onChange={(e) => setBatchC(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Batch C (Roll 41-60)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Preferences */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Delivery Options
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Randomize question order for each student</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={instantResults}
                  onChange={(e) => setInstantResults(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Allow student to view instant results & breakdown</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleAssign}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Assign Assessment to Students
        </button>
      </div>
    </div>
  );
};
