import { startCase } from 'lodash-es';

import { PickListArgs } from '@/modules/form/types';
import { getSchemaForInputType } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import { PickListType } from '@/types/gqlTypes';
import { FilterType, BaseFilter } from '@/types/tableFilterTypes';

// Default remote pick lists to use for filters, based on filter name
const FILTER_NAME_TO_PICK_LIST = {
  project: PickListType.Project,
  appliedToProject: PickListType.Project,
  organization: PickListType.Organization,
  assessmentName: PickListType.AssessmentNames,
  serviceType: PickListType.AllServiceTypes,
  user: PickListType.Users,
  clientRecordType: PickListType.ClientAuditEventRecordTypes,
  enrollmentRecordType: PickListType.EnrollmentAuditEventRecordTypes,
  assignedStaff: PickListType.EligibleStaffAssignmentUsers,
  workflowTemplate: PickListType.CeWorkflowTemplateIdentifiersIncludingRetired,
  unitType: PickListType.PossibleUnitTypesForProject,
  referralStatus: PickListType.CeReferralStatuses,
};

function remotePickListForFilterName(
  filterName: string
): PickListType | undefined {
  if (Object.keys(FILTER_NAME_TO_PICK_LIST).includes(filterName)) {
    return FILTER_NAME_TO_PICK_LIST[
      filterName as keyof typeof FILTER_NAME_TO_PICK_LIST
    ];
  }
  return undefined;
}

const getGraphqlSchemaTypeName = (
  type: GqlInputObjectSchemaType
): GqlInputObjectSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getGraphqlSchemaTypeName(type.ofType);
};

const getFilterForType = (
  fieldName: any,
  type: GqlInputObjectSchemaType,
  filterPickListArgs?: PickListArgs
): FilterType<any> | null => {
  const inputType = getGraphqlSchemaTypeName(type);
  if (!inputType) return null;

  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName).replace(/\bHoh\b/, 'HoH'),
    multi: type.kind === 'LIST',
  };

  let filter: FilterType<any> | null = null;

  if (inputType === 'ISO8601Date') filter = { ...baseFields, type: 'date' };
  if (inputType === 'Boolean') filter = { ...baseFields, type: 'boolean' };

  const remotePickList = remotePickListForFilterName(fieldName);
  if (remotePickList) {
    filter = {
      ...baseFields,
      type: 'remote_picklist',
      pickListReference: remotePickList,
      pickListArgs: filterPickListArgs,
    };
  }

  if (inputType in HmisEnums) {
    filter = {
      ...baseFields,
      enumType: inputType as keyof typeof HmisEnums,
      type: 'enum',
    };
  }

  if (!filter && inputType === 'String') {
    // console.log('Skipping free-text filter:', fieldName);
    return null; // Free-text filters are not supported because PII is not allowed in URL
  }

  return filter || null;
};

export const getFilter = (
  inputType: string,
  fieldName: string,
  filterPickListArgs?: PickListArgs
): FilterType<any> | null => {
  const fieldSchema = (getSchemaForInputType(inputType)?.args || []).find(
    (f) => f.name === fieldName
  );
  if (!fieldSchema) return null;

  return getFilterForType(fieldName, fieldSchema.type, filterPickListArgs);
};
