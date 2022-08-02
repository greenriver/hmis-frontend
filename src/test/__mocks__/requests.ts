import { GET_CLIENTS } from '@/api/clients.gql';
import { GET_PROJECTS } from '@/api/projects.gql';

export const RITA_ACKROYD = {
  id: '9999',
  personalId: '9999',
  ssnSerial: '0001',
  firstName: 'Rita',
  preferredName: null,
  lastName: 'Ackroyd',
  dob: '1980-03-20',
  dateUpdated: '2022-07-27T15:14:29.062',
  enrollments: [
    {
      id: '5',
      entryDate: '2022-06-18T00:00:00+00:00',
      exitDate: null,
      project: { projectName: 'White Pine' },
    },
    {
      id: '6',
      entryDate: '2021-02-10T00:00:00+00:00',
      exitDate: '2021-02-10T00:00:00+00:00',
      project: { projectName: 'Spruce Hill' },
    },
    {
      id: '7',
      entryDate: '2013-02-10T00:00:00+00:00',
      exitDate: '2013-02-10T00:00:00+00:00',
      project: { projectName: 'White Pine Terrace' },
    },
    {
      id: '8',
      entryDate: '2013-02-10T00:00:00+00:00',
      exitDate: '2013-02-10T00:00:00+00:00',
      project: { projectName: 'White Pine' },
    },
    {
      id: '9',
      entryDate: '2013-02-10T00:00:00+00:00',
      exitDate: '2013-02-10T00:00:00+00:00',
      project: { projectName: 'White Pine' },
    },
  ],
};

const projectsForSelectMock = {
  request: {
    query: GET_PROJECTS,
  },
  result: {
    data: {
      projects: [
        {
          projectName: 'White Ash Center',
          id: '116',
          projectType: 'ES',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          projectName: 'Eastern Hemlock Lake',
          id: '118',
          projectType: 'ES',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          projectName: 'Scarlet Oak Creek',
          id: '127',
          projectType: 'RRH',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          projectName: 'White Spruce Hill',
          id: '37518',
          projectType: 'SO',
          organization: {
            organizationName: 'Hawthorne Home',
          },
        },
        {
          projectName: 'The Maples Room',
          id: '37612',
          projectType: 'ES',
          organization: {
            organizationName: 'American Chestnut Home',
          },
        },
        {
          projectName: 'Paper Birch Room',
          id: '428',
          projectType: 'PH',
          organization: {
            organizationName: 'American Chestnut Home',
          },
        },
        {
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
    query: GET_CLIENTS,
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
          enrollments: null,
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
          enrollments: null,
          dateUpdated: '2022-07-27T15:14:29.062',
        },
      ],
    },
  },
};

const clientSearchMockNextPage = {
  request: {
    query: GET_CLIENTS,
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
    query: GET_CLIENTS,
    variables: {
      offset: 0,
      input: { id: '9999' },
      limit: 1,
    },
  },
  result: {
    data: {
      offset: 0,
      limit: 1,
      hasMoreAfter: false,
      hasMoreBefore: false,
      nodesCount: 1,
      pagesCount: 1,
      nodes: [RITA_ACKROYD],
    },
  },
};

const mocks: any[] = [
  projectsForSelectMock,
  clientSearchMock,
  clientSearchMockNextPage,
  clientLookupMock,
];

export default mocks;
