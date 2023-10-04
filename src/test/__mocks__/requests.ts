import MOCK_IMAGE from '@/components/elements/upload/MOCK_IMAGE';
import {
  CreateDirectUploadMutationDocument,
  DobDataQuality,
  Gender,
  GetClientDocument,
  GetClientEnrollmentsDocument,
  GetClientImageDocument,
  GetClientPermissionsDocument,
  GetEnrollmentWithHouseholdDocument,
  GetFileDocument,
  GetPickListDocument,
  NameDataQuality,
  NoYesReasonsForMissingData,
  PickListOption,
  Race,
  RelationshipToHoH,
  SearchClientsDocument,
  SsnDataQuality,
} from '@/types/gqlTypes';

const CLIENT_ACCESS_MOCK = {
  id: '9999:1',
  canEditClient: true,
  canDeleteClient: true,
  canViewDob: true,
  canViewFullSsn: true,
  canViewPartialSsn: true,
  canEditEnrollments: true,
  canDeleteEnrollments: true,
  canViewEnrollmentDetails: true,
  canDeleteAssessments: true,
  canManageAnyClientFiles: true,
  canManageOwnClientFiles: true,
  canViewAnyConfidentialClientFiles: true,
  canViewAnyNonconfidentialClientFiles: true,
};

export const RITA_ACKROYD = {
  __typename: 'Client',
  id: '9999',
  personalId: '9999',
  ssn: '0001',
  firstName: 'Rita',
  lastName: 'Ackroyd',
  dob: '1980-03-20',
  age: 43,
  nameSuffix: null,
  access: CLIENT_ACCESS_MOCK,
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
  externalIds: [
    {
      id: 'client_id:999',
      identifier: '999',
      url: null,
      type: 'CLIENT_ID',
      label: 'Client ID',
      __typename: 'ExternalIdentifier',
    },
    {
      id: 'personal_id:999',
      identifier: '9999',
      url: null,
      label: 'Personal ID',
      type: 'PERSONAL_ID',
      __typename: 'ExternalIdentifier',
    },
    {
      id: 'warehouse_id:999',
      identifier: '9999',
      url: 'https://hmis-warehouse.dev.test/clients/999/from_source',
      type: 'WAREHOUSE_ID',
      label: 'Warehouse ID',
      __typename: 'ExternalIdentifier',
    },
  ],
  enrollments: {
    nodesCount: 5,
    offset: 0,
    limit: 10,
    nodes: [
      {
        __typename: 'Enrollment',
        id: '5',
        entryDate: '2022-06-18',
        exitDate: null,
        householdSize: 1,
        project: { projectName: 'White Pine' },
      },
      {
        __typename: 'Enrollment',
        id: '6',
        entryDate: '2021-02-10',
        exitDate: '2021-02-10',
        project: { projectName: 'Spruce Hill' },
      },
      {
        __typename: 'Enrollment',
        id: '7',
        entryDate: '2013-02-10',
        exitDate: '2013-02-10',
        project: { projectName: 'White Pine Terrace' },
      },
      {
        __typename: 'Enrollment',
        id: '8',
        entryDate: '2013-02-10',
        exitDate: '2013-02-10',
        project: { projectName: 'White Pine' },
      },
      {
        __typename: 'Enrollment',
        id: '9',
        entryDate: '2013-02-10',
        exitDate: '2013-02-10',
        project: { projectName: 'White Pine' },
      },
    ],
  },
};

export const RITA_ACKROYD_WITHOUT_ENROLLMENTS = {
  ...RITA_ACKROYD,
  id: '9998',
  enrollments: [],
};

const projectsForSelectMock = {
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
        return p;
      }),
    },
  },
};

const clientSearchMock = {
  request: {
    query: SearchClientsDocument,
    variables: {
      offset: 0,
      input: { textSearch: 'ack' },
      limit: 3,
    },
  },
  result: {
    data: {
      offset: 0,
      limit: 3,
      hasMoreAfter: true,
      hasMoreBefore: false,
      nodesCount: 4,
      pagesCount: 2,
      nodes: [
        RITA_ACKROYD,
        {
          id: '9998',
          personalId: '9999',
          ssnSerial: '0002',
          firstName: 'Lennart',
          lastName: 'Acker',
          dob: '1980-03-20',
          dateUpdated: '2022-07-27T15:14:29.062',
        },
        {
          id: '9997',
          personalId: '9999',
          ssnSerial: '0003',
          firstName: 'Jane',
          lastName: 'Ackman',
          dob: '1980-03-20',
          dateUpdated: '2022-07-27T15:14:29.062',
        },
      ],
    },
  },
};

const clientSearchMockNextPage = {
  request: {
    query: SearchClientsDocument,
    variables: {
      input: { textSearch: 'ack' },
      limit: 3,
      offset: 3,
    },
  },
  result: {
    data: {
      offset: 4,
      limit: 3,
      hasMoreAfter: true,
      hasMoreBefore: false,
      nodesCount: 4,
      pagesCount: 2,
      nodes: [
        {
          id: '9996',
          personalId: '9999',
          ssnSerial: '0004',
          firstName: 'Rita',
          lastName: 'Acker',
          dob: '1980-03-20',
          enrollments: null,
          dateUpdated: '2022-07-27T15:14:29.062',
        },
      ],
    },
  },
};

const clientLookupMock = {
  request: {
    query: GetClientDocument,
    variables: {
      id: '9999',
    },
  },
  result: {
    data: {
      client: RITA_ACKROYD,
    },
  },
};

const clientImageLookupMock = {
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
      },
    },
  },
};

const clientWithEnrollmentsMock = {
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

const clientWithoutEnrollmentsMock = {
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

const enrollmentWithHoHMock = {
  request: {
    query: GetEnrollmentWithHouseholdDocument,
    variables: {
      id: '5',
    },
  },
  result: {
    data: {
      enrollment: {
        __typename: 'Enrollment',
        id: '5',
        entryDate: '2022-06-18',
        exitDate: null,
        project: { label: 'White Pine' },
        household: {
          id: '123',
          __typename: 'Household',
          householdClients: [
            {
              __typename: 'HouseholdClient',
              id: RITA_ACKROYD.id,
              relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
              client: RITA_ACKROYD,
              enrollment: {
                __typename: 'Enrollment',
                id: '5',
                entryDate: '2022-06-18',
                exitDate: null,
              },
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
              },
              enrollment: {
                __typename: 'Enrollment',
                id: '4',
                entryDate: '2022-06-15',
                exitDate: '2022-08-15',
              },
            },
          ],
        },
      },
    },
  },
};

const createDirectUploadMock = {
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

const getFileMock = {
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

const getClientPermissionMocks = {
  request: {
    query: GetClientPermissionsDocument,
    variables: {
      id: RITA_ACKROYD.id,
    },
  },
  result: {
    data: {
      client: {
        id: RITA_ACKROYD.id,
        access: CLIENT_ACCESS_MOCK,
      },
    },
  },
};
const mocks: any[] = [
  projectsForSelectMock,
  clientSearchMock,
  clientSearchMockNextPage,
  clientLookupMock,
  clientImageLookupMock,
  clientImageLookupMock,
  clientWithEnrollmentsMock,
  clientWithEnrollmentsMock,
  clientWithEnrollmentsMock,
  clientWithEnrollmentsMock,
  clientWithEnrollmentsMock,
  clientWithEnrollmentsMock,
  clientWithoutEnrollmentsMock,
  enrollmentWithHoHMock,
  createDirectUploadMock,
  getFileMock,
  getClientPermissionMocks,
  getClientPermissionMocks,
  getClientPermissionMocks,
];

export default mocks;
