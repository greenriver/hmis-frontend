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

export interface GqlInputObjectSchemaType {
  kind: 'NON_NULL' | 'LIST' | 'SCALAR' | 'ENUM' | 'INPUT_OBJECT';
  name: string | null;
  ofType: GqlInputObjectSchemaType | null;
}

export interface GqlSchemaInputArgument {
  name: string;
  type: GqlInputObjectSchemaType;
}
export interface GqlInputObjectSchema {
  name: string;
  args: GqlSchemaInputArgument[];
}

// Partial schema introspection for object types. Includes non-object fields only.
export const HmisObjectSchemas: GqlSchema[] = [
  {
    name: 'ActivityLog',
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
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'ipAddress',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'ActivityLogRecord',
    fields: [
      {
        name: 'recordId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'recordType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
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
        name: 'email',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'firstName',
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
        name: 'lastName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        name: 'lockVersion',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'role',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'AssessmentRole', ofType: null },
        },
      },
      {
        name: 'wipValues',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
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
    name: 'AutoExitConfig',
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
        name: 'lengthOfAbsenceDays',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'organizationId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'projectType',
        type: { kind: 'ENUM', name: 'ProjectType', ofType: null },
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
      {
        name: 'valueQuestion',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
    name: 'CeParticipation',
    fields: [
      {
        name: 'accessPoint',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'ceParticipationStatusEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'ceParticipationStatusStartDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'crisisAssessment',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'directServices',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'housingAssessment',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
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
        name: 'preventionAssessment',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'receivesReferrals',
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
    ],
  },
  {
    name: 'Client',
    fields: [
      {
        name: 'additionalRaceEthnicity',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'afghanistanOef',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      { name: 'age', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'desertStorm',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'differentIdentityText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dischargeStatus',
        type: { kind: 'ENUM', name: 'DischargeStatus', ofType: null },
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
        name: 'hudChronic',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
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
        name: 'iraqOif',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'iraqOnd',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'koreanWar',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'lastName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'lockVersion',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'middleName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'militaryBranch',
        type: { kind: 'ENUM', name: 'MilitaryBranch', ofType: null },
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
        name: 'otherTheater',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
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
      {
        name: 'vietnamWar',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'worldWarIi',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'yearEnteredService',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'yearSeparated',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
  {
    name: 'ClientAccess',
    fields: [
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
        name: 'canUploadClientFiles',
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
        name: 'canViewAnyFiles',
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
    name: 'ClientAddress',
    fields: [
      {
        name: 'addressType',
        type: { kind: 'ENUM', name: 'ClientAddressType', ofType: null },
      },
      { name: 'city', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'country',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'district',
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
      { name: 'line1', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      { name: 'line2', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      { name: 'notes', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'postalCode',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'state', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'use',
        type: { kind: 'ENUM', name: 'ClientAddressUse', ofType: null },
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
        name: 'graphqlType',
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
        name: 'objectChanges',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
      {
        name: 'recordId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'recordName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ClientContactPoint',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      { name: 'notes', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'system',
        type: { kind: 'ENUM', name: 'ClientContactPointSystem', ofType: null },
      },
      {
        name: 'use',
        type: { kind: 'ENUM', name: 'ClientContactPointUse', ofType: null },
      },
      { name: 'value', type: { kind: 'SCALAR', name: 'String', ofType: null } },
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
    name: 'ClientMergeCandidate',
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
        name: 'warehouseUrl',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ClientName',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      { name: 'first', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      { name: 'last', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'middle',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'nameDataQuality',
        type: { kind: 'ENUM', name: 'NameDataQuality', ofType: null },
      },
      { name: 'notes', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'primary',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'suffix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'use',
        type: { kind: 'ENUM', name: 'ClientNameUse', ofType: null },
      },
    ],
  },
  {
    name: 'CurrentLivingSituation',
    fields: [
      {
        name: 'clsSubsidyType',
        type: { kind: 'ENUM', name: 'RentalSubsidyType', ofType: null },
      },
      {
        name: 'currentLivingSituation',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'ENUM',
            name: 'CurrentLivingSituationOptions',
            ofType: null,
          },
        },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'leaseOwn60Day',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'leaveSituation14Days',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'locationDetails',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'movedTwoOrMore',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'resourcesToObtain',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'subsequentResidence',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'verifiedBy',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'CustomCaseNote',
    fields: [
      {
        name: 'content',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
    ],
  },
  {
    name: 'CustomDataElement',
    fields: [
      {
        name: 'fieldType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'CustomDataElementType', ofType: null },
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
        name: 'key',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'label',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'repeats',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
    ],
  },
  {
    name: 'CustomDataElementValue',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        name: 'valueBoolean',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'valueDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'valueFloat',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'valueInteger',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'valueJson',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
      {
        name: 'valueString',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'valueText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'DataCollectionFeature',
    fields: [
      {
        name: 'dataCollectedAbout',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectedAbout', ofType: null },
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
        name: 'legacy',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'role',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'ENUM',
            name: 'DataCollectionFeatureRole',
            ofType: null,
          },
        },
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
        name: 'antiRetroviral',
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
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'tCellCount',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'tCellCountAvailable',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'tCellSource',
        type: {
          kind: 'ENUM',
          name: 'TCellSourceViralLoadSource',
          ofType: null,
        },
      },
      {
        name: 'viralLoad',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'viralLoadAvailable',
        type: { kind: 'ENUM', name: 'ViralLoadAvailable', ofType: null },
      },
    ],
  },
  {
    name: 'DisabilityGroup',
    fields: [
      {
        name: 'antiRetroviral',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
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
      {
        name: 'tCellCount',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'tCellCountAvailable',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'tCellSource',
        type: {
          kind: 'ENUM',
          name: 'TCellSourceViralLoadSource',
          ofType: null,
        },
      },
      {
        name: 'viralLoad',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'viralLoadAvailable',
        type: { kind: 'ENUM', name: 'ViralLoadAvailable', ofType: null },
      },
    ],
  },
  {
    name: 'EmploymentEducation',
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'employed',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'employmentType',
        type: { kind: 'ENUM', name: 'EmploymentType', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'lastGradeCompleted',
        type: { kind: 'ENUM', name: 'LastGradeCompleted', ofType: null },
      },
      {
        name: 'notEmployedReason',
        type: { kind: 'ENUM', name: 'NotEmployedReason', ofType: null },
      },
      {
        name: 'schoolStatus',
        type: { kind: 'ENUM', name: 'SchoolStatus', ofType: null },
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
        name: 'localConstant',
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
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'Enrollment',
    fields: [
      {
        name: 'alcoholDrugUseDisorderFam',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'annualPercentAmi',
        type: { kind: 'ENUM', name: 'AnnualPercentAMI', ofType: null },
      },
      {
        name: 'childWelfareMonths',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'childWelfareYears',
        type: { kind: 'ENUM', name: 'RHYNumberofYears', ofType: null },
      },
      {
        name: 'clientEnrolledInPath',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'clientLeaseholder',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'cocPrioritized',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'countOutreachReferralApproaches',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'criminalRecord',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'currentPregnant',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateOfBcpStatus',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateOfEngagement',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateOfPathStatus',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateToStreetEssh',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dependentUnder6',
        type: { kind: 'ENUM', name: 'DependentUnder6', ofType: null },
      },
      {
        name: 'disabledHoh',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
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
        name: 'eligibleForRhy',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'enrollmentCoc',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
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
        name: 'evictionHistory',
        type: { kind: 'ENUM', name: 'EvictionHistory', ofType: null },
      },
      {
        name: 'exitDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'exitDestination',
        type: { kind: 'ENUM', name: 'Destination', ofType: null },
      },
      {
        name: 'formerWardChildWelfare',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'formerWardJuvenileJustice',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'hh5Plus',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'hohLeaseholder',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'householdId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'householdShortId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
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
        name: 'hpScreeningScore',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
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
        name: 'incarceratedAdult',
        type: { kind: 'ENUM', name: 'IncarceratedAdult', ofType: null },
      },
      {
        name: 'incarceratedParent',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'insufficientIncome',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'juvenileJusticeMonths',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'juvenileJusticeYears',
        type: { kind: 'ENUM', name: 'RHYNumberofYears', ofType: null },
      },
      {
        name: 'lastBedNightDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
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
        name: 'literalHomelessHistory',
        type: { kind: 'ENUM', name: 'LiteralHomelessHistory', ofType: null },
      },
      {
        name: 'livingSituation',
        type: { kind: 'ENUM', name: 'PriorLivingSituation', ofType: null },
      },
      {
        name: 'lockVersion',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'losUnderThreshold',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'mentalHealthDisorderFam',
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
        name: 'moveInDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'numUnitsAssignedToHousehold',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
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
        name: 'percentAmi',
        type: { kind: 'ENUM', name: 'PercentAMI', ofType: null },
      },
      {
        name: 'physicalDisabilityFam',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'preferredLanguage',
        type: { kind: 'ENUM', name: 'PreferredLanguage', ofType: null },
      },
      {
        name: 'preferredLanguageDifferent',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'previousStreetEssh',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'prisonDischarge',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
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
        name: 'reasonNoServices',
        type: { kind: 'ENUM', name: 'ReasonNoServices', ofType: null },
      },
      {
        name: 'reasonNotEnrolled',
        type: { kind: 'ENUM', name: 'ReasonNotEnrolled', ofType: null },
      },
      {
        name: 'referralSource',
        type: { kind: 'ENUM', name: 'ReferralSource', ofType: null },
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
        name: 'rentalSubsidyType',
        type: { kind: 'ENUM', name: 'RentalSubsidyType', ofType: null },
      },
      {
        name: 'runawayYouth',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'sexOffender',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'sexualOrientation',
        type: { kind: 'ENUM', name: 'SexualOrientation', ofType: null },
      },
      {
        name: 'sexualOrientationOther',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'singleParent',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
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
        name: 'subsidyAtRisk',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'targetScreenReqd',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'thresholdScore',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'timeToHousingLoss',
        type: { kind: 'ENUM', name: 'TimeToHousingLoss', ofType: null },
      },
      {
        name: 'timesHomelessPastThreeYears',
        type: {
          kind: 'ENUM',
          name: 'TimesHomelessPastThreeYears',
          ofType: null,
        },
      },
      {
        name: 'translationNeeded',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'unemploymentFam',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'vamcStation',
        type: { kind: 'ENUM', name: 'VamcStationNumber', ofType: null },
      },
    ],
  },
  {
    name: 'EnrollmentAccess',
    fields: [
      {
        name: 'canAuditEnrollments',
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
        name: 'canSplitHouseholds',
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
    name: 'EnrollmentAuditEvent',
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
        name: 'graphqlType',
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
        name: 'objectChanges',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
      {
        name: 'recordId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'recordName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'EnrollmentSummary',
    fields: [
      {
        name: 'canViewEnrollment',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
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
        name: 'moveInDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'projectId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
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
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ProjectType', ofType: null },
        },
      },
    ],
  },
  {
    name: 'EsgFundingService',
    fields: [
      {
        name: 'clientDob',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'clientId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
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
        name: 'faAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'faEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'faStartDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'firstName',
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
        name: 'lastName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'organizationId',
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
        name: 'projectId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
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
    ],
  },
  {
    name: 'Event',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
    name: 'Exit',
    fields: [
      {
        name: 'aftercareDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'aftercareMethods',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'AftercareMethod', ofType: null },
          },
        },
      },
      {
        name: 'aftercareProvided',
        type: { kind: 'ENUM', name: 'AftercareProvided', ofType: null },
      },
      {
        name: 'askedOrForcedToExchangeForSex',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'askedOrForcedToExchangeForSexPastThreeMonths',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'cmExitReason',
        type: { kind: 'ENUM', name: 'CmExitReason', ofType: null },
      },
      {
        name: 'coercedToContinueWork',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'counselingMethods',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'CounselingMethod', ofType: null },
          },
        },
      },
      {
        name: 'counselingReceived',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'countOfExchangeForSex',
        type: { kind: 'ENUM', name: 'CountExchangeForSex', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'destination',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'Destination', ofType: null },
        },
      },
      {
        name: 'destinationSafeClient',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'destinationSafeWorker',
        type: { kind: 'ENUM', name: 'WorkerResponse', ofType: null },
      },
      {
        name: 'destinationSubsidyType',
        type: { kind: 'ENUM', name: 'RentalSubsidyType', ofType: null },
      },
      {
        name: 'earlyExitReason',
        type: { kind: 'ENUM', name: 'ExpelledReason', ofType: null },
      },
      {
        name: 'exchangeForSex',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'exchangeForSexPastThreeMonths',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'exitDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'housingAssessment',
        type: { kind: 'ENUM', name: 'HousingAssessmentAtExit', ofType: null },
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
        name: 'laborExploitPastThreeMonths',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'otherDestination',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'posAdultConnections',
        type: { kind: 'ENUM', name: 'WorkerResponse', ofType: null },
      },
      {
        name: 'posCommunityConnections',
        type: { kind: 'ENUM', name: 'WorkerResponse', ofType: null },
      },
      {
        name: 'posPeerConnections',
        type: { kind: 'ENUM', name: 'WorkerResponse', ofType: null },
      },
      {
        name: 'postExitCounselingPlan',
        type: { kind: 'ENUM', name: 'NoYesMissing', ofType: null },
      },
      {
        name: 'projectCompletionStatus',
        type: { kind: 'ENUM', name: 'ProjectCompletionStatus', ofType: null },
      },
      {
        name: 'sessionCountAtExit',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'sessionsInPlan',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'subsidyInformation',
        type: { kind: 'ENUM', name: 'SubsidyInformation', ofType: null },
      },
      {
        name: 'subsidyInformationA',
        type: { kind: 'ENUM', name: 'SubsidyInformationA', ofType: null },
      },
      {
        name: 'subsidyInformationB',
        type: { kind: 'ENUM', name: 'SubsidyInformationB', ofType: null },
      },
      {
        name: 'workPlaceViolenceThreats',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
      },
      {
        name: 'workplacePromiseDifference',
        type: {
          kind: 'ENUM',
          name: 'NoYesReasonsForMissingData',
          ofType: null,
        },
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
      {
        name: 'type',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'ENUM',
            name: 'ExternalIdentifierType',
            ofType: null,
          },
        },
      },
      { name: 'url', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'FieldMapping',
    fields: [
      {
        name: 'customFieldKey',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'fieldName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'recordType',
        type: { kind: 'ENUM', name: 'RelatedRecordType', ofType: null },
      },
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
        type: { kind: 'SCALAR', name: 'String', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
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
        name: 'redacted',
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
      { name: 'url', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'FormDefinition',
    fields: [
      {
        name: 'cacheKey',
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
        name: 'role',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'FormRole', ofType: null },
        },
      },
      {
        name: 'system',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'title',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
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
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DisabledDisplay', ofType: null },
        },
      },
      {
        name: 'enableBehavior',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'EnableBehavior', ofType: null },
        },
      },
      {
        name: 'helperText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'hidden',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
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
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'prefix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'readOnly',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'readonlyText',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'repeats',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'required',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
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
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
    ],
  },
  {
    name: 'FormRule',
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
        name: 'activeStatus',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ActiveStatus', ofType: null },
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
        name: 'dataCollectedAbout',
        type: { kind: 'ENUM', name: 'DataCollectedAbout', ofType: null },
      },
      {
        name: 'definitionId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'definitionIdentifier',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'definitionRole',
        type: { kind: 'ENUM', name: 'FormRole', ofType: null },
      },
      {
        name: 'definitionTitle',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'funder',
        type: { kind: 'ENUM', name: 'FundingSource', ofType: null },
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
        name: 'organizationId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'otherFunder',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'projectType',
        type: { kind: 'ENUM', name: 'ProjectType', ofType: null },
      },
      {
        name: 'system',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        name: 'otherFunder',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'startDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
    ],
  },
  {
    name: 'HealthAndDv',
    fields: [
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dentalHealthStatus',
        type: { kind: 'ENUM', name: 'HealthStatus', ofType: null },
      },
      {
        name: 'domesticViolenceSurvivor',
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
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
        name: 'whenOccurred',
        type: { kind: 'ENUM', name: 'WhenDVOccurred', ofType: null },
      },
    ],
  },
  {
    name: 'HmisParticipation',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'hmisParticipationStatusEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'hmisParticipationStatusStartDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'hmisParticipationType',
        type: { kind: 'ENUM', name: 'HMISParticipationType', ofType: null },
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
    name: 'Household',
    fields: [
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
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
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
        name: 'noVhaReason',
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
        name: 'vhaServices',
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
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'esBedType',
        type: { kind: 'ENUM', name: 'BedType', ofType: null },
      },
      {
        name: 'householdType',
        type: { kind: 'ENUM', name: 'HouseholdType', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
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
    name: 'MergeAuditEvent',
    fields: [
      {
        name: 'clientIdsMerged',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
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
        name: 'mergedAt',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'preMergeState',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
        },
      },
    ],
  },
  {
    name: 'OccurrencePointForm',
    fields: [
      {
        name: 'dataCollectedAbout',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'DataCollectedAbout', ofType: null },
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
    name: 'Organization',
    fields: [
      {
        name: 'contactInformation',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'description',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'hudId',
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
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'description',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'hasUnits',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'housingType',
        type: { kind: 'ENUM', name: 'HousingType', ofType: null },
      },
      {
        name: 'hudId',
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
        name: 'operatingEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'operatingStartDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
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
        type: { kind: 'ENUM', name: 'NoYes', ofType: null },
      },
      {
        name: 'residentialAffiliationProjectIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
      {
        name: 'rrhSubType',
        type: { kind: 'ENUM', name: 'RRHSubType', ofType: null },
      },
      {
        name: 'targetPopulation',
        type: { kind: 'ENUM', name: 'TargetPopulation', ofType: null },
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
        name: 'canEnrollClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageDeniedReferrals',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageIncomingReferrals',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageInventory',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageOutgoingReferrals',
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
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        name: 'canAuditEnrollments',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canAuditUsers',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canConfigureDataCollection',
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
        name: 'canEnrollClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canImpersonateUsers',
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
        name: 'canManageDeniedReferrals',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageIncomingReferrals',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageInventory',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canManageOutgoingReferrals',
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
        name: 'canMergeClients',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canSplitHouseholds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canTransferEnrollments',
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
        name: 'canViewHudChronicStatus',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewLimitedEnrollmentDetails',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'canViewOpenEnrollmentSummary',
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
        name: 'canViewProject',
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
    name: 'ReferralHouseholdMember',
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
    name: 'ReferralPosting',
    fields: [
      {
        name: 'assignedDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'chronic',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'denialNote',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'denialReason',
        type: {
          kind: 'ENUM',
          name: 'ReferralPostingDenialReasonType',
          ofType: null,
        },
      },
      { name: 'hohMciId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'hohName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
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
        name: 'hudChronic',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
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
        name: 'needsWheelchairAccessibleUnit',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'postingIdentifier',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'referralDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'referralIdentifier',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'referralNotes',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'referralResult',
        type: { kind: 'ENUM', name: 'ReferralResult', ofType: null },
      },
      {
        name: 'referredBy',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'referredFrom',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'resourceCoordinatorNotes',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'score', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
      {
        name: 'status',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ReferralPostingStatus', ofType: null },
        },
      },
      {
        name: 'statusNote',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'statusNoteUpdatedAt',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'statusNoteUpdatedBy',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'statusUpdatedAt',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'statusUpdatedBy',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'ReferralRequest',
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
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'neededBy',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'requestedOn',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
        },
      },
      {
        name: 'requestorEmail',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'requestorName',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'requestorPhone',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Reminder',
    fields: [
      {
        name: 'dueDate',
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
      {
        name: 'overdue',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'topic',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'ReminderTopic', ofType: null },
        },
      },
    ],
  },
  {
    name: 'Service',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateProvided',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'faAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
      },
      {
        name: 'faEndDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'faStartDate',
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
    name: 'ServiceCategory',
    fields: [
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'hud',
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
    name: 'ServiceType',
    fields: [
      {
        name: 'category',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      {
        name: 'dateCreated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'hud',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Boolean', ofType: null },
        },
      },
      {
        name: 'hudRecordType',
        type: { kind: 'ENUM', name: 'RecordType', ofType: null },
      },
      {
        name: 'hudTypeProvided',
        type: { kind: 'ENUM', name: 'ServiceTypeProvided', ofType: null },
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
    name: 'Unit',
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
      { name: 'unitSize', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
    ],
  },
  {
    name: 'UnitTypeCapacity',
    fields: [
      {
        name: 'availability',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'capacity',
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
        name: 'unitType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'UnitTypeObject',
    fields: [
      {
        name: 'bedType',
        type: { kind: 'ENUM', name: 'InventoryBedType', ofType: null },
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
      { name: 'unitSize', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
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
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
      { name: 'offset', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
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
    name: 'YouthEducationStatus',
    fields: [
      {
        name: 'currentEdStatus',
        type: { kind: 'ENUM', name: 'CurrentEdStatus', ofType: null },
      },
      {
        name: 'currentSchoolAttend',
        type: { kind: 'ENUM', name: 'CurrentSchoolAttended', ofType: null },
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
        name: 'dateDeleted',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
      },
      {
        name: 'dateUpdated',
        type: { kind: 'SCALAR', name: 'ISO8601DateTime', ofType: null },
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
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'mostRecentEdStatus',
        type: { kind: 'ENUM', name: 'MostRecentEdStatus', ofType: null },
      },
    ],
  },
];

// Partial schema introspection for input object types.
export const HmisInputObjectSchemas: GqlInputObjectSchema[] = [
  {
    name: 'AddRecentItemInput',
    args: [
      {
        name: 'itemId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'itemType',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'RecentItemType', ofType: null },
        },
      },
    ],
  },
  {
    name: 'ApplicationUserFilterOptions',
    args: [
      {
        name: 'searchTerm',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'AssessmentFilterOptions',
    args: [
      {
        name: 'project',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'projectType',
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
        name: 'type',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'AssessmentRole', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'AssessmentInput',
    args: [
      {
        name: 'assessmentId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'confirmed',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'enrollmentId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'formDefinitionId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'hudValues',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
        },
      },
      {
        name: 'validateOnly',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'values',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
        },
      },
    ],
  },
  {
    name: 'AssessmentsForEnrollmentFilterOptions',
    args: [
      {
        name: 'type',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'AssessmentRole', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'AssessmentsForHouseholdFilterOptions',
    args: [
      {
        name: 'type',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'AssessmentRole', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'AutoExitConfigInput',
    args: [
      {
        name: 'lengthOfAbsenceDays',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'organizationId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'projectType',
        type: { kind: 'ENUM', name: 'ProjectType', ofType: null },
      },
    ],
  },
  {
    name: 'BaseAuditEventFilterOptions',
    args: [
      {
        name: 'auditEventRecordType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'user',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'BulkMergeClientsInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'INPUT_OBJECT',
                name: 'ClientMergeInput',
                ofType: null,
              },
            },
          },
        },
      },
    ],
  },
  {
    name: 'ClearMciInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'INPUT_OBJECT',
            name: 'MciClearanceInput',
            ofType: null,
          },
        },
      },
    ],
  },
  { name: 'ClearRecentItemsInput', args: [] },
  {
    name: 'ClientFilterOptions',
    args: [
      {
        name: 'organization',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'project',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'ClientMergeInput',
    args: [
      {
        name: 'clientIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
    ],
  },
  {
    name: 'ClientSearchInput',
    args: [
      { name: 'dob', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'firstName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'id', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'lastName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'organizations',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'personalId',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'projects',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'ssnSerial',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'textSearch',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'warehouseId',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'CreateDirectUploadInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'INPUT_OBJECT',
            name: 'DirectUploadInput',
            ofType: null,
          },
        },
      },
    ],
  },
  {
    name: 'CreateFormRuleInput',
    args: [
      {
        name: 'definitionId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'INPUT_OBJECT', name: 'FormRuleInput', ofType: null },
        },
      },
    ],
  },
  {
    name: 'CreateServiceInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'INPUT_OBJECT', name: 'ServiceInput', ofType: null },
        },
      },
    ],
  },
  {
    name: 'CreateUnitsInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'INPUT_OBJECT', name: 'UnitInput', ofType: null },
        },
      },
    ],
  },
  {
    name: 'DeleteAssessmentInput',
    args: [
      {
        name: 'assessmentLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
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
    name: 'DeleteCeAssessmentInput',
    args: [
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
    name: 'DeleteCeEventInput',
    args: [
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
    name: 'DeleteCeParticipationInput',
    args: [
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
    name: 'DeleteClientFileInput',
    args: [
      {
        name: 'fileId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'DeleteClientImageInput',
    args: [
      {
        name: 'clientId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'DeleteClientInput',
    args: [
      {
        name: 'clientLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'confirmed',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
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
    name: 'DeleteCurrentLivingSituationInput',
    args: [
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
    name: 'DeleteEnrollmentInput',
    args: [
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
    name: 'DeleteFunderInput',
    args: [
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
    name: 'DeleteHmisParticipationInput',
    args: [
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
    name: 'DeleteInventoryInput',
    args: [
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
    name: 'DeleteOrganizationInput',
    args: [
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
    name: 'DeleteProjectCocInput',
    args: [
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
    name: 'DeleteProjectInput',
    args: [
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
    name: 'DeleteServiceInput',
    args: [
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
    name: 'DeleteUnitsInput',
    args: [
      {
        name: 'unitIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
    ],
  },
  {
    name: 'DirectUploadInput',
    args: [
      {
        name: 'byteSize',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'Int', ofType: null },
        },
      },
      {
        name: 'checksum',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
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
        name: 'filename',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'String', ofType: null },
        },
      },
    ],
  },
  {
    name: 'EnrollmentsForClientFilterOptions',
    args: [
      {
        name: 'householdTasks',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'EnrollmentFilterOptionHouseholdTask',
              ofType: null,
            },
          },
        },
      },
      {
        name: 'openOnDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'projectType',
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
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'EnrollmentFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
    ],
  },
  {
    name: 'EnrollmentsForProjectFilterOptions',
    args: [
      {
        name: 'bedNightOnDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'householdTasks',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'EnrollmentFilterOptionHouseholdTask',
              ofType: null,
            },
          },
        },
      },
      {
        name: 'openOnDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'searchTerm',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'EnrollmentFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
    ],
  },
  {
    name: 'FormInput',
    args: [
      { name: 'clientId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'confirmed',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'enrollmentId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'formDefinitionId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'hudValues',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
      {
        name: 'organizationId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      { name: 'recordId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'serviceTypeId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'values',
        type: { kind: 'SCALAR', name: 'JsonObject', ofType: null },
      },
    ],
  },
  {
    name: 'FormRuleFilterOptions',
    args: [
      {
        name: 'activeStatus',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'ActiveStatus', ofType: null },
          },
        },
      },
      {
        name: 'appliedToProject',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'definition',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'formType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'FormRole', ofType: null },
          },
        },
      },
      {
        name: 'projectType',
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
        name: 'systemForm',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'SystemStatus', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'FormRuleInput',
    args: [
      {
        name: 'activeStatus',
        type: { kind: 'ENUM', name: 'ActiveStatus', ofType: null },
      },
      {
        name: 'dataCollectedAbout',
        type: { kind: 'ENUM', name: 'DataCollectedAbout', ofType: null },
      },
      {
        name: 'funder',
        type: { kind: 'ENUM', name: 'FundingSource', ofType: null },
      },
      {
        name: 'organizationId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'otherFunder',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'projectType',
        type: { kind: 'ENUM', name: 'ProjectType', ofType: null },
      },
    ],
  },
  {
    name: 'HouseholdFilterOptions',
    args: [
      {
        name: 'hohAgeRange',
        type: { kind: 'ENUM', name: 'AgeRange', ofType: null },
      },
      {
        name: 'openOnDate',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'searchTerm',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'EnrollmentFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
    ],
  },
  {
    name: 'MciClearanceInput',
    args: [
      {
        name: 'dob',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
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
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'ENUM', name: 'Gender', ofType: null },
          },
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
        name: 'middleName',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      { name: 'ssn', type: { kind: 'SCALAR', name: 'String', ofType: null } },
    ],
  },
  {
    name: 'MergeClientsInput',
    args: [
      {
        name: 'clientIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
    ],
  },
  {
    name: 'OutgoingReferralPostingInput',
    args: [
      {
        name: 'enrollmentId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      { name: 'note', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      { name: 'projectId', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'unitTypeId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
    ],
  },
  {
    name: 'ProjectFilterOptions',
    args: [
      {
        name: 'funder',
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
        name: 'organization',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'projectType',
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
        name: 'searchTerm',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'ProjectFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
    ],
  },
  {
    name: 'ProjectsForEnrollmentFilterOptions',
    args: [
      {
        name: 'funder',
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
        name: 'projectType',
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
        name: 'searchTerm',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'ProjectFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
    ],
  },
  {
    name: 'ReferralPostingInput',
    args: [
      {
        name: 'denialNote',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'denialReason',
        type: {
          kind: 'ENUM',
          name: 'ReferralPostingDenialReasonType',
          ofType: null,
        },
      },
      {
        name: 'referralResult',
        type: { kind: 'ENUM', name: 'ReferralResult', ofType: null },
      },
      {
        name: 'resendReferralRequest',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      { name: 'status', type: { kind: 'SCALAR', name: 'ID', ofType: null } },
      {
        name: 'statusNote',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
    ],
  },
  {
    name: 'SaveAssessmentInput',
    args: [
      {
        name: 'assessmentLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'INPUT_OBJECT',
            name: 'AssessmentInput',
            ofType: null,
          },
        },
      },
    ],
  },
  {
    name: 'ServiceFilterOptions',
    args: [
      {
        name: 'dateProvided',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'project',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'projectType',
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
        name: 'serviceCategory',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'serviceType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'ServiceInput',
    args: [
      {
        name: 'dateProvided',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'enrollmentId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
      {
        name: 'faAmount',
        type: { kind: 'SCALAR', name: 'Float', ofType: null },
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
    name: 'ServicesForEnrollmentFilterOptions',
    args: [
      {
        name: 'dateProvided',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'serviceCategory',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'serviceType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'ServicesForProjectFilterOptions',
    args: [
      {
        name: 'dateProvided',
        type: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
      },
      {
        name: 'serviceCategory',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
      {
        name: 'serviceType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'SubmitAssessmentInput',
    args: [
      {
        name: 'assessmentLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'INPUT_OBJECT',
            name: 'AssessmentInput',
            ofType: null,
          },
        },
      },
    ],
  },
  {
    name: 'SubmitFormInput',
    args: [
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'INPUT_OBJECT', name: 'FormInput', ofType: null },
        },
      },
      {
        name: 'recordLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
  {
    name: 'SubmitHouseholdAssessmentsInput',
    args: [
      {
        name: 'confirmed',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'submissions',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: {
                kind: 'INPUT_OBJECT',
                name: 'VersionedRecordInput',
                ofType: null,
              },
            },
          },
        },
      },
      {
        name: 'validateOnly',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
    ],
  },
  {
    name: 'UnitFilterOptions',
    args: [
      {
        name: 'status',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'ENUM',
              name: 'UnitFilterOptionStatus',
              ofType: null,
            },
          },
        },
      },
      {
        name: 'unitType',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
          },
        },
      },
    ],
  },
  {
    name: 'UnitInput',
    args: [
      { name: 'count', type: { kind: 'SCALAR', name: 'Int', ofType: null } },
      {
        name: 'prefix',
        type: { kind: 'SCALAR', name: 'String', ofType: null },
      },
      {
        name: 'projectId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'unitTypeId',
        type: { kind: 'SCALAR', name: 'ID', ofType: null },
      },
    ],
  },
  {
    name: 'UpdateBedNightsInput',
    args: [
      {
        name: 'action',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'ENUM', name: 'BulkActionType', ofType: null },
        },
      },
      {
        name: 'bedNightDate',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ISO8601Date', ofType: null },
        },
      },
      {
        name: 'enrollmentIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
      {
        name: 'projectId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'UpdateClientImageInput',
    args: [
      {
        name: 'clientId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'imageBlobId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
    ],
  },
  {
    name: 'UpdateFormRuleInput',
    args: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'input',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'INPUT_OBJECT', name: 'FormRuleInput', ofType: null },
        },
      },
    ],
  },
  {
    name: 'UpdateRelationshipToHoHInput',
    args: [
      {
        name: 'confirmed',
        type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
      },
      {
        name: 'enrollmentId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'enrollmentLockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
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
    name: 'UpdateUnitsInput',
    args: [
      { name: 'name', type: { kind: 'SCALAR', name: 'String', ofType: null } },
      {
        name: 'projectId',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'unitIds',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: {
            kind: 'LIST',
            name: null,
            ofType: {
              kind: 'NON_NULL',
              name: null,
              ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
            },
          },
        },
      },
    ],
  },
  {
    name: 'VersionedRecordInput',
    args: [
      {
        name: 'id',
        type: {
          kind: 'NON_NULL',
          name: null,
          ofType: { kind: 'SCALAR', name: 'ID', ofType: null },
        },
      },
      {
        name: 'lockVersion',
        type: { kind: 'SCALAR', name: 'Int', ofType: null },
      },
    ],
  },
];
