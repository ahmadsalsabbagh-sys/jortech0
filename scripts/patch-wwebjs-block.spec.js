'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { applyBlockPatches, isApplied, GROUPS, findFor, replaceFor } = require('./patch-wwebjs-block');

/**
 * The patcher rewrites a file this repository does not own, so what has to hold is that it fires on
 * exactly the shape it was written for and refuses everything else. A transform that silently did
 * nothing would ship a build where block and unblock still answer an opaque 500 on every id, which
 * is the whole failure this patch exists to remove.
 *
 * The fixture is the INSTALLED Contact.js rather than a hand-written approximation: a synthetic
 * fixture can only prove the patcher matches a shape I wrote, not the shape upstream ships. When the
 * installed tree is already patched (postinstall runs on `npm install`), the patch is reversed to
 * recover the pristine text, so the suite behaves the same before and after a local install.
 */
const INSTALLED_CONTACT = path.join(
  __dirname,
  '..',
  'node_modules',
  'whatsapp-web.js',
  'src',
  'structures',
  'Contact.js',
);

/** The installed file as upstream ships it, un-patching first when postinstall already ran. */
function pristineSource() {
  let source = fs.readFileSync(INSTALLED_CONTACT, 'utf8');
  for (const group of GROUPS) {
    if (source.includes(group.replace)) {
      source = source.replace(group.replace, group.find);
    }
  }
  return source;
}

/** A throwaway whatsapp-web.js tree holding just the file the patcher edits. */
function fakeWwjs(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wwjs-block-'));
  const structures = path.join(dir, 'src', 'structures');
  fs.mkdirSync(structures, { recursive: true });
  fs.writeFileSync(path.join(structures, 'Contact.js'), source);
  return { dir, file: path.join(structures, 'Contact.js') };
}

test('the installed tree still has both shapes the patcher targets', () => {
  const source = pristineSource();
  for (const group of GROUPS) {
    assert.ok(source.includes(group.find), `upstream no longer matches the ${group.name}() shape`);
  }
});

test('patches block and unblock, and is idempotent', () => {
  const { dir, file } = fakeWwjs(pristineSource());
  const first = applyBlockPatches({ wwjsDir: dir });
  assert.deepEqual(first.applied, ['block', 'unblock']);
  assert.deepEqual(first.skipped, []);

  const patched = fs.readFileSync(file, 'utf8');
  // The dead helper is gone from both bodies, and the entry point the new action signature needs is
  // supplied on the block side only (unblockContact takes the contact positionally).
  assert.ok(!patched.includes('getContactToBlockOnlyUseIfNoAssociatedChat'));
  assert.ok(patched.includes("blockContact({ contact: target, blockEntryPoint: 'ChatListBlock' })"));
  assert.ok(patched.includes('unblockContact(target)'));
  // Both bodies resolve through the chat-owning identity.
  assert.equal(patched.split('migration.toUserLid(contact.id)').length - 1, 2);
  assert.equal(patched.split('chat && chat.contact ? chat.contact : contact').length - 1, 2);

  const second = applyBlockPatches({ wwjsDir: dir });
  assert.deepEqual(second.applied, []);
  assert.deepEqual(second.skipped, ['block', 'unblock']);
  assert.equal(fs.readFileSync(file, 'utf8'), patched, 'a second run must not change the file');

  fs.rmSync(dir, { recursive: true, force: true });
});

test('isApplied tracks the transform, false before it runs and true after', () => {
  const { dir } = fakeWwjs(pristineSource());
  assert.equal(isApplied(dir), false);
  applyBlockPatches({ wwjsDir: dir });
  assert.equal(isApplied(dir), true);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('refuses an unknown shape instead of shipping unpatched', () => {
  const { dir } = fakeWwjs(pristineSource().replace('getContactToBlockOnlyUseIfNoAssociatedChat', 'someRenamedHelper'));
  assert.throws(() => applyBlockPatches({ wwjsDir: dir }), /refusing to patch blind/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('refuses a tree with no Contact.js at all', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wwjs-block-empty-'));
  assert.throws(() => applyBlockPatches({ wwjsDir: dir }), /Contact\.js not found/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a half-patched tree still gets the missing half', () => {
  // Only block patched: unblock must still be applied rather than reported as already present.
  const half = pristineSource().replace(
    findFor('blockContact({ contact: resolved })'),
    replaceFor("blockContact({ contact: target, blockEntryPoint: 'ChatListBlock' })"),
  );
  const { dir } = fakeWwjs(half);
  const result = applyBlockPatches({ wwjsDir: dir });
  assert.deepEqual(result.applied, ['unblock']);
  assert.deepEqual(result.skipped, ['block']);
  fs.rmSync(dir, { recursive: true, force: true });
});
