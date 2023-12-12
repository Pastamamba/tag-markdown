import { TAG_ID_ATTR, TAG_LABEL_ATTR } from './constants';

/**
 * Converts HTML content to plain text, filtering out spans
 * that contain tags not present in the availableTags array.
 * @param {string} htmlContent - The HTML content to convert.
 * @param {Array} availableTags - The array of available tags to consider.
 * @returns {string} - The converted plain text content.
 */
export const replaceHtmlTagsWithIdentifiers = (htmlContent, availableTags) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const spans = doc.querySelectorAll(`span[${TAG_ID_ATTR}]`);

    spans.forEach((span) => {
        const id = span.getAttribute(TAG_ID_ATTR);
        const tagExists = availableTags.some((tag) => tag.id === id);
        if (tagExists) {
            const textNode = doc.createTextNode(`{${id}}`);
            span.parentNode?.replaceChild(textNode, span);
        }
    });

    doc.querySelectorAll('br').forEach(br => {
        br.parentNode?.replaceChild(doc.createTextNode('/n'), br);
    });

    let textWithLineBreaks = doc.body.innerHTML.replace(/<br\s*\/?>/gi, '/n');
    textWithLineBreaks = textWithLineBreaks.replace(/&nbsp;/gi, ' ');
    return textWithLineBreaks;
};

/**
 * Converts text content to HTML, considering only tags present
 * in the availableTags array, replacing tag identifiers with html elements.
 * @param {string} textContent - The text content to convert.
 * @param {Array} availableTags - The array of available tags to consider.
 * @returns {string} - The converted HTML content.
 */
export const transformIdentifiersToHtmlTags = (textContent, availableTags) => {
    const regex = /{([^}]+)}/g;
    let htmlContent = textContent;
    let match;

    while ((match = regex.exec(textContent)) !== null) {
        const id = match[1];
        const label = availableTags.find((tag) => tag.id === id)?.label;
        const tagExists = availableTags.some((tag) => tag.id === id);
        if (tagExists) {
            const spanElement = `<span 
        ${TAG_ID_ATTR}="${id}" 
        ${TAG_LABEL_ATTR}="${label}" 
        contenteditable="false"
        draggable="true">
          <button data-tag-action="remove"></button>
        </span>`;
            htmlContent = htmlContent.replace(match[0], spanElement);
        }
    }
    return htmlContent;
};
