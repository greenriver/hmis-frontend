import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { isNil } from 'lodash-es';
import React, { useMemo } from 'react';

import { usePickList } from '../../hooks/usePickList';
import { DynamicViewFieldProps } from '../../types';
import { hasMeaningfulValue } from '../../util/formUtil';
import DynamicDisplay from '../DynamicDisplay';

import NotCollectedText from './item/NotCollectedText';
import TextContent from './item/TextContent';

import { FALSE_OPT, TRUE_OPT } from '@/components/elements/input/YesNoRadio';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { Component, FormItem, ItemType } from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

const getLabel = (item: FormItem, horizontal?: boolean) => {
  if (!item.prefix && !item.text) return null;

  return (
    <Stack direction='row' spacing={1}>
      <Typography
        variant='body2'
        fontWeight={
          item.component === Component.Checkbox || horizontal ? undefined : 600
        }
      >
        {item.text}
      </Typography>
    </Stack>
  );
};

const DynamicViewField: React.FC<DynamicViewFieldProps> = ({
  item,
  // nestingLevel,
  value,
  horizontal = false,
  pickListRelationId,
  noLabel = false,
}) => {
  const label = noLabel ? null : getLabel(item, horizontal);

  const [, pickListLoading] = usePickList(item, pickListRelationId, {
    fetchPolicy: 'network-only', // Always fetch, because ProjectCoC and Enrollment records change
  });

  const fallback = (
    <Box>
      <Typography
        color='white'
        sx={{
          textShadow: '1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;',
        }}
      >
        {item.type}
      </Typography>
    </Box>
  );

  const commonProps = useMemo(
    () => ({
      label,
      value,
      horizontal,
    }),
    [label, value, horizontal]
  );

  switch (item.type) {
    case ItemType.Display:
      return <DynamicDisplay item={item} />;
    case ItemType.Boolean:
      return (
        <TextContent
          {...commonProps}
          value={
            [TRUE_OPT, FALSE_OPT].find((o) => o.code === String(value))
              ?.label || <NotCollectedText variant='body2' />
          }
          hasValue={(val) => !isNil(val)}
        />
      );
    case ItemType.String:
    case ItemType.Text:
      return <TextContent {...commonProps} />;
    case ItemType.Integer:
      return <TextContent {...commonProps} />;
    case ItemType.Currency:
      return (
        <TextContent
          {...commonProps}
          hasValue={(val) => !isNil(val)}
          renderValue={(val) => `$${val}`}
        />
      );
    case ItemType.Date:
      return (
        <TextContent
          {...commonProps}
          renderValue={(val) => {
            let formatted;
            if (val instanceof Date) formatted = format(val, 'M/d/yyyy');
            if (typeof val === 'string') {
              const parsed = parseHmisDateString(val);
              if (parsed) formatted = format(parsed, 'M/d/yyyy');
            }
            if (formatted)
              return <Typography variant='body2'>{formatted}</Typography>;
            return (
              <Typography color='textSecondary' variant='body2'>
                Invalid Date: {String(val)}
              </Typography>
            );
          }}
        />
      );
    case ItemType.OpenChoice:
      return (
        <TextContent
          {...commonProps}
          hasValue={(val) => hasMeaningfulValue(val)}
          renderValue={(val) => {
            if (pickListLoading) return <Skeleton>{val}</Skeleton>;
            return (
              <Typography variant='body2'>
                {ensureArray(value)
                  .map((val) => val.code)
                  .join(', ')}
              </Typography>
            );
          }}
        />
      );
    case ItemType.Choice:
      return (
        <TextContent
          {...commonProps}
          hasValue={(val) => hasMeaningfulValue(val)}
          renderValue={(val) => {
            if (pickListLoading) return <Skeleton>{val}</Skeleton>;

            return (
              <Typography variant='body2'>
                {ensureArray(value)
                  .map((val) => val.label)
                  .join(', ')}
              </Typography>
            );
          }}
        />
      );
    // case ItemType.Image:
    //   return (
    //     <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
    //       <Uploader
    //         id={linkId}
    //         image
    //         onUpload={async (upload) => onChangeValue(upload.blobId)}
    //       />
    //     </InputContainer>
    //   );
    // case ItemType.File:
    //   return (
    //     <InputContainer sx={{ maxWidth, minWidth }} {...commonContainerProps}>
    //       <Uploader
    //         id={linkId}
    //         onUpload={async (upload) => onChangeValue(upload.blobId)}
    //       />
    //     </InputContainer>
    //   );
    default:
      console.warn('Unrecognized item type:', item.type);
      // return <></>;
      return fallback;
  }
};

export default DynamicViewField;
