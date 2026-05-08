import type { QuizRepository } from '../repositories/QuizRepository';
import type { TriviaQuestionType } from '../services/triviaApi';

export interface CompleteQuizSessionParams {
  playerName: string;
  score: number;
  wrongAnswers: number;
  totalQuestions: number;
  startedAt: number;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: TriviaQuestionType;
  answersJson: string;
}

export interface CompleteQuizSessionResult {
  score: number;
  wrongAnswers: number;
  total: number;
  durationSec: number;
}

const getDurationInSec = (startedAt: number): number =>
  startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

export const completeQuizSession = async (
  repository: QuizRepository,
  params: CompleteQuizSessionParams
): Promise<CompleteQuizSessionResult> => {
  const durationSec = getDurationInSec(params.startedAt);

  const safeName = params.playerName.trim().length > 0 ? params.playerName.trim() : 'Player';

  await repository.saveResult({
    userName: safeName,
    score: params.score,
    total: params.totalQuestions,
    durationSec,
    categoryName: params.categoryName,
    difficulty: params.difficulty,
    questionType: params.questionType,
    answersJson: params.answersJson,
  });

  return {
    score: params.score,
    wrongAnswers: params.wrongAnswers,
    total: params.totalQuestions,
    durationSec,
  };
};
