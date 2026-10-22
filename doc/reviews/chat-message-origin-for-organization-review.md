# Code Review: Chat Message Origin for Organization

**Branch:** `include-chat-message-origin-for-organization`
**Reviewed against:** `master` (after merging #2335, the project origin)
**Issue:** [#2327 — Include chat message origin when reacting on an organisation page](https://github.com/climateconnect/climatehub/issues/2327)
**Spec:** `doc/spec/20261007_1100_issue_2327_chat_message_origin_for_organization.md`
**Date:** 2026-10-21
**Reviewer:** Claude (Opus 5.5)

---

## Summary

The branch tags chat messages sent from an organization page with `origin_type="organization"` and shows a label on them ("This message is about the organization {name}"), as #2296 did for projects. That part is correct and follows the project pattern.

The branch also does something the issue never asked for: **the first organization-tagged message adds every admin of the organization to the chat.** In practice that chat is usually the existing private one-to-one chat between the sender and the organization creator. This causes privacy and permission problems that do not exist on master (findings 1–5).

**Verdict: changes requested.** Remove the admin-participation scope (spec AC-14–17 and the code that implements them) before merging. Keep the origin label part.

---

## Scope drift from the issue

Issue #2327 asks for one thing:

> Follow the example of the event registration cancellation message and include an origin to the message when a user sends a message on an organisation page. […] the same we did for projects #2296

The project feature (#2296) only tags the message and shows a label. Nobody is added to any chat.

The spec went further. It was committed with these parts already in it (`6744022a5`, 2026-10-07):

| Spec location | Content not covered by the issue |
|---|---|
| Design decisions, row "Other org admins" | "**Added as participants** of the chat on the first org-origin message … Decided by product" |
| AC-14 | Every org admin who is not yet an active participant is added as an active `Participant` (POST and WebSocket) |
| AC-15 | Added admins can read and reply in the chat |
| AC-16 | Admins are added after the origin check passes |
| AC-17 | Note above the message input: "Your message will be visible to all admins of {organization}" |
| Open question 2 / Log | "Revised after feedback: … admins are added as chat participants … Replaced AC-14–16" |

The issue author says this was not intended. Neither the issue nor #2296 asks for it. The spec presents it as a product decision, but nothing in the issue supports that.

### Code that implements the drift

| File | What it does |
|---|---|
| `backend/chat_messages/utility/message_origin.py:95` | `add_organization_admins_to_chat()`: adds org admins as active chat participants with role `READ_WRITE`, and makes inactive ones active again |
| `backend/chat_messages/views/message_views.py:442` | Called on the POST send path |
| `backend/chat_messages/consumer.py:79` | Called on the WebSocket send path |
| `backend/chat_messages/tests/test_message_origin.py` | Tests that assert this behaviour: `test_other_admins_join_once_and_receive_message`, `test_added_admin_can_reply`, `test_rejected_message_adds_nobody`, plus participant assertions in the consumer tests |
| `frontend/pages/chat/[chatUUID].tsx:330` | Shows the "visible to all admins" note through a new `inputNote` prop |
| `frontend/src/components/communication/chat/MessagingLayout.tsx:46,150`, `ChatContent.tsx:78,132` | `inputNote` prop and its rendering |
| `frontend/public/texts/chat_texts.json:194` | `chat_message_origin_organization_admins_note` |
| `doc/api-documentation.md:293` | Documents that sending "adds all org admins to the chat as participants" |
| `doc/domain-entities.md` | `origin_type` row mentions that admins are added |

---

## Why the drift is harmful

On master, a private chat can never gain members. Both people get `READ_ONLY`, and `AddParticipantsPermission` (`chat_messages/permissions.py:72-78`) only lets someone add a role lower than their own, which is impossible from `READ_ONLY`.

Some rules already exist on master:
- every active participant sees the whole chat history;
- higher chat roles can manage lower ones;
- a private chat is only reused while it has exactly 2 participants.

Before this branch they only applied to group chats that people created on purpose. This branch applies them to existing private DMs without asking anyone.

### 1. Added admins can read the earlier private conversation (privacy) — High

- The Contact button on the org page (`pages/organizations/[organizationUrl].tsx:278`) calls `startPrivateChat(creator)`. This returns the **existing** one-to-one chat between the sender and the creator if there is one (`get_or_create_private_chat`, `chat_messages/utility/chat_setup.py`).
- The first organization-tagged message adds all org admins to that chat.
- `GetChatMessages` (`message_views.py:242`) returns every message in the chat to any active participant, with no join-date filter.

**Scenario:** user A and user B (creator of org X) have chatted privately for months. A clicks Contact on org X's page and sends a message. Every other admin of org X can now read the full private history between A and B.

### 2. Added admins outrank the original two people — High

- The original two people have role `READ_ONLY` (type 0). Added admins get `READ_WRITE` (type 1, `message_origin.py:104`).
- Under `ParticipantReadWritePermission` (`permissions.py:36-41`), a higher role can update or remove a lower one. Any added admin can therefore remove the sender or the creator from their own chat.
- Under `AddParticipantsPermission`, added admins can also bring more people into the chat as `READ_ONLY`, which the original two cannot.

### 3. Admins can't really leave the chat — Medium

- `add_organization_admins_to_chat` makes inactive participants active again (`message_origin.py:110`).
- An admin who leaves (`is_active=False`, `message_views.py:485`) is added back by the next message the sender sends while `?origin_organization=` is in the URL. That includes every later message in the same visit.

### 4. Each new Contact click creates another group chat — Medium

- `get_or_create_private_chat` only reuses a chat with exactly 2 participants (`chat_setup.py:42-45`). It counts every participant row, including people who left.
- Once admins have joined, the chat no longer counts as private. The next Contact click creates a new private chat, and the next tagged message turns that into another group chat.
- Repeat contacts get spread across several chats. The sender and the creator also lose their ordinary DM: the next profile-page contact creates a new chat as well.

### 5. Any admin's chat partner can pull in all the other admins — Medium

- The origin check (`resolve_organization_origin`) only requires that one other participant is an admin of the organization.
- Anyone who already has a DM with any admin of org X (not just the creator) can send one message with `origin_organization_url_slug=<x>`, which adds all of X's admins to that DM.
- Combined with finding 1, the sender can expose their whole chat with one admin to all the others.

---

## Other findings

### 6. Sender's label can show without a stored origin — Low (same as the project origin on master)

- On the WebSocket path, the sender's own message shows the label immediately, even if the server drops the origin as invalid. The label disappears on reload.
- `originRejected` (`[chatUUID].tsx`) is only set on the POST path.
- The project drawer behaves the same way.

### 7. Sender briefly sees no label — Low

While `getOrganizationOriginBySlug` is still loading, messages are sent tagged but the sender's own copy shows no label until reload.

### 8. Spec and docs out of date — Low

- The spec header still says "Draft — not implemented", and no acceptance criterion is ticked.
- The "Reused from #2296", Tests and Manual sections still describe "chip only on origin change" / "hidden on consecutive same-origin messages". This was dropped on 2026-10-21: the label now shows on every tagged message, as for projects.
- The implementation plan names `organization/views/` and `organization/urls.py`. Since #2335 the origin views are in `chat_messages/views/message_origin_views.py` and `chat_messages/urls.py`.
- AC-12 asks for the contact-chat flow in `doc/mosy/flows/core-flows.md`, but only the project flow is there.
- `api-documentation.md:293` documents the organization field on the generic `POST /api/send_message/` line. The project field is documented in its own section (line ~655); the two should be together.

### 9. Missing tests — Low

- No frontend tests for the org page link (`?origin_organization=` with `hub` kept) or for the chat-page payload with and without the origin, including the retry without origin after a 400.
- These are listed in the spec's Tests section.

---

## What is good

- Origins are resolved and checked on the server from the slug only, never from a raw `origin_id` sent by the client. Sending both a project and an organization slug is rejected.
- A single `resolve_message_origin` dispatcher serves both origin types on both send paths.
- `OrganizationOriginView` copies the project view's permission model and has full 200/403/404/401 test coverage.
- The frontend reuses the shared `fetchOriginContext` and its cache from #2335, so the organization label is just one more case in `Message.tsx`. It uses the same `Groups2Icon` as the mobile page navigation, and the label shows on every tagged message, as for projects.

---

## Recommendation

Bring the branch back to the scope of issue #2327.

1. **Backend:** remove `add_organization_admins_to_chat` and its calls in `message_views.py` and `consumer.py`. Remove or rewrite the tests listed above so they assert that **no** participants are added for organization-tagged messages.
2. **Frontend:**
   - Remove the "visible to all admins" note: the `inputNote` prop in `ChatContent` and `MessagingLayout`, its use in `[chatUUID].tsx`, and the `chat_message_origin_organization_admins_note` text.
   - Keep `getOrganizationOriginBySlug`. The sender's own message still needs it to show the label straight away.
3. **Spec:**
   - Remove the "Other org admins" decision row, AC-14–17 and the related open question and log entries.
   - Add a log entry recording the scope reduction and why.
   - Fix the items in finding 8.
4. **Docs:** remove the "adds all org admins" wording from `api-documentation.md` and `domain-entities.md`, and document `origin_organization_url_slug` next to `origin_project_url_slug`.

Findings 1–5 go away with this change. If reaching the other admins is wanted later, open a separate issue. Possible approaches are a new group chat that starts empty, or a notification instead of joining the chat, and it should get its own privacy review.
