import re

import bleach
from bleach.css_sanitizer import CSSSanitizer


def _strip_script_content(html):
    """Remove <script> and <iframe> tags AND their content before bleach."""
    html = re.sub(
        r"<(script|iframe|object|embed|style)[^>]*>.*?</\1>",
        "",
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    html = re.sub(
        r"<(script|iframe|object|embed)[^>]*/>",
        "",
        html,
        flags=re.IGNORECASE,
    )
    return html


def sanitize_html(html_input, allowed_tags=None, allowed_attributes=None):
    """
    Sanitize HTML using bleach, stripping disallowed tags and attributes.
    Forces rel="noopener noreferrer" on every <a> tag.
    Filters CSS styles via ``CSSSanitizer`` — only ``text-align`` and
    ``background-color`` are permitted.
    Returns "" for blank or empty input.

    Callers may pass a custom allowlist to support different rich-text fields.
    The defaults cover the checkbox description (bold + links only).
    """
    if not html_input or not html_input.strip():
        return ""
    if allowed_tags is None:
        allowed_tags = ["p", "strong", "b", "a", "br"]
    if allowed_attributes is None:
        allowed_attributes = {"a": ["href", "target"]}

    # Pre-process: remove dangerous tags AND their content before bleach.
    cleaned = _strip_script_content(html_input)

    # Determine whether any caller-provided attribute list includes "style".
    has_style_attrs = any("style" in attrs for attrs in allowed_attributes.values())

    css_sanitizer = (
        CSSSanitizer(allowed_css_properties=["text-align", "background-color"])
        if has_style_attrs
        else None
    )

    cleaned = bleach.clean(
        cleaned,
        tags=allowed_tags,
        attributes=allowed_attributes,
        css_sanitizer=css_sanitizer,
        strip=True,
    )

    # Force rel="noopener noreferrer" on every <a> tag, replacing any existing rel.
    def _force_rel(match):
        tag_inner = match.group(1)
        tag_inner = re.sub(
            r'\s+rel=["\'][^"\']*["\']', "", tag_inner, flags=re.IGNORECASE
        )
        return f'<a{tag_inner} rel="noopener noreferrer">'

    cleaned = re.sub(r"<a([^>]*)>", _force_rel, cleaned)

    # Remove empty style="" left by CSSSanitizer when all properties are stripped.
    cleaned = re.sub(r'\s+style=""', "", cleaned)

    return cleaned
