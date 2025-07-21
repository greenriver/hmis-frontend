import { Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import { ChangeType, GroupItemComponentProps } from '@/modules/form/types';
import { ItemType, useFetchAhaScoreMutation } from '@/types/gqlTypes';

// Custom component for rendering AHA score. Renders a button to fetch the score, as well as sub-items including:
// score (value), alt-AHA flag, and hidden items for values that should be submitted but not shown to the user.
// Similar to DisabilityGroup, this component is tightly coupled to its expected form structure.
const AhaScore = ({
  item,
  handlers,
  renderChildItem,
  severalItemsChanged,
}: GroupItemComponentProps) => {
  // Introspect on the group's child elements and find the link IDs for the expected fields
  const { scoreLinkId, altAhaFlagLinkId, dwClientLinkId, generatorLinkId } =
    useMemo(() => {
      return {
        // Expect to find an integer field and assume it's for storing the score
        scoreLinkId: item.item?.find((i) => i.type === ItemType.Integer)
          ?.linkId,
        // Expect to find a boolean field for alt-AHA flag
        altAhaFlagLinkId: item.item?.find((i) => i.type === ItemType.Boolean)
          ?.linkId,
        // Expect to find two string fields for dwClientId and generator
        dwClientLinkId: item.item?.find((i) => i.type === ItemType.String)
          ?.linkId,
        generatorLinkId: item.item
          ?.slice(-1)
          .find((i) => i.type === ItemType.String)?.linkId,
      };
    }, [item]);

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  // hasScore is a boolean that can be undefined when the user hasn't clicked the fetch button yet.
  // `false` indicates the user did click the button but the score wasn't available.
  const [hasScore, setHasScore] = useState<boolean | undefined>(undefined);

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

      setErrorState(emptyErrorState);

      if (data.fetchAhaScore) {
        setHasScore(true);

        if (
          severalItemsChanged &&
          scoreLinkId &&
          altAhaFlagLinkId &&
          dwClientLinkId &&
          generatorLinkId
        ) {
          severalItemsChanged({
            values: {
              [scoreLinkId]: data.fetchAhaScore.score,
              [altAhaFlagLinkId]: data.fetchAhaScore.altAhaFlag,
              [dwClientLinkId]: data.fetchAhaScore.dwClientId,
              [generatorLinkId]: data.fetchAhaScore.generator,
            },
            type: ChangeType.User,
          });
        }
      } else {
        // TODO(#7812) If score is not available (or bad quality?), calculate alt-AHA
        setHasScore(false);
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
      setHasScore(false);
    },
  });

  // console.error instead of throwing an error, so we can still preview how the form looks in non-client contexts
  if (!clientId)
    console.error(
      "AhaScore did not receive a client ID, and won't function properly without one."
    );

  // Throw an error if the child items don't match the expected structure
  if (!scoreLinkId || !altAhaFlagLinkId || !dwClientLinkId || !generatorLinkId)
    throw new Error('Invalid Aha form component');

  return (
    <>
      {errorState && hasErrors(errorState) && (
        <Stack gap={1}>
          <ApolloErrorAlert error={errorState.apolloError} />
          <ErrorAlert errors={errorState.errors} />
        </Stack>
      )}
      <Stack direction='column' gap={1} alignItems='flex-start'>
        <LabelWithContent label={item.text} helperText={item.helperText}>
          <LoadingButton
            loading={loading}
            disabled={hasScore} // If value has already been fetched, disable the button
            type='button'
            onClick={() => fetchAha()}
          >
            Fetch AHA Score
          </LoadingButton>
        </LabelWithContent>
        {hasScore === false && (
          <LabelWithContent label='AHA Score'>
            <Typography variant='body2' color='text.secondary'>
              AHA score is not available for this client.
            </Typography>
          </LabelWithContent>
        )}
        {/* Only render the child items if the score has already been fetched */}
        {hasScore &&
          renderChildItem &&
          item.item?.map((childItem) => renderChildItem(childItem))}
      </Stack>
    </>
  );
};

export default AhaScore;
