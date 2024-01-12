import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { filter, isNil } from 'lodash-es';
import SimpleTable from '@/components/elements/SimpleTable';
import {
  hasMeaningfulValue,
  isDataNotCollected,
} from '@/modules/form/util/formUtil';
import HmisField from '@/modules/hmis/components/HmisField';
import { AuditEventType } from '@/types/gqlTypes';

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
  recordType: string;
  eventType: AuditEventType;
}

const nullText = (
  <Typography component='span' variant='inherit' color='text.disabled'>
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

const hasValueExcludingDNC = (value: any) =>
  hasMeaningfulValue(value) && !isDataNotCollected(value);

/**
 * Simple table for displaying "objectChanges" from an Audit Event object
 */
const AuditObjectChangesSummary: React.FC<Props> = ({
  objectChanges,
  recordType,
  eventType,
}) => {
  const filteredRows = Object.values(objectChanges)
    // dont show changes like `null => DNC`, they are meaningless
    .filter((r) => filter(r.values, hasValueExcludingDNC).length > 0)
    .map((r) => ({
      ...r,
      id: r.fieldName,
    }));

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
      rows={filteredRows}
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
                  recordType={recordType}
                />
              )
            );

            return (
              <Stack gap={1} direction='row' alignItems='center'>
                {['destroy', 'update'].includes(eventType) && (
                  <Typography variant='body2' component='div'>
                    {isNil(from) ? nullText : from}
                  </Typography>
                )}
                {eventType === 'update' && (
                  <ArrowForwardIcon fontSize='inherit' />
                )}
                {['update', 'create'].includes(eventType) && (
                  <Typography variant='body2' component='div'>
                    {isNil(to) ? nullText : to}
                  </Typography>
                )}
              </Stack>
            );
          },
        },
      ]}
    />
  );
};

export default AuditObjectChangesSummary;
