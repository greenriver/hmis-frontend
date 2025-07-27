import { Box, Stack } from '@mui/material';
import { useMemo } from 'react';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import ClientCaseNoteCard from '@/modules/caseNotes/components/ClientCaseNoteCard';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { useGetClientCaseNotesQuery } from '@/types/gqlTypes';

/*
 * This component is used to print all case notes for a client.
 * It fetches the case notes and displays them in a format that
 * is suitable for printing from the browser. A future improvement
 * would be to have the backend generate a PDF for printing.
 */
const ClientCaseNotesPrintPage = () => {
  const { client } = useClientDashboardContext();
  const { data, loading } = useGetClientCaseNotesQuery({
    variables: { id: client?.id, includeOrganizationName: true, limit: 1000 },
    skip: !client,
  });

  const caseNotes = useMemo(
    () => data?.client?.customCaseNotes?.nodes || [],
    [data]
  );

  const isPrint = useIsPrintView();

  usePrintTrigger({
    startReady: isPrint,
    hold: loading,
  });

  // This page is not used for non-printing use-cases
  if (!isPrint) {
    return <NotFound />;
  }
  if (!client) return <NotFound />;

  return (
    <>
      <Box sx={{ displayPrint: 'none' }}>
        <PageTitle
          title={`${clientBriefName(client)}`}
          overlineText='Case Notes'
        />
      </Box>
      {loading && <LoadingSkeleton height={200} count={3} />}
      <Stack gap={2}>
        {caseNotes.map((note) => (
          <ClientCaseNoteCard key={note.id} caseNote={note} client={client} />
        ))}
      </Stack>
    </>
  );
};

export default ClientCaseNotesPrintPage;
