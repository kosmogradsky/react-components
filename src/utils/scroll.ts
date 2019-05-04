import { rootElement } from '../main';

import { or } from './undefined';

export const scroll = ({
  element,
  top,
  left,
  behavior,
}: {
  element?: HTMLElement,
  top: number,
  left?: number,
  behavior?: ScrollBehavior,
}) => {
  const domElement = or(element, rootElement);
  if (!Boolean(domElement.scroll)) {
    domElement.scrollTop = top;
    if (left !== undefined) { domElement.scrollLeft = left; }
    return;
  }
  domElement.scroll({
    top,
    left,
    behavior,
  });
};
