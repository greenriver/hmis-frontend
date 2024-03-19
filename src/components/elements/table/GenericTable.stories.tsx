import { Box, Paper } from '@mui/material';
import { Meta, StoryFn } from '@storybook/react';

import GenericTable, { Props as GenericTableProps } from './GenericTable';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { getCustomDataElementColumns } from '@/modules/hmis/hmisUtil';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment, DisplayHook } from '@/types/gqlTypes';

export default {
  title: 'GenericTable',
  component: GenericTable,
  decorators: [
    (Story) => (
      <Box sx={{ width: 800 }}>
        <Story />
      </Box>
    ),
  ],
} as Meta<typeof GenericTable>;

const Template =
  <T extends { id: string }>(): StoryFn<GenericTableProps<T>> =>
  (args) =>
    (
      <Paper>
        <SsnDobShowContextProvider>
          <GenericTable<T> {...args} />
        </SsnDobShowContextProvider>
      </Paper>
    );

const clientColumns = [
  CLIENT_COLUMNS.id,
  CLIENT_COLUMNS.first,
  CLIENT_COLUMNS.last,
  CLIENT_COLUMNS.ssn,
  CLIENT_COLUMNS.dobAge,
];

type RowType = ClientFieldsFragment;
const fakeRows: RowType[] = [];
for (let i = 0; i < 10; i++) {
  fakeRows.push({ ...RITA_ACKROYD, id: (i + 1).toString() } as RowType);
}

export const NoData = Template<RowType>().bind({});
NoData.args = { rows: [] as RowType[], columns: clientColumns };

export const WithClientData = Template<RowType>().bind({});
WithClientData.args = {
  rows: fakeRows,
  columns: clientColumns,
};

export const SelectableRows = Template<RowType>().bind({});
SelectableRows.args = {
  rows: fakeRows,
  columns: clientColumns,
  selectable: 'row',
};

export const WithCustomDataElements = Template<RowType>().bind({});
const rowsWithCdes = [
  {
    ...RITA_ACKROYD,
    id: '1',
    customDataElements: [
      {
        key: 'food',
        label: 'Favorite Foods',
        repeats: true,
        fieldType: 'string',
        displayHooks: [DisplayHook.TableSummary],
        values: [{ valueString: 'Pizza' }],
      },
    ],
  },
  {
    ...RITA_ACKROYD,
    id: '2',
    customDataElements: [
      {
        id: '1',
        key: 'color',
        label: 'Favorite Color',
        repeats: false,
        fieldType: 'string',
        displayHooks: [DisplayHook.TableSummary],
        value: { valueString: 'Pink' },
      },
      {
        id: '2',
        key: 'foo',
        label: 'Non detail field',
        repeats: false,
        fieldType: 'string',
        displayHooks: [],
        value: { valueString: 'Some value' },
      },
    ],
  },
  {
    ...RITA_ACKROYD,
    id: '3',
    customDataElements: [
      {
        key: 'color',
        label: 'Favorite Color',
        repeats: false,
        fieldType: 'string',
        displayHooks: [DisplayHook.TableSummary],
        value: { valueString: 'Green' },
      },
      {
        id: '1d',
        key: 'food',
        label: 'Favorite Foods',
        repeats: true,
        fieldType: 'string',
        displayHooks: [DisplayHook.TableSummary],
        values: [
          {
            id: 'f1',
            valueString: 'Potato',
          },
          {
            id: 'f2',
            valueString: 'Leek',
          },
        ],
      },
    ],
  },
] as RowType[];

WithCustomDataElements.args = {
  rows: rowsWithCdes,
  columns: [
    CLIENT_COLUMNS.id,
    CLIENT_COLUMNS.name,
    ...getCustomDataElementColumns<RowType>(rowsWithCdes),
  ],
};
