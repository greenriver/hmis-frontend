import {
  GetClientDocument,
  SearchClientsDocument,
  GetProjectsForSelectDocument,
  GetEnrollmentWithHoHDocument,
} from '@/types/gqlTypes';

export const RITA_ACKROYD = {
  __typename: 'Client',
  id: '9999',
  personalId: '9999',
  ssnSerial: '0001',
  firstName: 'Rita',
  preferredName: null,
  lastName: 'Ackroyd',
  dob: '1980-03-20',
  nameSuffix: null,
  dateUpdated: '2022-07-27T15:14:29.062',
  enrollments: {
    nodesCount: 5,
    offset: 0,
    limit: 10,
    nodes: [
      {
        __typename: 'Enrollment',
        id: '5',
        entryDate: '2022-06-18T00:00:00+00:00',
        exitDate: null,
        project: { projectName: 'White Pine' },
      },
      {
        __typename: 'Enrollment',
        id: '6',
        entryDate: '2021-02-10T00:00:00+00:00',
        exitDate: '2021-02-10T00:00:00+00:00',
        project: { projectName: 'Spruce Hill' },
      },
      {
        __typename: 'Enrollment',
        id: '7',
        entryDate: '2013-02-10T00:00:00+00:00',
        exitDate: '2013-02-10T00:00:00+00:00',
        project: { projectName: 'White Pine Terrace' },
      },
      {
        __typename: 'Enrollment',
        id: '8',
        entryDate: '2013-02-10T00:00:00+00:00',
        exitDate: '2013-02-10T00:00:00+00:00',
        project: { projectName: 'White Pine' },
      },
      {
        __typename: 'Enrollment',
        id: '9',
        entryDate: '2013-02-10T00:00:00+00:00',
        exitDate: '2013-02-10T00:00:00+00:00',
        project: { projectName: 'White Pine' },
      },
    ],
  },
};

const projectsForSelectMock = {
  request: {
    query: GetProjectsForSelectDocument,
  },
  result: {
    data: {
      projects: [
        {
          __typename: 'Project',
          projectName: 'White Ash Center',
          id: '116',
          projectType: 'ES',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'Eastern Hemlock Lake',
          id: '118',
          projectType: 'ES',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'Scarlet Oak Creek',
          id: '127',
          projectType: 'RRH',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'White Spruce Hill',
          id: '37518',
          projectType: 'SO',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'The Maples Room',
          id: '37612',
          projectType: 'ES',
          organization: {
            organizationName: 'American Chestnut Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'Paper Birch Room',
          id: '428',
          projectType: 'PH',
          organization: {
            organizationName: 'American Chestnut Home',
          },
        },
        {
          __typename: 'Project',
          projectName: 'Paper Birch Lake',
          id: '433',
          projectType: 'ES',
          organization: {
            organizationName: 'American Chestnut Home',
          },
        },
      ],
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
          preferredName: 'Leo',
          lastName: 'Acker',
          dob: '1980-03-20',
          dateUpdated: '2022-07-27T15:14:29.062',
        },
        {
          id: '9997',
          personalId: '9999',
          ssnSerial: '0003',
          firstName: 'Jane',
          preferredName: 'Jay',
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
          preferredName: null,
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

const enrollmentWithHoHMock = {
  request: {
    query: GetEnrollmentWithHoHDocument,
  },
  result: {
    data: {
      enrollment: {
        __typename: 'Enrollment',
        id: '5',
        entryDate: '2022-06-18T00:00:00+00:00',
        exitDate: null,
        project: { projectName: 'White Pine' },
        household: {
          id: '123',
          __typename: 'Household',
          householdClients: [
            {
              __typename: 'HouseholdClient',
              id: '5',
              relationshipToHoH: 1,
              client: RITA_ACKROYD,
            },
          ],
        },
      },
    },
  },
};

const mocks: any[] = [
  projectsForSelectMock,
  clientSearchMock,
  clientSearchMockNextPage,
  clientLookupMock,
  enrollmentWithHoHMock,
];

export default mocks;
