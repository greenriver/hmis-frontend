import { Stack } from '@mui/material';

import RelativeDateDisplay, {
  RelativeDateDisplayProps,
} from './RelativeDateDisplay';

import { UserFieldsFragment } from '@/types/gqlTypes';

type RecordWithDates = { dateCreated: string; dateUpdated: string };

export function hasMetadataDates(record: any): record is RecordWithDates {
  return !!(
    typeof record === 'object' &&
    typeof (record as RecordWithDates).dateCreated === 'string' &&
    typeof (record as RecordWithDates).dateUpdated === 'string'
  );
}

type RecordWithUser = { user?: UserFieldsFragment };

export function hasMetadataUser(record: any): record is RecordWithUser {
  return !!(
    typeof record === 'object' &&
    typeof (record as RecordWithUser).user === 'object' &&
    typeof (record as RecordWithUser).user?.id === 'string' &&
    typeof (record as RecordWithUser).user?.name === 'string'
  );
}

export interface RecordMetadataProps {
  record?: any;
  RelativeDateDisplayProps?: Omit<RelativeDateDisplayProps, 'dateString'>;
}

const HudRecordMetadata = ({
  record,
  RelativeDateDisplayProps = {},
}: RecordMetadataProps) => {
  if (!hasMetadataDates(record)) return null;

  let userLastUpdated;
  if (hasMetadataUser(record)) {
    userLastUpdated = record.user?.name ? `by ${record.user?.name}` : undefined;
  }
  // If dateUpdated and dateCreated are the same, just show 'Created X minutes ago by Y'
  const createdSameAsUpdated = record.dateUpdated === record.dateCreated;
  return (
    <>
      {!createdSameAsUpdated && (
        <RelativeDateDisplay
          dateString={record.dateUpdated}
          prefixVerb='Updated'
          suffixText={userLastUpdated}
          {...RelativeDateDisplayProps}
        />
      )}
      <RelativeDateDisplay
        dateString={record.dateCreated}
        prefixVerb='Created'
        suffixText={createdSameAsUpdated ? userLastUpdated : undefined}
        {...RelativeDateDisplayProps}
      />
    </>
  );
};

export const HudRecordMetadataHistoryColumn = {
  header: 'History',
  key: 'history',
  render: (record: any) => (
    <Stack gap={0.5} sx={{ py: 0.5 }}>
      <HudRecordMetadata
        record={record}
        RelativeDateDisplayProps={{
          TooltipProps: { placement: 'right' },
          TypographyProps: { variant: 'body2' },
        }}
      />
    </Stack>
  ),
};

export default HudRecordMetadata;
