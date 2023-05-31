import { DocumentNode } from 'graphql';
import { useCallback } from 'react';

import RelativeDateDisplay from '@/modules/hmis/components/RelativeDateDisplay';
import apolloClient from '@/providers/apolloClient';

export function useRenderLastUpdated(
  typeName: string,
  fragment: DocumentNode,
  fragmentName: string
) {
  const renderMetadata = useCallback(
    (value: { id?: string }) => {
      if (!value.id) return null;
      const record = apolloClient.readFragment({
        id: `${typeName}:${value.id}`,
        fragment,
        fragmentName,
      });
      if (!record) return null;
      return (
        <RelativeDateDisplay
          dateString={record.dateUpdated}
          prefixVerb='Last updated'
          TypographyProps={{
            variant: 'body2',
            fontStyle: 'italic',
            color: 'text.disabled',
            fontSize: 'inherit',
          }}
        />
      );
    },
    [fragment, fragmentName, typeName]
  );

  return { renderMetadata } as const;
}
