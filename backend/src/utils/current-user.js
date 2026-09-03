/**
 * The workshop baseline has no login flow, so the current user is identified by
 * the `x-user-id` request header sent by the frontend.
 */
export function getUserId(request) {
  const headerValue = request.headers['x-user-id'];
  if (typeof headerValue !== 'string' || !headerValue.trim()) {
    return null;
  }

  return headerValue.trim();
}

export const MISSING_USER_RESPONSE = { message: 'x-user-id header is required' };
