import { useEffect } from 'react';
import {isCursorInNode} from "../utils/cursorUtils.js";
import {placeTagElement} from "../utils/tagUtils.js";

/**
 * Custom hook for managing tags within a text area.
 * Provides functionality to add and remove tags dynamically.
 *
 * @param {object} promptRef - A React ref object pointing to the text area element.
 * @returns {object} - An object containing functions to add and remove tags.
 */
export const useTaggableTextArea = (promptRef) => {
    /**
     * Adds a tag to the text area at the current cursor position.
     *
     * @param {object} tag - An object representing the tag, containing its label and id.
     */
    const addTag = ({ label, id }) => {
        // Check if the cursor is in the prompt element before adding the tag
        if (!isCursorInNode(window.getSelection(), promptRef.current)) {
            return;
        }

        // Place the tag element in the text area at the cursor position
        placeTagElement({ label, id }, promptRef);
    };

    /**
     * Removes a tag from the text area.
     *
     * @param {object} event - The event object from the click event listener.
     */
    const removeTag = (event) => {
        const target = event.target;

        // Check if the clicked element is a remove button for a tag
        if (target.dataset.tagAction === 'remove') {
            // Find the closest span element, which is the tag container
            const spanElement = target.closest('span');

            // Remove the span element (tag) from the DOM
            if (spanElement) spanElement.remove();
        }
    };

    // Effect for setting up a global click listener to handle tag removal
    useEffect(() => {
        const handleClick = (event) => {
            removeTag(event);
        };

        // Add a click event listener to the document
        document.addEventListener('click', handleClick);

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    // Return functions to add and remove tags
    return {
        addTag,
        removeTag
    };
};
