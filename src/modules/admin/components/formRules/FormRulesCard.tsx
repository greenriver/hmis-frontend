import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Divider, Typography } from '@mui/material';

import { useState } from 'react';
import FormRuleTable from '../formRules/FormRuleTable';
import TitleCard from '@/components/elements/TitleCard';
import FormProjectMatchTable from '@/modules/admin/components/formRules/FormProjectMatchTable';
import NewFormRuleDialog from '@/modules/admin/components/formRules/NewFormRuleDialog';
import { FormRole, useGetFormProjectMatchesQuery } from '@/types/gqlTypes';

interface Props {
  formId: string;
  formTitle: string;
  formRole: FormRole;
}
const FormRulesCard: React.FC<Props> = ({ formId, formTitle, formRole }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Fetch here in order to display the total number of project matches outside of the table.
  // FormProjectMatchTable also requests this, but there is no easy way to get the data out of GenericTable
  const { data: fetchFormData } = useGetFormProjectMatchesQuery({
    variables: { id: formId, limit: 0 },
  });
  const matchCount = fetchFormData?.formDefinition?.projectMatches.nodesCount;

  return (
    <>
      <TitleCard
        title='Form Applicability'
        headerTypographyVariant='h5'
        headerComponent='h2'
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            startIcon={<AddIcon />}
            variant='text'
          >
            New Rule
          </Button>
        }
      >
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant='h6' component='h3' sx={{ pb: 1 }}>
            Rules
          </Typography>
          <Typography variant='body1'>
            This form applies to projects that match any of the following rules.
          </Typography>
        </Box>
        <Divider sx={{ borderWidth: 'inherit' }} />
        <FormRuleTable formId={formId} formRole={formRole} />
        <Box padding={2}>
          <Typography variant='h6' component='h3' sx={{ pb: 1 }}>
            Projects
          </Typography>
          <Typography variant='body1'>
            This form applies to the following{' '}
            {matchCount ? matchCount + ' ' : ''}
            projects based on the current rules.
          </Typography>
        </Box>
        <FormProjectMatchTable formId={formId} />
      </TitleCard>
      <NewFormRuleDialog
        formId={formId}
        formTitle={formTitle}
        formRole={formRole}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default FormRulesCard;
