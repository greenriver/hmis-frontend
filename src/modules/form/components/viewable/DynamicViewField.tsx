import { Skeleton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { intersectionBy, isNil } from 'lodash-es';
import React, { useMemo } from 'react';

import { usePickList } from '../../hooks/usePickList';
import {
  DynamicViewFieldProps,
  isPickListOption,
  isPickListOptionArray,
} from '../../types';
import { hasMeaningfulValue } from '../../util/formUtil';
import DynamicDisplay from '../DynamicDisplay';

import File from './item/File';
import Image from './item/Image';
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
  adjustValue = () => {},
}) => {
  const label = noLabel ? null : getLabel(item, horizontal);

  const [options, pickListLoading] = usePickList(item, pickListRelationId, {
    fetchPolicy: 'network-only', // Always fetch, because ProjectCoC and Enrollment records change
    onCompleted: (data) => {
      if (!data?.pickList) return;
      if (!hasMeaningfulValue(value)) return;

      // Try to find the "full" option (including label) for this value from the pick list
      let fullOption;
      if (isPickListOption(value)) {
        fullOption = data.pickList.find((o) => o.code === value.code);
      } else if (isPickListOptionArray(value)) {
        fullOption = intersectionBy(data.pickList, value, 'code');
      }

      if (fullOption) {
        // Update the value so that it shows the complete label
        adjustValue({ linkId: item.linkId, value: fullOption });
      } else {
        console.warn(
          `Selected value '${JSON.stringify(
            value
          )}' is not present in option list '${item.pickListReference}'`
        );
      }
    },
  });

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
            if (formatted) return formatted;
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
          renderValue={(value) => {
            if (pickListLoading) return <Skeleton />;

            return (
              <Typography variant='body2'>
                {ensureArray(value)
                  .map((val) => {
                    let label = val.label;
                    if (options)
                      label =
                        options?.find((opt) => opt.code === val.code)?.label ||
                        label;
                    if (!label) label = val.code;
                    return label;
                  })
                  .join(', ')}
              </Typography>
            );
          }}
        />
      );
    case ItemType.Image:
      return <Image id={value} />;
    case ItemType.File:
      return <File id={value} />;
    default:
      console.warn('Unrecognized item type:', item.type);
      return <></>;
  }
};

export default DynamicViewField;
