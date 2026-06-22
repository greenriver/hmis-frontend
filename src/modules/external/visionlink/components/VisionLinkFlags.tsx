import { Stack } from '@mui/material';
import { useCallback, useMemo } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';
import LoadingButton from '@/components/elements/LoadingButton';
import { DUMMY_CLIENT_ID } from '@/modules/admin/components/forms/FormPreview';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { hasErrors } from '@/modules/errors/util';
import { useFetchVisionLinkFlags } from '@/modules/external/visionlink/hooks/useFetchVisionLinkFlags';
import {
  VISIONLINK_RISK_OF_HOMELESSNESS_FLAG_LINK_ID,
  VisionLinkLinkIds,
} from '@/modules/external/visionlink/visionLinkUtils';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useDynamicFieldWatchValues } from '@/modules/form/hooks/rhf/useDynamicFieldWatchValues';
import { ChangeType, GroupItemComponentProps } from '@/modules/form/types';

const VisionLinkFlags = ({
  item,
  handlers,
  renderChildItem,
  severalItemsChanged,
  viewOnly = false,
}: GroupItemComponentProps) => {
  const isComponentValid = useMemo(() => {
    return VisionLinkLinkIds.every((expectedLinkId) =>
      item.item?.find((i) => i.linkId === expectedLinkId)
    );
  }, [item]);

  // Watch the risk of homelessness flag value to determine if eligibility data is available.
  // We assume that if data is present for one flag, it is present for all flags, since that's how the backend returns the data.
  const watchedValues = useDynamicFieldWatchValues([
    VISIONLINK_RISK_OF_HOMELESSNESS_FLAG_LINK_ID,
  ]);

  // Checking existence of the value, which may be "Flag", "No Flag", or "No Eligibility Data".
  const hasEligibilityData =
    !!watchedValues[VISIONLINK_RISK_OF_HOMELESSNESS_FLAG_LINK_ID];

  const clientId = handlers?.localConstants.clientId;
  // Disable fetch button when rendered in form builder preview mode
  const hasRequiredContext = !!clientId && clientId !== DUMMY_CLIENT_ID;

  const onFlagsFetched = useCallback(
    (flagValues: Record<string, string>) => {
      severalItemsChanged?.({
        values: flagValues,
        type: ChangeType.User,
      });
    },
    [severalItemsChanged]
  );

  const { loading, errorState, fetchVisionLinkFlags } = useFetchVisionLinkFlags(
    { clientId, onFlagsFetched }
  );

  if (!isComponentValid)
    throw new Error(
      'Invalid VisionLink form component. Expected link IDs: ' +
        VisionLinkLinkIds.join(', ')
    );

  if (viewOnly) {
    return item.item?.map((i) => renderChildItem(i));
  }

  if (!clientId) {
    throw new Error(
      "VisionLinkFlags did not receive a client ID, and won't function properly without one."
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
            <RequiredLabel
              text={item.text || 'Eviction Prevention Eligibility Flags'}
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
            disabled={hasEligibilityData || !hasRequiredContext}
            type='button'
            onClick={fetchVisionLinkFlags}
            sx={{ my: 1 }}
          >
            Fetch Eligibility Data
          </LoadingButton>
        </LabelWithContent>
        {renderChildItem &&
          item.item
            // Only render VisionLink flags once they have data. Allow other unrelated child items to be rendered.
            ?.filter((i) =>
              VisionLinkLinkIds.includes(i.linkId) ? hasEligibilityData : true
            )
            .map((i) => renderChildItem(i))}
      </Stack>
    </>
  );
};

export default VisionLinkFlags;
