import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  initDB,
  insertQuestions,
  getQuestions,
  saveGameResult,
  getBestResult,
  getLastResults,
  getTopResults,
  clearQuestions,
} from './database/db';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import MainScreen from './screens/MainScreen';
import { QUESTIONS_PER_GAME } from './constants/quiz';
import { Question } from './types/Question';
import { shuffleArray } from './utils/shuffle';
import type { GameResult } from './database/db';
import type { TriviaQuestionType } from './services/triviaApi';

const CATEGORY_OPTIONS = [
  { id: 9, label: 'General Knowledge' },
  { id: 17, label: 'Science & Nature' },
  { id: 21, label: 'Sports' },
  { id: 23, label: 'History' },
  { id: 25, label: 'Art' },
];

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
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [lastGameQuestionIds, setLastGameQuestionIds] = useState<number[]>([]);

  const [bestResult, setBestResult] = useState<GameResult | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);
  const [topResults, setTopResults] = useState<GameResult[]>([]);

  const selectedCategoryName =
    CATEGORY_OPTIONS.find((item) => item.id === selectedCategoryId)?.label ?? 'Unknown';

  const loadResultsStats = async () => {
    const best = await getBestResult();
    const recent = await getLastResults(5);
    const top = await getTopResults(5);
    setBestResult(best);
    setLastResults(recent);
    setTopResults(top);
  };

  const prepareNewGame = async (
    existingUsedIds: number[] = usedQuestionIds,
    previousGameIds: number[] = lastGameQuestionIds
  ) => {
    const allQuestions = await getQuestions();

    let availableQuestions = allQuestions.filter((q) => !existingUsedIds.includes(q.id));
    let nextUsedIds = [...existingUsedIds];

    if (availableQuestions.length < QUESTIONS_PER_GAME) {
      nextUsedIds = [];
      const withoutPreviousGame = allQuestions.filter((q) => !previousGameIds.includes(q.id));
      availableQuestions =
        withoutPreviousGame.length >= QUESTIONS_PER_GAME ? withoutPreviousGame : [...allQuestions];
    }

    const shuffled = shuffleArray(availableQuestions);
    const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_GAME, shuffled.length));
    const selectedIds = selected.map((q) => q.id);

    setGameQuestions(selected);
    setTotal(selected.length);
    setUsedQuestionIds([...nextUsedIds, ...selectedIds]);
    setLastGameQuestionIds(selectedIds);
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        await initDB();
        await loadResultsStats();
        setReady(true);
      } catch (error) {
        console.error('DB init error:', error);
      }
    };

    prepare();
  }, []);

  const restartQuiz = async () => {
    if (isLoadingQuiz) return;
    setIsLoadingQuiz(true);
    try {
      await clearQuestions();
      await insertQuestions({
        categoryId: selectedCategoryId,
        difficulty: selectedDifficulty,
        questionType: selectedQuestionType,
      });
      await prepareNewGame([], lastGameQuestionIds);

      setScore(0);
      setWrongAnswers(0);
      setDurationSec(0);
      setStartedAt(Date.now());
      setFinished(false);
    } catch (error) {
      console.error('Restart error:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const startQuiz = async () => {
    if (isLoadingQuiz) return;
    setIsLoadingQuiz(true);

    try {
      setReady(false);

      await clearQuestions();
      await insertQuestions({
        categoryId: selectedCategoryId,
        difficulty: selectedDifficulty,
        questionType: selectedQuestionType,
      });
      await prepareNewGame([], []);

      setScore(0);
      setWrongAnswers(0);
      setDurationSec(0);
      setStartedAt(Date.now());
      setFinished(false);
      setStarted(true);
    } catch (error) {
      console.error('Start error:', error);
    } finally {
      setReady(true);
      setIsLoadingQuiz(false);
    }
  };

  const goToMenu = () => {
    setFinished(false);
    setStarted(false);
    setScore(0);
    setWrongAnswers(0);
    setDurationSec(0);
    setTotal(QUESTIONS_PER_GAME);
    setGameQuestions([]);
    setUsedQuestionIds([]);
    setLastGameQuestionIds([]);
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
        onRestart={restartQuiz}
        onGoToMenu={goToMenu}
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
        onStart={startQuiz}
      />
    );
  }

  return (
    <QuizScreen
      questions={gameQuestions}
      onFinish={async (correct, wrong, totalQuestions) => {
        const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

        setScore(correct);
        setWrongAnswers(wrong);
        setTotal(totalQuestions);
        setDurationSec(duration);

        await saveGameResult({
          userName: playerName || 'Player',
          score: correct,
          total: totalQuestions,
          durationSec: duration,
          categoryName: selectedCategoryName,
          difficulty: selectedDifficulty,
          questionType: selectedQuestionType,
        });

        await loadResultsStats();
        setFinished(true);
      }}
    />
  );
}