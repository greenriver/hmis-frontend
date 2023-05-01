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
  return (
    <>
      <RelativeDateDisplay
        dateString={record.dateCreated}
        prefixVerb='Created'
        {...RelativeDateDisplayProps}
      />
      <RelativeDateDisplay
        dateString={record.dateUpdated}
        prefixVerb='Updated'
        suffixText={userLastUpdated}
        {...RelativeDateDisplayProps}
      />
    </>
  );
};
export default HudRecordMetadata;
