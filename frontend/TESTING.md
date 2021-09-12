# Testing

This is rough document outlining some functional and manual tests that we use to verify flows and
different use cases.

As the project evolves, we should automate these using some other functional test tooling (e.g.
https://www.cypress.io/).

I'm aiming to keep the ROI high with this, and just outlining some basic functional tests so that we
can keep moving fast with more quality. This should help raise our bus factor, and dissemeniate more
context and knowledge of various test cases across the team and project contributors.

## End to end testing

<!-- Note: this documentation might move elsewhere as the project evolves. -->

### API calls

### Tips

1. Don't forget the trailing slash!
1. We reuse Postman collections and snippets. Ping the web team's Slack channel to get them.

## Functional test cases

### Filtering with query params

1. Enter a URL with query params. Ensure
   1. Correct selected filter tags / chips appear
   1. Correct selected resources (projects) are returned from the server
1. Enter a URL with query params. Open related filter dialog (e.g. "Categories" if query param is a
   category). Ensure
   1. Ensure items are selected and not grayed out / disabled in MutliSelect
   1. Ensure when clicking "X", menu is dismissed / canceled
   1. Ensure when clicking "Save", menu is dismissed, query params in URL are updated, filter and
      fetch of new resources from backend takes place
1. Dismiss a selected filter tag (chip).
   1. Ensure selected filter tag (chip) disappears
   1. Ensure URL is updated (query param removed) correctly
   1. Ensure resources (projects) are re-fetched and cards are updated in the UI correctly
   1. Ensure opening a multi level selector dialog (e.g. Skills or Categories) has the state
      reflected
   1. On refresh, you see selected filter / selected item state updated appropriately
