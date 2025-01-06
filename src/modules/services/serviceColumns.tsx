import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { ColumnDef } from '@/components/elements/table/types';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import {
  ServiceBasicFieldsFragment,
  ServiceFieldsFragment,
  ServiceTypeConfigFieldsFragment,
} from '@/types/gqlTypes';

export const getServiceTypeForDisplay = (
  serviceType?: Pick<
    ServiceTypeConfigFieldsFragment,
    'name' | 'serviceCategory'
  > | null
) => {
  if (!serviceType) return 'Unknown Service';
  const { name, serviceCategory } = serviceType;
  if (name === serviceCategory.name) return name;
  return `${serviceCategory.name} - ${name}`;
};

export const SERVICE_BASIC_COLUMNS: {
  [key: string]: ColumnDef<ServiceBasicFieldsFragment>;
} = {
  serviceDate: {
    header: 'Service Date',
    render: (s) => parseAndFormatDate(s.dateProvided),
  },
  serviceType: {
    header: 'Service Type',
    render: (s) => getServiceTypeForDisplay(s.serviceType),
  },
};

export const SERVICE_COLUMNS: {
  [key: string]: ColumnDef<ServiceFieldsFragment>;
} = {
  serviceDetails: {
    header: 'Service Details',
    render: (service) => (
      <Stack>
        {serviceDetails(service).map((s, i) => (
          <Typography
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            variant='body2'
            sx={{
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '1',
              overflow: 'hidden',
              maxWidth: '300px',
            }}
          >
            {s}
          </Typography>
        ))}
      </Stack>
    ),
  },
};
