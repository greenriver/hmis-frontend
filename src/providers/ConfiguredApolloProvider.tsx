import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  from,
  createHttpLink,
  ServerError,
  FieldReadFunction,
  FieldMergeFunction,
  FieldFunctionOptions,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import fetch from 'cross-fetch';

import * as storage from '@/modules/auth/api/storage';
import { getCsrfToken } from '@/utils/csrf';

const httpLink = createHttpLink({
  uri: import.meta.env.PUBLIC_HMIS_GRAPHQL_API,
  fetch,
});

const authLink = setContext(
  (
    _,
    { headers }: { headers: { [key: string]: string } }
  ): { headers: Record<string, string> } => {
    return {
      headers: {
        ...headers,
        'X-CSRF-Token': getCsrfToken(),
      },
    };
  }
);

/**
 * Handle errors on GraphQL chain.
 *
 * If unauthenticated, remove user info from storage and redirect to the login page.
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) console.log('[GraphQL error]', graphQLErrors);

  if (networkError) {
    console.log('[Network error]', networkError);
    if ((networkError as ServerError).statusCode == 401) {
      storage.removeUser();
      location.reload();
    }
  }
});

const offsetLimitMerge: FieldMergeFunction<any, any, FieldFunctionOptions> = (
  existing: any[] | undefined,
  incoming: any[],
  { variables }
): any[] => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const offset: number = variables?.offset ?? 0;

  const merged: any[] = existing ? existing.slice(0) : [];
  for (let i = 0; i < incoming.length; ++i) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    merged[offset + i] = incoming[i];
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return merged;
};

const offsetLimitRead: FieldReadFunction<any[]> = (
  existing,
  { variables }
): any[] | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const offset: number = variables?.offset ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const limit: number = variables?.limit ?? existing?.length;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return existing?.slice(offset, offset + limit);
};

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        clientSearch: {
          keyArgs: ['input'],
        },
      },
    },
    ClientsPaginated: {
      fields: {
        nodes: {
          merge: offsetLimitMerge,
          read: offsetLimitRead,
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  credentials: 'same-origin',
});

export default ({ children }: { children: React.ReactNode }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
);
