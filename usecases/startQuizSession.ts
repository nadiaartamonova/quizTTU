import type { QuizRepository, StartQuizParams } from '../repositories/QuizRepository';
import type { Question } from '../types/Question';
import { shuffleArray } from '../utils/shuffle';

export interface StartQuizSessionResult {
  questions: Question[];
  selectedIds: number[];
}

export const startQuizSession = async (
  repository: QuizRepository,
  params: StartQuizParams
): Promise<StartQuizSessionResult> => {
  const triviaQuestions = await repository.fetchTriviaQuestions({
    amount: params.questionsPerGame,
    categoryId: params.categoryId,
    difficulty: params.difficulty,
    questionType: params.questionType,
  });

  await repository.replaceQuestionsFromTrivia(triviaQuestions);

  const allQuestions = await repository.getAllQuestions();
  const withoutPrevious = allQuestions.filter((q) => !params.previousGameIds.includes(q.id));
  const pool = withoutPrevious.length >= params.questionsPerGame ? withoutPrevious : allQuestions;

  const selected = shuffleArray(pool).slice(0, params.questionsPerGame);

  return {
    questions: selected,
    selectedIds: selected.map((q: Question) => q.id),
  };
};
