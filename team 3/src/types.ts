export type DivisionId = 'DIV_A' | 'DIV_B';
export type BatchId = 'BATCH_A' | 'BATCH_B' | 'BATCH_C';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
  options: QuestionOption[];
  explanation?: string;
}

export interface QuizAssignment {
  division: DivisionId;
  batches: BatchId[];
}

export interface Quiz {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  description: string;
  timeLimitMinutes: number;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  assignedTo: QuizAssignment[];
  dueDate: string;
  dueTime?: string;
  shuffleQuestions?: boolean;
  instantResults?: boolean;
  createdAt: string;
  status: 'draft' | 'assigned';
  questions: Question[];
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  marksObtained: number;
}

export interface StudentAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  division: DivisionId;
  batch: BatchId;
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  passed: boolean;
  answers: StudentAnswer[];
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  division: DivisionId;
  batch: BatchId;
}
