import { v4 } from 'uuid';
import MOCK_IMAGE from '@/components/elements/upload/MOCK_IMAGE';
import { HmisEnums } from '@/types/gqlEnums';
import { HmisObjectSchemas } from '@/types/gqlObjects';
import {
  ClientAccess,
  ClientDetailFormsDocument,
  CreateDirectUploadMutationDocument,
  DobDataQuality,
  EnrollmentAccess,
  ExternalIdentifierType,
  Gender,
  GetClientEnrollmentsDocument,
  GetClientImageDocument,
  GetClientPermissionsDocument,
  GetEnrollmentGeolocationsDocument,
  GetEnrollmentWithHouseholdDocument,
  GetFileDocument,
  GetPickListDocument,
  GetProjectHouseholdsDocument,
  GetRootPermissionsDocument,
  NameDataQuality,
  NoYesReasonsForMissingData,
  PickListOption,
  ProjectAccess,
  ProjectType,
  Race,
  RelationshipToHoH,
  SsnDataQuality,
  UserFieldsFragment,
} from '@/types/gqlTypes';

/**
 * Mocked requests to use with Apollo MockedProvider in Storybook stories
 */

const clientAccessMock = {
  ...Object.fromEntries(
    HmisObjectSchemas.find((obj) => obj.name === 'ClientAccess')?.fields.map(
      (f) => [f.name, true]
    ) || []
  ),
  id: '9999:1', // <client id>:<user id>
} as ClientAccess;

const rootAccessMock = {
  ...Object.fromEntries(
    HmisObjectSchemas.find((obj) => obj.name === 'QueryAccess')?.fields.map(
      (f) => [f.name, true]
    ) || []
  ),
  id: '1', // user id
} as ClientAccess;

const enrollmentAccessMock = {
  ...Object.fromEntries(
    HmisObjectSchemas.find(
      (obj) => obj.name === 'EnrollmentAccess'
    )?.fields.map((f) => [f.name, true]) || []
  ),
  id: '9999:1', // <enrollment id>:<user id>
} as EnrollmentAccess;

const projectAccessMock = {
  ...Object.fromEntries(
    HmisObjectSchemas.find((obj) => obj.name === 'ProjectAccess')?.fields.map(
      (f) => [f.name, true]
    ) || []
  ),
  id: 'X:1', // <project id>:<user id>
} as ProjectAccess;

export const applicationUserMock: UserFieldsFragment = {
  __typename: 'ApplicationUser',
  id: '1',
  name: 'Provider User',
  firstName: 'Provider',
  lastName: 'User',
  email: 'fake@email.org',
};

export const fakeEnrollment = () => {
  return {
    __typename: 'Enrollment',
    id: v4(),
    relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
    inProgress: false,
    entryDate: '2022-06-18',
    exitDate: null,
    access: enrollmentAccessMock,
    householdSize: 1,
    projectName: 'White Pine',
    projectType: ProjectType.EsNbn,
    organizationName: 'Blue Hills Organization',
    lastBedNightDate: '2022-06-18',
    moveInDate: null,
    lockVersion: 1,
    autoExited: false,
    project: {
      id: '1',
      projectName: 'White Pine',
      projectType: ProjectType.EsNbn,
    },
  };
};

export const RITA_ACKROYD = {
  __typename: 'Client',
  id: '9999',
  lockVersion: 1,
  personalId: '9999',
  ssn: '0001',
  firstName: 'Rita',
  lastName: 'Ackroyd',
  dob: '1980-03-20',
  age: 43,
  nameSuffix: null,
  access: clientAccessMock,
  customDataElements: [],
  names: [],
  addresses: [],
  contactPoints: [],
  phoneNumbers: [],
  emailAddresses: [],
  gender: [Gender.Man, Gender.NonBinary],
  race: [Race.ClientPrefersNotToAnswer],
  dobDataQuality: DobDataQuality.ApproximateOrPartialDobReported,
  nameDataQuality: NameDataQuality.FullNameReported,
  ssnDataQuality: SsnDataQuality.ApproximateOrPartialSsnReported,
  veteranStatus: NoYesReasonsForMissingData.ClientPrefersNotToAnswer,
  dateUpdated: '2022-07-27T15:14:29.062',
  dateCreated: '2022-07-27T15:14:29.062',
  pronouns: ['she/hers'],
  enabledFeatures: Object.keys(HmisEnums.ClientDashboardFeature),
  externalIds: [
    {
      id: 'client_id:999',
      identifier: '999',
      url: null,
      type: ExternalIdentifierType.ClientId,
      label: 'Client ID',
      __typename: 'ExternalIdentifier',
    },
    {
      id: 'personal_id:999',
      identifier: '9999',
      url: null,
      label: 'Personal ID',
      type: ExternalIdentifierType.PersonalId,
      __typename: 'ExternalIdentifier',
    },
    {
      id: 'warehouse_id:999',
      identifier: '9999',
      url: 'https://hmis-warehouse.dev.test/clients/999/from_source',
      type: ExternalIdentifierType.WarehouseId,
      label: 'Warehouse ID',
      __typename: 'ExternalIdentifier',
    },
  ],
  enrollments: {
    nodesCount: 5,
    offset: 0,
    limit: 10,
    nodes: [fakeEnrollment(), fakeEnrollment(), fakeEnrollment()],
  },
  alerts: [],
};

export const fakeClient = () => ({
  ...RITA_ACKROYD,
  id: v4(),
});
export const fakeProject = () => ({
  id: v4(),
  __typename: 'Project',
  projectName: 'White Pine',
  projectType: ProjectType.EsNbn,
  access: projectAccessMock,
});

export const fakeHousehold = () => ({
  id: v4(),
  __typename: 'Household',
  householdId: v4(),
  householdSize: 2,
  shortId: 'ABC',
  householdClients: [
    {
      __typename: 'HouseholdClient',
      id: RITA_ACKROYD.id,
      relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
      client: RITA_ACKROYD,
      enrollment: { ...fakeEnrollment(), id: '5', __typename: 'Enrollment' },
    },
    {
      __typename: 'HouseholdClient',
      id: '9998',
      relationshipToHoH: RelationshipToHoH.OtherRelative,
      client: {
        __typename: 'Client',
        id: '9998',
        firstName: 'Lennart',
        lastName: 'Acker',
        nameSuffix: null,
        dob: '1990-03-20',
        age: 35,
      },
      enrollment: {
        ...fakeEnrollment(),
        relationshipToHoH: RelationshipToHoH.OtherRelative,
      },
    },
  ],
});

export const RITA_ACKROYD_WITHOUT_ENROLLMENTS = {
  ...RITA_ACKROYD,
  id: '9998',
  enrollments: [],
};

export const AMERICAN_LAKE_HOUSE = {
  id: '441',
  staffAssignmentsEnabled: true,
  // TODO: flesh out project mock
};

export const getProjectHouseholdsMock = {
  request: {
    query: GetProjectHouseholdsDocument,
    variables: {
      limit: 25,
      offset: 0,
      includeStaffAssignment: false,
      id: undefined,
      filters: { searchTerm: undefined },
      openOnDate: undefined,
      sortOrder: 'MOST_RECENT',
    },
  },
  result: {
    data: {
      project: {
        households: {
          offset: 0,
          limit: 25,
          nodesCount: 2,
          nodes: [
            {
              id: '1',
              householdSize: 1,
              householdClients: [
                {
                  id: '35871:8678',
                  relationshipToHoH: 'SELF_HEAD_OF_HOUSEHOLD',
                  client: {
                    ...RITA_ACKROYD,
                  },
                  enrollment: fakeEnrollment(),
                },
              ],
            },
            {
              id: '2',
              householdSize: 4,
              householdClients: [
                {
                  id: '1:1',
                  relationshipToHoH: 'SELF_HEAD_OF_HOUSEHOLD',
                  client: {
                    ...RITA_ACKROYD,
                    firstName: 'Elmer',
                    lastName: 'Smith',
                  },
                  enrollment: fakeEnrollment(),
                },
                {
                  id: '1:2',
                  relationshipToHoH: 'SPOUSE_OR_PARTNER',
                  client: {
                    ...RITA_ACKROYD,
                    firstName: 'Ryan',
                    lastName: 'Smith',
                  },
                  enrollment: fakeEnrollment(),
                },
              ],
            },
          ],
        },
      },
    },
  },
};

export const projectsForSelectMock = {
  request: {
    query: GetPickListDocument,
    variables: {
      pickListType: 'PROJECT',
    },
  },
  result: {
    data: {
      pickList: [
        {
          label: 'White Ash Center',
          code: '116',
          secondaryLabel: 'ES',
          groupLabel: 'Hawthorne Home',
        },
        {
          label: 'Eastern Hemlock Lake',
          code: '118',
          secondaryLabel: 'ES',
          groupLabel: 'Hawthorne Home',
        },
        {
          label: 'Scarlet Oak Creek',
          code: '127',
          secondaryLabel: 'RRH',

          groupLabel: 'Hawthorne Home',
        },
        {
          label: 'White Spruce Hill',
          code: '37518',
          secondaryLabel: 'SO',

          groupLabel: 'Hawthorne Home',
        },
        {
          label: 'The Maples Room',
          code: '37612',
          secondaryLabel: 'ES',
          groupLabel: 'American Chestnut Home',
        },
        {
          label: 'Paper Birch Room',
          code: '428',
          secondaryLabel: 'PH',
          groupLabel: 'American Chestnut Home',
        },
        {
          label: 'Paper Birch Lake',
          code: '433',
          secondaryLabel: 'ES',
          groupLabel: 'American Chestnut Home',
        },
      ].map((p: PickListOption) => {
        p.__typename = 'PickListOption';
        p.initialSelected = false;
        p.groupCode = null;
        p.helperText = null;
        p.numericValue = null;
        return p;
      }),
    },
  },
};

export const getEnrollmentGeolocationsMock = {
  request: {
    query: GetEnrollmentGeolocationsDocument,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      enrollment: {
        id: '1',
        geolocations: [
          {
            id: '15',
            __typename: 'Geolocation',
            coordinates: {
              __typename: 'GeolocationCoordinates',
              id: '15',
              latitude: '42.355560',
              longitude: '-71.067285',
            },
            locatedAt: '2024-12-13T11:53:37-05:00',
            sourceFormName: 'Street Outreach Assessment',
            collectedBy: applicationUserMock,
          },
          {
            __typename: 'Geolocation',
            id: '14',
            coordinates: {
              __typename: 'GeolocationCoordinates',
              id: '14',
              latitude: '42.355060',
              longitude: '-71.063485',
            },
            locatedAt: '2024-12-13T11:53:28-05:00',
            sourceFormName: 'Current Living Situation',
            collectedBy: applicationUserMock,
          },
          {
            __typename: 'Geolocation',
            id: '13',
            coordinates: {
              __typename: 'GeolocationCoordinates',
              id: '13',
              latitude: '42.355960',
              longitude: '-71.067485',
            },
            locatedAt: '2024-12-13T11:53:14-05:00',
            sourceFormName: 'Current Living Situation',
            collectedBy: applicationUserMock,
          },
        ],
      },
    },
  },
};
// Not used-- keeping around in case we add a storybook story with client search?
// const clientSearchMock = {
//   request: {
//     query: SearchClientsDocument,
//     variables: {
//       offset: 0,
//       input: { textSearch: 'ack' },
//       limit: 3,
//     },
//   },
//   result: {
//     data: {
//       offset: 0,
//       limit: 3,
//       hasMoreAfter: true,
//       hasMoreBefore: false,
//       nodesCount: 4,
//       pagesCount: 2,
//       nodes: [
//         RITA_ACKROYD,
//         {
//           id: '9998',
//           personalId: '9999',
//           ssnSerial: '0002',
//           firstName: 'Lennart',
//           lastName: 'Acker',
//           dob: '1980-03-20',
//           dateUpdated: '2022-07-27T15:14:29.062',
//         },
//         {
//           id: '9997',
//           personalId: '9999',
//           ssnSerial: '0003',
//           firstName: 'Jane',
//           lastName: 'Ackman',
//           dob: '1980-03-20',
//           dateUpdated: '2022-07-27T15:14:29.062',
//         },
//       ],
//     },
//   },
// };

// const clientSearchMockNextPage = {
//   request: {
//     query: SearchClientsDocument,
//     variables: {
//       input: { textSearch: 'ack' },
//       limit: 3,
//       offset: 3,
//     },
//   },
//   result: {
//     data: {
//       offset: 4,
//       limit: 3,
//       hasMoreAfter: true,
//       hasMoreBefore: false,
//       nodesCount: 4,
//       pagesCount: 2,
//       nodes: [
//         {
//           id: '9996',
//           personalId: '9999',
//           ssnSerial: '0004',
//           firstName: 'Rita',
//           lastName: 'Acker',
//           dob: '1980-03-20',
//           enrollments: null,
//           dateUpdated: '2022-07-27T15:14:29.062',
//         },
//       ],
//     },
//   },
// };

// const clientLookupMock = {
//   request: {
//     query: GetClientDocument,
//     variables: {
//       id: '9999',
//     },
//   },
//   result: {
//     data: {
//       client: RITA_ACKROYD,
//     },
//   },
// };

export const clientImageLookupMock = {
  request: {
    query: GetClientImageDocument,
    variables: {
      id: '9999',
    },
  },
  result: {
    data: {
      client: {
        __typename: 'Client',
        id: '9999',
        image: {
          __typename: 'ClientImage',
          id: 1,
          contentType: 'image/jpeg',
          base64: MOCK_IMAGE,
        },
        access: {
          canEditClient: true,
          canViewClientPhoto: true,
        },
      },
    },
  },
};

export const clientWithEnrollmentsMock = {
  request: {
    query: GetClientEnrollmentsDocument,
    variables: {
      id: '9999',
      limit: 10,
      offset: 0,
    },
  },
  result: {
    data: {
      client: RITA_ACKROYD,
    },
  },
};

export const clientWithoutEnrollmentsMock = {
  request: {
    query: GetClientEnrollmentsDocument,
    variables: {
      id: '9998',
      limit: 10,
      offset: 0,
    },
  },
  result: {
    data: {
      client: RITA_ACKROYD_WITHOUT_ENROLLMENTS,
    },
  },
};

export const enrollmentWithHoHMock = {
  request: {
    query: GetEnrollmentWithHouseholdDocument,
    variables: { id: '5' },
  },
  result: {
    data: {
      enrollment: {
        ...fakeEnrollment(),
        householdSize: 2,
        household: fakeHousehold(),
      },
    },
  },
};

export const createDirectUploadMock = {
  request: {
    query: CreateDirectUploadMutationDocument,
    variables: {
      input: {
        checksum: 'upfCZclwF7d84KD6gbjppQ==',
        filename: 'image.jpeg',
        contentType: 'image/jpeg',
        byteSize: 467145,
      },
    },
  },
  result: {
    data: {
      createDirectUpload: {
        __typename: 'DirectUpload',
        filename: 'image.json',
        headers: '{}',
        url: 'http://example.com',
        blobId: '1',
        signedBlobId: '1',
      },
    },
  },
};

export const getFileMock = {
  request: {
    query: GetFileDocument,
    variables: {
      id: '9999',
    },
  },
  result: {
    data: {
      file: {
        __typename: 'File',
        confidential: false,
        contentType: 'image/jpeg',
        createdAt: '2023-04-06T12:03:06-04:00',
        effectiveDate: null,
        expirationDate: null,
        id: '9999',
        name: 'image.jpeg',
        fileBlobId: '150',
        updatedAt: '2023-04-06T12:07:51-04:00',
        url: MOCK_IMAGE,
        tags: ['15'],
        ownFile: false,
        enrollmentId: null,
        enrollment: null,
        updatedBy: {
          id: '1',
          name: 'Some User',
        },
      },
    },
  },
};

export const getClientPermissionMocks = {
  request: {
    query: GetClientPermissionsDocument,
    variables: {
      id: RITA_ACKROYD.id,
    },
  },
  result: {
    data: {
      client: {
        __typename: 'Client',
        id: RITA_ACKROYD.id,
        access: clientAccessMock,
      },
    },
  },
};

export const clientDetailFormsMock = {
  request: {
    query: ClientDetailFormsDocument,
    variables: {},
  },
  result: {
    data: {},
  },
};

export const getRootPermissionsMock = {
  request: {
    query: GetRootPermissionsDocument,
    variables: {},
  },
  result: {
    data: {
      access: rootAccessMock,
    },
  },
};
