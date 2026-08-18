import React, { useState } from 'react';
import { Users, X, CheckCircle2, XCircle, Search, Eye, Award, Clock } from 'lucide-react';
import { Quiz, StudentAttempt } from '../../types';
import { QuizResultModal } from '../student/QuizResultModal';

interface ViewSubmissionsModalProps {
  quiz: Quiz;
  attempts: StudentAttempt[];
  onClose: () => void;
}

export const ViewSubmissionsModal: React.FC<ViewSubmissionsModalProps> = ({
  quiz,
  attempts,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState<StudentAttempt | null>(null);

  const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);

  const filteredAttempts = quizAttempts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentRoll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSubmissions = quizAttempts.length;
  const passedCount = quizAttempts.filter((a) => a.passed).length;
  const averageScore = totalSubmissions > 0
    ? Math.round((quizAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / totalSubmissions))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {quiz.subjectCode} • Student Submissions
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Total Submissions</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{totalSubmissions} Students</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Average Score</div>
              <div className="text-xl font-bold text-indigo-600 mt-1">{averageScore}%</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 font-medium">Passing Rate</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0}% ({passedCount}/{totalSubmissions})
              </div>
            </div>
          </div>

          {/* Search filter */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by name or roll no..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredAttempts.length} of {totalSubmissions} records
            </span>
          </div>

          {/* Submissions Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Division & Batch</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAttempts.length > 0 ? (
                  filteredAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {attempt.studentName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {attempt.studentRoll}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-600">
                          {attempt.division.replace('_', ' ')} • {attempt.batch.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {attempt.totalScore} / {attempt.maxScore}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-indigo-600">
                        {attempt.scorePercentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            attempt.passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttempt(attempt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Answers
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      {totalSubmissions === 0
                        ? 'No student has attempted this quiz yet.'
                        : 'No submissions matching your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Student Detailed Answer Review Modal */}
      {selectedAttempt && (
        <QuizResultModal
          quiz={quiz}
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  );
};
