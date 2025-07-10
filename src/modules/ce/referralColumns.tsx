import { isNil } from 'lodash-es';
import CommonTruncatedList from '@/components/elements/CommonTruncatedList';
import { ColumnDef } from '@/components/elements/table/types';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  CeReferralTableFieldsFragment,
  CeReferralWithProjectFieldsFragment,
  ClientCeReferralTableFieldsFragment,
} from '@/types/gqlTypes';

export const REFERRAL_COLUMNS: Record<
  string,
  ColumnDef<CeReferralTableFieldsFragment | ClientCeReferralTableFieldsFragment>
> = {
  client: {
    header: 'Client',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => referral.clientName,
    key: 'name',
    sticky: 'left',
  },
  opportunity: {
    header: 'Unit',
    key: 'unit',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => referral.opportunity.name,
  },
  date: {
    header: 'Referral Date',
    key: 'date',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => parseAndFormatDate(referral.createdAt),
  },
  status: {
    header: 'Status',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => <ReferralStatusChip status={referral.status} size='small' />,
    key: 'status',
  },
  currentSteps: {
    key: 'currentSteps',
    header: 'Current Task',
    render: (referral) => {
      if (!referral.currentSteps || referral.currentSteps.length === 0) return;
      return (
        <CommonTruncatedList
          items={referral.currentSteps?.map((s) => s.name)}
        />
      );
    },
  },
  daysOnCurrentTask: {
    key: 'daysOnCurrentTask',
    header: 'Days on Current Task',
    render: ({ daysOnCurrentSteps }) => {
      if (isNil(daysOnCurrentSteps)) return; // no open steps
      if (daysOnCurrentSteps === 0) return '< 1 day';
      return `${daysOnCurrentSteps} day${daysOnCurrentSteps > 1 ? 's' : ''}`;
    },
  },
  currentTaskSwimlane: {
    key: 'currentTaskSwimlane',
    header: 'Assigned To',
    render: (referral) => {
      if (!referral.currentSteps || referral.currentSteps.length === 0) return;
      return (
        <CommonTruncatedList
          items={referral.currentSteps?.map((s) => s.swimlane)}
        />
      );
    },
  },
  currentTaskAssignees: {
    key: 'currentTaskAssignees',
    header: 'Current Task Assignees',
    render: (referral) => {
      if (!referral.currentSteps || referral.currentSteps.length === 0) return;

      const assignees = referral.currentSteps.flatMap((s) =>
        s.assignees.map((a) => a.name)
      );
      return <CommonTruncatedList items={assignees} />;
    },
  },
  referredBy: {
    header: 'Referred By',
    key: 'referredBy',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => referral.referredBy?.name,
  },
  // TODO(#7321) - add column for sending project
};

export const REFERRAL_WITH_PROJECT_COLUMNS: {
  [key: string]: ColumnDef<CeReferralWithProjectFieldsFragment>;
} = {
  projectName: {
    header: 'Project Name',
    key: 'projectName',
    render: (referral: CeReferralWithProjectFieldsFragment) =>
      referral.targetProjectName,
  },
  projectType: {
    header: 'Project Type',
    key: 'projectType',
    render: (referral: CeReferralWithProjectFieldsFragment) => (
      <ProjectTypeChip projectType={referral.targetProjectType} />
    ),
  },
};
