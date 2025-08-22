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
    statusIndex: Schema.Attribute.Integer;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedAnswerRecord extends Struct.ComponentSchema {
  collectionName: 'components_shared_answer_records';
  info: {
    displayName: 'answerRecord';
    icon: 'alien';
  };
  attributes: {
    answerIndex: Schema.Attribute.Integer;
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

export interface SharedStatus extends Struct.ComponentSchema {
  collectionName: 'components_shared_statuses';
  info: {
    displayName: 'status';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String;
    statusIndex: Schema.Attribute.Integer;
  };
}

export interface SharedStatusImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_status_images';
  info: {
    displayName: 'StatusImage';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    index: Schema.Attribute.Integer;
  };
}

export interface SharedThreshold extends Struct.ComponentSchema {
  collectionName: 'components_shared_thresholds';
  info: {
    displayName: 'Threshold';
    icon: 'alien';
  };
  attributes: {
    minCorrect: Schema.Attribute.Integer;
    resultDescription: Schema.Attribute.Text;
    statusIndex: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.answer': SharedAnswer;
      'shared.answer-record': SharedAnswerRecord;
      'shared.question': SharedQuestion;
      'shared.question-image': SharedQuestionImage;
      'shared.status': SharedStatus;
      'shared.status-image': SharedStatusImage;
      'shared.threshold': SharedThreshold;
    }
  }
}
