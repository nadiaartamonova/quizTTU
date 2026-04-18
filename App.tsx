import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  initDB,
  insertQuestions,
  getQuestions,
  saveGameResult,
  getBestResult,
  getLastResults,
} from './database/db';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
import { QUESTIONS_PER_GAME } from './constants/quiz';
import { Question } from './types/Question';
import { shuffleArray } from './utils/shuffle';
import type { GameResult } from './database/db';
import { clearQuestions } from './database/db';


export default function App() {
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(QUESTIONS_PER_GAME);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [lastGameQuestionIds, setLastGameQuestionIds] = useState<number[]>([]);

  const [bestResult, setBestResult] = useState<GameResult | null>(null);
  const [lastResults, setLastResults] = useState<GameResult[]>([]);

  const loadResultsStats = async () => {
    const best = await getBestResult();
    const recent = await getLastResults(5);
    setBestResult(best);
    setLastResults(recent);
  };

  const prepareNewGame = async (
    existingUsedIds: number[] = usedQuestionIds,
    previousGameIds: number[] = lastGameQuestionIds
  ) => {
    const allQuestions = await getQuestions();

    let availableQuestions = allQuestions.filter(
      (q) => !existingUsedIds.includes(q.id)
    );

    let nextUsedIds = [...existingUsedIds];

    // Если оставшихся вопросов не хватает, начинаем новый цикл
    if (availableQuestions.length < QUESTIONS_PER_GAME) {
      nextUsedIds = [];

      // Сначала пробуем взять вопросы без повторов из предыдущей игры
      const withoutPreviousGame = allQuestions.filter(
        (q) => !previousGameIds.includes(q.id)
      );

      if (withoutPreviousGame.length >= QUESTIONS_PER_GAME) {
        availableQuestions = withoutPreviousGame;
      } else {
        // Если вопросов мало и это невозможно — берём все
        availableQuestions = [...allQuestions];
      }
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
await clearQuestions();

        await insertQuestions();
        await prepareNewGame([], []);
        await loadResultsStats();
        setReady(true);
      } catch (error) {
        console.error('DB init error:', error);
      }
    };

    prepare();
  }, []);

  const restartQuiz = async () => {
    try {
      await prepareNewGame();
      setScore(0);
      setWrongAnswers(0);
      setFinished(false);
    } catch (error) {
      console.error('Restart error:', error);
    }
  };

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 20 }}>Laadimine...</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={total}
        wrongAnswers={wrongAnswers}
        bestResult={bestResult}
        lastResults={lastResults}
        onRestart={restartQuiz}
      />
    );
  }

  return (
    <QuizScreen
      questions={gameQuestions}
      onFinish={async (correct, wrong, totalQuestions) => {
        setScore(correct);
        setWrongAnswers(wrong);
        setTotal(totalQuestions);

        await saveGameResult(correct, totalQuestions);
        await loadResultsStats();

        setFinished(true);
      }}
    />
  );
}