import { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Animated } from 'react-native';
import { Question } from '../types/Question';
import { shuffleArray } from '../utils/shuffle';
import { QUESTION_TIME } from '../constants/quiz';

interface Props {
  questions: Question[];
  onFinish: (correct: number, wrong: number, total: number, answersJson: string) => void;
}

interface QuestionAnswerLog {
  questionId: number;
  question: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timedOut: boolean;
}

export default function QuizScreen({ questions, onFinish }: Props) {
  const [index, setIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answerLog, setAnswerLog] = useState<QuestionAnswerLog[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setWrongAnswers(0);
    setAnswerLog([]);
  }, [questions]);

  useEffect(() => {
    if (questions.length === 0) return;

    const currentQuestion = questions[index];
    if (currentQuestion) {
      const options = [
        currentQuestion.optionA,
        currentQuestion.optionB,
        currentQuestion.optionC,
        currentQuestion.correct,
      ].filter((value) => value && value.trim().length > 0);

      // Удаляем дубли (актуально для boolean)
      const uniqueOptions = [...new Set(options)];
      setAnswers(shuffleArray(uniqueOptions));
    }

    resetTimer();

    return () => {
      stopTimer();
      progressAnim.stopAnimation();
    };
  }, [index, questions]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: QUESTION_TIME * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();

          setTimeout(() => {
            goNext(false, null, true);
          }, 0);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const goNext = (isCorrect: boolean, selectedAnswer: string | null, timedOut: boolean) => {
    const currentQuestion = questions[index];
    if (!currentQuestion) return;

    const entry: QuestionAnswerLog = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correct,
      isCorrect,
      timedOut,
    };

    const nextLog = [...answerLog, entry];
    const newScore = isCorrect ? score + 1 : score;
    const newWrongAnswers = isCorrect ? wrongAnswers : wrongAnswers + 1;

    if (index < questions.length - 1) {
      setScore(newScore);
      setWrongAnswers(newWrongAnswers);
      setAnswerLog(nextLog);
      setIndex((prev) => prev + 1);
    } else {
      onFinish(newScore, newWrongAnswers, questions.length, JSON.stringify(nextLog));
    }
  };

  const answer = (selected: string): void => {
    const currentQuestion = questions[index];
    if (!currentQuestion) return;

    const isCorrect = selected === currentQuestion.correct;

    stopTimer();
    progressAnim.stopAnimation();
   goNext(isCorrect, selected, false);
  };

  const current = questions[index];

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!current) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Laadimine...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        {index + 1}/{questions.length}
      </Text>

      <Text style={styles.timerText}>Aeg: {timeLeft}</Text>

      <View style={styles.progressBarBackground}>
        <Animated.View style={[styles.progressBarFill, { width: animatedWidth }]} />
      </View>

      <Text style={styles.question}>{current.question}</Text>

      {answers.map((item, answerIndex) => (
        <View style={styles.buttonWrap} key={`${current.id}-${answerIndex}-${item}`}>
          <Button title={item} color="#E85A4F" onPress={() => answer(item)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 20,
  },
  counter: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 12,
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E85A4F',
    borderRadius: 10,
  },
  question: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    color: '#fff',
  },
  buttonWrap: {
    marginBottom: 15,
  },
});