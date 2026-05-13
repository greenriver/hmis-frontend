import { Container } from '@mui/material';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { ContextHeaderAppBar } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import ContextHeaderContent from '@/components/layout/dashboard/contextHeader/ContextHeaderContent';
import {
  useDashboardBreadcrumbs,
  useReferralBreadcrumbConfig,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';

const ReferralDashboard: FC = () => {
  const [breadcrumbOverrides, setBreadcrumbOverrides] = useState<
    Record<string, string> | undefined
  >();
  // Merge each partial update into previous overrides, so that
  // nested pages (ReferralPage and ReferralStep) can each call overrideBreadcrumbTitles
  // for a different route template key.
  const overrideBreadcrumbTitles = useCallback(
    (crumbs: Record<string, string>) =>
      setBreadcrumbOverrides((prev) => ({ ...prev, ...crumbs })),
    []
  );
  const crumbConfig = useReferralBreadcrumbConfig();
  const breadcrumbs = useDashboardBreadcrumbs(crumbConfig, breadcrumbOverrides);
  const outletContext = useMemo(
    () => ({ overrideBreadcrumbTitles }),
    [overrideBreadcrumbTitles]
  );

  return (
    <>
      <ContextHeaderAppBar>
        <Container maxWidth='md'>
          <ContextHeaderContent breadcrumbs={breadcrumbs} />
        </Container>
      </ContextHeaderAppBar>
      <Outlet context={outletContext} />
    </>
  );
};

export type ReferralDashboardContext = {
  overrideBreadcrumbTitles: (crumbs: Record<string, string>) => void;
};

export const useReferralDashboardContext = () =>
  useOutletContext<ReferralDashboardContext>();

export default ReferralDashboard;
