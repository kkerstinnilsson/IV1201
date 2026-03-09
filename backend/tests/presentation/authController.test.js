/**
 * @file authController.test.js
 * @description Unit tests for authController.
 *
 * These tests verify:
 * - register(): input validation, service delegation, HTTP 201 response
 * - login(): missing credentials, invalid credentials, session regeneration/save, success response
 * - logout(): session destroy, cookie clearing, success response
 * - me(): authenticated vs unauthenticated behavior
 */

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

jest.mock('../../src/business/authService', () => mockAuthService);

const {
  ValidationError,
  AppError,
} = require('../../src/business/errors/AppError');

const authController = require('../../src/presentation/controllers/authController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
}

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('success: validates input, delegates to service and returns 201', async () => {
      /**
       * Success:
       * - request body contains all required and valid registration fields
       * - controller delegates registration to authService
       * - response should return HTTP 201 with created user payload
       */
      const req = {
        body: {
          name: 'Anna',
          surname: 'Bengtsson',
          email: 'anna@bengtsson.se',
          pnr: '20000101-1234',
          username: 'anna',
          password: 'password123',
        },
      };
      const res = createRes();

      mockAuthService.register.mockResolvedValue({
        id: 14,
        username: 'anna',
      });

      await authController.register(req, res);

      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'Anna',
        surname: 'Bengtsson',
        email: 'anna@bengtsson.se',
        pnr: '20000101-1234',
        username: 'anna',
        password: 'password123',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'account created',
        user: { id: 14, username: 'anna' },
      });
    });

    test('throws ValidationError(400) when required fields are missing/invalid', async () => {
      /**
       * Validation:
       * - request body contains missing and invalid registration fields
       * - controller should throw ValidationError(400)
       * - authService.register must not be called
       */
      const req = {
        body: {
          name: '',
          surname: '',
          email: 'not-an-email',
          pnr: 'bad-pnr',
          username: 'ab',
          password: '123',
        },
      };
      const res = createRes();

      const err = await authController.register(req, res).catch((e) => e);
      expect(err).toBeInstanceOf(ValidationError);
      expect(err).toMatchObject({
        message: 'Validation failed',
        statusCode: 400,
      });

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    test('throws ValidationError(400) when body is missing', async () => {
      /**
       * Validation:
       * - request body is missing entirely
       * - controller should throw ValidationError(400)
       * - authService.register must not be called
       */
      const req = {};
      const res = createRes();

      await expect(authController.register(req, res))
        .rejects.toBeInstanceOf(ValidationError);

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('throws ValidationError(400) when username or password is missing', async () => {
      /**
       * Validation:
       * - login request is missing either username or password
       * - controller should throw ValidationError(400)
       * - authService.login must not be called
       */
      const req = {
        body: {
          username: 'anna',
        },
        session: {},
      };
      const res = createRes();

      await expect(authController.login(req, res))
        .rejects.toMatchObject({
          message: 'Username and password are required',
          statusCode: 400,
        });

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    test('throws ValidationError(401) when credentials are invalid', async () => {
      /**
       * Authentication:
       * - authService.login returns null for invalid credentials
       * - controller should throw ValidationError(401)
       * - no session should be created
       */
      const req = {
        body: {
          username: 'anna',
          password: 'wrong',
        },
        session: {},
      };
      const res = createRes();

      mockAuthService.login.mockResolvedValue(null);

      await expect(authController.login(req, res))
        .rejects.toMatchObject({
          message: 'Wrong username or password',
          statusCode: 401,
        });
    });

    test('success: regenerates session, saves user and returns JSON', async () => {
      /**
       * Success:
       * - username and password are provided
       * - authService returns an authenticated user
       * - controller regenerates the session to prevent fixation
       * - authenticated user is stored in session and session is saved
       * - response returns the authenticated user payload
       */
      const req = {
        body: {
          username: 'anna',
          password: 'password123',
        },
        session: {
          regenerate: jest.fn((cb) => cb(null)),
          save: jest.fn((cb) => cb(null)),
        },
      };
      const res = createRes();

      mockAuthService.login.mockResolvedValue({
        id: 1,
        username: 'anna',
        role: 'applicant',
      });

      await authController.login(req, res);

      expect(mockAuthService.login).toHaveBeenCalledWith('anna', 'password123');
      expect(req.session.regenerate).toHaveBeenCalledTimes(1);
      expect(req.session.user).toEqual({
        id: 1,
        username: 'anna',
        role: 'applicant',
      });
      expect(req.session.save).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1, username: 'anna', role: 'applicant' },
      });
    });

    test('throws AppError(500) when session regenerate fails', async () => {
      /**
        * Session error:
        * - authService returns a valid authenticated user
        * - session regeneration fails
        * - controller should wrap this as AppError(500)
        * - session should not proceed to save
        */
      const req = {
        body: {
          username: 'anna',
          password: 'password123',
        },
        session: {
          regenerate: jest.fn((cb) => cb(new Error('boom'))),
          save: jest.fn((cb) => cb(null)),
        },
      };
      const res = createRes();

      mockAuthService.login.mockResolvedValue({
        id: 1,
        username: 'anna',
        role: 'applicant',
      });

      const err = await authController.login(req, res).catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        message: 'Session regeneration failed',
        statusCode: 500,
      });
    });

    test('throws AppError(500) when session save fails', async () => {
      /**
       * Session error:
       * - authService returns a valid authenticated user
       * - session regeneration succeeds
       * - session save fails
       * - controller should wrap this as AppError(500)
       */
      const req = {
        body: {
          username: 'anna',
          password: 'password123',
        },
        session: {
          regenerate: jest.fn((cb) => cb(null)),
          save: jest.fn((cb) => cb(new Error('boom'))),
        },
      };
      const res = createRes();

      mockAuthService.login.mockResolvedValue({
        id: 1,
        username: 'anna',
        role: 'applicant',
      });

      await expect(authController.login(req, res))
        .rejects.toBeInstanceOf(AppError);

      await expect(authController.login(req, res))
        .rejects.toMatchObject({
          message: 'Session save failed',
          statusCode: 500,
        });
    });
  });

  describe('logout', () => {
    test('success: destroys session, clears cookie and returns message', async () => {
      /**
       * Success:
       * - session destruction succeeds
       * - controller clears the session cookie
       * - response returns a logout confirmation message
       */
      const req = {
        session: {
          destroy: jest.fn((cb) => cb(null)),
        },
      };
      const res = createRes();

      await authController.logout(req, res);

      expect(req.session.destroy).toHaveBeenCalledTimes(1);
      expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
      expect(res.json).toHaveBeenCalledWith({ message: 'logged out' });
    });

    test('throws AppError(500) when destroy fails', async () => {
      /**
       * Session error:
       * - session destruction fails
       * - controller should wrap this as AppError(500)
       * - no success response should be returned
       */
      const req = {
        session: {
          destroy: jest.fn((cb) => cb(new Error('boom'))),
        },
      };
      const res = createRes();

      await expect(authController.logout(req, res))
        .rejects.toMatchObject({
          message: 'Logout failed',
          statusCode: 500,
        });
    });
  });

  describe('me', () => {
    test('returns current user from session', async () => {
      /**
       * Success:
       * - session contains an authenticated user
       * - controller should return that user in the response
       */
      const req = {
        session: {
          user: { id: 1, username: 'anna', role: 'applicant' },
        },
      };
      const res = createRes();

      await authController.me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1, username: 'anna', role: 'applicant' },
      });
    });

    test('throws AppError(401) when not authenticated', async () => {
      /**
       * Authentication:
       * - session has no authenticated user
       * - controller should throw AppError(401)
       */
      const req = { session: {} };
      const res = createRes();

      await expect(authController.me(req, res))
        .rejects.toMatchObject({
          message: 'Not authenticated',
          statusCode: 401,
        });
    });
  });
});
