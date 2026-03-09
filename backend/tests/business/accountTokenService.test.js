/**
 * @file accountTokenService.test.js
 * @description Unit tests for accountTokenService.
 *
 * These tests verify:
 * - requestAccountToken(): token generation, email not found, already has credentials
 * - claimAccountToken(): credential creation, invalid token, username conflict
 */

jest.mock('bcrypt', () => ({ hash: jest.fn() }));
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'tokenHash'),
  })),
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'rawToken') })),
}));

jest.mock('../../models', () => ({
  sequelize: { transaction: jest.fn() },
}));

const mockAccountTokenDAO = {
  findApplicantByEmail: jest.fn(),
  personHasCredentials: jest.fn(),
  upsertAccountToken: jest.fn(),
  findValidTokenByHash: jest.fn(),
  markTokenUsed: jest.fn(),
};

const mockUserDAO = {
  usernameExists: jest.fn(),
  createCredentialsForPerson: jest.fn(),
};

jest.mock('../../src/integration/AccountTokenDAO', () => jest.fn().mockImplementation(() => mockAccountTokenDAO));
jest.mock('../../src/integration/UserDAO', () => jest.fn().mockImplementation(() => mockUserDAO));

const bcrypt = require('bcrypt');
const { sequelize } = require('../../models');
const { AppError, ValidationError, NotFoundError } = require('../../src/business/errors/AppError');
const accountTokenService = require('../../src/business/accountTokenService');

describe('accountTokenService', () => {
  beforeEach(() => {
    /** Resets call history between tests */
    jest.clearAllMocks();

    /**
     * Default: transaction executes the callback and returns its result.
     * We pass a fake transaction object to simulate the "t" argument.
     */
    sequelize.transaction.mockImplementation(async (cb) => cb({}));

    /** Set a predictable frontend URL for link */
    process.env.FRONTEND_URL = 'http://test.com';
  });

  describe('requestAccountToken', () => {
    test('success: generates token, stores hash and returns link', async () => {
      /**
       * Success:
       * - person is found by email and has no existing credentials
       * - token hash is stored with an expiry date
       * - service returns the claim link and email
       */
      mockAccountTokenDAO.findApplicantByEmail.mockResolvedValue({ person_id: 12, email: 'user@test.se' });
      mockAccountTokenDAO.personHasCredentials.mockResolvedValue(false);

      const res = await accountTokenService.requestAccountToken('user@test.se');

      expect(mockAccountTokenDAO.upsertAccountToken).toHaveBeenCalledWith(
        12,
        'tokenHash',
        expect.any(Date),
        expect.anything(),
      );
      expect(res).toMatchObject({
        email: 'user@test.se',
        link: 'http://test.com/claim/rawToken',
      });
    });

    test('throws NotFoundError when email not found', async () => {
      /**
       * Not found:
       * - DAO returns null for the given email
       * - service should throw NotFoundError before generating any token
       */
      mockAccountTokenDAO.findApplicantByEmail.mockResolvedValue(null);

      await expect(accountTokenService.requestAccountToken('nope@nope.se'))
        .rejects.toBeInstanceOf(NotFoundError);
    });

    test('throws AppError(409) when person already has credentials', async () => {
      /**
       * Conflict:
       * - person exists but already has credentials
       * - service should throw AppError(409) before generating any token
       */
      mockAccountTokenDAO.findApplicantByEmail.mockResolvedValue({ person_id: 12, email: 'user@test.se' });
      mockAccountTokenDAO.personHasCredentials.mockResolvedValue(true);

      const err = await accountTokenService.requestAccountToken('user@test.se').catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ statusCode: 409 });
    });

    test('wraps unexpected error into AppError(500)', async () => {
      /**
       * Error wrapping:
       * - DAO throws a regular Error while looking up the applicant
       * - service should wrap it into AppError(500)
       */
      mockAccountTokenDAO.findApplicantByEmail.mockRejectedValue(new Error('db down'));

      await expect(accountTokenService.requestAccountToken('user@test.se'))
        .rejects.toMatchObject({
          message: 'Failed to request account token',
          statusCode: 500,
        });
    });
  });

  describe('claimAccountToken', () => {
    test('success: creates credentials and marks token used', async () => {
      /**
       * Success:
       * - token is valid and not yet used
       * - username is available and person has no existing credentials
       * - password is hashed with configured bcrypt rounds
       * - credentials are created and token is marked as used
       * - service returns { id, username }
       */
      mockAccountTokenDAO.findValidTokenByHash.mockResolvedValue({
        account_token_id: 5,
        person_id: 12,
      });
      mockUserDAO.usernameExists.mockResolvedValue(false);
      mockAccountTokenDAO.personHasCredentials.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue('$hash');

      const res = await accountTokenService.claimAccountToken('rawToken', 'anna', 'pw');
      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 12);

      expect(mockUserDAO.createCredentialsForPerson).toHaveBeenCalledWith(
        12,
        'anna',
        '$hash',
        expect.anything(),
      );
      expect(mockAccountTokenDAO.markTokenUsed).toHaveBeenCalledWith(5, expect.anything());
      expect(res).toEqual({ id: 12, username: 'anna' });
    });

    test('throws ValidationError when token invalid/expired', async () => {
      /**
       * Validation:
       * - DAO returns null meaning the token does not exist or has expired
       * - service should throw ValidationError before any further checks
       */
      mockAccountTokenDAO.findValidTokenByHash.mockResolvedValue(null);

      await expect(accountTokenService.claimAccountToken('bad', 'anna', 'pw'))
        .rejects.toBeInstanceOf(ValidationError);
    });

    test('throws AppError(409) when username exists', async () => {
      /**
       * Conflict:
       * - token is valid
       * - username is already taken
       * - service should throw AppError(409) before creating credentials
       */
      mockAccountTokenDAO.findValidTokenByHash.mockResolvedValue({ 
        account_token_id: 5, 
        person_id: 12 });
      mockUserDAO.usernameExists.mockResolvedValue(true);

      await expect(accountTokenService.claimAccountToken('rawToken', 'taken', 'pw'))
        .rejects.toMatchObject({ statusCode: 409 });
    });

    test('throws AppError(409) when person already has credentials', async () => {
      /**
       * Conflict:
       * - token is valid and username is available
       * - person already has credentials (race condition guard)
       * - service should throw AppError(409) before creating credentials
       */
      mockAccountTokenDAO.findValidTokenByHash.mockResolvedValue({ 
        account_token_id: 5, 
        person_id: 12 });
      mockUserDAO.usernameExists.mockResolvedValue(false);
      mockAccountTokenDAO.personHasCredentials.mockResolvedValue(true);

      await expect(accountTokenService.claimAccountToken('rawToken', 'anna', 'pw'))
        .rejects.toMatchObject({ statusCode: 409 });
    });

    test('wraps unexpected error into AppError(500)', async () => {
      /**
       * Error wrapping:
       * - DAO throws a regular Error while validating the token
       * - service should wrap it into AppError(500)
       */
      mockAccountTokenDAO.findValidTokenByHash.mockRejectedValue(new Error('db down'));

      await expect(accountTokenService.claimAccountToken('rawToken', 'anna', 'pw'))
        .rejects.toMatchObject({
          message: 'Failed to claim account token',
          statusCode: 500,
        });
    });
  });
});
