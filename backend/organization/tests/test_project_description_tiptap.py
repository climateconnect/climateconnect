from django.test import TestCase

from climateconnect_api.utility.html import (
    PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
    PROJECT_DESCRIPTION_ALLOWED_TAGS,
    sanitize_html,
)
from organization.utility.legacy_description_to_tiptap import (
    legacy_description_to_tiptap_html,
)


class TestLegacyDescriptionToTiptap(TestCase):
    def test_plain_text_single_paragraph(self):
        result = legacy_description_to_tiptap_html("Hello world")
        self.assertEqual(result, "<p>Hello world</p>")

    def test_multi_paragraph(self):
        result = legacy_description_to_tiptap_html("Line one\nLine two\nLine three")
        self.assertEqual(
            result,
            "<p>Line one</p><p>Line two</p><p>Line three</p>",
        )

    def test_empty_line_skipped(self):
        result = legacy_description_to_tiptap_html("A\n\nB")
        self.assertEqual(result, "<p>A</p><p>B</p>")

    def test_youtube_url_own_line(self):
        url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        result = legacy_description_to_tiptap_html(url)
        self.assertIn('<div data-youtube-video="">', result)
        self.assertIn(
            'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"', result
        )
        self.assertIn('width="640"', result)
        self.assertIn('height="480"', result)

    def test_youtube_url_mixed_with_text(self):
        result = legacy_description_to_tiptap_html(
            "Check this out: https://www.youtube.com/watch?v=dQw4w9WgXcQ cool right?"
        )
        self.assertIn("Check this out:", result)
        self.assertIn("cool right?", result)
        self.assertIn('<div data-youtube-video="">', result)
        # Text before the URL should be in its own <p>, text after in another
        self.assertIn("<p>Check this out:</p>", result)
        self.assertIn("<p>cool right?</p>", result)

    def test_multiple_youtube_urls(self):
        result = legacy_description_to_tiptap_html(
            "https://www.youtube.com/watch?v=abc123\nhttps://youtu.be/def456"
        )
        self.assertIn("abc123", result)
        self.assertIn("def456", result)
        self.assertEqual(result.count('<div data-youtube-video="">'), 2)

    def test_bare_url_autolinked(self):
        result = legacy_description_to_tiptap_html("Visit https://example.com for info")
        self.assertIn('<a href="https://example.com"', result)
        self.assertIn("https://example.com</a>", result)

    def test_email_autolinked(self):
        result = legacy_description_to_tiptap_html("Contact us@test.org please")
        self.assertIn('<a href="mailto:us@test.org"', result)
        self.assertIn("us@test.org</a>", result)

    def test_empty_input(self):
        self.assertEqual(legacy_description_to_tiptap_html(""), "")
        self.assertEqual(legacy_description_to_tiptap_html(None), "")
        self.assertEqual(legacy_description_to_tiptap_html("   "), "")

    def test_youtu_be_short_url(self):
        result = legacy_description_to_tiptap_html("https://youtu.be/dQw4w9WgXcQ")
        self.assertIn('<div data-youtube-video="">', result)
        self.assertIn("dQw4w9WgXcQ", result)

    def test_html_escaped_in_text(self):
        result = legacy_description_to_tiptap_html("A < B & C > D")
        self.assertIn("&lt;", result)
        self.assertIn("&amp;", result)
        self.assertIn("&gt;", result)

    def test_youtube_url_with_trailing_comma(self):
        result = legacy_description_to_tiptap_html("http://youtu.be/dQw4w9WgXcQ ,")
        self.assertIn('<div data-youtube-video="">', result)
        self.assertIn("dQw4w9WgXcQ", result)
        self.assertNotIn(",", result)

    def test_youtube_url_with_trailing_comma_no_space(self):
        result = legacy_description_to_tiptap_html("http://youtu.be/dQw4w9WgXcQ,")
        self.assertIn('<div data-youtube-video="">', result)
        self.assertIn("dQw4w9WgXcQ", result)


class TestSanitizeHtmlProjectDescription(TestCase):
    def test_allowed_tags_pass_through(self):
        html = "<p>Hello <strong>world</strong> and <em>italic</em></p>"
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn("<strong>", result)
        self.assertIn("<em>", result)

    def test_lists_allowed(self):
        html = "<ul><li>Item 1</li><li>Item 2</li></ul>"
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn("<ul>", result)
        self.assertIn("<li>", result)

    def test_ordered_list_allowed(self):
        html = "<ol><li>First</li><li>Second</li></ol>"
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn("<ol>", result)

    def test_blockquote_allowed(self):
        html = "<blockquote>Quote</blockquote>"
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn("<blockquote>", result)

    def test_youtube_iframe_preserved(self):
        html = (
            '<div data-youtube-video="">'
            '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" '
            'width="640" height="480" allowfullscreen="true"></iframe></div>'
        )
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn('<div data-youtube-video="">', result)
        self.assertIn("<iframe", result)
        self.assertIn("youtube-nocookie.com/embed/dQw4w9WgXcQ", result)

    def test_non_youtube_iframe_stripped(self):
        html = '<iframe src="https://evil.com/hack"></iframe>'
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertNotIn("<iframe", result)
        self.assertNotIn("evil.com", result)

    def test_script_stripped(self):
        html = '<p>Hello</p><script>alert("xss")</script>'
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertNotIn("<script>", result)
        self.assertNotIn("alert", result)
        self.assertIn("<p>Hello</p>", result)

    def test_link_gets_noopener(self):
        html = '<a href="https://example.com">Link</a>'
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn('rel="noopener noreferrer"', result)

    def test_disallowed_tag_stripped(self):
        html = "<p>Hello</p><h1>Title</h1>"
        result = sanitize_html(
            html,
            allowed_tags=PROJECT_DESCRIPTION_ALLOWED_TAGS,
            allowed_attributes=PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES,
        )
        self.assertIn("<p>Hello</p>", result)
        self.assertNotIn("<h1>", result)

    def test_default_sanitize_unchanged(self):
        """The default checkbox description sanitizer is unchanged."""
        html = "<p><strong>Bold</strong></p><script>bad</script>"
        result = sanitize_html(html)
        self.assertIn("<strong>", result)
        self.assertNotIn("<script>", result)


class TestGetProjectDescription(TestCase):
    def test_returns_description_html_when_set(self):
        from unittest.mock import MagicMock

        from organization.utility.project import get_project_description

        project = MagicMock()
        project.language.language_code = "en"
        project.description_html = "<p>Hello HTML</p>"
        project.description = "Hello plain"
        project.translation_project.filter.return_value.exists.return_value = False

        result = get_project_description(project, "en")
        self.assertEqual(result, "<p>Hello HTML</p>")

    def test_falls_back_to_description(self):
        from unittest.mock import MagicMock

        from organization.utility.project import get_project_description

        project = MagicMock()
        project.language.language_code = "en"
        project.description_html = None
        project.description = "Hello plain"
        project.translation_project.filter.return_value.exists.return_value = False

        result = get_project_description(project, "en")
        self.assertEqual(result, "Hello plain")

    def test_returns_html_translation_when_available(self):
        from unittest.mock import MagicMock

        from organization.utility.project import get_project_description

        project = MagicMock()
        project.language.language_code = "en"
        project.description_html = "<p>Hello</p>"
        project.description = "Hello"
        project.translation_project.filter.return_value.exists.return_value = True
        translation = MagicMock()
        translation.description_html_translation = "<p>Hallo</p>"
        translation.description_translation = "Hallo"
        project.translation_project.get.return_value = translation

        result = get_project_description(project, "de")
        self.assertEqual(result, "<p>Hallo</p>")

    def test_falls_back_to_plain_translation(self):
        from unittest.mock import MagicMock

        from organization.utility.project import get_project_description

        project = MagicMock()
        project.language.language_code = "en"
        project.description_html = "<p>Hello</p>"
        project.description = "Hello"
        project.translation_project.filter.return_value.exists.return_value = True
        translation = MagicMock()
        translation.description_html_translation = None
        translation.description_translation = "Hallo"
        project.translation_project.get.return_value = translation

        result = get_project_description(project, "de")
        self.assertEqual(result, "Hallo")
