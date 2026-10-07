/**
 * Make whatsapp-web.js block/unblock work after WhatsApp Web's LID migration.
 *
 * `Contact.block()` / `Contact.unblock()` resolve their target through
 * `WAWebBlockContactUtils.getContactToBlockOnlyUseIfNoAssociatedChat(contact, 'ChatListBlock')`.
 * WhatsApp Web has since REMOVED that function, so both calls reject in the page with
 * `TypeError: window.require(...).getContactToBlockOnlyUseIfNoAssociatedChat is not a function`,
 * which reaches the caller as an opaque `500`. Measured live: every id shape fails, a phone-based
 * `@c.us` id exactly like a privacy `@lid` one, so the whole capability is dead rather than degraded.
 *
 * Restoring it is not a rename. Three things changed together:
 *
 * 1. The replacement helpers `handleBlock` / `handleUnblock` are UI wrappers: they call
 *    `getIsPSA(chat)` and open a confirmation modal through ModalManager. Driving `handleBlock`
 *    with a real chat returns without throwing and blocks NOTHING, because the modal is never
 *    confirmed. Verified on the test server: the blocklist stayed at 188 entries.
 * 2. The server now refuses a phone-keyed block outright, logging
 *    `[blocklist] trying to block a pn contact without a chat`. Blocking requires an identity that
 *    owns a chat.
 * 3. Individual chats are keyed by LID now, while whatsapp-web.js folds every identity back to a
 *    phone number: `getContactById('100000000000000@lid')` answers `id: 628123456789@c.us`. So the
 *    id `Contact.block()` had in hand was precisely the one WhatsApp refuses.
 *
 * The fix therefore resolves the contact to the identity that actually owns the chat, and calls the
 * underlying action directly instead of the modal wrapper:
 *
 *   `WAWebLidMigrationUtils.toUserLid(contact.id)` then `ChatCollection.get(lid)` then `chat.contact`
 *   then `WAWebBlockContactAction.blockContact({ contact, blockEntryPoint })` / `unblockContact(contact)`
 *
 * `blockEntryPoint` is required by the action's new signature; the removed helper used to supply it.
 * When no LID or no chat is found the original contact is used, which keeps a phone-only account
 * working exactly as before rather than making this patch a hard dependency on the migration.
 *
 * Verified against a live wwjs session (WhatsApp Web, 2026-08-18): the blocklist went 188 to 189 on
 * block and 189 back to 188 on unblock, twice in a row, with the in-page blocklist collection
 * confirming the LID entry. Before the patch both calls answered `500`.
 *
 * The transform is exact and self-disabling: an unknown shape fails the build instead of silently
 * shipping without the fix, matching the sibling patchers.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_WWJS = path.join(__dirname, '..', 'node_modules', 'whatsapp-web.js');
const CONTACT_PATH = path.join('src', 'structures', 'Contact.js');

/** The upstream body, byte-exact, differing only in the action call at the end. */
const findFor = (call) => `            const resolved = window
                .require('WAWebBlockContactUtils')
                .getContactToBlockOnlyUseIfNoAssociatedChat(
                    contact,
                    'ChatListBlock',
                );
            await window
                .require('WAWebBlockContactAction')
                .${call};`;

/**
 * Resolve to the identity that owns the chat, then call the action directly.
 *
 * `toUserLid` throws for an account with no LID mapping, so it is wrapped: a throw means "no LID",
 * not "fail the block". Same for a missing chat. Both fall back to the contact we were given.
 */
const replaceFor = (call) => `            const req = (name) => {
                try {
                    return window.require(name);
                } catch (error) {
                    return null;
                }
            };
            const migration = req('WAWebLidMigrationUtils');
            const chats = req('WAWebChatCollection');
            let lid = null;
            if (migration && typeof migration.toUserLid === 'function') {
                try {
                    lid = migration.toUserLid(contact.id);
                } catch (error) {
                    lid = null;
                }
            }
            const lidId = lid ? String(lid._serialized || lid) : null;
            const chat = chats && chats.ChatCollection && lidId ? chats.ChatCollection.get(lidId) : null;
            const target = chat && chat.contact ? chat.contact : contact;
            await window
                .require('WAWebBlockContactAction')
                .${call};`;

const GROUPS = [
  {
    name: 'block',
    find: findFor('blockContact({ contact: resolved })'),
    replace: replaceFor("blockContact({ contact: target, blockEntryPoint: 'ChatListBlock' })"),
  },
  {
    name: 'unblock',
    find: findFor('unblockContact(resolved)'),
    replace: replaceFor('unblockContact(target)'),
  },
];

/**
 * Both groups' stand-down branch as one predicate, for the startup guard
 * (engine-patch-status.ts). A half-patched tree is a reachable, supported state here, and it reads
 * as NOT applied: whichever half is missing still answers an opaque 500 on every id.
 * Unreadable reads as applied, since a tree we cannot inspect is not evidence of a broken one.
 */
function isApplied(wwjsDir = DEFAULT_WWJS) {
  try {
    const source = fs.readFileSync(path.join(wwjsDir, CONTACT_PATH), 'utf8');
    return GROUPS.every((group) => source.includes(group.replace));
  } catch {
    return true;
  }
}

function applyBlockPatches({ wwjsDir = DEFAULT_WWJS } = {}) {
  const contactFile = path.join(wwjsDir, CONTACT_PATH);
  if (!fs.existsSync(contactFile)) {
    throw new Error(`whatsapp-web.js Contact.js not found at ${contactFile}`);
  }
  let source = fs.readFileSync(contactFile, 'utf8');
  const applied = [];
  const skipped = [];

  for (const group of GROUPS) {
    if (source.includes(group.replace)) {
      skipped.push(group.name);
      continue;
    }
    if (!source.includes(group.find)) {
      throw new Error(`unexpected ${group.name}() shape in ${CONTACT_PATH}: refusing to patch blind`);
    }
    source = source.replace(group.find, group.replace);
    applied.push(group.name);
  }

  if (applied.length > 0) {
    fs.writeFileSync(contactFile, source);
  }
  return { applied, skipped };
}

function run() {
  const bestEffort = process.argv.includes('--best-effort');
  try {
    const { applied, skipped } = applyBlockPatches();
    const report = [
      ...applied.map((name) => `applied ${name}`),
      ...skipped.map((name) => `skipped ${name} (already present)`),
    ].join('; ');
    console.log(`patch-wwebjs-block: ${report}`);
  } catch (error) {
    if (bestEffort) {
      console.warn(`patch-wwebjs-block: skipped, ${error.message}`);
      return;
    }
    console.error(`patch-wwebjs-block: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) run();

module.exports = { applyBlockPatches, isApplied, GROUPS, findFor, replaceFor, CONTACT_PATH };
