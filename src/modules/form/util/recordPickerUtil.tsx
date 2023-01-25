import { ColumnDef } from '@/components/elements/GenericTable';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  DataCollectionStage,
  DisabilityGroupFieldsFragment,
  EnrollmentFieldsFragment,
  EnrollmentFieldsFromAssessmentFragment,
  GetClientAssessmentsQuery,
  HealthAndDvFieldsFragment,
  IncomeBenefitFieldsFragment,
  RelatedRecordType,
} from '@/types/gqlTypes';

// Types that have informationDate and dataCollectionStage
type TypicalAssessmentRelatedRecord =
  | IncomeBenefitFieldsFragment
  | DisabilityGroupFieldsFragment
  | HealthAndDvFieldsFragment; //| YouthEducationStatus | EmploymentEduction | Exit | EnrollmentCoc

type AssessmentFragment = NonNullable<
  GetClientAssessmentsQuery['client']
>['assessments']['nodes'][0];

// All types, including Enrollment and Assessment which are special
export type RelatedRecord =
  | TypicalAssessmentRelatedRecord
  | EnrollmentFieldsFromAssessmentFragment
  | AssessmentFragment;

export type PopulatableSourceRecordType = RelatedRecordType | 'Assessment';

export const isTypicalRelatedRecord = (
  r: RelatedRecord
): r is TypicalAssessmentRelatedRecord => {
  return (
    r.hasOwnProperty('informationDate') &&
    r.hasOwnProperty('dataCollectionStage')
  );
};

export const isEnrollment = (
  r: RelatedRecord
): r is EnrollmentFieldsFragment => {
  return r.__typename == 'Enrollment';
};

export const isAssessment = (r: RelatedRecord): r is AssessmentFragment => {
  return r.__typename == 'Assessment';
};

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

export const typicalRecordPickerColumns = [
  {
    header: COLLECTION_DATE,
    render: (record: RelatedRecord) =>
      isTypicalRelatedRecord(record) &&
      [parseAndFormatDate(record.informationDate), record.user?.name]
        .filter((s) => !!s)
        .join(' by '),
  },
  {
    header: COLLECTION_STAGE,
    render: (record: RelatedRecord) => {
      if (!isTypicalRelatedRecord(record)) return null; //make TS happy
      return [
        dataCollectionVerb[record.dataCollectionStage],
        enrollmentName(record.enrollment, true),
      ]
        .filter((s) => !!s)
        .join(' ');
    },
  },
];

export const enrollmentColumns = [
  {
    header: COLLECTION_DATE,
    render: (record: RelatedRecord) =>
      isEnrollment(record) && parseAndFormatDate(record.entryDate),
  },
  {
    header: COLLECTION_STAGE,
    render: (record: RelatedRecord) => {
      if (!isEnrollment(record)) return null; //make TS happy
      return [
        dataCollectionVerb[DataCollectionStage.ProjectEntry],
        enrollmentName(record, true),
      ]
        .filter((s) => !!s)
        .join(' ');
    },
  },
];

export const assessmentColumns = [
  {
    header: COLLECTION_DATE,
    render: (record: RelatedRecord) =>
      isAssessment(record) &&
      [parseAndFormatDate(record.assessmentDate), record.user?.name]
        .filter((s) => !!s)
        .join(' by '),
  },
  {
    header: COLLECTION_STAGE,
    render: (record: RelatedRecord) =>
      isAssessment(record) &&
      [
        record.assessmentDetail?.dataCollectionStage
          ? dataCollectionVerb[record.assessmentDetail.dataCollectionStage]
          : undefined,
        enrollmentName(record.enrollment, true),
      ]
        .filter((s) => !!s)
        .join(' '),
  },
];

export const getRecordPickerColumns = (
  recordType: PopulatableSourceRecordType
) => {
  let columns: ColumnDef<RelatedRecord>[] = [];
  switch (recordType) {
    // YouthEducationStatus
    // EmploymentEducation
    // CurrentLivingSituation
    // Exit
    case RelatedRecordType.IncomeBenefit:
    case RelatedRecordType.DisabilityGroup:
    case RelatedRecordType.HealthAndDv:
      columns = typicalRecordPickerColumns;
      break;
    case RelatedRecordType.Enrollment:
      columns = enrollmentColumns;
      break;
    case 'Assessment':
      columns = assessmentColumns;
      break;

    default:
      break;
  }

  if (
    import.meta.env.MODE === 'development' &&
    recordType !== RelatedRecordType.DisabilityGroup
  ) {
    columns = [
      {
        header: 'ID',
        render: 'id' as keyof RelatedRecord,
      },
      ...columns,
    ];
  }

  return columns;
};
