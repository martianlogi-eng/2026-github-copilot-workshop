import { describe, test, expect, jest } from '@jest/globals';
import { login, getUserByToken } from '../../src/services/auth-service.js';

function mockDb(queryImpl) {
  return { query: jest.fn(queryImpl) };
}

describe('auth-service', () => {
  test('login returns a token and user for a known username', async () => {
    const db = mockDb(() => ({
      rows: [{ id: 'user-1', username: 'sari', display_name: 'Sari Lestari' }],
    }));

    const result = await login(db, 'sari');

    expect(result).toEqual({
      token: 'user-1',
      user: { id: 'user-1', username: 'sari', displayName: 'Sari Lestari' },
    });
  });

  test('login rejects an unknown username with 401', async () => {
    const db = mockDb(() => ({ rows: [] }));

    await expect(login(db, 'nobody')).rejects.toMatchObject({ statusCode: 401 });
  });

  test('login rejects an empty username with 422', async () => {
    const db = mockDb(() => ({ rows: [] }));

    await expect(login(db, '  ')).rejects.toMatchObject({ statusCode: 422 });
    expect(db.query).not.toHaveBeenCalled();
  });

  test('getUserByToken returns null for a malformed token without querying the db', async () => {
    const db = mockDb(() => ({ rows: [] }));

    const result = await getUserByToken(db, 'not-a-uuid');

    expect(result).toBeNull();
    expect(db.query).not.toHaveBeenCalled();
  });

  test('getUserByToken returns the mapped user for a valid token', async () => {
    const db = mockDb(() => ({
      rows: [{ id: '11111111-1111-1111-1111-111111111111', username: 'budi', display_name: 'Budi Santoso' }],
    }));

    const result = await getUserByToken(db, '11111111-1111-1111-1111-111111111111');

    expect(result).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      username: 'budi',
      displayName: 'Budi Santoso',
    });
  });
});
