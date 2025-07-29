import { Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useDynamicFieldWatchValues } from '@/modules/form/hooks/rhf/useDynamicFieldWatchValues';
import { ChangeType, GroupItemComponentProps } from '@/modules/form/types';
import { useFetchAhaScoreMutation } from '@/types/gqlTypes';

const SCORE_LINK_ID = 'aha_score';
const ALT_AHA_FLAG_LINK_ID = 'aha_alt_aha_flag';
const DW_CLIENT_LINK_ID = 'aha_dw_client_id';
const GENERATOR_LINK_ID = 'aha_generator';

const EXPECTED_LINK_IDS = [
  SCORE_LINK_ID,
  ALT_AHA_FLAG_LINK_ID,
  DW_CLIENT_LINK_ID,
  GENERATOR_LINK_ID,
];

// Custom component for rendering AHA score. Renders a button to fetch the score, as well as sub-items including:
// score (value), alt-AHA flag, and hidden items for values that should be submitted but not shown to the user.
// Similar to DisabilityGroup, this component is tightly coupled to its expected form structure.
// `item` is expected to be of type 'GROUP', and have child items with certain link_ids (EXPECTED_LINK_IDS).
const AhaScore = ({
  item,
  handlers,
  renderChildItem,
  severalItemsChanged,
  viewOnly = false,
}: GroupItemComponentProps) => {
  // Introspect on the group's child elements and ensure items exist for the expected link IDs
  const isComponentValid = useMemo(() => {
    return EXPECTED_LINK_IDS.every((expectedLinkId) => {
      return item.item?.find((i) => i.linkId === expectedLinkId);
    });
  }, [item]);

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  // Use dynamic field watch to get the current values of the expected link IDs.
  // This is to disable the fetch button after unlocking an assessment that's already fetched the score.
  const values = useDynamicFieldWatchValues([SCORE_LINK_ID]);
  const existingValue = values[SCORE_LINK_ID];

  const [hasScore, setHasScore] = useState<boolean>(!!existingValue);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const clientId = handlers?.localConstants.clientId;

  const [fetchAha, { loading }] = useFetchAhaScoreMutation({
    variables: {
      clientId: clientId,
    },
    onCompleted: (data) => {
      const errors = data.fetchAhaScore?.errors || [];
      if (errors.length > 0) {
        setErrorState({ ...emptyErrorState, errors });
        setHasScore(false);
        return;
      }

      setHasFetched(true);
      setErrorState(emptyErrorState);

      if (data.fetchAhaScore?.score && data.fetchAhaScore.score >= 0) {
        setHasScore(true);

        if (severalItemsChanged) {
          severalItemsChanged({
            values: {
              [SCORE_LINK_ID]: data.fetchAhaScore.score,
              [ALT_AHA_FLAG_LINK_ID]: data.fetchAhaScore.altAhaFlag,
              [DW_CLIENT_LINK_ID]: data.fetchAhaScore.dwClientId,
              [GENERATOR_LINK_ID]: data.fetchAhaScore.generator,
            },
            type: ChangeType.User,
          });
        }
      } else {
        setHasScore(false);
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
      setHasScore(false);
    },
  });

  // Throw an error if the children don't match the expected structure
  if (!isComponentValid) throw new Error('Invalid Aha form component');

  if (viewOnly) {
    return item.item?.map((i) => renderChildItem(i));
  }

  if (!clientId) {
    throw new Error(
      "AhaScore did not receive a client ID, and won't function properly without one."
    );
  }

  return (
    <>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      <Stack direction='column' gap={1} alignItems='flex-start'>
        <LabelWithContent
          label={
            // Custom solution for visually requiring this field.
            // Form groups can't be required, but in the individual fields are hidden and/or readonly,
            // so the normal RequiredLabel logic doesn't work automagically.
            <RequiredLabel
              text={item.text || 'AHA Score'}
              required={true}
              TypographyProps={{
                fontWeight: 600,
              }}
            />
          }
          helperText={item.helperText}
        >
          <LoadingButton
            loading={loading}
            disabled={hasScore} // If value already exists, disable the button
            type='button'
            onClick={() => fetchAha()}
            sx={{ my: 1 }}
          >
            Fetch AHA Score
          </LoadingButton>
        </LabelWithContent>
        {hasFetched && !hasScore && (
          <LabelWithContent label='AHA Score'>
            <Typography variant='body2' color='text.secondary'>
              AHA score is not available for this client.
            </Typography>
          </LabelWithContent>
        )}
        {renderChildItem &&
          // Hide items that display the score if the score hasn't been fetched yet
          item.item
            ?.filter((i) =>
              hasScore ? true : !EXPECTED_LINK_IDS.includes(i.linkId)
            )
            .map((i) => renderChildItem(i))}
      </Stack>
    </>
  );
};

export default AhaScore;
