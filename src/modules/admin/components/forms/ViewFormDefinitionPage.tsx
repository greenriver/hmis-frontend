import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/material';
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import Loading from '@/components/elements/Loading';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectedAbout,
  FormRuleFieldsFragment,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
  useGetFormDefinitionByIdQuery,
} from '@/types/gqlTypes';

const FORM_RULE_COLUMNS: ColumnDef<FormRuleFieldsFragment>[] = [
  {
    header: 'Active Status',
    render: ({ active }) => (
      <Stack direction={'row'} gap={1}>
        {active ? 'Active' : 'Inactive'}
        {/* {system && <SystemChip />} */}
      </Stack>
    ),
  },
  {
    header: 'Project Applicability',
    render: ({ projectType }) =>
      projectType ? (
        <ProjectTypeChip projectType={projectType} />
      ) : (
        <NotCollectedText>All Project Types</NotCollectedText>
      ),
  },
  {
    header: 'Funder',
    render: ({ funder, otherFunder }) => {
      if (funder) return HmisEnums.FundingSource[funder];
      if (otherFunder) return otherFunder;
      return <NotCollectedText>All Funders</NotCollectedText>;
    },
  },
  {
    header: 'Data Collected About',
    render: ({ dataCollectedAbout }) =>
      dataCollectedAbout
        ? HmisEnums.DataCollectedAbout[dataCollectedAbout]
        : HmisEnums.DataCollectedAbout[DataCollectedAbout.AllClients],
  },
  // TODO: direct project applicability
  // TODO: direct organization applicability
];

const ViewFormDefinitionPage = () => {
  const { formId } = useParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionByIdQuery({
      variables: { id: formId },
    });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={formDefinition?.title} />

      <TitleCard
        title='Form Rules'
        headerVariant='border'
        actions={
          <ButtonLink to='' Icon={AddIcon}>
            New Rule
          </ButtonLink>
        }
      >
        <GenericTableWithData<
          GetFormRulesQuery,
          GetFormRulesQueryVariables,
          FormRuleFieldsFragment
        >
          queryVariables={{ filters: { definition: formId } }}
          queryDocument={GetFormRulesDocument}
          columns={FORM_RULE_COLUMNS}
          pagePath='formRules'
          noData='No form rules'
          showFilters
          recordType='FormRule'
          filterInputType='FormRuleFilterOptions'
          paginationItemName='rule'
          // TODO: click to edit in a modal

          // handleRowClick={onRowClick}
          // defaultFilters={{
          //   activeStatus: [ActiveStatus.Active],
          //   systemForm: [SystemStatus.NonSystem],
          // }}
        />
      </TitleCard>
    </>
  );
};

export default ViewFormDefinitionPage;
