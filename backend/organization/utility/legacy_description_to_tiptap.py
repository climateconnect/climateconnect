import re
from html import escape

# YouTube regex based on @tiptap/extension-youtube
# Matches youtube.com, youtu.be, youtube-nocookie.com URLs
YOUTUBE_RE = re.compile(
    r"^((?:https?:)?//)?((?:www|m|music)\.)?"
    r"(?:youtube\.com|youtu\.be|youtube-nocookie\.com)"
    r"(?:/(?:[\w-]+\?v=|embed/|v/)?|/)([\w-]+)(\S+)?$"
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
            # Empty line → empty paragraph (acts as paragraph break)
            parts.append("<p><br></p>")
            continue

        # Check if the line contains a YouTube URL
        words = stripped.split()
        youtube_words = []
        non_youtube_words = []

        for word in words:
            if YOUTUBE_RE.match(word):
                youtube_words.append(word)
            else:
                non_youtube_words.append(word)

        if youtube_words:
            # Emit any non-YouTube text first
            if non_youtube_words:
                text_content = " ".join(non_youtube_words)
                parts.append(f"<p>{_autolink_text(text_content)}</p>")
            # Emit each YouTube embed
            for yt_url in youtube_words:
                video_id = _extract_youtube_id(yt_url)
                if video_id:
                    parts.append(
                        f'<div data-youtube-video="">'
                        f'<iframe src="https://www.youtube-nocookie.com/embed/{video_id}" '
                        f'width="640" height="480" allowfullscreen="true"></iframe>'
                        f"</div>"
                    )
        else:
            # Regular text line
            parts.append(f"<p>{_autolink_text(stripped)}</p>")

    return "".join(parts)
