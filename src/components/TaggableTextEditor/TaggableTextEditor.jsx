import {
    forwardRef,
    useEffect,
    useState,
} from 'react';

import {TAG_ID_ATTR, TAG_LABEL_ATTR} from './utils/constants';

import {useForwardRef} from './hooks/useForwardRef';

import InsertionPoint from './utils/InsertionPoint';

import styles from './style.module.css';
import {replaceHtmlTagsWithIdentifiers, transformIdentifiersToHtmlTags} from "./utils/contentConversion.js";
import {sanitizeHtml} from "./utils/htmlSanitizer.js";
import {getCaretRange} from "./utils/cursorUtils.js";
import {isRedoKeyPressed, isUndoKeyPressed} from "./utils/undoRedoUtils.js";


/**
 * @description A textarea that allows you to add tags to it and drag them around.
 * @param {string} value - The value of the textarea.
 * @param {Tag[]} availableTags - The tags that can be added to the textarea.
 * @param {function} onChange - The function that will be called when the value of the textarea changes.
 * @param {string} className - The className that will be applied to the textarea.
 **/
export const TaggableTextEditor = forwardRef(({
                                           value,
                                           availableTags,
                                           onChange,
                                           className
                                       }, ref) => {
        const [history, setHistory] = useState([]);
        const [historyIndex, setHistoryIndex] = useState(-1);
        const [movedTag, setMovedTag] = useState(null);
        const [insertionPointPosition, setInsertionPointPosition] = useState(null);

        const forwardRef = useForwardRef(ref);

        const addToHistory = (val) => {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(val);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        };

        const handleUndo = () => {
            if (historyIndex > 0) {
                setHistoryIndex(historyIndex - 1);
                const historyValue = history[historyIndex - 1];
                onChange(replaceHtmlTagsWithIdentifiers(historyValue, availableTags));
            }
        };

        const handleRedo = () => {
            if (historyIndex < history.length - 1) {
                setHistoryIndex(historyIndex + 1);
                const historyValue = history[historyIndex + 1];
                onChange(replaceHtmlTagsWithIdentifiers(historyValue, availableTags));
            }
        };

        // Prevent the default paste behavior and sanitize the pasted text
        const onPasteToContentEditableElement = (
            e
        ) => {
            e.preventDefault();

            const plainText = e.clipboardData?.getData('text/plain');
            const cleanedText = sanitizeHtml(plainText, {
                span: [TAG_ID_ATTR, TAG_LABEL_ATTR, 'contenteditable', 'draggable']
            });
            const cleanedAndFormattedText = cleanedText?.replace(
                /\r?\n|\r/g,
                '<br/>'
            );

            document.execCommand('insertHTML', false, cleanedAndFormattedText);
        };

        // Set the tag element that is being dragged
        const handleDragStart = (e) => {
            const target = e.target;
            setMovedTag(target);
        };

        // Update the insertion point position when the tag is dragged over the textarea
        const handleDragOver = (e) => {
            e.preventDefault();

            const range = getCaretRange(e.clientX, e.clientY);
            const rect = range?.getClientRects()[0];

            if (!range || !rect) {
                setInsertionPointPosition(null);
                return;
            }

            const {x, y} = rect;
            setInsertionPointPosition({x, y});
        };

        // Insert the tag at the insertion point position when the drag ends
        const handleDrop = (e) => {
            e.preventDefault();

            const range = getCaretRange(e.clientX, e.clientY);

            if (!movedTag || !range) return;

            const dropNode = range.startContainer;

            // Block dropping on the same tag
            if (dropNode?.nodeName === 'SPAN') {
                if (!dropNode.nextSibling) {
                    dropNode.parentElement?.appendChild(movedTag);
                } else {
                    dropNode.parentElement?.insertBefore(movedTag, dropNode.nextSibling);
                }
            } else {
                range.insertNode(movedTag);
            }
        };

        // Reset the insertion point position when the drag ends
        const handleDragEnd = (e) => {
            e.preventDefault();

            setInsertionPointPosition(null);
        };

        // Keyboard shortcuts for undo and redo
        useEffect(() => {
            const handleKeyDown = (e) => {
                if (isUndoKeyPressed(e)) {
                    handleUndo();
                } else if (isRedoKeyPressed(e)) {
                    handleRedo();
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        });

        // Update the content of the textarea when the value changes
        useEffect(() => {
            if (
                value ===
                replaceHtmlTagsWithIdentifiers(
                    forwardRef.current.innerHTML,
                    availableTags
                )
            ) {
                return;
            }

            forwardRef.current.innerHTML = transformIdentifiersToHtmlTags(
                value,
                availableTags
            );
        }, [value, availableTags, forwardRef]);

        useEffect(() => {
            if (!ref) return;

            const observer = new MutationObserver(() => {
                const htmlContent = forwardRef.current.innerHTML;
                addToHistory(htmlContent);
                onChange(replaceHtmlTagsWithIdentifiers(htmlContent, availableTags));
            });

            const config = {
                characterData: true,
                childList: true,
                subtree: true
            };
            observer.observe(forwardRef.current, config);

            return () => {
                observer.disconnect();
            };
        });

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                const brElement = document.createElement('br');
                range.deleteContents();
                range.insertNode(brElement);

                const nextSibling = brElement.nextSibling;

                if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
                    // This is a zero-width space
                    const space = document.createTextNode('\u200B');

                    // Ensure the BR element has a parent node before inserting
                    if (brElement.parentNode) {
                        brElement.parentNode.insertBefore(space, nextSibling);

                        // Now set the cursor position after the space
                        range.setStartAfter(space);
                    }
                } else {
                    // If the next sibling is not a text node, just set the range to start after the BR element
                    range.setStartAfter(brElement);
                }

                range.setStartAfter(brElement);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        return (
            <div className={className}>
                {insertionPointPosition && (
                    <InsertionPoint position={insertionPointPosition}/>
                )}
                <div
                    ref={forwardRef}
                    className={styles.prompt}
                    style={{
                        minHeight: "128px",
                        maxHeight: "448px",
                        overflowY: "auto"
                    }}
                    onPaste={onPasteToContentEditableElement}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onKeyDown={handleKeyDown}
                    onDragStart={handleDragStart}
                    contentEditable
                    suppressContentEditableWarning
                />
            </div>
        );
    }
);
