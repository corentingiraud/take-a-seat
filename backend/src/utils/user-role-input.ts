// Reads the `role` of a users-permissions write the way the v5 document service
// does (@strapi/core document-service/transform/relations/utils/map-relation.js):
// shorthand ids/documentIds, { id } / { documentId }, arrays, and
// { set, connect, disconnect }.

export type RoleRef = { id: number } | { documentId: string };

/**
 * [] when the write leaves the role alone, the roles it assigns otherwise, and
 * null when it clears the role or the input cannot be read. Callers refuse null.
 */
export function assignedRoleRefs(role: unknown): RoleRef[] | null {
  if (role === undefined) return [];
  if (role === null) return null;
  if (Array.isArray(role)) return role.length ? refsOf(role) : null;
  if (typeof role !== 'object') return refsOf([role]);
  if ('id' in role || 'documentId' in role) return refsOf([role]);

  const { set, connect, disconnect } = role as Record<string, unknown>;
  if (set === undefined && connect === undefined && disconnect === undefined) return null;
  if (set === null || connect === null) return null;

  const assigned = [...toArray(set), ...toArray(connect)];
  if (assigned.length) return refsOf(assigned);
  // Nothing assigned: an explicit empty set or a disconnect leaves no role.
  return set !== undefined || toArray(disconnect).length ? null : [];
}

const toArray = (value: unknown): unknown[] =>
  value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];

// Strapi treats anything parseInt accepts as an id, so "4abc" is an id too; only
// plain positive integers are resolvable.
const toId = (value: unknown): number | null => {
  const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  return Number.isInteger(id) && (id as number) > 0 ? (id as number) : null;
};

const isIdLike = (value: unknown) =>
  typeof value === 'number' || (typeof value === 'string' && !Number.isNaN(parseInt(value, 10)));

function refsOf(entries: unknown[]): RoleRef[] | null {
  const refs: RoleRef[] = [];
  for (const entry of entries) {
    if (isIdLike(entry)) {
      const id = toId(entry);
      if (id === null) return null;
      refs.push({ id });
    } else if (typeof entry === 'string' && entry) {
      refs.push({ documentId: entry });
    } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const { id, documentId } = entry as Record<string, unknown>;
      if (id == null && documentId == null) return null;
      // Both are checked when both are sent: we cannot tell which one Strapi uses.
      if (id != null) {
        const parsed = toId(id);
        if (parsed === null) return null;
        refs.push({ id: parsed });
      }
      if (documentId != null) {
        if (typeof documentId !== 'string' || !documentId) return null;
        refs.push({ documentId });
      }
    } else {
      return null;
    }
  }
  return refs;
}
