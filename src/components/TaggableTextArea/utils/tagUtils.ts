import { RefObject } from 'react';

import type { Tag } from '../types';

import { TAG_ID_ATTR, TAG_LABEL_ATTR } from '../constants';

import { restoreCursorPosition, saveCursorPosition } from './cursorUtils.ts';

/**
 * Places a tag element in the prompt element at the current cursor position.
 * @param {Tag} tag - The tag to place.
 * @param {RefObject<HTMLElement>} elementRef - The prompt element ref.
 */
export const placeTagElement = (
  { label, id }: Tag,
  elementRef: RefObject<HTMLElement>
) => {
  const spanElement = document.createElement('span');
  spanElement.setAttribute(TAG_ID_ATTR, id);
  spanElement.setAttribute(TAG_LABEL_ATTR, label);
  spanElement.contentEditable = 'false';
  spanElement.draggable = true;

  const buttonElement = document.createElement('button');
  buttonElement.setAttribute('data-tag-action', 'remove');

  spanElement.appendChild(buttonElement);

  if (!elementRef.current) return;

  const emptyText = document.createTextNode('\u200B');
  elementRef.current.appendChild(emptyText);

  elementRef.current.appendChild(spanElement);

  const cursorPosition = saveCursorPosition(elementRef.current);

  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    range.insertNode(spanElement);
  }

  // Set cursor position after tag
  restoreCursorPosition(elementRef.current, (cursorPosition ?? 0) + 0.5);
};
