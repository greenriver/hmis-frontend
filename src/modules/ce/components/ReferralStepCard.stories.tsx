import { Meta, StoryObj } from '@storybook/react';
import ReferralStepCard from '@/modules/ce/components/ReferralStepCard';
import {
  CeOpportunityStatus,
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
  assignees: [],
  updatedBy: {
    id: '1',
    name: 'Test User',
  },
  updatedAt: '2023-10-01T12:00:00Z',
  access: {
    canPerformStep: true,
  },
};

const mockReferral = {
  id: '1',
  status: CeReferralStatus.InProgress,
  active: true,
  clientId: '1',
  opportunity: {
    id: '1',
    projectId: '1',
    name: 'Unit 1',
    categories: [],
    status: CeOpportunityStatus.Locked,
    active: true,
    projectName: 'Project ABC',
  },
  steps: [],
  swimlanes: [],
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
