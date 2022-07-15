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
          label: 'Hawthorne Home',
          options: [
            {
              label: 'White Ash Center',
              value: '116',
              projectType: 'ES',
            },
            {
              label: 'Eastern Hemlock Lake',
              value: '118',
              projectType: 'ES',
            },
            {
              label: 'Scarlet Oak Creek',
              value: '127',
              projectType: 'RRH',
            },
            {
              label: 'White Spruce Hill',
              value: '37518',
              projectType: 'SO',
            },
          ],
        },
        {
          label: 'American Chestnut Home',
          options: [
            {
              label: 'The Maples Room',
              value: '37612',
              projectType: 'ES',
            },
            {
              label: 'Paper Birch Room',
              value: '428',
              projectType: 'PH',
            },
            {
              label: 'Paper Birch Lake',
              value: '433',
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
