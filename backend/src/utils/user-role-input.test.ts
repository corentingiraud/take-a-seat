import test from 'node:test';
import assert from 'node:assert/strict';

import { assignedRoleRefs } from './user-role-input.ts';

const doc = 'qy9oo23a33t1d1gy5efnc3i0';

test('a write that does not touch the role assigns nothing', () => {
  assert.deepEqual(assignedRoleRefs(undefined), []);
  // What the admin edit form sends when the role field is left alone.
  assert.deepEqual(assignedRoleRefs({ connect: [], disconnect: [] }), []);
});

test('every v5 relation shape resolves to the roles it assigns', () => {
  assert.deepEqual(assignedRoleRefs(4), [{ id: 4 }]);
  assert.deepEqual(assignedRoleRefs('4'), [{ id: 4 }]);
  assert.deepEqual(assignedRoleRefs(doc), [{ documentId: doc }]);
  assert.deepEqual(assignedRoleRefs({ id: 4 }), [{ id: 4 }]);
  assert.deepEqual(assignedRoleRefs({ documentId: doc }), [{ documentId: doc }]);
  assert.deepEqual(assignedRoleRefs([3, doc]), [{ id: 3 }, { documentId: doc }]);
  assert.deepEqual(assignedRoleRefs({ connect: [{ documentId: doc, position: { end: true } }] }), [
    { documentId: doc },
  ]);
  assert.deepEqual(assignedRoleRefs({ connect: doc, disconnect: [3] }), [{ documentId: doc }]);
  assert.deepEqual(assignedRoleRefs({ set: [{ id: 4 }] }), [{ id: 4 }]);
  assert.deepEqual(assignedRoleRefs({ set: [], connect: [4] }), [{ id: 4 }]);
  // Both identifiers are returned, so a mismatched pair cannot slip one past the check.
  assert.deepEqual(assignedRoleRefs({ connect: [{ id: 4, documentId: doc }] }), [
    { id: 4 },
    { documentId: doc },
  ]);
  assert.deepEqual(assignedRoleRefs({ connect: [{ id: null, documentId: doc }] }), [{ documentId: doc }]);
});

test('clearing the role or an unreadable input is refused', () => {
  for (const role of [
    null,
    [],
    { set: [] },
    { set: null },
    { connect: null },
    { disconnect: [4] },
    { disconnect: { documentId: doc } },
    {},
    { position: { end: true } },
    '',
    '4abc',
    0,
    -1,
    1.5,
    true,
    [[4]],
    { connect: [{}] },
    { connect: [{ id: 'x' }] },
    { connect: [{ documentId: 4 }] },
    { connect: [4, null] },
  ]) {
    assert.equal(assignedRoleRefs(role), null, JSON.stringify(role));
  }
});
