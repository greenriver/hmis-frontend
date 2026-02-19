import React from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import EditCeDefaultContactsModal from '@/modules/ce/components/defaultContacts/EditCeDefaultContactsModal';
import {
  GetGlobalDefaultContactsDocument,
  useGetGlobalDefaultContactsQuery,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  onClose: () => void;
}
const EditGlobalCeDefaultContactsModal: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const {
    data: { globalCeDefaultContacts } = {},
    error: globalError,
    loading: globalLoading,
  } = useGetGlobalDefaultContactsQuery();
  const {
    data: { ceSwimlanes } = {},
    error: swimlanesError,
    loading: swimlanesLoading,
  } = useGetSwimlanesQuery();

  if (globalError) throw globalError;
  if (swimlanesError) throw swimlanesError;

  if (globalLoading || swimlanesLoading) {
    return (
      <CommonDialog open={open} onClose={onClose} fullWidth>
        <Loading />
      </CommonDialog>
    );
  }

  // unexpected to hit this line, since error and loading are false, but lets TS assume these will always be present
  if (!globalCeDefaultContacts || !ceSwimlanes) return null;

  return (
    <EditCeDefaultContactsModal
      key={JSON.stringify(globalCeDefaultContacts)} // force remount when initial value changes
      initialValue={globalCeDefaultContacts}
      ceSwimlanes={ceSwimlanes}
      title='Edit Global Contacts'
      open={open}
      onClose={onClose}
      // Refetch global contacts after mutation completes. The mutation doesn't return updated contacts
      // in the same shape as the original query, so Apollo's cache won't update automatically.
      // Refetching ensures the next time the modal opens, it displays the latest values.
      awaitRefetchQueriesOnSuccess={[GetGlobalDefaultContactsDocument]}
    />
  );
};

export default EditGlobalCeDefaultContactsModal;
