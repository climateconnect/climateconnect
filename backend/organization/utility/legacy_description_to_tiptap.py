import re
from html import escape

# YouTube regex based on @tiptap/extension-youtube
# Matches youtube.com, youtu.be, youtube-nocookie.com URLs
YOUTUBE_RE = re.compile(
    r"^((?:https?:)?//)?((?:www|m|music)\.)?"
    r"(?:youtube\.com|youtu\.be|youtube-nocookie\.com)"
    r"(?:/(?:[\w-]+\?v=|embed/|v/)?|/)([\w-]+)(\S+)?$"
)

# Non-anchored variant used to find a YouTube URL embedded within a line of text
# (e.g. "Check this out: https://youtube.com/watch?v=abc cool!").
YOUTUBE_RE_IN_LINE = re.compile(
    r"((?:https?:)?//)?((?:www|m|music)\.)?"
    r"(?:youtube\.com|youtu\.be|youtube-nocookie\.com)"
    r"(?:/(?:[\w-]+\?v=|embed/|v/)?|/)([\w-]+)(\S+)?"
)

# Bare URL / email autolink patterns
URL_RE = re.compile(r"(https?://[^\s<>\"']+|www\.[^\s<>\"']+)")
EMAIL_RE = re.compile(r"([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)")


def _extract_youtube_id(url: str) -> str | None:
    """Extract the YouTube video ID from a URL."""
    m = YOUTUBE_RE.match(url.strip())
    if m:
        return m.group(3)
    return None


def _youtube_embed(video_id: str) -> str:
    """Return the Tiptap/ProseMirror HTML for a YouTube video embed."""
    return (
        f'<div data-youtube-video="">'
        f'<iframe src="https://www.youtube-nocookie.com/embed/{video_id}" '
        f'width="640" height="480" allowfullscreen="true"></iframe>'
        f"</div>"
    )


def _autolink_text(text: str) -> str:
    """Autolink bare URLs and emails in plain text, producing HTML."""
    # Escape HTML entities first
    text = escape(text)

    # Replace emails first (so they don't get caught by URL regex)
    def email_replace(m):
        email = m.group(1)
        return f'<a href="mailto:{email}" target="_blank" rel="noopener noreferrer">{email}</a>'

    text = EMAIL_RE.sub(email_replace, text)

    # Replace URLs
    def url_replace(m):
        url = m.group(1)
        href = url if url.startswith("http") else f"https://{url}"
        return f'<a href="{href}" target="_blank" rel="noopener noreferrer">{url}</a>'

    text = URL_RE.sub(url_replace, text)

    return text


def legacy_description_to_tiptap_html(text: str | None) -> str:
    """Convert a legacy plain-text project description to Tiptap-compatible HTML.

    Rules:
    1. Split on \\n. Empty lines become paragraph breaks.
    2. A line containing a YouTube URL → extract video id, emit
       <div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/<id>"
       width="640" height="480" allowfullscreen="true"></iframe></div>.
       Any other text on the same line is wrapped in a separate <p>.
    3. Non-YouTube lines → wrap in <p>…</p>, autolinking bare URLs and emails.
    4. Empty / null input → empty string.
    """
    if not text or not text.strip():
        return ""

    lines = text.split("\n")
    parts: list[str] = []

    for line in lines:
        stripped = line.strip()

        if not stripped:
            # Empty line → skip. The natural margin between <p> tags already
            # provides paragraph spacing. Emitting <p><br></p> would double it.
            continue

        # Check if the line contains a YouTube URL
        words = stripped.split()
        current_text: list[str] = []

        for word in words:
            # Strip trailing punctuation (comma, period) that may be glued to
            # URLs in legacy plain text.  Only do this for words that look like
            # URLs — regular text like "Hello:" should keep its punctuation.
            cleaned = word
            if re.match(r"https?://", word):
                cleaned = word.rstrip(",.")
            if not cleaned or re.match(r"^[,.;:]+$", cleaned):
                continue
            if YOUTUBE_RE.match(cleaned):
                # Flush any accumulated text before the embed
                if current_text:
                    parts.append(f"<p>{_autolink_text(' '.join(current_text))}</p>")
                    current_text = []
                video_id = _extract_youtube_id(cleaned)
                if video_id:
                    parts.append(
                        f'<div data-youtube-video="">'
                        f'<iframe src="https://www.youtube-nocookie.com/embed/{video_id}" '
                        f'width="640" height="480" allowfullscreen="true"></iframe>'
                        f"</div>"
                    )
            else:
                current_text.append(cleaned)

        # Flush any remaining text
        if current_text:
            parts.append(f"<p>{_autolink_text(' '.join(current_text))}</p>")

    return "".join(parts)


def legacy_description_to_tiptap_html_v2(text: str | None) -> str:
    """Improved converter that preserves the original line-break layout.

    Unlike legacy_description_to_tiptap_html (which dropped blank lines and made
    every line its own <p>, flattening the structure), this keeps the visual
    layout of the legacy plain-text description so the rendered output is
    WYSIWYG with what authors expect:

    * A blank line in the source becomes an *empty paragraph* (<p><br></p>). Even
      though the rendered description uses no margin between paragraphs, the <br>
      gives that empty paragraph one line of height, so the blank line is visible
      in BOTH the tiptap editor (which renders empty paragraphs the same way) and
      the read-only display. This preserves the spacing authors created with
      blank lines (e.g. a "title" line separated from the body by blank lines).
    * A single line break (no blank line) within a block is preserved as a <br>
      inside the same <p>, so consecutive lines stay together without an extra gap.
    * A line that is entirely a YouTube URL becomes a standalone embed.
    * Bare URLs / emails are autolinked.

    Leading and trailing blank lines are ignored so they don't add stray spacing.
    """
    if not text or not text.strip():
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    lines = text.split("\n")
    # Drop leading/trailing blank lines so they don't produce empty paragraphs.
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()

    parts: list[str] = []
    current: list[str] = []

    def flush() -> None:
        if current:
            autolinked = [
                _autolink_text(line.strip()) for line in current if line.strip()
            ]
            if autolinked:
                parts.append(f"<p>{'<br>'.join(autolinked)}</p>")
            current.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            # Blank line → close the current paragraph and emit an empty
            # paragraph so the blank line is visible in the rendered output.
            flush()
            parts.append("<p><br></p>")
            continue

        # A line that is entirely a YouTube URL → standalone embed.
        video_id = _extract_youtube_id(stripped)
        if video_id:
            flush()
            parts.append(_youtube_embed(video_id))
            continue

        # A line that mixes text with a YouTube URL (e.g. "See this:
        # https://youtube... cool!") → flush any pending paragraph, then emit the
        # leading text, the embed, and the trailing text as separate blocks.
        mixed = YOUTUBE_RE_IN_LINE.search(stripped)
        if mixed:
            vid = _extract_youtube_id(mixed.group(0))
            if vid:
                flush()
                before = stripped[: mixed.start()].strip()
                after = stripped[mixed.end() :].strip()
                if before:
                    parts.append(f"<p>{_autolink_text(before)}</p>")
                parts.append(_youtube_embed(vid))
                if after:
                    parts.append(f"<p>{_autolink_text(after)}</p>")
                continue

        current.append(line)

    flush()
    return "".join(parts)
