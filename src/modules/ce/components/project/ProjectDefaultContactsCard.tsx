import { Stack, Tooltip, Typography } from '@mui/material';
import { Fragment, useCallback, useMemo, useState } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import { ErrorIcon, InfoIcon } from '@/components/elements/SemanticIcons';
import EditCeDefaultContactsModal from '@/modules/ce/components/admin/EditCeDefaultContactsModal';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { ProjectWithCeDefaultContactsFragment } from '@/types/gqlTypes';

interface Props {
  project: ProjectWithCeDefaultContactsFragment;
}

const ProjectDefaultContactsCard: React.FC<Props> = ({ project }: Props) => {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);

  // todo @Martha - permission check against this project
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
          {!project.ceDefaultContacts?.length && (
            <Typography variant='body2' color='text.secondary'>
              No default contacts configured
            </Typography>
          )}
          {project.ceSwimlanes.map((swimlane) => {
            const contacts = contactsBySwimlane[swimlane.id] || [];
            const isEmpty = contacts.length === 0;

            return (
              <Stack key={swimlane.id} spacing={0.5}>
                <CommonLabeledTextBlock
                  title={
                    <>
                      {swimlane.name} ({swimlane.templateName}){' '}
                      <Tooltip
                        title={`Tasks: ${swimlane.taskNames.join(', ')}`}
                      >
                        <InfoIcon
                          sx={{
                            fontSize: 'inherit',
                            color: 'text.secondary',
                            verticalAlign: 'middle',
                            ml: 0.5,
                          }}
                        />
                      </Tooltip>
                    </>
                  }
                >
                  {isEmpty ? (
                    <Typography
                      variant='body2'
                      color='warning.dark'
                      fontWeight='600'
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <ErrorIcon sx={{ fontSize: 'inherit' }} />
                      <span>Missing</span>
                    </Typography>
                  ) : (
                    <>
                      {contacts.map((contact, idx) => (
                        <Fragment key={contact.user.id}>
                          {idx > 0 && ', '}
                          <span
                            // Italicize global contacts to indicate how they should be edited
                            // todo @martha - only italicize for user who can edit
                            style={{
                              fontStyle: contact.project ? 'normal' : 'italic',
                            }}
                          >
                            {contact.user.name}
                          </span>
                        </Fragment>
                      ))}
                    </>
                  )}
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
