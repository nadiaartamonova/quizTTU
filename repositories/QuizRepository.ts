import type { Question } from '../types/Question';
import type { TriviaApiQuestion, TriviaQuestionType } from '../services/triviaApi';
import type { GameResult } from '../database/db';

export interface StartQuizParams {
  categoryId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: TriviaQuestionType;
  questionsPerGame: number;
  previousGameIds: number[];
}

export interface SaveResultParams {
  userName: string;
  score: number;
  total: number;
  durationSec: number;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: TriviaQuestionType;
  answersJson: string;
}

export interface QuizStats {
  bestResult: GameResult | null;
  lastResults: GameResult[];
  topResults: GameResult[];
}

export interface QuizRepository {
  init(): Promise<void>;

  fetchTriviaQuestions(params: {
    amount: number;
    categoryId: number;
    difficulty: TriviaApiQuestion['difficulty'];
    questionType: TriviaQuestionType;
  }): Promise<TriviaApiQuestion[]>;

  replaceQuestionsFromTrivia(triviaQuestions: TriviaApiQuestion[]): Promise<void>;

  getAllQuestions(): Promise<Question[]>;

  saveResult(params: SaveResultParams): Promise<void>;

  getStats(limit: number): Promise<QuizStats>;
}
