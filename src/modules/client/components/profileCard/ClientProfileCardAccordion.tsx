import { Box, Typography } from '@mui/material';

import ClientAddress from '../ClientAddress';
import ClientContactPoint from '../ClientContactPoint';
import ClientProfileCardTextTable from './ClientProfileCardTextTable';
import CommonLabelWithSubtitle from '@/components/elements/CommonLabelWithSubtitle';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import { isDataNotCollected } from '@/modules/form/util/formUtil';
import HmisEnum, { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { pronouns } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
}

const ClientProfileCardAccordion: React.FC<Props> = ({ client }) => {
  const hasContactInformation =
    client.addresses.length > 0 ||
    client.phoneNumbers.length > 0 ||
    client.emailAddresses.length > 0;

  return (
    <Box
      sx={{
        '& .MuiAccordion-root:first-of-type': {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
      }}
    >
      <SimpleAccordion
        renderHeader={(header) => <Typography>{header}</Typography>}
        renderContent={(content) => content}
        AccordionProps={{
          sx: { '&.MuiAccordion-root': { mb: 0, mt: '-1px' } },
        }}
        items={[
          {
            key: 'Client IDs',
            content: (
              <ClientProfileCardTextTable
                content={client.externalIds.map((externalId, idx) => {
                  const repeated =
                    idx > 0 &&
                    client.externalIds[idx - 1].type === externalId.type;
                  return [
                    repeated ? null : (
                      <HmisEnum
                        enumMap={HmisEnums.ExternalIdentifierType}
                        value={externalId.type}
                        fontWeight={600}
                      />
                    ),
                    <ExternalIdDisplay value={externalId} />,
                  ] as const;
                })}
              />
            ),
          },
          ...(hasContactInformation
            ? [
                {
                  key: 'Contact Information',
                  content: (
                    <ClientProfileCardTextTable
                      condensed={false}
                      content={[
                        ...client.addresses.map((address) => {
                          return [
                            <CommonLabelWithSubtitle
                              label='Address'
                              subtitle={
                                address.use
                                  ? HmisEnums.ClientAddressUse[address.use]
                                  : undefined
                              }
                            />,
                            <ClientAddress address={address} />,
                          ] as const;
                        }),
                        ...client.phoneNumbers.map((phoneNumber) => {
                          return [
                            <CommonLabelWithSubtitle
                              label='Phone Number'
                              subtitle={
                                phoneNumber.use
                                  ? HmisEnums.ClientContactPointUse[
                                      phoneNumber.use
                                    ]
                                  : undefined
                              }
                            />,
                            <ClientContactPoint contactPoint={phoneNumber} />,
                          ] as const;
                        }),
                        ...client.emailAddresses.map((email) => {
                          return [
                            <>Email</>,
                            <ClientContactPoint contactPoint={email} />,
                          ] as const;
                        }),
                      ]}
                    />
                  ),
                },
              ]
            : []),
          {
            key: 'Demographics',
            defaultExpanded: true,
            content: (
              <ClientProfileCardTextTable
                content={Object.fromEntries(
                  [
                    [
                      'Race',
                      <MultiHmisEnum
                        values={client.race}
                        enumMap={HmisEnums.Race}
                        noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                        oneRowPerValue
                      />,
                    ],
                    [
                      'Gender',
                      client.gender.some(
                        (gender) => !isDataNotCollected(gender)
                      ) && (
                        <>
                          <MultiHmisEnum
                            values={client.gender}
                            enumMap={HmisEnums.Gender}
                            noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                            oneRowPerValue
                          >
                            {client.differentIdentityText && (
                              <Typography variant='body2'>
                                {client.differentIdentityText}
                              </Typography>
                            )}{' '}
                          </MultiHmisEnum>
                        </>
                      ),
                    ],
                    [
                      'Sex',
                      <HmisEnum
                        value={client.sex}
                        enumMap={HmisEnums.Sex}
                        noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                      />,
                    ],
                    ['Pronouns', pronouns(client)],
                    [
                      'Veteran Status',
                      <HmisEnum
                        value={client.veteranStatus}
                        enumMap={HmisEnums.NoYesReasonsForMissingData}
                        noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                      />,
                    ],
                  ].filter(([, value]) => value)
                )}
              />
            ),
          },
        ]}
      />
    </Box>
  );
};

export default ClientProfileCardAccordion;
