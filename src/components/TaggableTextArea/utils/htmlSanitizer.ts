/**
 * Sanitizes HTML content by allowing only specified tags and attributes.
 * @param {string} html - The HTML content to sanitize.
 * @param {Record<string, string[]>} allowed - The allowed tags and attributes.
 * @returns {string} - The sanitized HTML content.
 */
export const sanitizeHtml = (
	html: string,
	allowed: Record<string, string[]>
): string => {
	const allowedAttributes = new Set(allowed['*'] ?? []);
	const allowedTags = Object.keys(allowed).filter((tag) => tag !== '*');

	const tagMatcher = /<([a-z][a-z0-9]*)([^>]*?)>(.*?)<\/\1>/gi;
	const attributeMatcher = /\b([a-z][a-z0-9-]*)=("[^"]*"|'[^']*')/gi;

	return html.replace(tagMatcher, (_, tag, attributes, content) => {
		if (!allowedTags.includes(tag)) return content;

		const allowedAttributesForTag = new Set([
			...Array.from(allowedAttributes),
			...(allowed[tag] ?? [])
		]);

		return `<${tag}${attributes.replace(
			attributeMatcher,
			(_: string, attr: string, value: string) => {
				if (!allowedAttributesForTag.has(attr)) return '';
				return ` ${attr}=${value}`;
			}
		)}>${sanitizeHtml(content, allowed)}</${tag}>`;
	});
};
