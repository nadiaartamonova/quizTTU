import * as SQLite from 'expo-sqlite';
import { Question } from '../types/Question';

export interface GameResult {
  id: number;
  score: number;
  total: number;
  playedAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('quiz.db');
  }
  return db;
};

export const initDB = async (): Promise<void> => {
  const database = await getDB();

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
};

export const clearQuestions = async (): Promise<void> => {
  const database = await getDB();
  await database.execAsync(`DELETE FROM questions;`);
};

export const insertQuestions = async (): Promise<void> => {
  const database = await getDB();

  const questions = [
    ['What is the capital of France?', 'Paris', 'Lyon', 'Marseille', 'Paris'],
    ['What is the capital of Germany?', 'Berlin', 'Munich', 'Cologne', 'Berlin'],
    ['What is the capital of Spain?', 'Madrid', 'Barcelona', 'Valencia', 'Madrid'],
    ['What is the capital of Italy?', 'Rome', 'Milan', 'Venice', 'Rome'],
    ['What is the capital of Estonia?', 'Tallinn', 'Tartu', 'Narva', 'Tallinn'],

  ];

  for (const [question, optionA, optionB, optionC, correct] of questions) {
    await database.runAsync(
      `INSERT OR IGNORE INTO questions (question, optionA, optionB, optionC, correct)
       VALUES (?, ?, ?, ?, ?)`,
      question,
      optionA,
      optionB,
      optionC,
      correct
    );
  }
};

export const getQuestions = async (): Promise<Question[]> => {
  const database = await getDB();
  return await database.getAllAsync<Question>('SELECT * FROM questions');
};

export const saveGameResult = async (
  score: number,
  total: number
): Promise<void> => {
  const database = await getDB();

  await database.runAsync(
    `INSERT INTO results (score, total, playedAt) VALUES (?, ?, ?)`,
    score,
    total,
    new Date().toISOString()
  );
};

export const getBestResult = async (): Promise<GameResult | null> => {
  const database = await getDB();

  const result = await database.getFirstAsync<GameResult>(
    `SELECT * FROM results
     ORDER BY score DESC, total DESC, id ASC
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