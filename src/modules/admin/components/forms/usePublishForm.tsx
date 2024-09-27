import { useCallback, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/app/routes';
import {
  ErrorState,
  emptyErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { usePublishFormDefinitionMutation } from '@/types/gqlTypes';

export function usePublishForm({
  formId,
  formIdentifier,
}: {
  formId?: string;
  formIdentifier?: string;
}) {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);
  const navigate = useNavigate();
  const [publishForm, { loading: publishLoading }] =
    usePublishFormDefinitionMutation({
      onError: (e) => setErrorState({ ...emptyErrorState, apolloError: e }),
      onCompleted: (data) => {
        if (
          data.publishFormDefinition?.errors &&
          data.publishFormDefinition.errors.length > 0
        ) {
          setErrorState(
            partitionValidations(data.publishFormDefinition.errors)
          );
        } else if (data.publishFormDefinition?.formIdentifier) {
          navigate(
            generatePath(AdminDashboardRoutes.VIEW_FORM, {
              identifier: formIdentifier,
            })
          );
        }
      },
    });

  const onPublishForm = useCallback(() => {
    if (!formId || !formIdentifier) return;

    // Mutation will fail if user lacks canManageForms (and button is hidden), no need to check here
    publishForm({ variables: { id: formId } });
  }, [formId, formIdentifier, publishForm]);

  return {
    publishLoading,
    onPublishForm,
    publishErrorState: errorState,
  } as const;
}
