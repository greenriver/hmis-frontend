import { ColumnDef } from '@/components/elements/GenericTable';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
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

export const typicalRecordPickerColumns = [
  {
    header: 'Date Collected',
    render: (record: RelatedRecord) =>
      isTypicalRelatedRecord(record) &&
      [parseAndFormatDate(record.informationDate), record.user?.name]
        .filter((s) => !!s)
        .join(' by '),
  },
  {
    header: 'Collection Point',
    render: (record: RelatedRecord) => {
      if (!isTypicalRelatedRecord(record)) return null; //make TS happy
      return [
        dataCollectionVerb[record.dataCollectionStage],
        enrollmentName(record.enrollment, true),
      ]
        .filter((s) => !!s)
        .join(' by ');
    },
  },
];

export const enrollmentColumns = [
  {
    header: 'Project',
    render: (record: RelatedRecord) =>
      isEnrollment(record) && enrollmentName(record, true),
  },
];

export const assessmentColumns = [
  {
    header: 'Collected On',
    render: (record: RelatedRecord) =>
      isAssessment(record) && parseAndFormatDate(record.assessmentDate),
  },
  {
    header: 'Collected By',
    render: 'user.name' as keyof RelatedRecord,
  },
  {
    header: 'Collection Stage',
    render: (record: RelatedRecord) =>
      isAssessment(record) && (
        <HmisEnum
          value={record.assessmentDetail?.dataCollectionStage}
          enumMap={HmisEnums.DataCollectionStage}
        />
      ),
  },
  {
    header: 'Project',
    render: (record: RelatedRecord) =>
      isAssessment(record) && enrollmentName(record.enrollment, true),
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
