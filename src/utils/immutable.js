// Immutable tree manipulation helpers (mirrors Immer produce patterns)

export const updateNode = (tree, id, changes) => ({
  ...tree,
  [id]: { ...tree[id], ...changes, updatedAt: Date.now() },
});

export const addChildToNode = (tree, parentId, childId) => ({
  ...tree,
  [parentId]: {
    ...tree[parentId],
    children: [...(tree[parentId]?.children || []), childId],
  },
});

export const removeChildFromNode = (tree, parentId, childId) => ({
  ...tree,
  [parentId]: {
    ...tree[parentId],
    children: (tree[parentId]?.children || []).filter(id => id !== childId),
  },
});

export const collectDescendants = (tree, id) => {
  const result = [];
  const walk = (nodeId) => {
    result.push(nodeId);
    (tree[nodeId]?.children || []).forEach(walk);
  };
  walk(id);
  return result;
};

export const reorderList = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
