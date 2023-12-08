export const fetchPreventionAssessmentReportUrl = (
  referralId: string
): string => `/ac_hmis/prevention_assessment_report/${referralId}`;

export const fetchConsumerSummaryReportUrl = ({
  clientId,
  startDate,
  endDate,
}: {
  clientId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}): string => {
  const params = new URLSearchParams({ clientId });
  if (startDate) params.append('startDate', startDate.toLocaleDateString());
  if (endDate) params.append('endDate', endDate.toLocaleDateString());

  return `/ac_hmis/consumer_summary_report?${params.toString()}`;
};
