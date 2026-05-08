import type { QuizRepository, QuizStats, SaveResultParams } from './QuizRepository';
import type { Question } from '../types/Question';
import type { TriviaApiQuestion, TriviaQuestionType } from '../services/triviaApi';
import {
  initDB,
  getQuestions,
  clearQuestions,
  saveGameResult,
  getBestResult,
  getLastResults,
  getTopResults,
  getDB,
} from '../database/db';
import { loadTriviaQuestions } from '../services/triviaApi';
import { mapTriviaToDbInsert } from '../mappers/triviaMappers';

export class SQLiteQuizRepository implements QuizRepository {
  async init(): Promise<void> {
    await initDB();
  }

  async fetchTriviaQuestions(params: {
    amount: number;
    categoryId: number;
    difficulty: TriviaApiQuestion['difficulty'];
    questionType: TriviaQuestionType;
  }): Promise<TriviaApiQuestion[]> {
    return loadTriviaQuestions({
      amount: params.amount,
      categoryId: params.categoryId,
      difficulty: params.difficulty,
      questionType: params.questionType,
    });
  }

  async replaceQuestionsFromTrivia(triviaQuestions: TriviaApiQuestion[]): Promise<void> {
    const db = await getDB();
    await clearQuestions();

    for (const item of triviaQuestions) {
      const mapped = mapTriviaToDbInsert(item);

      await db.runAsync(
        `INSERT OR IGNORE INTO questions (question, optionA, optionB, optionC, correct)
         VALUES (?, ?, ?, ?, ?)`,
        mapped.question,
        mapped.optionA,
        mapped.optionB,
        mapped.optionC,
        mapped.correct
      );
    }
  }

  async getAllQuestions(): Promise<Question[]> {
    return getQuestions();
  }

  async saveResult(params: SaveResultParams): Promise<void> {
    await saveGameResult({
      userName: params.userName,
      score: params.score,
      total: params.total,
      durationSec: params.durationSec,
      categoryName: params.categoryName,
      difficulty: params.difficulty,
      questionType: params.questionType,
      answersJson: params.answersJson,
    });
  }

  async getStats(limit: number): Promise<QuizStats> {
    const [best, last, top] = await Promise.all([
      getBestResult(),
      getLastResults(limit),
      getTopResults(limit),
    ]);

    return {
      bestResult: best,
      lastResults: last,
      topResults: top,
    };
  }
}
