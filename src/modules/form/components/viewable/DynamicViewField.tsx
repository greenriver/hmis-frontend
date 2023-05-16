import { Skeleton, Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useMemo } from 'react';

import { getValueFromPickListData, usePickList } from '../../hooks/usePickList';
import { DynamicViewFieldProps } from '../../types';
import DynamicDisplay from '../DynamicDisplay';

import File from './item/File';
import Image from './item/Image';
import NotCollectedText from './item/NotCollectedText';
import TextContent from './item/TextContent';

import { FALSE_OPT, TRUE_OPT } from '@/components/elements/input/YesNoRadio';
import {
  formatDateForDisplay,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
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

  const [, pickListLoading] = usePickList(item, pickListRelationId, {
    onCompleted: (data) => {
      const newValue = getValueFromPickListData({
        item,
        value,
        linkId: item.linkId,
        data,
        setInitial: false,
      });
      // If this is already cached this will call setState within a render, which is an error; So use timeout to push the setter call to the next render cycle
      if (newValue) setTimeout(() => adjustValue(newValue));
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
      return <DynamicDisplay item={item} viewOnly />;
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
    case ItemType.Integer:
      return <TextContent {...commonProps} />;
    case ItemType.Currency:
      return <TextContent {...commonProps} renderValue={(val) => `$${val}`} />;
    case ItemType.Date:
      return (
        <TextContent
          {...commonProps}
          renderValue={(val) => {
            let formatted;
            if (val instanceof Date) formatted = formatDateForDisplay(val);
            if (typeof val === 'string') formatted = parseAndFormatDate(val);
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
    case ItemType.Choice:
      return (
        <TextContent
          {...commonProps}
          renderValue={(value) => {
            if (pickListLoading) return <Skeleton width={200} />;

            return (
              <Typography variant='body2'>
                {ensureArray(value)
                  .map((val) => val.label || val.code)
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
