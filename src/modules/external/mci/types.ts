import { MciMatchFieldsFragment } from '@/types/gqlTypes';

export type ClearanceStatus =
  | 'initial' // search available
  | 'no_matches' // no matches, click to search again, click to
  | 'one_match' // 1 match, click to search again, choose a match
  | 'several_matches' // x matches, click to search again, choose a match
  | 'auto_cleared'; // auto-cleared

export type ClearanceState = {
  status: ClearanceStatus;
  candidates: MciMatchFieldsFragment[];
};
