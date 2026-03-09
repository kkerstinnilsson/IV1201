const AccountTokenDAO = require('../../src/integration/AccountTokenDAO');

const { AccountToken, Person, Credentials } = require('../../models');

const {
  validateInteger,
  validateString,
} = require('../../src/integration/utils/validateIntegration');

const {
  DatabaseError,
  ValidationError,
} = require('../../src/business/errors/AppError');

jest.mock('../../models');
jest.mock('../../src/integration/utils/validateIntegration');

describe('AccountTokenDAO', () => {
  let dao;
  const t = { LOCK: { UPDATE: 'UPDATE' } };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    dao = new AccountTokenDAO();

    validateInteger.mockReturnValue(true);
    validateString.mockReturnValue(true);
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('findApplicantByEmail', () => {
    it('returns applicant', async () => {
      const mockPerson = { person_id: 1, email: 'test@test.com' };

      Person.findOne.mockResolvedValue(mockPerson);

      const res = await dao.findApplicantByEmail('test@test.com');

      expect(Person.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com', role_id: 2 },
        attributes: ['person_id', 'email'],
        transaction: undefined,
      });

      expect(res).toEqual(mockPerson);
    });

    it('passes transaction if provided', async () => {
      Person.findOne.mockResolvedValue(null);

      await dao.findApplicantByEmail('test@test.com', t);

      expect(Person.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: t }),
      );
    });

    it('throws ValidationError for invalid email', async () => {
      validateString.mockReturnValue(false);

      await expect(dao.findApplicantByEmail('')).rejects.toThrow(ValidationError);
    });

    it('wraps DB errors', async () => {
      Person.findOne.mockRejectedValue(new Error('db'));

      await expect(dao.findApplicantByEmail('test@test.com'))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('personHasCredentials', () => {
    it('returns true if credentials exist', async () => {
      Credentials.findOne.mockResolvedValue({ credential_id: 1 });

      const res = await dao.personHasCredentials(1);

      expect(Credentials.findOne).toHaveBeenCalledWith({
        where: { person_id: 1 },
        attributes: ['credential_id'],
        transaction: undefined,
      });

      expect(res).toBe(true);
    });

    it('returns false if credentials not found', async () => {
      Credentials.findOne.mockResolvedValue(null);

      const res = await dao.personHasCredentials(1);

      expect(res).toBe(false);
    });

    it('throws ValidationError for invalid personId', async () => {
      validateInteger.mockReturnValue(false);

      await expect(dao.personHasCredentials('bad'))
        .rejects.toThrow(ValidationError);
    });

    it('wraps DB errors', async () => {
      Credentials.findOne.mockRejectedValue(new Error());

      await expect(dao.personHasCredentials(1))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('upsertAccountToken', () => {
    it('upserts token', async () => {
      const expires = new Date();

      AccountToken.upsert.mockResolvedValue();

      await dao.upsertAccountToken(1, 'hash', expires, t);

      expect(AccountToken.upsert).toHaveBeenCalledWith(
        {
          person_id: 1,
          token_hash: 'hash',
          expires_at: expires,
          used_at: null,
        },
        { transaction: t },
      );
    });

    it('throws ValidationError for invalid personId', async () => {
      validateInteger.mockReturnValue(false);

      await expect(
        dao.upsertAccountToken('bad', 'hash', new Date(), t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError for invalid tokenHash', async () => {
      validateString.mockReturnValue(false);

      await expect(
        dao.upsertAccountToken(1, '', new Date(), t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(
        dao.upsertAccountToken(1, 'hash', new Date()),
      ).rejects.toThrow('Transaction is required for upsertAccountToken');
    });

    it('wraps DB errors', async () => {
      AccountToken.upsert.mockRejectedValue(new Error());

      await expect(
        dao.upsertAccountToken(1, 'hash', new Date(), t),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('findValidTokenByHash', () => {
    it('returns token if valid', async () => {
      const mockToken = { account_token_id: 1 };

      AccountToken.findOne.mockResolvedValue(mockToken);

      const res = await dao.findValidTokenByHash('hash', t);

      expect(AccountToken.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            token_hash: 'hash',
            used_at: null,
          }),
          transaction: t,
          lock: t.LOCK.UPDATE,
        }),
      );

      expect(res).toEqual(mockToken);
    });

    it('throws ValidationError for invalid tokenHash', async () => {
      validateString.mockReturnValue(false);

      await expect(
        dao.findValidTokenByHash('', t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(
        dao.findValidTokenByHash('hash'),
      ).rejects.toThrow('Transaction is required for findValidTokenByHash');
    });

    it('wraps DB errors', async () => {
      AccountToken.findOne.mockRejectedValue(new Error());

      await expect(
        dao.findValidTokenByHash('hash', t),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('markTokenUsed', () => {
    it('updates token as used', async () => {
      AccountToken.update.mockResolvedValue();

      await dao.markTokenUsed(1, t);

      expect(AccountToken.update).toHaveBeenCalledWith(
        { used_at: expect.any(Date) },
        {
          where: { account_token_id: 1, used_at: null },
          transaction: t,
        },
      );
    });

    it('throws ValidationError for invalid token id', async () => {
      validateInteger.mockReturnValue(false);

      await expect(
        dao.markTokenUsed('bad', t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(
        dao.markTokenUsed(1),
      ).rejects.toThrow('Transaction is required for markTokenUsed');
    });

    it('wraps DB errors', async () => {
      AccountToken.update.mockRejectedValue(new Error());

      await expect(
        dao.markTokenUsed(1, t),
      ).rejects.toThrow(DatabaseError);
    });
  });
});
