import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle, Save, HelpCircle, Layers, Check } from 'lucide-react';
import { Quiz, Question, QuestionOption } from '../../types';

interface CurateQuizFormProps {
  initialQuiz?: Quiz | null;
  onSaveQuiz: (quiz: Quiz) => void;
  onCancelEdit?: () => void;
}

export const CurateQuizForm: React.FC<CurateQuizFormProps> = ({
  initialQuiz,
  onSaveQuiz,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [subjectCode, setSubjectCode] = useState(initialQuiz?.subjectCode || 'CS301');
  const [subjectName, setSubjectName] = useState(initialQuiz?.subjectName || 'Data Structures & Algorithms');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialQuiz?.timeLimitMinutes || 20);
  const [passingMarks, setPassingMarks] = useState(initialQuiz?.passingMarks || 5);
  const [instructions, setInstructions] = useState(
    initialQuiz?.instructions ||
      'Answer all multiple choice questions. Each question carries marks as indicated. Click submit before time runs out.'
  );

  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz?.questions || [
      {
        id: 'q_' + Date.now() + '_1',
        text: 'What is the time complexity of pushing an element onto a Stack implemented with an array?',
        marks: 2,
        explanation: 'Pushing to an array stack at top index is a direct index assignment taking O(1) constant time.',
        options: [
          { id: 'opt_1', text: 'O(1)', isCorrect: true },
          { id: 'opt_2', text: 'O(n)', isCorrect: false },
          { id: 'opt_3', text: 'O(log n)', isCorrect: false },
          { id: 'opt_4', text: 'O(n^2)', isCorrect: false },
        ],
      },
      {
        id: 'q_' + Date.now() + '_2',
        text: 'Which data structure is typically used in the implementation of Breadth-First Search (BFS) on graphs?',
        marks: 2,
        explanation: 'BFS explores vertices level by level, requiring a FIFO Queue to maintain discovery order.',
        options: [
          { id: 'opt_5', text: 'Stack', isCorrect: false },
          { id: 'opt_6', text: 'Queue', isCorrect: true },
          { id: 'opt_7', text: 'Binary Search Tree', isCorrect: false },
          { id: 'opt_8', text: 'Hash Table', isCorrect: false },
        ],
      },
    ]
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // If initialQuiz changes (e.g. user clicked Edit on a different quiz)
  useEffect(() => {
    if (initialQuiz) {
      setTitle(initialQuiz.title);
      setSubjectCode(initialQuiz.subjectCode);
      setSubjectName(initialQuiz.subjectName);
      setTimeLimitMinutes(initialQuiz.timeLimitMinutes);
      setPassingMarks(initialQuiz.passingMarks);
      setInstructions(initialQuiz.instructions || '');
      setQuestions(initialQuiz.questions);
    }
  }, [initialQuiz]);

  const handleAddQuestion = () => {
    const newQId = 'q_' + Date.now();
    const newQuestion: Question = {
      id: newQId,
      text: '',
      marks: 2,
      explanation: '',
      options: [
        { id: newQId + '_opt1', text: '', isCorrect: true },
        { id: newQId + '_opt2', text: '', isCorrect: false },
        { id: newQId + '_opt3', text: '', isCorrect: false },
        { id: newQId + '_opt4', text: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      setValidationError('A quiz must contain at least 1 question.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].text = text;
    setQuestions(updated);
  };

  const handleQuestionMarksChange = (qIndex: number, marks: number) => {
    const updated = [...questions];
    updated[qIndex].marks = Math.max(1, marks);
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, explanation: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = explanation;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex,
    }));
    setQuestions(updated);
  };

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  };

  const handleSave = () => {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please enter a quiz title.');
      return;
    }

    if (!subjectCode.trim()) {
      setValidationError('Please enter a subject code (e.g. CS301).');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setValidationError(`Question #${i + 1} is missing question text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setValidationError(`Question #${i + 1} Option ${String.fromCharCode(65 + j)} cannot be blank.`);
          return;
        }
      }
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        setValidationError(`Question #${i + 1} must have a designated correct option.`);
        return;
      }
    }

    const totalMarks = calculateTotalMarks();
    const quizToSave: Quiz = {
      id: initialQuiz?.id || 'quiz-' + Date.now(),
      title: title.trim(),
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim() || subjectCode.trim(),
      description: initialQuiz?.description || `Assessment on ${subjectCode}: ${title}`,
      timeLimitMinutes: Math.max(1, Number(timeLimitMinutes) || 15),
      totalMarks,
      passingMarks: Math.min(totalMarks, Math.max(1, Number(passingMarks) || Math.ceil(totalMarks / 2))),
      instructions: instructions.trim(),
      dueDate: initialQuiz?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      dueTime: initialQuiz?.dueTime || '23:59',
      shuffleQuestions: initialQuiz?.shuffleQuestions ?? true,
      instantResults: initialQuiz?.instantResults ?? true,
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
      status: initialQuiz?.status || 'draft',
      assignedTo: initialQuiz?.assignedTo || [],
      questions,
    };

    onSaveQuiz(quizToSave);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            {initialQuiz ? 'Edit Curated Quiz' : 'Curate New Assessment'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure assessment properties, question bank, correct answers, and grading marks.
          </p>
        </div>

        {initialQuiz && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Quiz Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quiz Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 3: Graph Algorithms & Dynamic Programming"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Code *
          </label>
          <input
            type="text"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            placeholder="e.g. CS301"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Name
          </label>
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Data Structures"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Duration (Minutes)
          </label>
          <input
            type="number"
            min={1}
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Passing Marks
          </label>
          <input
            type="number"
            min={1}
            value={passingMarks}
            onChange={(e) => setPassingMarks(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Calculated Total Marks
          </label>
          <div className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold">
            {calculateTotalMarks()} Marks ({questions.length} Questions)
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Quiz Instructions
        </label>
        <textarea
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
        />
      </div>

      {/* Questions List */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Question Bank ({questions.length})
            </h4>
            <p className="text-[11px] text-slate-500">
              Select the radio button next to an option to mark it as the correct answer.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3.5 relative"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-800">
                  Question #{qIdx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Marks:</span>
                    <input
                      type="number"
                      min={1}
                      value={q.marks}
                      onChange={(e) => handleQuestionMarksChange(qIdx, Number(e.target.value))}
                      className="w-14 px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-center font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <input
                type="text"
                value={q.text}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                placeholder="Enter question text here..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900"
              />

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Multiple Choice Options (Select 1 Correct Answer)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}_correct`}
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                          className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-500">{letter}.</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${letter}`}
                          className="flex-1 px-2 py-1 text-xs bg-transparent focus:outline-none text-slate-900"
                        />
                        {opt.isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <input
                  type="text"
                  value={q.explanation || ''}
                  onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                  placeholder="Optional: Explanation / Hint for students after quiz submission"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-600 placeholder-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {initialQuiz ? 'Update Curated Quiz' : 'Save Curated Quiz'}
        </button>
      </div>
    </div>
  );
};
