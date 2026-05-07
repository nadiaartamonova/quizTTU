import * as SQLite from 'expo-sqlite';
import { Question } from '../types/Question';
import {
  loadTriviaQuestions,
  TriviaQuestionType,
  TriviaApiQuestion,
} from '../services/triviaApi';
import { QUESTIONS_PER_GAME } from '../constants/quiz';

export interface GameResult {
  id: number;
  userName: string;
  score: number;
  total: number;
  percentage: number;
  playedAt: string;
  durationSec: number;
  questionCount: number;
  correctAnswers: number;
  wrongAnswers: number;
  categoryName: string;
  difficulty: string;
  questionType: string;
}

interface InsertQuestionsParams {
  categoryId?: number;
  difficulty?: TriviaApiQuestion['difficulty'];
  questionType?: TriviaQuestionType;
}

interface SaveGameResultParams {
  userName: string;
  score: number;
  total: number;
  durationSec: number;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: TriviaQuestionType;
}

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('quiz.db');
  }
  return db;
};

const hasColumn = async (
  database: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> => {
  const rows = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === column);
};

const addColumnIfMissing = async (
  database: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> => {
  const exists = await hasColumn(database, table, column);
  if (!exists) {
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
};

export const initDB = async (): Promise<void> => {
  const database = await getDB();

  // Базовые таблицы
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY NOT NULL,
      question TEXT NOT NULL UNIQUE,
      optionA TEXT NOT NULL,
      optionB TEXT NOT NULL,
      optionC TEXT NOT NULL,
      correct TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      playedAt TEXT NOT NULL
    );
  `);

  // Миграции для старых баз
  await addColumnIfMissing(database, 'results', 'userName', `TEXT NOT NULL DEFAULT 'Player'`);
  await addColumnIfMissing(database, 'results', 'percentage', `REAL NOT NULL DEFAULT 0`);
  await addColumnIfMissing(database, 'results', 'durationSec', `INTEGER NOT NULL DEFAULT 0`);
  await addColumnIfMissing(database, 'results', 'questionCount', `INTEGER NOT NULL DEFAULT 0`);
  await addColumnIfMissing(database, 'results', 'correctAnswers', `INTEGER NOT NULL DEFAULT 0`);
  await addColumnIfMissing(database, 'results', 'wrongAnswers', `INTEGER NOT NULL DEFAULT 0`);
  await addColumnIfMissing(database, 'results', 'categoryName', `TEXT NOT NULL DEFAULT 'Unknown'`);
  await addColumnIfMissing(database, 'results', 'difficulty', `TEXT NOT NULL DEFAULT 'easy'`);
  await addColumnIfMissing(database, 'results', 'questionType', `TEXT NOT NULL DEFAULT 'any'`);
};

export const clearQuestions = async (): Promise<void> => {
  const database = await getDB();
  await database.execAsync(`DELETE FROM questions;`);
};

export const insertQuestions = async ({
  categoryId,
  difficulty,
  questionType = 'any',
}: InsertQuestionsParams = {}): Promise<void> => {
  const database = await getDB();

  const triviaQuestions = await loadTriviaQuestions({
    amount: QUESTIONS_PER_GAME,
    categoryId,
    difficulty,
    questionType,
  });

  for (const item of triviaQuestions) {
    let optionA = '';
    let optionB = '';
    let optionC = '';

    if (item.type === 'boolean') {
      optionA = 'True';
      optionB = 'False';
      optionC = '';
    } else {
      optionA = item.incorrect_answers[0] ?? '';
      optionB = item.incorrect_answers[1] ?? '';
      optionC = item.incorrect_answers[2] ?? '';
    }

    await database.runAsync(
      `INSERT OR IGNORE INTO questions (question, optionA, optionB, optionC, correct)
       VALUES (?, ?, ?, ?, ?)`,
      item.question,
      optionA,
      optionB,
      optionC,
      item.correct_answer
    );
  }
};

export const getQuestions = async (): Promise<Question[]> => {
  const database = await getDB();
  return await database.getAllAsync<Question>('SELECT * FROM questions');
};

export const saveGameResult = async ({
  userName,
  score,
  total,
  durationSec,
  categoryName,
  difficulty,
  questionType,
}: SaveGameResultParams): Promise<void> => {
  const database = await getDB();

  const percentage = total > 0 ? Number(((score / total) * 100).toFixed(2)) : 0;
  const wrongAnswers = total - score;

  await database.runAsync(
    `INSERT INTO results (
      userName, score, total, percentage, playedAt, durationSec,
      questionCount, correctAnswers, wrongAnswers, categoryName, difficulty, questionType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    userName || 'Player',
    score,
    total,
    percentage,
    new Date().toISOString(),
    durationSec,
    total,
    score,
    wrongAnswers,
    categoryName,
    difficulty,
    questionType
  );
};

export const getBestResult = async (): Promise<GameResult | null> => {
  const database = await getDB();

  const result = await database.getFirstAsync<GameResult>(
    `SELECT * FROM results
     ORDER BY percentage DESC, durationSec ASC, id ASC
     LIMIT 1`
  );

  return result ?? null;
};

export const getLastResults = async (limit: number = 5): Promise<GameResult[]> => {
  const database = await getDB();

  return await database.getAllAsync<GameResult>(
    `SELECT * FROM results
     ORDER BY id DESC
     LIMIT ${limit}`
  );
};

export const getTopResults = async (limit: number = 5): Promise<GameResult[]> => {
  const database = await getDB();

  return await database.getAllAsync<GameResult>(
    `SELECT * FROM results
     ORDER BY percentage DESC, durationSec ASC
     LIMIT ${limit}`
  );
};