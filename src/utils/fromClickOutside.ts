import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export const fromClickOutside = (elements: HTMLElement[]) => fromEvent(window.document, 'click').pipe(
  filter(event => {
    const someElementIsClicked = elements.some(element => element !== undefined && element.contains(<HTMLElement>event.target),
    );
    return someElementIsClicked === false;
  }),
);
