import { useCallback, useMemo, useReducer } from 'react';
import {
  getBestResult,
  getLastResults,
  getTopResults,
  initDB,
  saveGameResult,
} from '../database/db';
import type { GameResult } from '../database/db';
import { QUESTIONS_PER_GAME } from '../constants/quiz';
import type { TriviaQuestionType } from '../services/triviaApi';
import type { Question } from '../types/Question';
import { loadQuestionsForCurrentFilters } from '../usecases/quizSession';
import { CATEGORY_OPTIONS } from '../constants/categories';

const RESULTS_LIMIT = 5;

export type ScreenState = 'loading' | 'menu' | 'quiz' | 'result' | 'error';

interface QuizFlowState {
  screenState: ScreenState;
  isLoadingQuiz: boolean;
  errorMessage: string | null;

  score: number;
  total: number;
  wrongAnswers: number;
  durationSec: number;
  startedAt: number;

  gameQuestions: Question[];
  lastGameQuestionIds: number[];

  bestResult: GameResult | null;
  lastResults: GameResult[];
  topResults: GameResult[];
}

type StatsPayload = {
  bestResult: GameResult | null;
  lastResults: GameResult[];
  topResults: GameResult[];
};

type QuizPreparedPayload = {
  questions: Question[];
  startedAt: number;
};

type QuizFinishedPayload = {
  score: number;
  wrongAnswers: number;
  total: number;
  durationSec: number;
};

type QuizFlowAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'BOOTSTRAP_SUCCESS'; payload: StatsPayload }
  | { type: 'STATS_UPDATED'; payload: StatsPayload }
  | { type: 'QUIZ_PREPARED'; payload: QuizPreparedPayload }
  | { type: 'QUIZ_FINISHED'; payload: QuizFinishedPayload }
  | { type: 'GO_TO_MENU' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: QuizFlowState = {
  screenState: 'loading',
  isLoadingQuiz: false,
  errorMessage: null,

  score: 0,
  total: QUESTIONS_PER_GAME,
  wrongAnswers: 0,
  durationSec: 0,
  startedAt: 0,

  gameQuestions: [],
  lastGameQuestionIds: [],

  bestResult: null,
  lastResults: [],
  topResults: [],
};

function reducer(state: QuizFlowState, action: QuizFlowAction): QuizFlowState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoadingQuiz: action.payload,
        screenState: action.payload ? 'loading' : state.screenState,
      };

    case 'BOOTSTRAP_SUCCESS':
      return {
        ...state,
        screenState: 'menu',
        errorMessage: null,
        bestResult: action.payload.bestResult,
        lastResults: action.payload.lastResults,
        topResults: action.payload.topResults,
      };

    case 'STATS_UPDATED':
      return {
        ...state,
        bestResult: action.payload.bestResult,
        lastResults: action.payload.lastResults,
        topResults: action.payload.topResults,
      };

    case 'QUIZ_PREPARED':
      return {
        ...state,
        screenState: 'quiz',
        errorMessage: null,
        gameQuestions: action.payload.questions,
        total: action.payload.questions.length,
        lastGameQuestionIds: action.payload.questions.map((q: Question) => q.id),
        score: 0,
        wrongAnswers: 0,
        durationSec: 0,
        startedAt: action.payload.startedAt,
      };

    case 'QUIZ_FINISHED':
      return {
        ...state,
        screenState: 'result',
        errorMessage: null,
        score: action.payload.score,
        wrongAnswers: action.payload.wrongAnswers,
        total: action.payload.total,
        durationSec: action.payload.durationSec,
      };

    case 'GO_TO_MENU':
      return {
        ...state,
        screenState: 'menu',
        errorMessage: null,
        score: 0,
        wrongAnswers: 0,
        durationSec: 0,
        total: QUESTIONS_PER_GAME,
        gameQuestions: [],
        lastGameQuestionIds: [],
      };

    case 'SET_ERROR':
      return {
        ...state,
        screenState: 'error',
        isLoadingQuiz: false,
        errorMessage: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errorMessage: null,
      };

    default:
      return state;
  }
}

const getDurationInSec = (startedAt: number): number =>
  startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

export const useQuizFlow = (
  playerName: string,
  selectedCategoryId: number,
  selectedDifficulty: 'easy' | 'medium' | 'hard',
  selectedQuestionType: TriviaQuestionType
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedCategoryName = useMemo(
    () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategoryId)?.label ?? 'Unknown',
    [selectedCategoryId]
  );

  const fetchStats = useCallback(async (): Promise<StatsPayload> => {
    const [best, recent, top] = await Promise.all([
      getBestResult(),
      getLastResults(RESULTS_LIMIT),
      getTopResults(RESULTS_LIMIT),
    ]);

    const payload: StatsPayload = {
      bestResult: best,
      lastResults: recent,
      topResults: top,
    };

    dispatch({ type: 'STATS_UPDATED', payload });
    return payload;
  }, []);

  const bootstrap = useCallback(async () => {
    dispatch({ type: 'CLEAR_ERROR' });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await initDB();
      const stats = await fetchStats();
      dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: stats });
    } catch (error) {
      console.error('DB init error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchStats]);

  const startOrRestartQuiz = useCallback(
    async (previousGameIds: number[]) => {
      if (state.isLoadingQuiz) return;

      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const questions: Question[] = await loadQuestionsForCurrentFilters(
          {
            categoryId: selectedCategoryId,
            difficulty: selectedDifficulty,
            questionType: selectedQuestionType,
          },
          previousGameIds
        );

        dispatch({
          type: 'QUIZ_PREPARED',
          payload: {
            questions,
            startedAt: Date.now(),
          },
        });
      } catch (error) {
        console.error('Quiz start/restart error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load quiz questions. Please retry.' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.isLoadingQuiz, selectedCategoryId, selectedDifficulty, selectedQuestionType]
  );

  const finishQuiz = useCallback(
    async (correct: number, wrong: number, totalQuestions: number, answersJson: string) => {
      try {
        const duration = getDurationInSec(state.startedAt);

        await saveGameResult({
          userName: playerName || 'Player',
          score: correct,
          total: totalQuestions,
          durationSec: duration,
          categoryName: selectedCategoryName,
          difficulty: selectedDifficulty,
          questionType: selectedQuestionType,
          answersJson,
        });

        dispatch({
          type: 'QUIZ_FINISHED',
          payload: {
            score: correct,
            wrongAnswers: wrong,
            total: totalQuestions,
            durationSec: duration,
          },
        });

        await fetchStats();
      } catch (error) {
        console.error('Finish/save result error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save result. Please try again.' });
      }
    },
    [state.startedAt, playerName, selectedCategoryName, selectedDifficulty, selectedQuestionType, fetchStats]
  );

  const goToMenu = useCallback(() => {
    dispatch({ type: 'GO_TO_MENU' });
  }, []);

  return {
    state,
    bootstrap,
    startOrRestartQuiz,
    finishQuiz,
    goToMenu,
  };
};
