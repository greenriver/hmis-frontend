import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import {
  formatDateTimeForDisplay,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { UserFieldsFragment } from '@/types/gqlTypes';

const AssessmentHistoryInfo: React.FC<{
  label: string;
  user?: UserFieldsFragment | null;
  date?: string | null;
}> = ({ label, user, date }) => {
  const fmtDate = parseHmisDateString(date);
  let content: string | null = null;
  if (fmtDate && user) {
    content = `${user.name} at ${formatDateTimeForDisplay(fmtDate)} `;
  } else if (user) {
    // this case probably doesn't occur in practice, we should always have dates
    content = user.name;
  } else if (fmtDate) {
    content = `System User at ${formatDateTimeForDisplay(fmtDate)}`;
  }

  if (content) {
    return (
      <CommonLabeledTextBlock title={label} horizontal variant='body1'>
        {content}
      </CommonLabeledTextBlock>
    );
  }
};

export default AssessmentHistoryInfo;
