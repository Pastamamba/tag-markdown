/**
 * Sanitizes HTML content by removing disallowed tags and attributes.
 *
 * This function parses the given HTML content and filters out any tags and attributes
 * that are not explicitly allowed. It is useful for preventing XSS attacks and ensuring
 * that only safe HTML content is rendered.
 *
 * @param {string} html - The HTML content to be sanitized.
 * @param {object} allowed - An object specifying the allowed tags and their attributes.
 *                           The '*' key can be used to specify attributes allowed on all tags.
 * @returns {string} - The sanitized HTML content.
 */
export const sanitizeHtml = (html, allowed) => {
    // Set of attributes allowed on any tag
    const allowedAttributes = new Set(allowed['*'] ?? []);
    // Array of tags that are allowed
    const allowedTags = Object.keys(allowed).filter((tag) => tag !== '*');

    // Regular expression to match HTML tags
    const tagMatcher = /<([a-z][a-z0-9]*)([^>]*?)>(.*?)<\/\1>/gi;
    // Regular expression to match attributes within a tag
    const attributeMatcher = /\b([a-z][a-z0-9-]*)=("[^"]*"|'[^']*')/gi;

    // Replace disallowed tags and attributes in the HTML content
    return html.replace(tagMatcher, (_, tag, attributes, content) => {
        // Remove the tag if it's not allowed
        if (!allowedTags.includes(tag)) return content;

        // Combine global attributes with attributes allowed for this specific tag
        const allowedAttributesForTag = new Set([
            ...Array.from(allowedAttributes),
            ...(allowed[tag] ?? [])
        ]);

        // Replace attributes in the tag
        return `<${tag}${attributes.replace(
            attributeMatcher,
            (_, attr, value) => {
                // Remove the attribute if it's not allowed
                if (!allowedAttributesForTag.has(attr)) return '';
                // Return the attribute if it's allowed
                return ` ${attr}=${value}`;
            }
        )}>${sanitizeHtml(content, allowed)}</${tag}>`;
    });
};
