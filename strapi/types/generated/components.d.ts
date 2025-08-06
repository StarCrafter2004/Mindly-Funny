import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAnswer extends Struct.ComponentSchema {
  collectionName: 'components_shared_answers';
  info: {
    displayName: 'answer';
    icon: 'alien';
  };
  attributes: {
    isCorrect: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedAnswerRecord extends Struct.ComponentSchema {
  collectionName: 'components_shared_answer_records';
  info: {
    displayName: 'AnswerRecord';
    icon: 'alien';
  };
  attributes: {
    answerIndex: Schema.Attribute.Integer;
    correctAnswerIndex: Schema.Attribute.Integer;
    isCorrect: Schema.Attribute.Boolean;
    questionIndex: Schema.Attribute.Integer;
  };
}

export interface SharedQuestion extends Struct.ComponentSchema {
  collectionName: 'components_shared_questions';
  info: {
    displayName: 'question';
    icon: 'alien';
  };
  attributes: {
    answers: Schema.Attribute.Component<'shared.answer', true>;
    explanation: Schema.Attribute.Text;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedQuestionImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_question_images';
  info: {
    displayName: 'QuestionImage';
    icon: 'alien';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    index: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.answer': SharedAnswer;
      'shared.answer-record': SharedAnswerRecord;
      'shared.question': SharedQuestion;
      'shared.question-image': SharedQuestionImage;
    }
  }
}
