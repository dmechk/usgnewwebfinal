const { requireRole, requirePasswordChanged } = require('../../src/middleware/auth');
const AppError = require('../../src/utils/appError');
const { mockNext } = require('../helpers/http');

describe('authorization middleware', () => {
  it('allows a matching role', () => {
    const next = mockNext();
    requireRole('admin')({ user: { id: '1', role: 'admin' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a mismatched role', () => {
    const next = mockNext();
    requireRole('admin')({ user: { id: '1', role: 'technician' } }, {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('rejects unauthenticated requests', () => {
    const next = mockNext();
    requireRole('admin')({}, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('blocks users who must change their password', () => {
    const next = mockNext();
    requirePasswordChanged({ user: { passwordChangeRequired: true } }, {}, next);
    expect(next.mock.calls[0][0].code).toBe('PASSWORD_CHANGE_REQUIRED');
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows users who do not need a password change', () => {
    const next = mockNext();
    requirePasswordChanged({ user: { passwordChangeRequired: false } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
