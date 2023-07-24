import { compact } from 'lodash-es';
import React from 'react';

export const joinNodes = (arr: any[], sep: React.ReactNode = ' ') =>
  compact(arr).reduce(
    (acc: React.ReactNode[], item, i) => [
      ...acc,
      ...(i !== 0
        ? [<React.Fragment key={`${item}-sep`}>{sep}</React.Fragment>]
        : []),
      <React.Fragment key={item}>{item}</React.Fragment>,
    ],
    []
  );

export const compactJoinNodes = (arr: any[], sep: React.ReactNode = ' ') =>
  joinNodes(compact(arr), sep);
