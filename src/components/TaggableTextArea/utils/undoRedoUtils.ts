/**
 * Checks if the undo key combination is pressed
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} - Indicates if the undo key combination is pressed.
 */
export const isUndoKeyPressed = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey;

/**
 * Checks if the redo key combination is pressed
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} - Indicates if the redo key combination is pressed.
 */
export const isRedoKeyPressed = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) &&
  ((event.shiftKey && (event.key === 'Z' || event.key === 'z')) ||
    (!event.shiftKey && event.key === 'y'));
