import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import { DUMMY_CLIENT_ID } from '@/modules/admin/components/forms/FormPreview';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { emptyErrorState, ErrorState, hasErrors } from '@/modules/errors/util';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useDynamicFieldWatchValues } from '@/modules/form/hooks/rhf/useDynamicFieldWatchValues';
import { ChangeType, GroupItemComponentProps } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import { useFetchAhaScoreMutation } from '@/types/gqlTypes';

/**
 * AHA Score Component
 *
 * This component is used when a group item specifies "component: AHA".
 * The component renders a button to fetch the AHA score from the backend, and dynamically renders
 * its child items (which may be visible or hidden depending on the form definition).
 *
 *
 * Similar to DisabilityGroup, this component is tightly coupled to its expected form structure.
 * It MUST have certain child items with specific link_ids (see EXPECTED_LINK_IDS below).
 * Data associated with the AHA score retrieval is stored in separate form items so that they can
 * be stored and exported as custom data elements.
 *
 *
 * EXPECTED GROUP ITEM SHAPE:
 *  {
 *    "type": "GROUP",
 *    "component": "AHA",
 *    "item": [
 *      {
 *        "link_id": "aha_score",
 *        "type": "INTEGER",
 *        ...
 *      },
 *      {
 *        "link_id": "aha_mci_quality_indicator",
 *        "type": "INTEGER",
 *        ...
 *      },
 *      {
 *        "link_id": "aha_dw_client_id",
 *        "type": "STRING",
 *        ...
 *      },
 *      {
 *        "link_id": "aha_generator",
 *        "type": "STRING",
 *        ...
 *      },
 *      ... may have additional items
 *    ]
 *  }
 */

// Numeric AHA score, may be -1 or 1..10. -1 means no score, which can occur if (1) the client has no MCI Unique ID yet, OR (2) the API call return -1 for the client.
const SCORE_LINK_ID = 'aha_score';
// This field is a 0/1 flag indicating whether the Alt-AHA should be performed or not. (1 = Alt-AHA is required, 0 = Alt-AHA is not required). Only present if the API call was successful.
const MCI_QUALITY_INDICATOR_LINK_ID = 'aha_mci_quality_indicator';
// MCI Unique ID that is associated with the retrieved score. Only present if the API call was successful.
const DW_CLIENT_LINK_ID = 'aha_dw_client_id';
// Generator of the score, always 'AHA'. Only present if the API call was successful.
const GENERATOR_LINK_ID = 'aha_generator';

const EXPECTED_LINK_IDS = [
  SCORE_LINK_ID,
  MCI_QUALITY_INDICATOR_LINK_ID,
  DW_CLIENT_LINK_ID,
  GENERATOR_LINK_ID,
];

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
  const [missingMciUniqueId, setMissingMciUniqueId] = useState<boolean>(false);
  // Use RHF to watch the current value of the score field.
  // This is to disable the fetch button after unlocking an assessment that's already fetched the score.
  const values = useDynamicFieldWatchValues([SCORE_LINK_ID]);
  const scoreValue = values[SCORE_LINK_ID];

  // If client has no score (-1 is returned), hasScore is false and the button stays enabled
  const hasScore =
    scoreValue !== null && scoreValue !== undefined && scoreValue >= 0;

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
        return;
      }

      setHasFetched(true);
      setErrorState(emptyErrorState);

      // If response indicates that the score is not available because the client doesn't have an MCI Unique ID assigned yet, update state to display a message.
      setMissingMciUniqueId(
        data.fetchAhaScore?.ahaFailedReason ===
          HmisEnums.AhaFailedReason.NO_MCI_UNIQUE_ID
      );

      if (data.fetchAhaScore && severalItemsChanged) {
        severalItemsChanged({
          values: {
            [SCORE_LINK_ID]: data.fetchAhaScore.score,
            [MCI_QUALITY_INDICATOR_LINK_ID]:
              data.fetchAhaScore.mciQualityIndicator,
            [DW_CLIENT_LINK_ID]: data.fetchAhaScore.dwClientId,
            [GENERATOR_LINK_ID]: data.fetchAhaScore.generator,
          },
          type: ChangeType.User,
        });
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
    },
  });

  const hasRequiredContext = !!clientId && clientId !== DUMMY_CLIENT_ID;

  const handleFetch = useCallback(() => {
    if (hasRequiredContext) {
      fetchAha();
    }
  }, [fetchAha, hasRequiredContext]);

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
            // If value already exists, disable the button
            // If this is not in the assessment context (such as form preview mode), disable the button
            disabled={hasScore || !hasRequiredContext}
            type='button'
            onClick={handleFetch}
            sx={{ my: 1 }}
          >
            Fetch AHA Score
          </LoadingButton>
        </LabelWithContent>
        {hasFetched && !hasScore && (
          <LabelWithContent label='AHA Score'>
            <Typography variant='body2' color='text.secondary'>
              {/* If AHA is not available due to the client not having an MCI Unique ID assigned yet, the score is not available TODAY.
              The expectation is that the client will be assigned an MCI Unique ID the following day. */}
              {missingMciUniqueId
                ? 'AHA score is not available for this client TODAY'
                : 'AHA score is not available for this client'}
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
