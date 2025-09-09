import { Meta, StoryObj } from '@storybook/react';
import ReferralStepCard from '@/modules/ce/components/referral/ReferralStepCard';
import {
  CeOpportunityStatus,
  CeReferralFieldsFragment,
  CeReferralOrigin,
  CeReferralStatus,
  CeReferralStepStatus,
} from '@/types/gqlTypes';

export default {
  component: ReferralStepCard,
} as Meta<typeof ReferralStepCard>;

type Story = StoryObj<typeof ReferralStepCard>;

const mockStep = {
  id: '1',
  stepId: '1',
  name: 'A Test Step',
  status: CeReferralStepStatus.InProgress,
  swimlane: 'Case Managers',
  assignees: [
    {
      id: '1',
      name: 'Test User',
    },
    {
      id: '2',
      name: 'Another User',
    },
  ],
  updatedBy: {
    id: '1',
    name: 'Test User',
  },
  availableAt: '2023-10-01T12:00:00Z',
  updatedAt: '2023-10-01T12:00:00Z',
  access: {
    canPerformStep: true,
  },
};

const mockReferral: CeReferralFieldsFragment = {
  id: '1',
  status: CeReferralStatus.InProgress,
  targetProjectName: 'My Project',
  targetProjectId: '2',
  active: true,
  clientId: '1',
  clientName: 'Test Client',
  clientAge: 30,
  opportunity: {
    id: '1',
    projectId: '1',
    name: 'Unit 1',
    status: CeOpportunityStatus.Locked,
    active: true,
    projectName: 'Project ABC',
    dateAvailable: '2025-01-01',
  },
  createdAt: '2023-10-01T12:00:00Z',
  steps: [],
  swimlanes: [],
  auditEvents: {
    nodesCount: 0,
    nodes: [],
  },
  notes: {
    nodesCount: 0,
    nodes: [],
  },
  origin: CeReferralOrigin.Waitlist,
  access: {
    canAssignReferralTasks: true,
    canViewSourceEnrollmentDetails: true,
    canViewTargetProject: true,
  },
};

export const InProgress: Story = {
  args: {
    step: mockStep,
    referral: mockReferral,
  },
};

export const NotStarted: Story = {
  args: {
    step: { ...mockStep, status: CeReferralStepStatus.Available },
    referral: mockReferral,
  },
};

export const Locked: Story = {
  args: {
    step: { ...mockStep, status: CeReferralStepStatus.Unavailable },
    referral: mockReferral,
  },
};

export const Done: Story = {
  args: {
    step: { ...mockStep, status: CeReferralStepStatus.Completed },
    referral: mockReferral,
  },
};
