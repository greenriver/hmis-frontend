import { Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import SwimlaneLabel from './SwimlaneLabel';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import DefaultContactNamesList from '@/modules/ce/components/defaultContacts/DefaultContactNamesList';
import EditCeDefaultContactsModal from '@/modules/ce/components/defaultContacts/EditCeDefaultContactsModal';
import ProjectNoSwimlanesAlert from '@/modules/ce/components/defaultContacts/ProjectNoSwimlanesAlert';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { ProjectWithCeDefaultContactsFragment } from '@/types/gqlTypes';

interface Props {
  project: ProjectWithCeDefaultContactsFragment;
}

const ProjectDefaultContactsCard: React.FC<Props> = ({ project }: Props) => {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);

  const [rootPermissions] = useRootPermissions();
  const canEditContacts = rootPermissions?.canAdministrateCoordinatedEntry;

  const cardActions = useMemo(() => {
    if (!canEditContacts) return undefined;

    return (
      <CommonMenuButton
        iconButton
        title='Actions'
        items={[
          {
            key: 'edit-global',
            title: 'Edit Global Contacts',
            onClick: () => setGlobalModalOpen(true),
          },
          {
            key: 'edit-project',
            title: 'Edit Project Contacts',
            onClick: () => setProjectModalOpen(true),
          },
        ]}
        ButtonProps={{
          'aria-label': 'Default Contacts Actions',
        }}
      />
    );
  }, [canEditContacts]);

  // For convenience, group project contacts by swimlane ID
  const contactsBySwimlane = project.ceDefaultContacts.reduce(
    (acc, item) => {
      acc[item.swimlane.id] = item.contacts;
      return acc;
    },
    {} as Record<string, (typeof project.ceDefaultContacts)[0]['contacts']>
  );

  const handleClose = useCallback(() => {
    cache.evict({
      id: `Project:${project.id}`,
      fieldName: 'ceDefaultContacts',
    });
    setProjectModalOpen(false);
    setGlobalModalOpen(false);
  }, [project.id]);

  return (
    <>
      <CommonCard title='Default Contacts' actions={cardActions}>
        <Stack spacing={2}>
          {!project.ceSwimlanes?.length && <ProjectNoSwimlanesAlert />}
          {project.ceSwimlanes.map((swimlane) => {
            const contacts = contactsBySwimlane[swimlane.id] || [];

            return (
              <Stack key={swimlane.id} spacing={0.5}>
                <CommonLabeledTextBlock
                  title={<SwimlaneLabel swimlane={swimlane} />}
                >
                  <DefaultContactNamesList
                    contacts={contacts}
                    // Italicize global contacts for editors, to help indicate how they should be edited
                    // (at the project level or globally).
                    italicizeGlobalContacts={canEditContacts}
                  />
                </CommonLabeledTextBlock>
              </Stack>
            );
          })}
        </Stack>
      </CommonCard>

      {projectModalOpen && (
        <EditCeDefaultContactsModal
          project={project}
          open={projectModalOpen}
          onClose={handleClose}
        />
      )}
      {globalModalOpen && (
        <EditCeDefaultContactsModal
          open={globalModalOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default ProjectDefaultContactsCard;
