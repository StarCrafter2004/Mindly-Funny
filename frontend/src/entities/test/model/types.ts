export type Answer = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export type MediaFormat = {
  ext: string; // Расширение файла, например ".png"
  url: string; // URL к изображению в этом формате
  hash: string; // Хеш файла
  mime: string; // MIME-тип, например "image/png"
  name: string; // Имя файла с расширением
  path: string | null; // Путь (если есть), или null
  size: number; // Размер в мегабайтах
  width: number; // Ширина изображения
  height: number; // Высота изображения
};

export type Media = {
  id: number;
  name: string;
  alternativeText: string | null; // Альтернативный текст для картинки
  caption: string | null; // Подпись под изображением
  width: number; // Ширина оригинала
  height: number; // Высота оригинала
  url: string; // URL оригинала
  ext: string; // Расширение файла
  mime: string; // MIME-тип
  size: number; // Размер файла (вероятно в мегабайтах)
  hash: string; // Хеш файла
  previewUrl: string | null; // Превью (может быть null)
  provider: string; // Провайдер загрузки (например, "local")
  provider_metadata: unknown | null; // Метаданные провайдера (если есть)
  createdAt: string; // Дата создания
  updatedAt: string; // Дата обновления
  publishedAt: string | null; // Дата публикации (если есть)
  documentId?: string; // Опциональный ID документа
  formats?: {
    thumbnail?: MediaFormat; // Превью для маленького размера
    medium?: MediaFormat; // Средний размер
    small?: MediaFormat; // Маленький размер
    large?: MediaFormat; // Большой размер (если есть)
  };
};

export type QuestionImage = {
  id: number;
  image: Media; // картинка с полной инфой
  index: number; // номер вопроса, для которого эта картинка
};

export type Question = {
  id: number;
  text: string;
  explanation: string;
  answers: Answer[];
};

export type Test = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  stars: number;
  ton: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  timeLimit: number;
  questions: Question[];
  Images: QuestionImage[];
  isTestFree: boolean;
  isReportFree: boolean;
  isPurchased: boolean;
  isResultPurchased: boolean;
  resultsStars: number;
  resultsTon: number;
};

export type TestResponse = {
  data: Test;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type AnswerRecord = {
  questionIndex: number;
  answerIndex: number;
  isCorrect: boolean;
  correctAnswerIndex: number;
};

export type AnswerResult = {
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
};
