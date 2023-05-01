// **** THIS FILE IS GENERATED, DO NOT EDIT DIRECTLY ****

import { HmisEnums } from './gqlEnums';
import { Scalars } from './gqlTypes';

export interface GqlSchemaType {
  kind: 'NON_NULL' | 'LIST' | 'SCALAR' | 'OBJECT' | 'ENUM' | 'UNION';
  name: keyof Scalars | keyof typeof HmisEnums | 'OmnisearchResult' | null;
  ofType: GqlSchemaType | null;
}

export interface GqlSchemaField {
  name: string;
  type: GqlSchemaType;
}
export interface GqlSchema {
  name: string;
  fields: GqlSchemaField[];
}

// Partial schema introspection for object types. Includes non-object fields only.
export const HmisObjectSchemas: GqlSchema[] = [
  {
    name: 'ApplicationUser',
    fields: [
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'name',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'recentItems',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'UNION', name: 'OmnisearchResult', ofType: null },
            },
          },
        },
      },
    ],
  },
  {
    name: 'Assessment',
    fields: [
      {
        name: 'assessmentDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'dataCollectionStage',
        type: { kind: 'ENUM', name: 'DataCollectionStage', ofType: null },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'inProgress',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
    ],
  },
  {
    name: 'AssessmentAccess',
    fields: [
      {
        name: 'canDeleteAssessments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'AutofillValue',
    fields: [
      {
        name: 'autofillBehavior',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'EnableBehavior', ofType: null },
        },
      },
      {
        name: 'autofillReadonly',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'sumQuestions',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'String', ofType: null },
          },
        },
      },
      {
        name: 'valueBoolean',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'valueCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'valueNumber',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
  {
    name: 'Bed',
    fields: [
      {
        name: 'bedType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'InventoryBedType', ofType: null },
        },
      },
      {
        name: 'endDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'gender',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      { name: 'name', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'startDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
    ],
  },
  {
    name: 'CeAssessment',
    fields: [
      {
        name: 'assessmentDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'assessmentLevel',
        type: { kind: 'ENUM', name: 'AssessmentLevel', ofType: null },
      },
      {
        name: 'assessmentLocation',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'assessmentType',
        type: { kind: 'ENUM', name: 'AssessmentType', ofType: null },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'prioritizationStatus',
        type: { kind: 'ENUM', name: 'PrioritizationStatus', ofType: null },
      },
    ],
  },
  {
    name: 'Client',
    fields: [
      { name: 'age', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dob',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dobDataQuality',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DOBDataQuality', ofType: null },
        },
      },
      {
        name: 'ethnicity',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'Ethnicity', ofType: null },
        },
      },
      {
        name: 'firstName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'gender',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'ENUM', name: 'Gender', ofType: null },
            },
          },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'lastName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'middleName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'nameDataQuality',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'NameDataQuality', ofType: null },
        },
      },
      {
        name: 'nameSuffix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'personalId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'preferredName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'pronouns',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'String', ofType: null },
            },
          },
        },
      },
      {
        name: 'race',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'ENUM', name: 'Race', ofType: null },
            },
          },
        },
      },
      { name: 'ssn', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'ssnDataQuality',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'SSNDataQuality', ofType: null },
        },
      },
      {
        name: 'veteranStatus',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'ENUM',
            name: 'NoYesReasonsForMissingData',
            ofType: null,
          },
        },
      },
    ],
  },
  {
    name: 'ClientAccess',
    fields: [
      {
        name: 'canDeleteAssessments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteClient',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditClient',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageAnyClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageOwnClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewAnyConfidentialClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewAnyNonconfidentialClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewClient',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewDob',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewEnrollmentDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewFullSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewPartialSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ClientAuditEvent',
    fields: [
      {
        name: 'createdAt',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'event',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'AuditEventType', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'objectChanges',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
    ],
  },
  {
    name: 'ClientImage',
    fields: [
      {
        name: 'base64',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Base64', ofType: null },
        },
      },
      {
        name: 'contentType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'CustomForm',
    fields: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'values',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
    ],
  },
  {
    name: 'DirectUpload',
    fields: [
      {
        name: 'blobId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'filename',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'headers',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'signedBlobId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'url',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Disability',
    fields: [
      {
        name: 'dataCollectionStage',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectionStage', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'disabilityResponse',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DisabilityResponse', ofType: null },
        },
      },
      {
        name: 'disabilityType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DisabilityType', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'indefiniteAndImpairs',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'informationDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
    ],
  },
  {
    name: 'DisabilityGroup',
    fields: [
      {
        name: 'chronicHealthCondition',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'chronicHealthConditionIndefiniteAndImpairs',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'dataCollectionStage',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectionStage', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'developmentalDisability',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'disablingCondition',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'ENUM',
            name: 'NoYesReasonsForMissingData',
            ofType: null,
          },
        },
      },
      {
        name: 'hivAids',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'informationDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'mentalHealthDisorder',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'mentalHealthDisorderIndefiniteAndImpairs',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'physicalDisability',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'physicalDisabilityIndefiniteAndImpairs',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'substanceUseDisorder',
        type: { kind: 'ENUM', name: 'DisabilityResponse', ofType: null },
      },
      {
        name: 'substanceUseDisorderIndefiniteAndImpairs',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
    ],
  },
  {
    name: 'EnableWhen',
    fields: [
      {
        name: 'answerBoolean',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'answerCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'answerCodes',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'String', ofType: null },
          },
        },
      },
      {
        name: 'answerGroupCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'answerNumber',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'compareQuestion',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'operator',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'EnableOperator', ofType: null },
        },
      },
      {
        name: 'question',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Enrollment',
    fields: [
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateToStreetEssh',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'disablingCondition',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'entryDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'exitDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'householdSize',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'inProgress',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'lengthOfStay',
        type: {
          kind: 'ENUM',
          name: 'ResidencePriorLengthOfStay',
          ofType: null,
        },
      },
      {
        name: 'livingSituation',
        type: { kind: 'ENUM', name: 'LivingSituation', ofType: null },
      },
      {
        name: 'losUnderThreshold',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'monthsHomelessPastThreeYears',
        type: {
          kind: 'ENUM',
          name: 'MonthsHomelessPastThreeYears',
          ofType: null,
        },
      },
      {
        name: 'previousStreetEssh',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'relationshipToHoH',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'RelationshipToHoH', ofType: null },
        },
      },
      {
        name: 'status',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'EnrollmentStatus', ofType: null },
        },
      },
      {
        name: 'timesHomelessPastThreeYears',
        type: {
          kind: 'ENUM',
          name: 'TimesHomelessPastThreeYears',
          ofType: null,
        },
      },
    ],
  },
  {
    name: 'EnrollmentAccess',
    fields: [
      {
        name: 'canDeleteEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Event',
    fields: [
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'event',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'EventType', ofType: null },
        },
      },
      {
        name: 'eventDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'locationCrisisOrPhHousing',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'probSolDivRrResult',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'referralCaseManageAfter',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'referralResult',
        type: { kind: 'ENUM', name: 'ReferralResult', ofType: null },
      },
      {
        name: 'resultDate',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
    ],
  },
  {
    name: 'ExternalIdentifier',
    fields: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'identifier',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'label',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      { name: 'url', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'File',
    fields: [
      {
        name: 'confidential',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'contentType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'createdAt',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'effectiveDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'enrollmentId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'expirationDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'fileBlobId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'name',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'ownFile',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'tags',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'String', ofType: null },
            },
          },
        },
      },
      {
        name: 'updatedAt',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'url',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'FormDefinition',
    fields: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'identifier',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'role',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'FormRole', ofType: null },
        },
      },
      {
        name: 'status',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'version',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
    ],
  },
  { name: 'FormDefinitionJson', fields: [] },
  {
    name: 'FormItem',
    fields: [
      {
        name: 'assessmentDate',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'briefText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'component',
        type: { kind: 'ENUM', name: 'Component', ofType: null },
      },
      {
        name: 'dataCollectedAbout',
        type: { kind: 'ENUM', name: 'DataCollectedAbout', ofType: null },
      },
      {
        name: 'disabledDisplay',
        type: { kind: 'ENUM', name: 'DisabledDisplay', ofType: null },
      },
      {
        name: 'enableBehavior',
        type: { kind: 'ENUM', name: 'EnableBehavior', ofType: null },
      },
      {
        name: 'fieldName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'funders',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'FundingSource', ofType: null },
          },
        },
      },
      {
        name: 'helperText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'hidden',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'linkId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'pickListReference',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'prefill',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'prefix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'projectTypesExcluded',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'ProjectType', ofType: null },
          },
        },
      },
      {
        name: 'projectTypesIncluded',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'ProjectType', ofType: null },
          },
        },
      },
      {
        name: 'readOnly',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'readonlyText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'recordType',
        type: { kind: 'ENUM', name: 'RelatedRecordType', ofType: null },
      },
      {
        name: 'repeats',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'required',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'serviceDetailType',
        type: { kind: 'ENUM', name: 'ServiceDetailType', ofType: null },
      },
      { name: 'size', type: { kind: 'ENUM', name: 'InputSize', ofType: null } },
      { name: 'text', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'type',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ItemType', ofType: null },
        },
      },
      {
        name: 'warnIfEmpty',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
    ],
  },
  {
    name: 'Funder',
    fields: [
      {
        name: 'active',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'endDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'funder',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'FundingSource', ofType: null },
        },
      },
      {
        name: 'grantId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'otherFunder',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'startDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
    ],
  },
  {
    name: 'HealthAndDv',
    fields: [
      {
        name: 'bounceBack',
        type: { kind: 'ENUM', name: 'WellbeingAgreement', ofType: null },
      },
      {
        name: 'currentlyFleeing',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'dataCollectionStage',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectionStage', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dentalHealthStatus',
        type: { kind: 'ENUM', name: 'HealthStatus', ofType: null },
      },
      {
        name: 'domesticViolenceVictim',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'dueDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'feelingFrequency',
        type: { kind: 'ENUM', name: 'FeelingFrequency', ofType: null },
      },
      {
        name: 'generalHealthStatus',
        type: { kind: 'ENUM', name: 'HealthStatus', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'informationDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'lifeValue',
        type: { kind: 'ENUM', name: 'WellbeingAgreement', ofType: null },
      },
      {
        name: 'mentalHealthStatus',
        type: { kind: 'ENUM', name: 'HealthStatus', ofType: null },
      },
      {
        name: 'pregnancyStatus',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'supportFromOthers',
        type: { kind: 'ENUM', name: 'WellbeingAgreement', ofType: null },
      },
      {
        name: 'whenOccurred',
        type: { kind: 'ENUM', name: 'WhenDVOccurred', ofType: null },
      },
    ],
  },
  {
    name: 'Household',
    fields: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'shortId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'HouseholdClient',
    fields: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'relationshipToHoH',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'RelationshipToHoH', ofType: null },
        },
      },
    ],
  },
  {
    name: 'IncomeBenefit',
    fields: [
      {
        name: 'adap',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'alimony',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'alimonyAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'benefitsFromAnySource',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'childSupport',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'childSupportAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'cobra',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'connectionWithSoar',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'dataCollectionStage',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectionStage', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'earned',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'earnedAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'employerProvided',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'ga',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'gaAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'hivaidsAssistance',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'incomeFromAnySource',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'indianHealthServices',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'informationDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'insuranceFromAnySource',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'medicaid',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'medicare',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'noAdapReason',
        type: { kind: 'ENUM', name: 'NoAssistanceReason', ofType: null },
      },
      {
        name: 'noCobraReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noEmployerProvidedReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noHivaidsAssistanceReason',
        type: { kind: 'ENUM', name: 'NoAssistanceReason', ofType: null },
      },
      {
        name: 'noIndianHealthServicesReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noMedicaidReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noMedicareReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noPrivatePayReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noRyanWhiteReason',
        type: { kind: 'ENUM', name: 'NoAssistanceReason', ofType: null },
      },
      {
        name: 'noSchipReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noStateHealthInsReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'noVaMedReason',
        type: { kind: 'ENUM', name: 'ReasonNotInsured', ofType: null },
      },
      {
        name: 'otherBenefitsSource',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'otherBenefitsSourceIdentify',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'otherIncomeAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'otherIncomeSource',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'otherIncomeSourceIdentify',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'otherInsurance',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'otherInsuranceIdentify',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'otherTanf',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'pension',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'pensionAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'privateDisability',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'privateDisabilityAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'privatePay',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'ryanWhiteMedDent',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'schip',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'snap',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'socSecRetirement',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'socSecRetirementAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'ssdi',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'ssdiAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'ssi',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'ssiAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'stateHealthIns',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'tanf',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'tanfAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'tanfChildCare',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'tanfTransportation',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'totalMonthlyIncome',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'unemployment',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'unemploymentAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'vaDisabilityNonService',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'vaDisabilityNonServiceAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'vaDisabilityService',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'vaDisabilityServiceAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'vaMedicalServices',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'wic',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'workersComp',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'workersCompAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
    ],
  },
  {
    name: 'InitialValue',
    fields: [
      {
        name: 'initialBehavior',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'InitialBehavior', ofType: null },
        },
      },
      {
        name: 'valueBoolean',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'valueCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'valueLocalConstant',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'valueNumber',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
  {
    name: 'Inventory',
    fields: [
      {
        name: 'active',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'availability',
        type: { kind: 'ENUM', name: 'Availability', ofType: null },
      },
      {
        name: 'bedInventory',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'chBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'chVetBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'chYouthBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'cocCode',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'esBedType',
        type: { kind: 'ENUM', name: 'BedType', ofType: null },
      },
      {
        name: 'householdType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'HouseholdType', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'inventoryEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'inventoryStartDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'otherBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'unitInventory',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'vetBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'youthBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'youthVetBedInventory',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
  {
    name: 'MciClearanceMatch',
    fields: [
      {
        name: 'age',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'dob',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'existingClientId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'firstName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'gender',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'ENUM', name: 'Gender', ofType: null },
            },
          },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'lastName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'mciId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'middleName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'nameSuffix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'score',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      { name: 'ssn', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'Organization',
    fields: [
      {
        name: 'contactInformation',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'description',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'organizationName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'victimServiceProvider',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
        },
      },
    ],
  },
  {
    name: 'OrganizationAccess',
    fields: [
      {
        name: 'canDeleteOrganization',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditOrganization',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'PickListOption',
    fields: [
      {
        name: 'code',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'groupCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'groupLabel',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'initialSelected',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      { name: 'label', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'secondaryLabel',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'Project',
    fields: [
      {
        name: 'HMISParticipatingProject',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'HOPWAMedAssistedLivingFac',
        type: { kind: 'ENUM', name: 'HOPWAMedAssistedLivingFac', ofType: null },
      },
      {
        name: 'active',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'contactInformation',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'continuumProject',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'description',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'housingType',
        type: { kind: 'ENUM', name: 'HousingType', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'operatingEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'operatingStartDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'projectName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'projectType',
        type: { kind: 'ENUM', name: 'ProjectType', ofType: null },
      },
      {
        name: 'residentialAffiliation',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'targetPopulation',
        type: { kind: 'ENUM', name: 'TargetPopulation', ofType: null },
      },
      {
        name: 'trackingMethod',
        type: { kind: 'ENUM', name: 'TrackingMethod', ofType: null },
      },
    ],
  },
  {
    name: 'ProjectAccess',
    fields: [
      {
        name: 'canDeleteAssessments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteProject',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditProjectDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewDob',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewEnrollmentDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewFullSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewPartialSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ProjectCoc',
    fields: [
      {
        name: 'address1',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'address2',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'city', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'cocCode',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'geocode',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'geographyType',
        type: { kind: 'ENUM', name: 'GeographyType', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      { name: 'state', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      { name: 'zip', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'QueryAccess',
    fields: [
      {
        name: 'canAdministerHmis',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canAuditClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteAssessments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteAssignedProjectData',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteOrganization',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canDeleteProject',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditOrganization',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canEditProjectDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageAnyClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageOwnClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewAnyConfidentialClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewAnyNonconfidentialClientFiles',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewDob',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewEnrollmentDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewFullSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewPartialSsn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Service',
    fields: [
      {
        name: 'FAAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateProvided',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'movingOnOtherType',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'otherTypeProvided',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'recordType',
        type: { kind: 'ENUM', name: 'RecordType', ofType: null },
      },
      {
        name: 'referralOutcome',
        type: { kind: 'ENUM', name: 'PATHReferralOutcome', ofType: null },
      },
      {
        name: 'subTypeProvided',
        type: { kind: 'ENUM', name: 'ServiceSubTypeProvided', ofType: null },
      },
      {
        name: 'typeProvided',
        type: { kind: 'ENUM', name: 'ServiceTypeProvided', ofType: null },
      },
    ],
  },
  {
    name: 'Unit',
    fields: [
      {
        name: 'bedCount',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'endDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      { name: 'name', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'startDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
    ],
  },
  {
    name: 'User',
    fields: [
      {
        name: 'dateCreated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'name',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ValidationError',
    fields: [
      {
        name: 'attribute',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'data',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
      {
        name: 'fullMessage',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      { name: 'id', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'linkId',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'message',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'readableAttribute',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'recordId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'section',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'severity',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ValidationSeverity', ofType: null },
        },
      },
      {
        name: 'type',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ValidationType', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ValueBound',
    fields: [
      { name: 'id', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'question',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'severity',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ValidationSeverity', ofType: null },
        },
      },
      {
        name: 'type',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'BoundType', ofType: null },
        },
      },
      {
        name: 'valueDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'valueNumber',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
];
