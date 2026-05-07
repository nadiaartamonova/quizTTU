export interface TriviaApiQuestion {
  category: string;
  type: 'multiple' | 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface TriviaApiResponse {
  response_code: number;
  results: TriviaApiQuestion[];
}

export type TriviaQuestionType = 'multiple' | 'boolean' | 'any';

export interface TriviaQueryParams {
  amount: number;
  categoryId?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: TriviaQuestionType;
}

const decodeHtml = (value: string): string => {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = ({
  amount,
  categoryId,
  difficulty,
  questionType = 'any',
}: TriviaQueryParams): string => {
  const params = new URLSearchParams({ amount: String(amount) });

  if (categoryId) params.set('category', String(categoryId));
  if (difficulty) params.set('difficulty', difficulty);
  if (questionType !== 'any') params.set('type', questionType);

  return `https://opentdb.com/api.php?${params.toString()}`;
};

const fetchWith429Retry = async (url: string, maxRetries = 2): Promise<Response> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url);

    if (response.status !== 429) {
      return response;
    }

    if (attempt < maxRetries) {
      // 700ms, 1400ms, ...
      await sleep(700 * (attempt + 1));
      continue;
    }

    throw new Error('Trivia API request failed with status 429');
  }

  throw new Error('Trivia API request failed');
};

const requestTrivia = async (query: TriviaQueryParams): Promise<TriviaApiResponse> => {
  const url = buildUrl(query);
  console.log('TRIVIA URL:', url);

  const response = await fetchWith429Retry(url, 2);

  if (!response.ok) {
    throw new Error(`Trivia API request failed with status ${response.status}`);
  }

  return (await response.json()) as TriviaApiResponse;
};

export const loadTriviaQuestions = async (query: TriviaQueryParams): Promise<TriviaApiQuestion[]> => {
  // fallback-цепочка при response_code = 1 (нет вопросов по фильтрам)
  const attempts: TriviaQueryParams[] = [
    query,
    { ...query, questionType: 'any' },
    { amount: query.amount, categoryId: query.categoryId, questionType: 'any' },
    { amount: query.amount, questionType: 'any' },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const data = await requestTrivia(attempts[i]);

    if (data.response_code === 0 && data.results.length > 0) {
      return data.results.map((item) => ({
        ...item,
        category: decodeHtml(item.category),
        question: decodeHtml(item.question),
        correct_answer: decodeHtml(item.correct_answer),
        incorrect_answers: item.incorrect_answers.map(decodeHtml),
      }));
    }

    if (data.response_code !== 1) {
      throw new Error(`Trivia API response code ${data.response_code}`);
    }

    // чтобы fallback-запросы не шли слишком плотно
    if (i < attempts.length - 1) {
      await sleep(400);
    }
  }

  throw new Error('No questions available for selected filters. Try another settings combination.');
};