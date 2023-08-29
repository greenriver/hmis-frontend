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

const COLLECTION_DATE = 'Date Collected';
const COLLECTION_STAGE = 'Collection Point';

export const assessmentColumns = [
  {
    header: COLLECTION_DATE,
    render: (record: AssessmentForPopulation) =>
      [parseAndFormatDate(record.assessmentDate), record.user?.name]
        .filter((s) => !!s)
        .join(' by '),
  },
  {
    header: COLLECTION_STAGE,
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
];
