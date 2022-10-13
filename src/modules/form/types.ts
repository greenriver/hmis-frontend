import { ReactNode } from 'react';

export type DynamicInputCommonProps = {
  disabled?: boolean;
  label?: ReactNode;
  error?: boolean;
  helperText?: ReactNode;
};

export enum FieldType {
  group = 'group', // An item with no direct answer but should have at least one child item
  display = 'display', // Text for display that will not capture an answer or have child items

  // Types that defines a specific answer to be captured
  boolean = 'boolean',
  decimal = 'decimal',
  integer = 'integer',
  date = 'date',
  datetime = 'datetime',
  string = 'string',
  text = 'text',
  choice = 'choice',
  openchoice = 'openchoice',

  // Special HMIS types.. these are really just mappings to different components or props
  // TODO make this a different field like 'variant' or something
  dob = 'dob', // displays differently from date-picker
  ssn = 'ssn', // input-masked text field
}

type FieldTypes = keyof typeof FieldType;

export interface Coding {
  code: string;
  display: string;
  displayGroup?: string;
}

export function isAnswerOption(value: any): value is AnswerOption {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !!(value?.valueCoding || value?.valueString)
  );
}
export interface AnswerOption {
  valueCoding?: Coding;
  valueString?: string;
  initialSelected?: boolean; // Whether option is selected by default
}

export interface EnableWhen {
  question: string; // The linkId of question that determines whether item is enabled/disabled
  operator: string; // exists | = | != | > | < | >= | <=
  answerCoding?: Coding; // Value for question comparison based on operator
  answerString?: string;
}

export interface Mapping {
  [k: string]: string;
}
export interface DisplayOptions {
  direction?: 'row' | 'column';
}

export interface Item {
  linkId: string; // Unique ID for this field item
  type: FieldTypes;
  prefix?: string; // 	E.g. "1(a)", "2.5.3"
  text?: string; // Primary text for the item
  required?: boolean; // Whether the item must be included in data results
  hidden?: boolean; // Whether the item should always be hidden
  readOnly?: boolean; // Don't allow human editing
  repeats?: boolean; // Whether the item may repeat (for choice types, this means multiple choice)
  maxLength?: number; // No more than this many characters
  answerValueSet?: string; // Value set of possible answer options
  answerOption?: AnswerOption[]; // Permitted answers, for choice items
  item?: Item[]; // Nested items
  mapping?: Mapping;
  display?: DisplayOptions;

  enableBehavior?: 'any' | 'all';
  enableWhen?: EnableWhen[];
}

export interface FormDefinition {
  name: string; // computer-friendly name
  title?: string; // human-friendly name
  version?: string;
  description?: string;
  item: Item[]; // fields and sections within the form
}
