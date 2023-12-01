import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { filter, isNil } from 'lodash-es';
import SimpleTable from '@/components/elements/SimpleTable';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import HmisField from '@/modules/hmis/components/HmisField';

// expected shape of JSON 'objectChanges' field
export type ObjectChangesType = {
  [key: string]: {
    fieldName: string;
    displayName: string;
    values: [any, any] | 'changed';
  };
};

interface Props {
  objectChanges: ObjectChangesType;
}

const nullText = (
  <Typography component='span' variant='inherit' color='text.secondary'>
    Empty
  </Typography>
);

const changedText = (
  <Typography
    component='span'
    variant='inherit'
    display='inline-flex'
    alignItems='center'
  >
    changed&#160;
    <Tooltip title='Value changed but is not viewable'>
      <HelpOutlineIcon fontSize='inherit' />
    </Tooltip>
  </Typography>
);

/**
 * Simple table for displaying "objectChanges" from an Audit Event object
 */
const AuditObjectChangesSummary: React.FC<Props> = ({ objectChanges }) => {
  return (
    <SimpleTable
      TableCellProps={{
        sx: { py: 1.5, borderColor: (theme) => theme.palette.grey[200] },
      }}
      TableBodyProps={{
        sx: {
          '.MuiTableRow-root:last-child .MuiTableCell-root': {
            border: 'none',
          },
        },
      }}
      TableRowProps={{
        sx: { '.MuiTableCell-root:first-of-type': { width: '180px' } },
      }}
      rows={Object.values(objectChanges)
        .filter((r) => filter(r.values, hasMeaningfulValue).length > 0)
        .map((r) => ({
          ...r,
          id: r.fieldName,
        }))}
      columns={[
        { name: 'field', render: (row) => <b>{row.displayName}</b> },
        {
          name: 'changes',
          render: ({ values, fieldName }) => {
            if (values === 'changed') return changedText;

            const [from, to] = values.map((val) =>
              isNil(val) ? null : (
                <HmisField
                  key={fieldName}
                  record={{ ...objectChanges, [fieldName]: val }}
                  fieldName={fieldName}
                  recordType='Client'
                />
              )
            );

            return (
              <Stack gap={1} direction='row' alignItems='center'>
                <Typography variant='body2'>
                  {isNil(from) ? nullText : from}
                </Typography>
                <ArrowForwardIcon fontSize='inherit' />
                <Typography variant='body2'>
                  {isNil(to) ? nullText : to}
                </Typography>
              </Stack>
            );
          },
        },
      ]}
    />
  );
};

export default AuditObjectChangesSummary;
