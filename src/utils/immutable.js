// src/utils/immutable.js
// Immutable tree helpers — mirrors Immer produce patterns.

export const collectDescendants = (tree, id) => {
  const result = [];
  const walk = (nodeId) => {
    result.push(nodeId);
    (tree[nodeId]?.children || []).forEach(walk);
  };
  walk(id);
  return result;
};

export const reorderList = (list, fromIndex, toIndex) => {
  const next = [...list];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
};
