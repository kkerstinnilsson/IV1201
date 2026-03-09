/**
 * @file authService.test.js
 * @description Unit tests for authService.
 *
 * These tests verify:
 * - register(): uniqueness validation, password hashing, transaction usage, error mapping
 * - login(): null vs DTO based on lookup + password check, error mapping
 */

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../models', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

const mockUserDAO = {
  usernameExists: jest.fn(),
  emailExists: jest.fn(),
  pnrExists: jest.fn(),
  createApplicant: jest.fn(),
  findByUsername: jest.fn(),
};

jest.mock('../../src/integration/UserDAO', () => jest.fn().mockImplementation(() => mockUserDAO));

const bcrypt = require('bcrypt');
const { sequelize } = require('../../models');
const { AppError, ValidationError } = require('../../src/business/errors/AppError');
const authService = require('../../src/business/authService');

describe('authService.register', () => {
  /** Input payload for register() */
  const input = {
    name: 'Anna',
    surname: 'Bengtsson',
    email: 'anna@bengtsson.se',
    pnr: '20000101-1234',
    username: 'anna',
    password: 'password123',
  };

  beforeEach(() => {
    /** Resets call history between tests */
    jest.clearAllMocks();

    /**
     * Default: transaction executes the callback and returns its result.
     * We pass a fake transaction object to simulate the "t" argument.
     */
    sequelize.transaction.mockImplementation(async (cb) => cb({}));

    /** Default: uniqueness checks pass. */
    mockUserDAO.usernameExists.mockResolvedValue(false);
    mockUserDAO.emailExists.mockResolvedValue(false);
    mockUserDAO.pnrExists.mockResolvedValue(false);

    /** Default: hashing and creation succeed. */
    bcrypt.hash.mockResolvedValue('$bcryptHash');
    mockUserDAO.createApplicant.mockResolvedValue({ personId: 14, username: input.username });
  });

  test('success: creates applicant and returns id+username', async () => {
    /**
     * Success:
     * - uniqueness checks are all false
     * - password is hashed
     * - applicant is created
     * - service returns a simplified DTO { id, username }
     */
    const res = await authService.register(input);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);

    // Uniqueness checks should run inside the transaction
    expect(mockUserDAO.usernameExists).toHaveBeenCalledWith(input.username, expect.anything());
    expect(mockUserDAO.emailExists).toHaveBeenCalledWith(input.email, expect.anything());
    expect(mockUserDAO.pnrExists).toHaveBeenCalledWith(input.pnr, expect.anything());

    // Service uses the configured bcrypt rounds
    expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 12);

    // Verify the DAO receives the expected payload
    expect(mockUserDAO.createApplicant).toHaveBeenCalledWith(
      {
        name: input.name,
        surname: input.surname,
        email: input.email,
        pnr: input.pnr,
        username: input.username,
        passwordHash: '$bcryptHash',
      },
      expect.anything(),
    );

    expect(res).toEqual({ id: 14, username: 'anna' });
  });

  test('fails with ValidationError when username already exists', async () => {
    /**
     * Validation:
     * - usernameExists returns true
     * - service should throw ValidationError(409)
     * - hashing and creation must not happen
     */
    mockUserDAO.usernameExists.mockResolvedValue(true);

    const err = await authService.register(input).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toMatchObject({
      message: 'Username already exists',
      statusCode: 409,
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserDAO.createApplicant).not.toHaveBeenCalled();
  });

  test('fails with ValidationError when email already exists', async () => {
    /**
     * Validation:
     * - emailExists returns true
     * - service should throw ValidationError(409)
     * - hashing and creation must not happen
     */
    mockUserDAO.emailExists.mockResolvedValue(true);

    const err = await authService.register(input).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toMatchObject({
      message: 'Email already exists',
      statusCode: 409,
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserDAO.createApplicant).not.toHaveBeenCalled();
  });

  test('fails with ValidationError when pnr already exists', async () => {
    /**
     * Validation:
     * - pnrExists returns true
     * - service should throw ValidationError(409)
     * - hashing and creation must not happen
     */
    mockUserDAO.pnrExists.mockResolvedValue(true);

    const err = await authService.register(input).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toMatchObject({
      message: 'Personal number already exists',
      statusCode: 409,
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(mockUserDAO.createApplicant).not.toHaveBeenCalled();
  });

  test('wraps unexpected errors into AppError(500)', async () => {
    /**
     * Error wrapping:
     * - DAO throws a regular Error
     * - service should wrap it into AppError(500) with message "Registration failed"
     */
    mockUserDAO.createApplicant.mockRejectedValue(new Error('DB down'));

    const err = await authService.register(input).catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      message: 'Registration failed',
      statusCode: 500,
    });
  });

  test('if transaction itself fails, we also wrap into AppError(500)', async () => {
    /**
     * Transaction failure:
     * - transaction rejects before the callback completes
     * - service should wrap into AppError(500)
     */
    sequelize.transaction.mockRejectedValue(new Error('transaction fail'));

    const err = await authService.register(input).catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      message: 'Registration failed',
      statusCode: 500,
    });
  });
});

describe('authService.login', () => {
  beforeEach(() => {
    /** Clear mock call history between login tests. */
    jest.clearAllMocks();
  });

  test('returns null when user not found', async () => {
    /**
     * Not found:
     * - DAO returns null
     * - service returns null (no bcrypt.compare call)
     */
    mockUserDAO.findByUsername.mockResolvedValue(null);

    const res = await authService.login('nope', 'pw');
    expect(res).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('returns null when password mismatch', async () => {
    /**
     * Password mismatch:
     * - user exists
     * - compare returns false
     * - service returns null
     */
    mockUserDAO.findByUsername.mockResolvedValue({
      id: 1,
      username: 'anna',
      passwordHash: '$hash',
      role: 'applicant',
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await authService.login('anna', 'wrong');
    expect(res).toBeNull();
  });

  test('success returns user DTO when password matches', async () => {
    /**
     * Success:
     * - user exists
     * - compare returns true
     * - service returns a simplified DTO
     */
    mockUserDAO.findByUsername.mockResolvedValue({
      id: 1,
      username: 'anna',
      passwordHash: '$hash',
      role: 'applicant',
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await authService.login('anna', 'password123');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$hash');
    expect(res).toEqual({ id: 1, username: 'anna', role: 'applicant' });
  });

  test('wraps unexpected errors into AppError(500)', async () => {
    /**
     * Error wrapping:
     * - DAO throws a regular Error
     * - service wraps into AppError(500) with message "Authentication failed"
     */
    mockUserDAO.findByUsername.mockRejectedValue(new Error('DB error'));

    const err = await authService.login('anna', 'pw').catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      message: 'Authentication failed',
      statusCode: 500,
    });
  });
});
