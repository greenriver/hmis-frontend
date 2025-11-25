import LockIcon from '@mui/icons-material/Lock';
import { Alert, Chip, Grid, Stack, Typography } from '@mui/material';
import FormRulesCard from '../formRules/FormRulesCard';
import FormVersionTable from './FormVersionTable';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';

import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import FormDefinitionActionsCard from '@/modules/admin/components/forms/FormDefinitionActionsCard';
import FormStatusText from '@/modules/admin/components/forms/FormStatusText';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import { useGetFormIdentifierDetailsQuery } from '@/types/gqlTypes';

const FormDefinitionDetailPage = () => {
  const { identifier } = useSafeParams() as {
    identifier: string;
  };

  const {
    data: { formIdentifier } = {},
    error,
    loading,
  } = useGetFormIdentifierDetailsQuery({
    variables: { identifier },
  });

  if (error) throw error;
  if (!formIdentifier && loading) return <Loading />;
  if (!formIdentifier) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Selected Form'
        title={formIdentifier.displayVersion.title}
      />
      <Stack gap={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <CommonCard title='Details' TitleComponent='h5'>
              <Stack gap={2}>
                {formIdentifier.managedInVersionControl && (
                  <Alert severity='info' icon={<LockIcon />}>
                    <Typography variant='body2'>
                      This is a system-managed form. To make changes to the form
                      content, please contact support.
                    </Typography>
                  </Alert>
                )}
                {formIdentifier.adminEditableOnly && (
                  <Alert severity='info' icon={<LockIcon />}>
                    <Typography variant='body2'>
                      This form is locked
                      {formIdentifier.access.canManageForm && (
                        <> to non-admins</>
                      )}
                      .
                    </Typography>
                  </Alert>
                )}
                <CommonLabeledTextBlock title='Form ID'>
                  {formIdentifier.identifier}
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Form Type'>
                  <Chip
                    size='small'
                    sx={{ mt: 0.5 }}
                    label={
                      <HmisEnum
                        enumMap={HmisEnums.FormRole}
                        value={formIdentifier.displayVersion.role}
                      />
                    }
                  />
                </CommonLabeledTextBlock>
                <CommonLabeledTextBlock title='Form Status'>
                  <FormStatusText identifier={formIdentifier} />
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormDefinitionActionsCard formIdentifier={formIdentifier} />
          </Grid>
        </Grid>
        <FormRulesCard
          formId={formIdentifier.displayVersion.id}
          formTitle={formIdentifier.displayVersion.title}
          formRole={formIdentifier.displayVersion.role}
          formCacheKey={formIdentifier.displayVersion.cacheKey}
          managedInVersionControl={formIdentifier.managedInVersionControl}
        />
        <CommonCard
          title='Version History'
          headerVariant='border'
          TitleComponent='h2'
          padContent={false}
        >
          <FormVersionTable formIdentifier={formIdentifier.identifier} />
        </CommonCard>
      </Stack>
    </>
  );
};

export default FormDefinitionDetailPage;
