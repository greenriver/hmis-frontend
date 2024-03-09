import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import HomeIcon from '@mui/icons-material/Home';
import { Chip, ChipProps } from '@mui/material';
import { Stack } from '@mui/system';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormRuleFieldsFragment,
  ProjectConfigFieldsFragment,
} from '@/types/gqlTypes';
interface Props {
  rule: FormRuleFieldsFragment | ProjectConfigFieldsFragment;
}

function isFormRuleFragment(
  obj: FormRuleFieldsFragment | ProjectConfigFieldsFragment
): obj is FormRuleFieldsFragment {
  return obj && obj.hasOwnProperty('funder');
}

const ProjectApplicabilitySummary: React.FC<Props> = ({ rule }) => {
  const { projectType, project, organization } = rule;
  const funder = isFormRuleFragment(rule) ? rule.funder : undefined;
  const otherFunder = isFormRuleFragment(rule) ? rule.otherFunder : undefined;

  if (!projectType && !funder && !otherFunder && !project && !organization) {
    return <Chip size='small' label='All Projects' />;
  }

  const chipProps: ChipProps = { size: 'small' };

  return (
    <Stack
      sx={{ '.MuiChip-root': { width: 'fit-content', px: 0.5 } }}
      gap={1}
      direction='row'
    >
      {projectType && (
        <ProjectTypeChip
          projectType={projectType}
          variant='filled'
          color='primary'
        />
      )}
      {funder && (
        <Chip
          {...chipProps}
          icon={<AttachMoneyIcon />}
          label={HmisEnums.FundingSource[funder]}
          color='success'
        />
      )}
      {otherFunder && (
        <Chip
          {...chipProps}
          icon={<AttachMoneyIcon />}
          label={otherFunder}
          color='success'
        />
      )}
      {project && (
        <Chip
          {...chipProps}
          icon={<HomeIcon />}
          label={project.projectName}
          color='secondary'
        />
      )}
      {organization && (
        <Chip
          {...chipProps}
          icon={<CorporateFareIcon />}
          label={organization.organizationName}
          color='secondary'
        />
      )}
    </Stack>
  );
};

export default ProjectApplicabilitySummary;
