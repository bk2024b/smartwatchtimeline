function valueOf(item, field) {
  return item?.[field];
}

function compare(a, b, direction = 'asc') {
  const av = valueOf(a, arguments[2]?.field);
  const bv = valueOf(b, arguments[2]?.field);
  const an = Number(av);
  const bn = Number(bv);
  const numeric = Number.isFinite(an) && Number.isFinite(bn);
  const result = numeric ? an - bn : String(av ?? '').localeCompare(String(bv ?? ''));
  return direction === 'desc' ? -result : result;
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
    const av = valueOf(a, rule.field);
    const bv = valueOf(b, rule.field);
    const an = Number(av);
    const bn = Number(bv);
    let result;
    if (Number.isFinite(an) && Number.isFinite(bn)) result = an - bn;
    else result = String(av ?? '').localeCompare(String(bv ?? ''));
    if (rule.direction === 'desc') result *= -1;
    if (result !== 0 && rule.then) return result;
    return rule.then ? sortByGuideRule([a, b], rule.then).indexOf(a) - sortByGuideRule([a, b], rule.then).indexOf(b) : result;
  });
}
