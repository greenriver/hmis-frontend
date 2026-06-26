import React, { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import ReferralContent from './ReferralContent';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { LocationState } from '@/routes/routeUtil';
import { useGetCeReferralQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Thin wrapper around ReferralContent for Referrals rendered within a ProjectDashboard.
 * The project can be the referral's target project, or its source project (for direct referrals).
 *
 * Referrals can also be rendered in the Referral context (what we previously called "floating referrals"); see ReferralPage
 */
const ProjectReferralPage: React.FC = () => {
  const { referralId } = useSafeParams() as { referralId: string };
  const { state } = useLocation();

  const { project, overrideBreadcrumbTitles } = useProjectDashboardContext();
  const referralRouteState = state ? (state as LocationState) : undefined;

  const {
    data: { ceReferral: referral } = {},
    loading,
    error,
  } = useGetCeReferralQuery({
    variables: {
      id: referralId,
    },
  });

  useEffect(() => {
    if (!referral) return;
    overrideBreadcrumbTitles({
      [ProjectDashboardRoutes.REFERRAL]: referral.clientName,
    });
  }, [referral, overrideBreadcrumbTitles]);

  const overrideStepTitle = useCallback(
    (name: string | undefined) => {
      if (name === undefined) return;
      overrideBreadcrumbTitles({
        [ProjectDashboardRoutes.REFERRAL_STEP]: name,
      });
    },
    [overrideBreadcrumbTitles]
  );

  if (loading) return <Loading />;
  if (error) throw error;
  if (!referral) return <NotFound />;

  return (
    <ReferralContent
      referral={referral}
      referralPath={generateSafePath(ProjectDashboardRoutes.REFERRAL, {
        referralId: referral.id,
        projectId: project.id,
      })}
      referralRouteState={referralRouteState}
      generateReferralStepPath={(stepId) =>
        generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
          referralId: referral.id,
          stepId,
          projectId: project.id,
        })
      }
      overrideStepTitle={overrideStepTitle}
      // Link to the target project if we are in the source project context
      linkToProject={project.id !== referral.targetProjectId}
    />
  );
};

export default ProjectReferralPage;
