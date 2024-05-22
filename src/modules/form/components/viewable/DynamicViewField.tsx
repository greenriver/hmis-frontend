import { Skeleton, Stack, Typography } from '@mui/material';
import { formatDuration } from 'date-fns';
import { isNil } from 'lodash-es';
import React, { useMemo } from 'react';

import { getValueFromPickListData, usePickList } from '../../hooks/usePickList';
import { DynamicViewFieldProps } from '../../types';
import { isDataNotCollected } from '../../util/formUtil';
import DynamicDisplay from '../DynamicDisplay';

import File from './item/File';
import Image from './item/Image';

import TextContent from './item/TextContent';

import CommonHtmlContent from '@/components/elements/CommonHtmlContent';
import { minutesToHoursAndMinutes } from '@/components/elements/input/MinutesDurationInput';
import { FALSE_OPT, TRUE_OPT } from '@/components/elements/input/YesNoRadio';
import LabelWithContent from '@/components/elements/LabelWithContent';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RecoverableError from '@/components/elements/RecoverableError';
import ClientAddress from '@/modules/client/components/ClientAddress';
import {
  formatDateForDisplay,
  formatTimeOfDay,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import {
  Component,
  DisabledDisplay,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

const getLabel = (item: FormItem, horizontal?: boolean) => {
  const label = item.readonlyText || item.text;
  if (!label) return;

  return (
    <Stack direction='row' spacing={1}>
      <CommonHtmlContent
        variant='body2'
        fontWeight={horizontal ? undefined : 600}
        component='p'
      >
        {label}
      </CommonHtmlContent>
    </Stack>
  );
};

const DynamicViewField: React.FC<DynamicViewFieldProps> = ({
  item,
  value,
  horizontal = false,
  pickListArgs,
  noLabel = false,
  adjustValue = () => {},
  disabled = false,
}) => {
  const label = noLabel ? null : getLabel(item, horizontal);

  const { loading: pickListLoading } = usePickList({
    item,
    ...pickListArgs,
    fetchOptions: {
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
    },
  });
  const commonProps = useMemo(
    () => ({
      label,
      value,
      horizontal,
      'data-testid': item.linkId,
    }),
    [label, value, horizontal, item]
  );

  if (disabled && item.disabledDisplay !== DisabledDisplay.ProtectedWithValue) {
    return (
      <LabelWithContent {...commonProps}>
        <NotCollectedText variant='body2'>N/A</NotCollectedText>
      </LabelWithContent>
    );
  }
  switch (item.type) {
    case ItemType.Display:
      return <DynamicDisplay item={item} viewOnly value={value} />;
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
    case ItemType.TimeOfDay:
      return (
        <TextContent
          {...commonProps}
          renderValue={(val) => formatTimeOfDay(val)}
        />
      );
    case ItemType.Text:
    case ItemType.String:
      return <TextContent {...commonProps} />;
    case ItemType.Integer:
      if (item.component === Component.MinutesDuration) {
        return (
          <TextContent
            {...commonProps}
            renderValue={(val) => {
              const [hours, minutes] = minutesToHoursAndMinutes(val);
              return formatDuration({ minutes, hours }, { zero: true });
            }}
          />
        );
      }
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
      if (isDataNotCollected(value?.code)) {
        return (
          <LabelWithContent {...commonProps}>
            <NotCollectedText variant='body2'>
              {value.label || 'Data not collected'}
            </NotCollectedText>
          </LabelWithContent>
        );
      }
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
    case ItemType.Object:
      switch (item.component) {
        case Component.Address:
          return ensureArray(value).map((address) => (
            <ClientAddress address={address} key={JSON.stringify(address)} />
          ));
        default:
          return (
            <RecoverableError
              error={
                new Error(`Can't render form component "${item.component}"`)
              }
            />
          );
      }

    default:
      return (
        <RecoverableError
          error={new Error(`Unrecognized item type "${item.type}"`)}
        />
      );
  }
};

export default DynamicViewField;
