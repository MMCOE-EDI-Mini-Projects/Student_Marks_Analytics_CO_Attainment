import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Plus,
  Send,
  Play,
  FileCheck2,
  Clock,
  Calendar,
  CheckCircle2,
  ListTodo,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  Eye,
  RotateCcw,
  Check,
  AlertCircle,
  Award,
  GraduationCap
} from 'lucide-react';
import { Quiz, Student, StudentAttempt, QuizAssignment } from './types';
import { INITIAL_QUIZZES, INITIAL_STUDENTS, INITIAL_ATTEMPTS } from './data';
import { CurateQuizForm } from './components/teacher/CurateQuizForm';
import { AssignQuizForm } from './components/teacher/AssignQuizForm';
import { ViewSubmissionsModal } from './components/teacher/ViewSubmissionsModal';
import { TakeQuizModal } from './components/student/TakeQuizModal';
import { QuizResultModal } from './components/student/QuizResultModal';

export default function App() {
  // Persistence with localStorage
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('app_quizzes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_QUIZZES;
  });

  const [attempts, setAttempts] = useState<StudentAttempt[]>(() => {
    const saved = localStorage.getItem('app_attempts_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ATTEMPTS;
  });

  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudentId, setCurrentStudentId] = useState<string>(INITIAL_STUDENTS[0].id);

  // Active view states
  const [activeDashboard, setActiveDashboard] = useState<'teacher' | 'student'>('teacher');
  const [teacherTab, setTeacherTab] = useState<'curate' | 'assign' | 'list'>('curate');

  // Teacher action states
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [assigningQuizId, setAssigningQuizId] = useState<string>('');
  const [viewSubmissionsQuiz, setViewSubmissionsQuiz] = useState<Quiz | null>(null);

  // Student action states
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [reviewingQuiz, setReviewingQuiz] = useState<{ quiz: Quiz; attempt: StudentAttempt } | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('app_quizzes_v2', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('app_attempts_v2', JSON.stringify(attempts));
  }, [attempts]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];

  // Helper: check if a quiz is assigned to a specific student
  const isQuizAssignedToStudent = (quiz: Quiz, student: Student) => {
    if (quiz.status === 'draft' || !quiz.assignedTo || quiz.assignedTo.length === 0) {
      return false;
    }
    return quiz.assignedTo.some(
      (assign) =>
        assign.division === student.division &&
        (assign.batches.includes(student.batch) || assign.batches.length === 0)
    );
  };

  // Helper: get student's attempt on a quiz if completed
  const getStudentAttempt = (quizId: string, studentId: string) => {
    return attempts.find((a) => a.quizId === quizId && a.studentId === studentId);
  };

  // Handle Curate Save
  const handleSaveCuratedQuiz = (savedQuiz: Quiz) => {
    const exists = quizzes.some((q) => q.id === savedQuiz.id);
    let updated: Quiz[];
    if (exists) {
      updated = quizzes.map((q) => (q.id === savedQuiz.id ? savedQuiz : q));
      showToast(`Quiz "${savedQuiz.title}" updated successfully!`);
    } else {
      updated = [savedQuiz, ...quizzes];
      showToast(`New quiz "${savedQuiz.title}" created!`);
    }

    setQuizzes(updated);
    setEditingQuiz(null);

    // If it's a new quiz, prompt user to assign it or view all
    setAssigningQuizId(savedQuiz.id);
    setTeacherTab('assign');
  };

  // Handle Assign Quiz
  const handleAssignQuiz = (
    quizId: string,
    assignments: QuizAssignment[],
    dueDate: string,
    dueTime: string,
    shuffle: boolean,
    instantResults: boolean
  ) => {
    const updated = quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          assignedTo: assignments,
          dueDate,
          dueTime,
          shuffleQuestions: shuffle,
          instantResults,
          status: 'assigned' as const,
        };
      }
      return q;
    });

    setQuizzes(updated);
    const assignedQuiz = updated.find((q) => q.id === quizId);
    showToast(`Quiz "${assignedQuiz?.title}" has been assigned to student batches!`);
    setTeacherTab('list');
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
      setAttempts(attempts.filter((a) => a.quizId !== quizId));
      showToast('Quiz deleted successfully.', 'info');
    }
  };

  // Handle Quiz Submission
  const handleQuizSubmit = (newAttempt: StudentAttempt) => {
    // Add or replace attempt for this student & quiz
    const existingIndex = attempts.findIndex(
      (a) => a.quizId === newAttempt.quizId && a.studentId === newAttempt.studentId
    );

    let updatedAttempts: StudentAttempt[];
    if (existingIndex >= 0) {
      updatedAttempts = [...attempts];
      updatedAttempts[existingIndex] = newAttempt;
    } else {
      updatedAttempts = [newAttempt, ...attempts];
    }

    setAttempts(updatedAttempts);
    const currentQuiz = takingQuiz;
    setTakingQuiz(null);

    showToast(`Quiz submitted! Score: ${newAttempt.totalScore} / ${newAttempt.maxScore} (${newAttempt.scorePercentage}%)`);

    // Open results immediately
    if (currentQuiz) {
      setReviewingQuiz({ quiz: currentQuiz, attempt: newAttempt });
    }
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all quizzes and student attempts to initial demo state?')) {
      setQuizzes(INITIAL_QUIZZES);
      setAttempts(INITIAL_ATTEMPTS);
      localStorage.removeItem('app_quizzes_v2');
      localStorage.removeItem('app_attempts_v2');
      showToast('Demo data restored to default.', 'info');
    }
  };

  // Filter quizzes assigned to current student
  const studentAssignedQuizzes = quizzes.filter((q) => isQuizAssignedToStudent(q, currentStudent));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-70 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Quiz Portal</h1>
              <p className="text-xs text-slate-500">Teacher & Student Assessment System</p>
            </div>
          </div>

          {/* Clean Dashboard Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              id="btn-switch-teacher"
              onClick={() => {
                setActiveDashboard('teacher');
                setEditingQuiz(null);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeDashboard === 'teacher'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Teacher Dashboard
            </button>
            <button
              id="btn-switch-student"
              onClick={() => setActiveDashboard('student')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeDashboard === 'student'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Student Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ========================================================================= */}
        {/* TEACHER DASHBOARD                                                         */}
        {/* ========================================================================= */}
        {activeDashboard === 'teacher' && (
          <div className="space-y-6">
            {/* Header Title and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Teacher Dashboard</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curate questions, build assessments, and assign quizzes to student batches.
                </p>
              </div>

              {/* Sub-navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTeacherTab('curate');
                    setEditingQuiz(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    teacherTab === 'curate' && !editingQuiz
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  1. Curate Quiz
                </button>
                <button
                  onClick={() => setTeacherTab('assign')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    teacherTab === 'assign'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  2. Assign Quiz
                </button>
                <button
                  onClick={() => setTeacherTab('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    teacherTab === 'list'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  3. All Quizzes ({quizzes.length})
                </button>
              </div>
            </div>

            {/* TAB 1: CURATE QUIZ */}
            {teacherTab === 'curate' && (
              <CurateQuizForm
                initialQuiz={editingQuiz}
                onSaveQuiz={handleSaveCuratedQuiz}
                onCancelEdit={() => {
                  setEditingQuiz(null);
                  setTeacherTab('list');
                }}
              />
            )}

            {/* TAB 2: ASSIGN QUIZ */}
            {teacherTab === 'assign' && (
              <AssignQuizForm
                quizzes={quizzes}
                preSelectedQuizId={assigningQuizId}
                onAssignQuiz={handleAssignQuiz}
              />
            )}

            {/* TAB 3: ALL QUIZZES LIST */}
            {teacherTab === 'list' && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Curated & Assigned Quizzes</h3>
                    <p className="text-xs text-slate-500">
                      Summary of all quizzes, active batch targets, and student submissions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuiz(null);
                      setTeacherTab('curate');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Curate New Quiz
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                        <th className="py-2.5 px-3">Quiz Name</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Target Group</th>
                        <th className="py-2.5 px-3 text-center">Questions</th>
                        <th className="py-2.5 px-3 text-center">Duration</th>
                        <th className="py-2.5 px-3 text-center">Submissions</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {quizzes.map((quiz) => {
                        const quizAttemptCount = attempts.filter((a) => a.quizId === quiz.id).length;
                        const isAssigned = quiz.status === 'assigned';

                        return (
                          <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {quiz.title}
                            </td>
                            <td className="py-3 px-3 text-slate-500 font-mono">
                              {quiz.subjectCode}
                            </td>
                            <td className="py-3 px-3">
                              {isAssigned ? (
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
                                  {quiz.assignedTo.map((a) => a.division.replace('_', ' ')).join(', ')} (
                                  {quiz.assignedTo.flatMap((a) => a.batches).map((b) => b.replace('BATCH_', '')).join(',')}
                                  )
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] font-medium">
                                  Draft (Unassigned)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-medium">
                              {quiz.questions.length} Qs
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500">
                              {quiz.timeLimitMinutes} mins
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                                  quizAttemptCount > 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {quizAttemptCount} Students
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {quiz.dueDate || '-'}
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuiz(quiz);
                                  setTeacherTab('curate');
                                }}
                                className="px-2 py-1 text-slate-600 hover:text-indigo-600 font-medium hover:bg-slate-100 rounded"
                                title="Edit Quiz"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAssigningQuizId(quiz.id);
                                  setTeacherTab('assign');
                                }}
                                className="px-2 py-1 text-indigo-600 hover:text-indigo-800 font-medium hover:bg-indigo-50 rounded"
                                title="Assign Quiz"
                              >
                                Assign
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewSubmissionsQuiz(quiz)}
                                className="px-2 py-1 text-slate-700 hover:text-slate-900 font-medium bg-slate-100 hover:bg-slate-200 rounded"
                                title="View Submissions"
                              >
                                Submissions
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="px-1.5 py-1 text-slate-400 hover:text-rose-600 font-medium hover:bg-rose-50 rounded"
                                title="Delete Quiz"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STUDENT DASHBOARD                                                         */}
        {/* ========================================================================= */}
        {activeDashboard === 'student' && (
          <div className="space-y-6">
            {/* Header Title with Student Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 bg-white p-4 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-base">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{currentStudent.name}</h2>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      {currentStudent.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentStudent.division.replace('_', ' ')} • {currentStudent.batch.replace('_', ' ')} • Computer Science
                  </p>
                </div>
              </div>

              {/* Student Switcher for testing */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 hidden sm:inline">Switch Student View:</span>
                <select
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.name} ({std.division.replace('_', ' ')} - {std.batch.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Quizzes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Quizzes Assigned to You ({studentAssignedQuizzes.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click Start to attempt an assessment, or click See Result to review your submission breakdown.
                  </p>
                </div>
              </div>

              {studentAssignedQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {studentAssignedQuizzes.map((quiz) => {
                    const attempt = getStudentAttempt(quiz.id, currentStudent.id);
                    const isCompleted = !!attempt;

                    return (
                      <div
                        key={quiz.id}
                        className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                          isCompleted
                            ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                              {quiz.subjectCode}
                            </span>

                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Score: {attempt.scorePercentage}%
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Due: {quiz.dueDate || 'Pending'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {quiz.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2">
                            {quiz.description || quiz.instructions}
                          </p>

                          <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                            <span>{quiz.questions.length} Questions</span>
                            <span>{quiz.timeLimitMinutes} Mins</span>
                            <span>{quiz.totalMarks} Marks</span>
                          </div>
                        </div>

                        {/* Working Action Buttons: Start and See Result */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            id={`btn-start-${quiz.id}`}
                            onClick={() => setTakingQuiz(quiz)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                              isCompleted
                                ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                                : 'text-white bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            {isCompleted ? 'Retake' : 'Start'}
                          </button>

                          <button
                            type="button"
                            id={`btn-result-${quiz.id}`}
                            onClick={() => {
                              if (attempt) {
                                setReviewingQuiz({ quiz, attempt });
                              } else {
                                showToast('You must attempt the quiz before reviewing results.', 'info');
                              }
                            }}
                            disabled={!isCompleted}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                              isCompleted
                                ? 'text-slate-800 bg-white hover:bg-slate-50 border-slate-300 font-bold'
                                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
                            See Result
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No quizzes are currently assigned to your division and batch.</p>
                  <p className="text-slate-400">
                    Switch to Teacher Dashboard to curate and assign a quiz to Division {currentStudent.division.replace('DIV_', '')} - Batch {currentStudent.batch.replace('BATCH_', '')}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Active Exam Taking */}
      {takingQuiz && (
        <TakeQuizModal
          quiz={takingQuiz}
          student={currentStudent}
          onClose={() => setTakingQuiz(null)}
          onSubmit={handleQuizSubmit}
        />
      )}

      {/* MODAL: Student Detailed Results Breakdown */}
      {reviewingQuiz && (
        <QuizResultModal
          quiz={reviewingQuiz.quiz}
          attempt={reviewingQuiz.attempt}
          onClose={() => setReviewingQuiz(null)}
          onRetake={() => {
            const quizToRetake = reviewingQuiz.quiz;
            setReviewingQuiz(null);
            setTakingQuiz(quizToRetake);
          }}
        />
      )}

      {/* MODAL: Teacher View All Submissions */}
      {viewSubmissionsQuiz && (
        <ViewSubmissionsModal
          quiz={viewSubmissionsQuiz}
          attempts={attempts}
          onClose={() => setViewSubmissionsQuiz(null)}
        />
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Quiz Assessment Portal • Teacher & Student Dashboards</span>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="text-[11px] text-slate-400 hover:text-slate-700 underline font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Demo Data
          </button>
        </div>
      </footer>
    </div>
  );
}
