import { useEffect, type RefObject } from 'react';

import type { Tag } from '../types';

import { isCursorInNode, placeTagElement } from '../utils';

export const useTaggableTextArea = (promptRef: RefObject<HTMLElement>) => {
  const addTag = ({ label, id }: Tag) => {
    if (!isCursorInNode(window.getSelection(), promptRef.current)) {
      return;
    }

    placeTagElement({ label, id }, promptRef);
  };

  const removeTag = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.dataset.tagAction === 'remove') {
      const spanElement = target.closest('span');

      if (spanElement) spanElement.remove();
    }
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      removeTag(event);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return {
    addTag,
    removeTag
  };
};
