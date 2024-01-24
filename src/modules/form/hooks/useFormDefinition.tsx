import { useMemo } from 'react';

import { applyDefinitionRulesForClient, getItemMap } from '../util/formUtil';

import {
  ClientNameDobVetFragment,
  FormDefinitionFieldsFragment,
  GetFormDefinitionQueryVariables,
  RelationshipToHoH,
  useGetFormDefinitionByIdQuery,
  useGetFormDefinitionQuery,
} from '@/types/gqlTypes';

interface Args {
  // ID, if looking up FormDefinition by ID
  formDefinitionId?: string;
  // Query Variables, if looking up FormDefiniton by Role
  queryVariables?: GetFormDefinitionQueryVariables;
  // Local Definition, to bypass queries entirely
  localDefinition?: FormDefinitionFieldsFragment;
  // Skip queries
  skip?: boolean;
  // Optional, to apply "Data Collected About" rules
  client?: ClientNameDobVetFragment;
  // Optional, to apply "Data Collected About" rules
  relationshipToHoH?: RelationshipToHoH;
}

/**
 * There are 2 primary ways to find a Form Definition:
 * 1. Look up by ID. This is used for custom assessments.
 * 2. Look up by "role" context. This is used for most lookups.
 *     It will return the most relevant form for the given role and context.
 *
 * This hook also provides an option for passing a local definition which
 * will bypass all queries.
 *
 * If Client details are passed, this hook will apply DataCollectedAbout conditions,
 * so irrelevant questions are removed from the resulting definition.
 */
const useFormDefinition = ({
  formDefinitionId,
  queryVariables,
  localDefinition,
  skip,
  client,
  relationshipToHoH,
}: Args) => {
  // Query by ID
  const {
    data: dataById,
    loading: byIdLoading,
    error: byIdError,
  } = useGetFormDefinitionByIdQuery({
    variables: { id: formDefinitionId || '' },
    skip: skip || !formDefinitionId || !!localDefinition,
  });

  // Query by Role
  const {
    data: dataByRole,
    loading: byRoleLoading,
    error: byRoleError,
  } = useGetFormDefinitionQuery({
    variables: queryVariables,
    skip: skip || !queryVariables || !!formDefinitionId || !!localDefinition,
  });

  const { formDefinition, itemMap } = useMemo(() => {
    // Find the definition that we actually have
    let formDefinition =
      localDefinition ||
      dataById?.formDefinition ||
      dataByRole?.getFormDefinition;

    if (!formDefinition) return {};

    // If we have a Client, apply the DataCollectedAbout rules
    if (client) {
      formDefinition = applyDefinitionRulesForClient(
        formDefinition,
        client,
        relationshipToHoH || RelationshipToHoH.DataNotCollected
      );
    }

    return {
      formDefinition,
      // Generate ItemMap for convenience
      itemMap: getItemMap(formDefinition.definition, false),
    };
  }, [
    localDefinition,
    dataById?.formDefinition,
    dataByRole?.getFormDefinition,
    client,
    relationshipToHoH,
  ]);

  if (byIdError || byRoleError)
    throw new Error(
      `Failed to fetch form definition: ${
        formDefinitionId || queryVariables?.role || ''
      }`
    );

  return { formDefinition, itemMap, loading: byRoleLoading || byIdLoading };
};

export default useFormDefinition;
