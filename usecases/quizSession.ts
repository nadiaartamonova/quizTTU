import { clearQuestions, getQuestions, insertQuestions } from '../database/db';
import { QUESTIONS_PER_GAME } from '../constants/quiz';
import type { TriviaQuestionType } from '../services/triviaApi';
import type { Question } from '../types/Question';
import { shuffleArray } from '../utils/shuffle';

interface LoadQuestionsParams {
  categoryId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: TriviaQuestionType;
}

export const prepareNewGame = async (previousGameIds: number[]): Promise<Question[]> => {
  const allQuestions = await getQuestions();
  const withoutPrevious = allQuestions.filter((q) => !previousGameIds.includes(q.id));
  const pool = withoutPrevious.length >= QUESTIONS_PER_GAME ? withoutPrevious : allQuestions;

  return shuffleArray(pool).slice(0, QUESTIONS_PER_GAME);
};

export const loadQuestionsForCurrentFilters = async (
  params: LoadQuestionsParams,
  previousGameIds: number[]
): Promise<Question[]> => {
  await clearQuestions();
  await insertQuestions({
    categoryId: params.categoryId,
    difficulty: params.difficulty,
    questionType: params.questionType,
  });

  return prepareNewGame(previousGameIds);
};