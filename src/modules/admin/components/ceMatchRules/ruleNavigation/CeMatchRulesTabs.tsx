import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ceMatchRuleOwnerLevelConfigs,
  type CeMatchRuleOwnerLevel,
} from '../ceMatchRuleOwnerLevelConfig';
import CeMatchGlobalRules from './CeMatchGlobalRules';
import CeMatchOrganizationRules from './CeMatchOrganizationRules';
import CommonTabs from '@/components/elements/CommonTabs';
import {
  GlobalIcon,
  OrganizationIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';

const CeMatchRulesTabs: React.FC<{
  selectedOwnerLevel: CeMatchRuleOwnerLevel;
}> = ({ selectedOwnerLevel }) => {
  const navigate = useNavigate();

  const tabDefinitions = useMemo(
    () => [
      {
        title: ceMatchRuleOwnerLevelConfigs.global.label,
        key: 'global',
        icon: <GlobalIcon />,
        iconPosition: 'start' as const,
        contents: <CeMatchGlobalRules />,
      },
      {
        title: ceMatchRuleOwnerLevelConfigs.organization.label,
        key: 'organization',
        icon: <OrganizationIcon />,
        iconPosition: 'start' as const,
        contents: <CeMatchOrganizationRules />,
      },
      {
        title: ceMatchRuleOwnerLevelConfigs.project.label,
        key: 'project',
        icon: <ProjectIcon />,
        iconPosition: 'start' as const,
        contents: null,
      },
      {
        title: ceMatchRuleOwnerLevelConfigs['unit-group'].label,
        key: 'unit-group',
        icon: <UnitGroupIcon />,
        iconPosition: 'start' as const,
        contents: null,
      },
    ],
    []
  );

  const handleChangeTab = (key: string) => {
    if (!(key in ceMatchRuleOwnerLevelConfigs)) return;

    navigate(ceMatchRuleOwnerLevelConfigs[key as CeMatchRuleOwnerLevel].route);
  };

  return (
    <CommonTabs
      ariaLabel='CE match rules levels'
      currentTab={selectedOwnerLevel}
      onChangeTab={handleChangeTab}
      tabDefinitions={tabDefinitions}
    />
  );
};

export default CeMatchRulesTabs;
