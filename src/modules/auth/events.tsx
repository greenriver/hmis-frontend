import { HMIS_REMOTE_SESSION_UID_EVENT } from '@/modules/auth/api/constants';

export const dispatchSessionTrackingEvent = (userId: string | undefined) => {
  document.dispatchEvent(
    new CustomEvent(HMIS_REMOTE_SESSION_UID_EVENT, { detail: userId })
  );
};
