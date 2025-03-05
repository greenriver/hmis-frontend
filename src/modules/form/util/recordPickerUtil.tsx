import { AssessmentForPopulation } from '../types';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DataCollectionStage } from '@/types/gqlTypes';

const dataCollectionVerb = {
  [DataCollectionStage.AnnualAssessment]: 'Annual at',
  [DataCollectionStage.PostExit]: 'Post-Exit from',
  [DataCollectionStage.ProjectEntry]: 'Intake at',
  [DataCollectionStage.ProjectExit]: 'Exit from',
  [DataCollectionStage.Update]: 'Update at',
  [DataCollectionStage.Invalid]: '',
};

export const ASSESSMENT_COLUMNS = {
  CollectionDate: {
    header: 'Date Collected',
    key: 'dateCollected',
    render: (record: AssessmentForPopulation) =>
      [parseAndFormatDate(record.assessmentDate), record.user?.name]
        .filter((s) => !!s)
        .join(' by '),
  },
  CollectionStage: {
    header: 'Collection Point',
    key: 'collectionPoint',
    render: (record: AssessmentForPopulation) =>
      [
        record.dataCollectionStage
          ? dataCollectionVerb[record.dataCollectionStage]
          : undefined,
        enrollmentName(record.enrollment, true),
      ]
        .filter((s) => !!s)
        .join(' '),
  },
};

export const assessmentColumns = [
  ASSESSMENT_COLUMNS.CollectionDate,
  ASSESSMENT_COLUMNS.CollectionStage,
];
