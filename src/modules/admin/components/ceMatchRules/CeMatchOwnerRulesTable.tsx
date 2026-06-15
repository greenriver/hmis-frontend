import { Stack, Typography } from '@mui/material';
import {
  CeMatchRuleOwnerLevel,
  getPluralCeMatchRuleOwnerLevelLabel,
} from './ceMatchRuleFormUtil';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { HmisEnums } from '@/types/gqlEnums';
import { CeMatchRuleAdminSummaryFieldsFragment } from '@/types/gqlTypes';

const ruleColumns: ColumnDef<CeMatchRuleAdminSummaryFieldsFragment>[] = [
  {
    key: 'name',
    render: 'name',
    tableCellProps: {
      sx: { borderBottom: 'none', py: 1 },
    },
  },
  {
    key: 'ruleType',
    render: ({ ruleType }) => HmisEnums.CeMatchRuleType[ruleType],
    tableCellProps: {
      sx: {
        borderBottom: 'none',
        color: 'text.secondary',
        py: 1,
      },
    },
  },
  {
    key: 'applicability',
    render: ({ funders, projectTypes }) => {
      if (!funders?.length && !projectTypes.length) {
        return 'All Projects';
      }

      return (
        <Stack>
          {!!funders?.length && <span>Funder Specific</span>}
          {!!projectTypes.length && <span>Project Type Specific</span>}
        </Stack>
      );
    },
    tableCellProps: {
      sx: {
        borderBottom: 'none',
        color: 'text.secondary',
        py: 1,
      },
    },
  },
];

export interface CeMatchOwnerRulesTableProps {
  ownerLevel: CeMatchRuleOwnerLevel;
  // Accepts rules as input, rather than using GenericTableWithData,
  // to enable useful design affordances like listing the rules count in parent components
  // without duplicating queries.
  rules: CeMatchRuleAdminSummaryFieldsFragment[];
  variant?: 'current' | 'inherited';
  rowSecondaryActionConfigs?: (
    rule: CeMatchRuleAdminSummaryFieldsFragment
  ) => CommonMenuItem[];
}

const CeMatchOwnerRulesTable: React.FC<CeMatchOwnerRulesTableProps> = ({
  ownerLevel,
  rules,
  variant = 'inherited',
  rowSecondaryActionConfigs,
}) => (
  <Stack
    gap={0.5}
    sx={{
      ml: 1,
      pl: 2,
      borderLeft: 4,
      borderColor: variant === 'current' ? 'primary.main' : 'divider',
    }}
  >
    <GenericTable<CeMatchRuleAdminSummaryFieldsFragment>
      rows={rules}
      columns={ruleColumns}
      noHead
      noData={
        <Typography variant='body2' textAlign='center'>
          No {getPluralCeMatchRuleOwnerLevelLabel(ownerLevel)} rules have been
          created.
        </Typography>
      }
      rowName={(rule) => rule.name}
      rowSecondaryActionConfigs={rowSecondaryActionConfigs}
      tableContainerProps={{ sx: { overflow: 'visible' } }}
      tableProps={{
        sx: {
          borderCollapse: 'separate',
          borderSpacing: '0 4px',
          height: 'auto',
          '.MuiTableRow-root': {
            backgroundColor: 'grayscale.50',
          },
          '.MuiTableCell-root:first-of-type': {
            borderTopLeftRadius: 1,
            borderBottomLeftRadius: 1,
          },
          '.MuiTableCell-root:last-of-type': {
            borderTopRightRadius: 1,
            borderBottomRightRadius: 1,
          },
        },
      }}
    />
  </Stack>
);

export default CeMatchOwnerRulesTable;
