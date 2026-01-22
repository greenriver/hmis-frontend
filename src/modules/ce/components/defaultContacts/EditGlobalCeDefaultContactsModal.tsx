import React from 'react';
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
  const { data: { globalCeDefaultContacts } = {}, error: globalError } =
    useGetGlobalDefaultContactsQuery();
  const { data: { ceSwimlanes } = {}, error: swimlanesError } =
    useGetSwimlanesQuery();

  if (globalError) throw globalError;
  if (swimlanesError) throw swimlanesError;
  if (!globalCeDefaultContacts || !ceSwimlanes) return null; // won't be able to open the modal until initial data is fetched

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
