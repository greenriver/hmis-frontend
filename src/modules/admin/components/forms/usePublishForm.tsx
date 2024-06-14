import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/routes/routes';
import { usePublishFormDefinitionMutation } from '@/types/gqlTypes';

export function usePublishForm({
  formId,
  formIdentifier,
}: {
  formId?: string;
  formIdentifier?: string;
}) {
  const [publishForm, { loading: publishLoading, error: publishError }] =
    usePublishFormDefinitionMutation();

  const navigate = useNavigate();

  const onPublishForm = useCallback(() => {
    if (!formId || !formIdentifier) return;

    // Mutation will fail if user lacks canManageForms (and button is hidden), no need to check here
    publishForm({
      variables: {
        id: formId,
      },
      onCompleted: () => {
        navigate(
          generatePath(AdminDashboardRoutes.VIEW_FORM, {
            identifier: formIdentifier,
          })
        );
      },
    });
  }, [formId, formIdentifier, publishForm, navigate]);

  if (publishError) throw publishError;

  return {
    publishLoading,
    onPublishForm,
  } as const;
}
