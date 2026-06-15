import { useMemo } from 'react';
import CeMatchGlobalRulesCard from './CeMatchGlobalRulesCard';
import CommonTabs from '@/components/elements/CommonTabs';
import {
  OrganizationIcon,
  GlobalIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';

const CeMatchRuleLevelTabs: React.FC = () => {
  const tabDefinitions = useMemo(
    () => [
      {
        title: 'Global',
        key: 'global',
        icon: <GlobalIcon />,
        iconPosition: 'start' as const,
        contents: <CeMatchGlobalRulesCard />,
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

export default CeMatchRuleLevelTabs;
