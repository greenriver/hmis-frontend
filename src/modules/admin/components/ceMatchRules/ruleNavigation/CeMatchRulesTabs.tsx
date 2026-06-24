import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ceMatchRuleOwnerLevelConfigs,
  ceMatchRuleOwnerLevels,
  type CeMatchRuleOwnerLevel,
} from '../ceMatchRuleOwnerLevelConfig';
import CeMatchGlobalRules from './CeMatchGlobalRules';
import CommonTabs from '@/components/elements/CommonTabs';

/**
 * Renders the owner-level tabs for CE rules, including scaffolded levels.
 */
const CeMatchRulesTabs: React.FC<{
  selectedOwnerLevel: CeMatchRuleOwnerLevel;
}> = ({ selectedOwnerLevel }) => {
  const navigate = useNavigate();

  const tabDefinitions = useMemo(() => {
    const ownerLevelContents: Partial<
      Record<CeMatchRuleOwnerLevel, ReactNode>
    > = {
      global: <CeMatchGlobalRules />,
    };

    return ceMatchRuleOwnerLevels.map((ownerLevel) => {
      const { Icon, label } = ceMatchRuleOwnerLevelConfigs[ownerLevel];

      return {
        title: label,
        key: ownerLevel,
        icon: <Icon />,
        iconPosition: 'start' as const,
        contents: ownerLevelContents[ownerLevel] || null,
      };
    });
  }, []);

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
