// Minimal demo authentication for the workshop app.
//
// There is no password/session infra in this MVP: a user "logs in" with just
// their username, and the API returns a bearer token that is simply the
// user's id. This is intentionally simple (workshop clarity over production
// hardening) but still lets us enforce per-user authorization for bookmarks.

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
  };
}

export async function login(db, username) {
  const trimmed = typeof username === 'string' ? username.trim() : '';
  if (!trimmed) {
    const err = new Error('username is required');
    err.statusCode = 422;
    throw err;
  }

  const { rows } = await db.query(
    `SELECT id, username, display_name FROM users WHERE username = $1`,
    [trimmed]
  );

  if (rows.length === 0) {
    const err = new Error('Invalid username');
    err.statusCode = 401;
    throw err;
  }

  const user = mapUser(rows[0]);
  return { token: user.id, user };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getUserByToken(db, token) {
  if (!token || !UUID_PATTERN.test(token)) {
    return null;
  }

  const { rows } = await db.query(
    `SELECT id, username, display_name FROM users WHERE id = $1`,
    [token]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapUser(rows[0]);
}
