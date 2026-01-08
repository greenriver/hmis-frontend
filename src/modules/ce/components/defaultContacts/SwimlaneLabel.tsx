import { Tooltip } from '@mui/material';
import { InfoIcon } from '@/components/elements/SemanticIcons';
import { CeSwimlaneFieldsFragment } from '@/types/gqlTypes';

interface Props {
  swimlane: CeSwimlaneFieldsFragment;
  showTooltip?: boolean;
}

/**
 * Displays swimlane name with template name and tooltip showing associated tasks.
 * Format: "Swimlane Name (Template Name)" with info icon
 */
const SwimlaneLabel: React.FC<Props> = ({ swimlane, showTooltip = true }) => {
  return (
    <>
      {swimlane.name} ({swimlane.templateName}){' '}
      {showTooltip && (
        <Tooltip title={`Tasks: ${swimlane.taskNames.join(', ')}`}>
          <InfoIcon
            sx={{
              fontSize: 'inherit',
              color: 'text.secondary',
              verticalAlign: 'middle',
              ml: 0.5,
            }}
          />
        </Tooltip>
      )}
    </>
  );
};

export default SwimlaneLabel;
