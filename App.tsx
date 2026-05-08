import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import MainScreen from './screens/MainScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';

import type { TriviaQuestionType } from './services/triviaApi';
import type { GameResult } from './database/db';
import type { Question } from './types/Question';

import { QUESTIONS_PER_GAME } from './constants/quiz';
import { CATEGORY_OPTIONS } from './constants/categories';

import { SQLiteQuizRepository } from './repositories/SQLiteQuizRepository';
import { startQuizSession } from './usecases/startQuizSession';
import { completeQuizSession } from './usecases/completeQuizSession';
import { loadStats } from './usecases/loadStats';

const RESULTS_LIMIT = 5;

const repository = new SQLiteQuizRepository();

export default function App() {
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const [playerName, setPlayerName] = useState('Player');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(9);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedQuestionType, setSelectedQuestionType] = useState<TriviaQuestionType>('any');

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(QUESTIONS_PER_GAME);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(0);

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [lastGameQuestionIds, setLastGameQuestionIds] = useState<number[]>([]);

  const [bestResult, setBestResult] = useState<GameResult | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);
  const [topResults, setTopResults] = useState<GameResult[]>([]);

  const selectedCategoryName = useMemo(
    () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategoryId)?.label ?? 'Unknown',
    [selectedCategoryId]
  );

  const refreshStats = async () => {
    const stats = await loadStats(repository, RESULTS_LIMIT);
    setBestResult(stats.bestResult);
    setLastResults(stats.lastResults);
    setTopResults(stats.topResults);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await repository.init();
        await refreshStats();
        setReady(true);
      } catch (error) {
        console.error('Init error:', error);
      }
    };

    bootstrap();
  }, []);

  const resetSessionToMenu = () => {
    setFinished(false);
    setStarted(false);
    setScore(0);
    setWrongAnswers(0);
    setDurationSec(0);
    setTotal(QUESTIONS_PER_GAME);
    setGameQuestions([]);
    setLastGameQuestionIds([]);
  };

  const startOrRestart = async (previousGameIds: number[], markStarted: boolean) => {
    if (isLoadingQuiz) return;

    setIsLoadingQuiz(true);
    if (markStarted) setReady(false);

    try {
      const session = await startQuizSession(repository, {
        categoryId: selectedCategoryId,
        difficulty: selectedDifficulty,
        questionType: selectedQuestionType,
        questionsPerGame: QUESTIONS_PER_GAME,
        previousGameIds,
      });

      setGameQuestions(session.questions);
      setLastGameQuestionIds(session.selectedIds);
      setTotal(session.questions.length);
      setScore(0);
      setWrongAnswers(0);
      setDurationSec(0);
      setStartedAt(Date.now());
      setFinished(false);

      if (markStarted) setStarted(true);
    } catch (error) {
      console.error(markStarted ? 'Start error:' : 'Restart error:', error);
    } finally {
      if (markStarted) setReady(true);
      setIsLoadingQuiz(false);
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={total}
        wrongAnswers={wrongAnswers}
        durationSec={durationSec}
        bestResult={bestResult}
        lastResults={lastResults}
        topResults={topResults}
        onRestart={() => startOrRestart(lastGameQuestionIds, false)}
        onGoToMenu={resetSessionToMenu}
      />
    );
  }

  if (!started) {
    return (
      <MainScreen
        playerName={playerName}
        categories={CATEGORY_OPTIONS}
        selectedCategoryId={selectedCategoryId}
        selectedDifficulty={selectedDifficulty}
        selectedQuestionType={selectedQuestionType}
        onChangePlayerName={setPlayerName}
        onSelectCategory={setSelectedCategoryId}
        onSelectDifficulty={setSelectedDifficulty}
        onSelectQuestionType={setSelectedQuestionType}
        onStart={() => startOrRestart([], true)}
      />
    );
  }

  return (
    <QuizScreen
      questions={gameQuestions}
      onFinish={async (correct, wrong, totalQuestions, answersJson) => {
        const completed = await completeQuizSession(repository, {
          playerName,
          score: correct,
          wrongAnswers: wrong,
          totalQuestions,
          startedAt,
          categoryName: selectedCategoryName,
          difficulty: selectedDifficulty,
          questionType: selectedQuestionType,
          answersJson,
        });

        setScore(completed.score);
        setWrongAnswers(completed.wrongAnswers);
        setTotal(completed.total);
        setDurationSec(completed.durationSec);

        await refreshStats();
        setFinished(true);
      }}
    />
  );
}
