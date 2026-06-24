import { FetchVisionLinkFlagsMutation } from '@/types/gqlTypes';

export const NO_ELIGIBILITY_DATA = 'No Eligibility Data';

type FetchVisionLinkFlagsResult = NonNullable<
  FetchVisionLinkFlagsMutation['fetchVisionLinkFlags']
>;

// Primary flag field; maps to API isEligibleRa. Used to detect fetched eligibility data in the form.
export const VISIONLINK_RISK_OF_HOMELESSNESS_FLAG_LINK_ID =
  'visionlink_risk_of_homelessness_flag';

const VisionLinkFieldConfig: {
  linkId: string;
  getValue: (result: FetchVisionLinkFlagsResult) => boolean | null | undefined;
}[] = [
  {
    linkId: VISIONLINK_RISK_OF_HOMELESSNESS_FLAG_LINK_ID,
    getValue: (result) => result.isEligibleRa,
  },
  {
    linkId: 'visionlink_section_8_housing_flag',
    getValue: (result) => result.section8,
  },
  {
    linkId: 'visionlink_subsidized_housing_flag',
    getValue: (result) => result.subsidizedHousing,
  },
  {
    linkId: 'visionlink_city_of_pittsburgh_flag',
    getValue: (result) => result.cityOfPittsburgh,
  },
  {
    linkId: 'visionlink_recent_eviction_case_flag',
    getValue: (result) => result.recentEvictionCase,
  },
];

export const VisionLinkLinkIds = VisionLinkFieldConfig.map(
  ({ linkId }) => linkId
);

export function buildVisionLinkFlagValues(
  result: FetchVisionLinkFlagsResult | null | undefined
) {
  const failedReason = result?.failedReason;
  const hasEligibilityData =
    !failedReason &&
    result?.isEligibleRa !== null &&
    result?.isEligibleRa !== undefined;

  const flagValues = Object.fromEntries(
    VisionLinkFieldConfig.map(({ linkId, getValue }) => [
      linkId,
      hasEligibilityData && result
        ? getValue(result)
          ? 'Flag'
          : 'No Flag'
        : NO_ELIGIBILITY_DATA,
    ])
  );

  return { flagValues, hasEligibilityData, failedReason };
}
