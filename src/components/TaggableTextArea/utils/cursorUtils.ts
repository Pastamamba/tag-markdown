/**
 * Checks if the cursor is within a specific HTML node.
 * @param {Selection | null} selection - The current selection.
 * @param {HTMLElement | null} node - The HTML node to check against the cursor position.
 * @returns {boolean} - Indicates if the cursor is inside the provided HTML node.
 */
export const isCursorInNode = (
  selection: Selection | null,
  node: HTMLElement | null
) => {
  if (!selection || !node) return false;

  let currentSelectionNode = selection.anchorNode;

  while (currentSelectionNode !== null) {
    if (currentSelectionNode === node) return true;
    currentSelectionNode = currentSelectionNode.parentNode;
  }

  return false;
};

/**
 * Gets the caret range from the given coordinates (clientX, clientY).
 * @param {number} clientX - The X-coordinate on the screen.
 * @param {number} clientY - The Y-coordinate on the screen.
 * @returns {Range | null} - The caret range or null if not found/supported.
 */
export const getCaretRange = (
  clientX: number,
  clientY: number
): Range | null => {
  let range: Range | null = null;

  if (document.caretRangeFromPoint) {
    // Webkit
    range = document.caretRangeFromPoint(clientX, clientY);
  } else if (document.caretPositionFromPoint) {
    // Firefox
    const caretPosition = document.caretPositionFromPoint(clientX, clientY);
    if (caretPosition) {
      range = document.createRange();
      range.setStart(caretPosition.offsetNode, caretPosition.offset);
      range.collapse(true);
    }
  }

  return range;
};

/**
 * Saves the current cursor position within an HTML element.
 * @param {HTMLElement} element - The HTML element to save the cursor position in.
 * @returns {number | null} - The cursor position within the element or null if unsuccessful.
 */
export const saveCursorPosition = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();

    if (preSelectionRange) {
      preSelectionRange.selectNodeContents(element);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);

      return preSelectionRange.toString().length;
    }
  }

  return null;
};

/**
 * Restores the cursor position within an HTML element.
 * @param {HTMLElement} element - The HTML element to restore the cursor position in.
 * @param {number} cursorPosition - The cursor position to restore.
 */
export const restoreCursorPosition = (element: HTMLElement, cursorPosition: number) => {
  const selection = window.getSelection();
  if (!selection || !element) return;

  let currentPos = 0;
  let nodeFound = false;

  const recursiveSearch = (nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodeFound) return;

      const node = nodes[i];
      let count = 0;

      if (node.nodeType === Node.TEXT_NODE) {
        count = node.textContent.length;
      } else if (node.nodeName === 'BR') {
        count = 1; // Asumme, että BR on yksi merkki pitkä
      } else {
        // Jos solmulla on lapsia, jatka rekursiota
        recursiveSearch(node.childNodes);
      }

      if (currentPos + count >= cursorPosition) {
        const range = document.createRange();
        range.setStart(node, cursorPosition - currentPos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        nodeFound = true; // Löysimme solmun, joten ei tarvitse jatkaa
        return;
      } else {
        currentPos += count;
      }
    }
  };

  recursiveSearch(element.childNodes);
};
