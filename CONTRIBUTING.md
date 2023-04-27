# Contributing to Climate Connect

Thank you for your interest in contributing to Climate Connect!

Table of Contents:

1. [Feature Requests](#feature-requests)
1. [Bug Reports](#bug-reports)
1. [Pull Requests](#pull-requests)
   1. [Documentation](#documentation)
1. [Contact](#contact)

## Feature Requests

Feature requests should be reported in the [Climate Connect issue tracker](https://github.com/climateconnect/climateconnect/issues). To avoid duplicates, please make sure to check existing issues.

## Bug Reports

Bug reports should be reported in the [Climate Connect issue tracker](https://github.com/climateconnect/climateconnect/issues).

To report a bug follow these guideline.

1. Describe the issue: Fill in a concise description of what went wrong
1. Steps to recreate: List every step you took that led to the unexpected result.
1. Expected result: Fill in what you would have expected after the last step in "Steps to recreate"
1. Actual result: Explain what actually happened
1. Link: Please provide a link to this issue.

## Pull Requests

If you are looking for a place to start contributing to Climate Connect, take a look at the [good first issues](https://github.com/climateconnect/climateconnect/projects/7?card_filter_query=label%3A%22good+first+issue%22) and the [beginner level](https://github.com/climateconnect/climateconnect/issues?q=is%3Aopen+is%3Aissue+label%3A%22beginner+level+issue%22) issues.

When creating a pull request (PR) follow these guidelines.

1. Ensure you're starting off a new branch, that's checked out from the latest master. The project uses a single branching model off master (no develop branches).
1. `yarn lint` passes (frontend)
1. `yarn format` passes (frontend)
1. `make format` passes (backend)
1. Add concise description to the PR summary, and a meaningful title.
1. Add detailed steps to for testing a feature or bug.
1. If there is code unrelated to feature or a bug in the PR, please list all changes.

Once your PR is approved, ensure that you **squash merge** your PR -- this improves maintainability for future contributors.

### Testing

For a full test, test the following site functionality:

**User**

- [ ] Sign Up
- [ ] Log In

**Projects**

- [ ] create project
- [ ] view project
- [ ] edit project

**Organizations**

- [ ] create organization
- [ ] view organization
- [ ] edit organization

**Members**

- [ ] create member
- [ ] view member
- [ ] edit member

**Ideas**

- [ ] create idea
- [ ] view idea
- [ ] edit idea

**Hubs**

- [ ] view hub http://localhost:3000/hubs/food
- [ ] filter projects in hub

**Other**

- [ ] switch language de/en

- [ ] private chat
- [ ] group chat
- [ ] /admin page
- [ ] send and receive notification


### Documentation

Code should be documented where appropriate. The general Python and JavaScript rules can be followed for formatting.

## Contact

If there are any outstanding questions about contributing to Climate Connect, they can be asked on the [Climate Connect issue tracker](https://github.com/climateconnect/climateconnect/issues).

For a more immediate and direct form of communication, please tag core contributors @positiveimpact and @ddhanesha on an issue.
