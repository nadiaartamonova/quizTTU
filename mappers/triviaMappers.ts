import type { TriviaApiQuestion } from '../services/triviaApi';

export interface DbQuestionInsert {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correct: string;
}

export const mapTriviaToDbInsert = (item: TriviaApiQuestion): DbQuestionInsert => {
  if (item.type === 'boolean') {
    return {
      question: item.question,
      optionA: 'True',
      optionB: 'False',
      optionC: '',
      correct: item.correct_answer,
    };
  }

  return {
    question: item.question,
    optionA: item.incorrect_answers[0] ?? '',
    optionB: item.incorrect_answers[1] ?? '',
    optionC: item.incorrect_answers[2] ?? '',
    correct: item.correct_answer,
  };
};
