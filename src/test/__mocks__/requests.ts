import { GET_CLIENTS } from '@/api/clients.gql';
import { GET_PROJECTS } from '@/api/projects.gql';

const projectsForSelectMock = {
  request: {
    query: GET_PROJECTS,
  },
  result: {
    data: {
      organizations: [
        {
          organizationName: 'Hawthorne Home',
          projects: [
            {
              projectName: 'White Ash Center',
              id: '116',
              projectType: 'ES',
            },
            {
              projectName: 'Eastern Hemlock Lake',
              id: '118',
              projectType: 'ES',
            },
            {
              projectName: 'Scarlet Oak Creek',
              id: '127',
              projectType: 'RRH',
            },
            {
              projectName: 'White Spruce Hill',
              id: '37518',
              projectType: 'SO',
            },
          ],
        },
        {
          organizationName: 'American Chestnut Home',
          projects: [
            {
              projectName: 'The Maples Room',
              id: '37612',
              projectType: 'ES',
            },
            {
              projectName: 'Paper Birch Room',
              id: '428',
              projectType: 'PH',
            },
            {
              projectName: 'Paper Birch Lake',
              id: '433',
              projectType: 'ES',
            },
          ],
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
      input: { searchTerm: 'ack' },
      limit: 3,
    },
  },
  result: {
    data: {
      offset: 0,
      limit: 3,
      totalCount: 4,
      nodes: [
        {
          id: '9999',
          ssn: '0001',
          firstName: 'Rita',
          preferredName: null,
          lastName: 'Ackroyd',
          dob: '04/04/1980',
          enrollments: [
            {
              id: 5,
              entryDate: '07/01/2022',
              exitDate: null,
              project: { projectName: 'White Pine' },
            },
            {
              id: 6,
              entryDate: '12/01/2021',
              exitDate: '12/05/2021',
              project: { projectName: 'Spruce Hill' },
            },
            {
              id: 7,
              entryDate: '12/01/2021',
              exitDate: '12/05/2021',
              project: { projectName: 'White Pine Terrace' },
            },
            {
              id: 8,
              entryDate: '12/01/2021',
              exitDate: '12/05/2021',
              project: { projectName: 'White Pine' },
            },
            {
              id: 9,
              entryDate: '12/01/2021',
              exitDate: '12/05/2021',
              project: { projectName: 'White Pine' },
            },
          ],
        },
        {
          id: '9998',
          ssn: '0002',
          firstName: 'Lennart',
          preferredName: 'Leo',
          lastName: 'Acker',
          dob: '04/04/1980',
          enrollments: null,
        },
        {
          id: '9997',
          ssn: '0003',
          firstName: 'Jane',
          preferredName: 'Jay',
          lastName: 'Ackman',
          dob: '12/13/1980',
          enrollments: null,
        },
      ],
    },
  },
};

const clientSearchMockNextPage = {
  request: {
    query: GET_CLIENTS,
    variables: {
      input: { searchTerm: 'ack' },
      limit: 3,
      offset: 3,
    },
  },
  result: {
    data: {
      offset: 4,
      limit: 3,
      totalCount: 4,
      nodes: [
        {
          id: '9996',
          ssn: '0004',
          firstName: 'Rita',
          preferredName: null,
          lastName: 'Acker',
          dob: '12/01/1980',
          enrollments: null,
        },
      ],
    },
  },
};

const mocks: any[] = [
  projectsForSelectMock,
  clientSearchMock,
  clientSearchMockNextPage,
];

export default mocks;
