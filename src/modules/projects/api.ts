import { formatDateForGql } from '../hmis/hmisUtil';

export const fetchPreventionAssessmentReportUrl = (
  referralId: string
): string => `/hmis/ac/prevention_assessment_report/${referralId}`;

export const fetchConsumerSummaryReportUrl = ({
  referralIdentifier,
  startDate,
  endDate,
}: {
  referralIdentifier: string;
  startDate?: Date | null;
  endDate?: Date | null;
}): string => {
  const params = new URLSearchParams({ referral_id: referralIdentifier });
  if (startDate) {
    const dt = formatDateForGql(startDate);
    if (dt) params.append('start_date', dt);
  }
  if (endDate) {
    const dt = formatDateForGql(endDate);
    if (dt) params.append('end_date', dt);
  }

  return `/hmis/ac/consumer_summary_report?${params.toString()}`;
};
