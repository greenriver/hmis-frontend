import {
  Box,
  Chip,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ceMatchRuleOwnerLevelConfigs,
  type CeMatchRuleOwnerLevel,
} from '../ceMatchRuleOwnerLevelConfig';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import GenericTable from '@/components/elements/table/GenericTable';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { HmisEnums } from '@/types/gqlEnums';
import { CeMatchRuleAdminSummaryFieldsFragment } from '@/types/gqlTypes';

export interface CeMatchRuleGroupTableProps {
  ownerLevel: CeMatchRuleOwnerLevel;
  // Accepts rules as input, rather than using GenericTableWithData,
  // to enable useful design affordances like listing the rules count in parent components
  // without duplicating queries.
  rules: CeMatchRuleAdminSummaryFieldsFragment[];
  variant?: 'current' | 'inherited';
}

/**
 * Displays CE Match Rules at a given owner level.
 * Uses GenericTable internally, but displays the rules with custom styling using renderRow.
 */
const CeMatchRuleGroupTable: React.FC<CeMatchRuleGroupTableProps> = ({
  ownerLevel,
  rules,
  variant = 'inherited',
}) => {
  return (
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
        columns={[]}
        noHead
        noData={
          <Typography variant='body2' textAlign='center'>
            No {ceMatchRuleOwnerLevelConfigs[ownerLevel].label.toLowerCase()}{' '}
            rules have been created.
          </Typography>
        }
        rowName={(rule) => rule.name}
        renderRow={(rule) => {
          const actionConfigs: CommonMenuItem[] = [
            {
              key: 'primary',
              title: 'View Rule',
              ariaLabel: `View Rule, ${rule.name}`,
              // TODO(#7544) existing rules don't link anywhere yet, implementing in a later phase
            },
          ];

          return (
            <TableRow key={rule.id}>
              <TableCell colSpan={0} sx={{ border: 0, p: 0 }}>
                <Box
                  sx={{
                    bgcolor: 'grayscale.50',
                    borderRadius: 1,
                    mb: 0.5,
                    pl: 2,
                    pr: 1,
                    py: 1,
                  }}
                >
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    gap={1}
                  >
                    <Stack direction='row' alignItems='flex-start' gap={2}>
                      <Tooltip title={rule.expression} arrow placement='top'>
                        <Typography
                          variant='body2'
                          component='span'
                          sx={{ width: 'fit-content' }}
                        >
                          {rule.name}
                        </Typography>
                      </Tooltip>
                      {!!(rule.funders?.length || rule.projectTypes.length) && (
                        <>
                          <Stack direction='row' gap={0.5} flexWrap='wrap'>
                            {rule.funders?.map((funder) => (
                              <Chip
                                key={`funder-${funder}`}
                                size='small'
                                variant='outlined'
                                label={
                                  HmisEnums.FundingSource[funder] || funder
                                }
                              />
                            ))}
                            {rule.projectTypes.map((projectType) => (
                              <Chip
                                key={`project-type-${projectType}`}
                                size='small'
                                variant='outlined'
                                label={
                                  HmisEnums.ProjectType[projectType] ||
                                  projectType
                                }
                              />
                            ))}
                          </Stack>
                        </>
                      )}
                    </Stack>
                    <TableRowActions
                      record={rule}
                      recordName={rule.name}
                      menuActionConfigs={actionConfigs}
                    />
                  </Stack>
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
        tableContainerProps={{ sx: { overflow: 'wrap' } }}
      />
    </Stack>
  );
};

export default CeMatchRuleGroupTable;
