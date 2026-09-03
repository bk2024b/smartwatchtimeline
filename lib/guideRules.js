function valueOf(item, field) {
  return item?.[field];
}

function compareValues(a, b, field, direction = 'asc') {
  const av = valueOf(a, field);
  const bv = valueOf(b, field);
  const an = Number(av);
  const bn = Number(bv);
  let result = Number.isFinite(an) && Number.isFinite(bn)
    ? an - bn
    : String(av ?? '').localeCompare(String(bv ?? ''));
  if (direction === 'desc') result *= -1;
  return result;
}

export function matchesGuideRule(item, rule) {
  if (!rule) return true;
  if (Array.isArray(rule.all)) return rule.all.every((r) => matchesGuideRule(item, r));
  if (Array.isArray(rule.any)) return rule.any.some((r) => matchesGuideRule(item, r));

  const actual = valueOf(item, rule.field);
  const expected = rule.value;
  switch (rule.operator) {
    case 'lte': return Number(actual) <= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'gt': return Number(actual) > Number(expected);
    case 'eq': return actual === expected;
    case 'neq': return actual !== expected;
    case 'exists': return actual !== null && actual !== undefined;
    default: return true;
  }
}

export function sortByGuideRule(items, rule) {
  if (!rule?.field) return items;
  return [...items].sort((a, b) => {
    const primary = compareValues(a, b, rule.field, rule.direction);
    if (primary !== 0 || !rule.then) return primary;
    return compareValues(a, b, rule.then.field, rule.then.direction);
  });
}
