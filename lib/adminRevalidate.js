export async function revalidateAdminResource(resource, id) {
  try {
    const response = await fetch('/api/admin/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resource, id }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
