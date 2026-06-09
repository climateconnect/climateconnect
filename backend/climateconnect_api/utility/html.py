import re

import bleach

_ALLOWED_TEXT_ALIGN_VALUES = frozenset({"left", "center", "right", "justify"})


def _extract_styles(html):
    """
    Extract ``style`` attributes from tags that support them.

    Returns a dict mapping ``(tag_index, tag_name)`` → extracted style string.
    ``tag_index`` is the positional index of the opening tag in the HTML.
    """
    styles = {}
    for i, m in enumerate(
        re.finditer(r"<(\w+)[^>]*\sstyle=\"([^\"]*)\"", html, re.IGNORECASE)
    ):
        styles[i] = (m.group(1).lower(), m.group(2))
    return styles


def _filter_style_value(raw_value):
    """
    Keep only ``text-align`` declarations with valid values from a CSS
    declaration string.  Returns the cleaned value or ``None`` if nothing
    valid remains.
    """
    kept = []
    for declaration in raw_value.split(";"):
        declaration = declaration.strip()
        if not declaration:
            continue
        if ":" not in declaration:
            continue
        prop, _, value = declaration.partition(":")
        prop = prop.strip().lower()
        value = value.strip().lower()
        if prop == "text-align" and value in _ALLOWED_TEXT_ALIGN_VALUES:
            kept.append(f"text-align: {value}")
    return "; ".join(kept) if kept else None


def _reinject_styles(html, styles):
    """
    Re-inject extracted style attributes into the corresponding opening tags.

    ``styles`` is a dict mapping positional tag index → (tag_name, style_value).
    Tags are matched by counting opening tags in the cleaned HTML in order.
    """
    tag_counts = {}

    def _replace(match):
        nonlocal tag_counts
        tag_name = match.group(1).lower()
        idx = tag_counts.get(tag_name, 0)
        tag_counts[tag_name] = idx + 1

        if idx in styles:
            original_tag, style_val = styles[idx]
            if original_tag == tag_name:
                clean_style = _filter_style_value(style_val)
                if clean_style:
                    # Check if tag already has a style attr (from bleach) — replace it.
                    if re.search(r'\s+style=""', match.group(0), re.IGNORECASE):
                        tag_str = re.sub(
                            r'\s+style=""',
                            f' style="{clean_style}"',
                            match.group(0),
                            flags=re.IGNORECASE,
                        )
                    else:
                        # Insert style before closing >
                        tag_str = match.group(0).rstrip(">")
                        tag_str = f'{tag_str} style="{clean_style}">'
                    return tag_str
                else:
                    # No valid style — remove the empty style="" left by bleach
                    return re.sub(
                        r'\s+style=""', "", match.group(0), flags=re.IGNORECASE
                    )
        else:
            # No style to re-inject — clean up empty style="" from bleach
            return re.sub(r'\s+style=""', "", match.group(0), flags=re.IGNORECASE)

    return re.sub(r"<(\w+)[^>]*>", _replace, html, flags=re.IGNORECASE)


def _strip_script_content(html):
    """Remove <script> and <iframe> tags AND their content before bleach."""
    html = re.sub(
        r"<(script|iframe|object|embed|style)[^>]*>.*?</\1>",
        "",
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    # Self-closing variants
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
    Filters style attributes to keep only ``text-align`` declarations.
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

    # Pre-process: remove dangerous tags AND their content before bleach.
    cleaned = _strip_script_content(html_input)

    # Extract styles before bleach (bleach strips style values without CSSSanitizer).
    has_style_in_attrs = any("style" in attrs for attrs in allowed_attributes.values())
    extracted_styles = {}
    if has_style_in_attrs:
        # Tag-agnostic extraction: record style for every tag that has one.
        extracted_styles = {}
        tag_counter = {}
        for m in re.finditer(
            r"<(\w+)[^>]*\sstyle=\"([^\"]*)\"", cleaned, re.IGNORECASE
        ):
            tag_name = m.group(1).lower()
            idx = tag_counter.get(tag_name, 0)
            tag_counter[tag_name] = idx + 1
            extracted_styles[(tag_name, idx)] = m.group(2)

    cleaned = bleach.clean(
        cleaned, tags=allowed_tags, attributes=allowed_attributes, strip=True
    )

    # Force rel="noopener noreferrer" on every <a> tag, replacing any existing rel.
    def _force_rel(match):
        tag_inner = match.group(1)
        tag_inner = re.sub(
            r'\s+rel=["\'][^"\']*["\']', "", tag_inner, flags=re.IGNORECASE
        )
        return f'<a{tag_inner} rel="noopener noreferrer">'

    cleaned = re.sub(r"<a([^>]*)>", _force_rel, cleaned)

    # Re-inject filtered style attributes.
    if extracted_styles:
        tag_counter = {}

        def _replace_style(match):
            tag_name = match.group(1).lower()
            idx = tag_counter.get(tag_name, 0)
            tag_counter[tag_name] = idx + 1

            key = (tag_name, idx)
            if key in extracted_styles:
                clean_style = _filter_style_value(extracted_styles[key])
                if clean_style:
                    tag_str = match.group(0)
                    if re.search(r'\s+style=""', tag_str, re.IGNORECASE):
                        tag_str = re.sub(
                            r'\s+style=""',
                            f' style="{clean_style}"',
                            tag_str,
                            flags=re.IGNORECASE,
                        )
                    else:
                        tag_str = tag_str.rstrip(">")
                        tag_str = f'{tag_str} style="{clean_style}">'
                    return tag_str
                else:
                    return re.sub(
                        r'\s+style=""', "", match.group(0), flags=re.IGNORECASE
                    )
            else:
                return re.sub(r'\s+style=""', "", match.group(0), flags=re.IGNORECASE)

        cleaned = re.sub(r"<(\w+)[^>]*>", _replace_style, cleaned, flags=re.IGNORECASE)

    return cleaned
