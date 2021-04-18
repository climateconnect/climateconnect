# Testing

This is rough document outlining some functional and manual tests that we use to verify flows and
different use cases.

As the project evolves, we should automate these using some other functional test tooling (e.g.
https://www.cypress.io/).

I'm aiming to keep the ROI high with this, and just outlining some basic functional tests so that we
can keep moving fast with more quality. This should help raise our bus factor, and dissemeniate more
context and knowledge of various test cases across the team and project contributors.

## Test cases

### Filtering with query params

1. Enter a URL with query params. Expect to see the selected filter tags
1. Dismiss a selected filter tag (chip). Ensure
   - URL is updated (query param removed)
   - Selected filter tag (chip) disappears
   - On refresh, you see selected filter / selected item state updated appropriately
1. Enter a URL with query params. Open related filter menu (e.g. "Categories" if query param is a
   category). Ensure
   - Items are selected in MutliSelect
