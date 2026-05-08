import type { QuizRepository, QuizStats } from '../repositories/QuizRepository';

export const loadStats = async (repository: QuizRepository, limit: number): Promise<QuizStats> => {
  return repository.getStats(limit);
};
