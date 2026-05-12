import re

import bleach


def sanitize_html(html_input, allowed_tags=None, allowed_attributes=None):
    """
    Sanitize HTML using bleach, stripping disallowed tags and attributes.
    Forces rel="noopener noreferrer" on every <a> tag.
    Returns "" for blank or empty input.

    Callers may pass a custom allowlist to support different rich-text fields.
    The defaults cover the checkbox description (bold + links only).
    """
    if not html_input or not html_input.strip():
        return ""
    if allowed_tags is None:
        allowed_tags = ["p", "strong", "b", "a", "br"]
    if allowed_attributes is None:
        # Allow href and target; rel is stripped then re-added in post-processing.
        allowed_attributes = {"a": ["href", "target"]}

    cleaned = bleach.clean(
        html_input, tags=allowed_tags, attributes=allowed_attributes, strip=True
    )

    # Force rel="noopener noreferrer" on every <a> tag, replacing any existing rel.
    def _force_rel(match):
        tag_inner = match.group(1)
        tag_inner = re.sub(
            r'\s+rel=["\'][^"\']*["\']', "", tag_inner, flags=re.IGNORECASE
        )
        return f'<a{tag_inner} rel="noopener noreferrer">'

    return re.sub(r"<a([^>]*)>", _force_rel, cleaned)
