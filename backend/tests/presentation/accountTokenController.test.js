/**
 * @file accountTokenController.test.js
 * @description Unit tests for accountTokenController.
 *
 * These tests verify:
 * - requestAccountToken(): email validation, service delegation, HTTP 200 response
 * - claimAccountToken(): token/body validation, service delegation, HTTP 201 response
 * - validation errors: invalid or missing input results in ValidationError
 */

const mockAccountTokenService = {
  requestAccountToken: jest.fn(),
  claimAccountToken: jest.fn(),
};

jest.mock("../../src/business/accountTokenService", () => mockAccountTokenService);

const {
  ValidationError,
} = require("../../src/business/errors/AppError");

const accountTokenController = require("../../src/presentation/controllers/accountTokenController");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
}

describe("accountTokenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestAccountToken", () => {
    test("success: validates email, delegates to service and returns 200", async () => {
      /**
       * Success:
       * - request body contains a valid email address
       * - controller delegates token generation to accountTokenService
       * - response should return HTTP 200 with token link payload
       */
      const req = {
        body: {
          email: "user@test.se",
        },
      };
      const res = createRes();

      mockAccountTokenService.requestAccountToken.mockResolvedValue({
        email: "user@test.se",
        link: "http://test.com/claim/rawToken",
        expiresAt: new Date(),
      });

      await accountTokenController.requestAccountToken(req, res);

      expect(mockAccountTokenService.requestAccountToken).toHaveBeenCalledWith("user@test.se");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "token link generated",
        data: expect.objectContaining({
          email: "user@test.se",
          link: "http://test.com/claim/rawToken",
        }),
      });
    });

    test("throws ValidationError(400) when email is missing", async () => {
      /**
       * Validation:
       * - email is missing from the request body
       * - controller should throw ValidationError(400)
       * - accountTokenService.requestAccountToken must not be called
       */
      const req = { body: {} };
      const res = createRes();

      const err = await accountTokenController.requestAccountToken(req, res).catch(e => e);
      expect(err).toBeInstanceOf(ValidationError);
      expect(err).toMatchObject({ 
        message: "Validation failed", 
        statusCode: 400 
      });

      expect(mockAccountTokenService.requestAccountToken).not.toHaveBeenCalled();
    });

    test("throws ValidationError(400) when email format is invalid", async () => {
      /**
       * Validation:
       * - request body contains an invalid email format
       * - controller should throw ValidationError(400)
       * - accountTokenService.requestAccountToken must not be called
       */
      const req = {
        body: {
          email: "not-an-email",
        },
      };
      const res = createRes();

      await expect(accountTokenController.requestAccountToken(req, res))
        .rejects.toMatchObject({
          message: "Validation failed",
          statusCode: 400,
        });

      expect(mockAccountTokenService.requestAccountToken).not.toHaveBeenCalled();
    });
  });

  describe("claimAccountToken", () => {
    test("success: validates token/body, delegates to service and returns 201", async () => {
      /**
       * Success:
       * - route params contain a token
       * - request body contains valid username and password
       * - controller delegates account claiming to accountTokenService
       * - response should return HTTP 201 with claimed user payload
       */
      const req = {
        params: {
          token: "rawToken",
        },
        body: {
          username: "anna",
          password: "password123",
        },
      };
      const res = createRes();

      mockAccountTokenService.claimAccountToken.mockResolvedValue({
        id: 12,
        username: "anna",
      });

      await accountTokenController.claimAccountToken(req, res);

      expect(mockAccountTokenService.claimAccountToken).toHaveBeenCalledWith(
        "rawToken",
        "anna",
        "password123"
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "account claimed",
        user: { id: 12, username: "anna" },
      });
    });

    test("throws ValidationError when token is missing", async () => {
      /**
       * Validation:
       * - route params are missing the claim token
       * - controller should throw ValidationError
       * - accountTokenService.claimAccountToken must not be called
       */
      const req = {
        params: {},
        body: {
          username: "anna",
          password: "password123",
        },
      };
      const res = createRes();

      await expect(accountTokenController.claimAccountToken(req, res))
        .rejects.toBeInstanceOf(ValidationError);

      expect(mockAccountTokenService.claimAccountToken).not.toHaveBeenCalled();
    });

    test("throws ValidationError when username is too short", async () => {
      /**
       * Validation:
       * - token is present but username is shorter than the minimum length
       * - controller should throw ValidationError
       * - accountTokenService.claimAccountToken must not be called
       */
      const req = {
        params: {
          token: "rawToken",
        },
        body: {
          username: "ab",
          password: "password123",
        },
      };
      const res = createRes();

      await expect(accountTokenController.claimAccountToken(req, res))
        .rejects.toBeInstanceOf(ValidationError);

      expect(mockAccountTokenService.claimAccountToken).not.toHaveBeenCalled();
    });

    test("throws ValidationError when password is too short", async () => {
      /**
       * Validation:
       * - token is present but password is shorter than the minimum length
       * - controller should throw ValidationError
       * - accountTokenService.claimAccountToken must not be called
       */
      const req = {
        params: {
          token: "rawToken",
        },
        body: {
          username: "anna",
          password: "123",
        },
      };
      const res = createRes();

      await expect(accountTokenController.claimAccountToken(req, res))
        .rejects.toBeInstanceOf(ValidationError);

      expect(mockAccountTokenService.claimAccountToken).not.toHaveBeenCalled();
    });
  });
});