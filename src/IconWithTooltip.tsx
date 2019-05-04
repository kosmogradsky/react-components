import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { componentFromObservable } from './utils/componentFromObservable';
import { createEventHandler } from './utils/createEventHandler';
import { Icon, IconProps } from './Icon/Icon';
import { TooltipElement } from './Tooltip';

type Props = IconProps & {
  tooltip: TooltipElement;
};

export const IconWithTooltip = componentFromObservable<Props>('IconWithTooltip', props$ => {
  const { handler: toggleInfo, observable: isInfoShown$ } = createEventHandler<boolean>();

  return combineLatest(
    props$,
    isInfoShown$.pipe(startWith(false)),
  ).pipe(map(([
    { tooltip, ...rest },
    isInfoShown,
  ]) => (
    <>
      <Icon
        {...rest}
        onMouseEnter={() => toggleInfo(true)}
        onMouseLeave={() => toggleInfo(false)}
      />
      {React.cloneElement(tooltip, {
        isShown: isInfoShown,
      })}
    </>
  )));
});
