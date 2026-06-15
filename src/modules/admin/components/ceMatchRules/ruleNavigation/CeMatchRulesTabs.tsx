import { useMemo } from 'react';
import CeMatchGlobalRules from './CeMatchGlobalRules';
import CommonTabs from '@/components/elements/CommonTabs';
import {
  OrganizationIcon,
  GlobalIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';

const CeMatchRulesTabs: React.FC = () => {
  const tabDefinitions = useMemo(
    () => [
      {
        title: 'Global',
        key: 'global',
        icon: <GlobalIcon />,
        iconPosition: 'start' as const,
        contents: <CeMatchGlobalRules />,
      },
      {
        title: 'Organization',
        key: 'organization',
        icon: <OrganizationIcon />,
        iconPosition: 'start' as const,
        contents: null,
      },
      {
        title: 'Project',
        key: 'project',
        icon: <ProjectIcon />,
        iconPosition: 'start' as const,
        contents: null,
      },
      {
        title: 'Unit Group',
        key: 'unitGroup',
        icon: <UnitGroupIcon />,
        iconPosition: 'start' as const,
        contents: null,
      },
    ],
    []
  );

  return (
    <CommonTabs
      ariaLabel='CE match rules levels'
      tabDefinitions={tabDefinitions}
    />
  );
};

export default CeMatchRulesTabs;
