
const UserDAO = require('../../src/integration/UserDAO');
const { Credentials, Person } = require('../../models');
const { DatabaseError, ValidationError } = require('../../src/business/errors/AppError');

jest.mock('../../models', () => ({
  Credentials: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Person: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('UserDAO', () => {
  let dao;
  const t = {};

  beforeEach(() => {
    jest.clearAllMocks();
    dao = new UserDAO();
  });


  describe('findByUsername', () => {
    it('returns mapped user with role', async () => {
      Credentials.findOne.mockResolvedValue({
        username: 'john',
        password: 'hash',
        Person: { person_id: 1, Role: { name: 'applicant' } },
      });

      const res = await dao.findByUsername('john');

      expect(res).toEqual({
        id: 1,
        username: 'john',
        passwordHash: 'hash',
        role: 'applicant',
      });
    });

    it('returns unknown role if role missing', async () => {
      Credentials.findOne.mockResolvedValue({
        username: 'john',
        password: 'hash',
        Person: { person_id: 1, Role: null },
      });

      const res = await dao.findByUsername('john');

      expect(res.role).toBe('unknown');
    });

    it('returns null if user not found', async () => {
      Credentials.findOne.mockResolvedValue(null);

      const res = await dao.findByUsername('john');

      expect(res).toBeNull();
    });

    it('returns null if person missing', async () => {
      Credentials.findOne.mockResolvedValue({
        username: 'john',
        password: 'hash',
        Person: null,
      });

      const res = await dao.findByUsername('john');

      expect(res).toBeNull();
    });

    it('queries database correctly', async () => {
      Credentials.findOne.mockResolvedValue(null);

      await dao.findByUsername('john');

      expect(Credentials.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { username: 'john' },
          attributes: ['username', 'password'],
        }),
      );
    });

    it('throws DatabaseError on DB failure', async () => {
      Credentials.findOne.mockRejectedValue(new Error());

      await expect(dao.findByUsername('john')).rejects.toThrow(DatabaseError);
    });
  });


  describe('usernameExists', () => {
    it('returns true if username exists', async () => {
      Credentials.findOne.mockResolvedValue({ credential_id: 1 });

      const res = await dao.usernameExists('john');

      expect(res).toBe(true);
    });

    it('returns false if username not found', async () => {
      Credentials.findOne.mockResolvedValue(null);

      const res = await dao.usernameExists('john');

      expect(res).toBe(false);
    });

    it('passes transaction', async () => {
      Credentials.findOne.mockResolvedValue(null);

      await dao.usernameExists('john', t);

      expect(Credentials.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: t }),
      );
    });

    it('throws DatabaseError on DB failure', async () => {
      Credentials.findOne.mockRejectedValue(new Error());

      await expect(dao.usernameExists('john')).rejects.toThrow(DatabaseError);
    });
  });


  describe('emailExists', () => {
    it('returns true if email exists', async () => {
      Person.findOne.mockResolvedValue({ person_id: 1 });

      const res = await dao.emailExists('test@test.com');

      expect(res).toBe(true);
    });

    it('returns false if email not found', async () => {
      Person.findOne.mockResolvedValue(null);

      const res = await dao.emailExists('test@test.com');

      expect(res).toBe(false);
    });

    it('passes transaction', async () => {
      Person.findOne.mockResolvedValue(null);

      await dao.emailExists('test@test.com', t);

      expect(Person.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: t }),
      );
    });

    it('throws DatabaseError on DB failure', async () => {
      Person.findOne.mockRejectedValue(new Error());

      await expect(dao.emailExists('test@test.com')).rejects.toThrow(DatabaseError);
    });
  });


  describe('pnrExists', () => {
    it('returns true if pnr exists', async () => {
      Person.findOne.mockResolvedValue({ person_id: 1 });

      const res = await dao.pnrExists('19900101-1234');

      expect(res).toBe(true);
    });

    it('returns false if pnr not found', async () => {
      Person.findOne.mockResolvedValue(null);

      const res = await dao.pnrExists('19900101-1234');

      expect(res).toBe(false);
    });

    it('passes transaction', async () => {
      Person.findOne.mockResolvedValue(null);

      await dao.pnrExists('19900101-1234', t);

      expect(Person.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: t }),
      );
    });

    it('throws DatabaseError on DB failure', async () => {
      Person.findOne.mockRejectedValue(new Error());

      await expect(dao.pnrExists('19900101-1234')).rejects.toThrow(DatabaseError);
    });
  });


  describe('createCredentialsForPerson', () => {
    it('creates credentials', async () => {
      Credentials.create.mockResolvedValue({});

      await dao.createCredentialsForPerson(1, 'john', 'hash', t);

      expect(Credentials.create).toHaveBeenCalledWith(
        { person_id: 1, username: 'john', password: 'hash' },
        { transaction: t },
      );
    });

    it('throws if transaction missing', async () => {
      await expect(
        dao.createCredentialsForPerson(1, 'john', 'hash'),
      ).rejects.toThrow();
    });

    it('wraps DB errors', async () => {
      Credentials.create.mockRejectedValue(new Error());

      await expect(
        dao.createCredentialsForPerson(1, 'john', 'hash', t),
      ).rejects.toThrow(DatabaseError);
    });
  });


  describe('createApplicant', () => {
    const validData = {
      name: 'John',
      surname: 'Doe',
      email: 'test@test.com',
      pnr: '19900101-1234',
      username: 'john',
      passwordHash: 'hash',
    };

    it('creates person and credentials', async () => {
      Person.create.mockResolvedValue({ person_id: 10 });
      Credentials.create.mockResolvedValue({});

      const res = await dao.createApplicant(validData, t);

      expect(Person.create).toHaveBeenCalledWith(
        {
          name: 'John',
          surname: 'Doe',
          email: 'test@test.com',
          pnr: '19900101-1234',
          role_id: 2,
        },
        { transaction: t },
      );

      expect(Credentials.create).toHaveBeenCalledWith(
        { person_id: 10, username: 'john', password: 'hash' },
        { transaction: t },
      );

      expect(res).toEqual({ personId: 10, username: 'john' });
    });

    it('throws if transaction missing', async () => {
      await expect(
        dao.createApplicant(validData),
      ).rejects.toThrow(ValidationError);
    });

    it('wraps DB errors', async () => {
      Person.create.mockRejectedValue(new Error());

      await expect(
        dao.createApplicant(validData, t),
      ).rejects.toThrow(DatabaseError);
    });
  });


  describe('deleteCredentialsByUsername', () => {
    it('deletes credentials', async () => {
      Credentials.destroy.mockResolvedValue(1);

      await dao.deleteCredentialsByUsername('john');

      expect(Credentials.destroy).toHaveBeenCalledWith({
        where: { username: 'john' },
      });
    });

    it('wraps DB errors', async () => {
      Credentials.destroy.mockRejectedValue(new Error());

      await expect(
        dao.deleteCredentialsByUsername('john'),
      ).rejects.toThrow(DatabaseError);
    });
  });


  describe('deleteAccountByUsername', () => {
    it('deletes credentials and person', async () => {
      Credentials.findOne.mockResolvedValue({ person_id: 5 });
      Credentials.destroy.mockResolvedValue(1);
      Person.destroy.mockResolvedValue(1);

      await dao.deleteAccountByUsername('john');

      expect(Credentials.destroy).toHaveBeenCalled();
      expect(Person.destroy).toHaveBeenCalledWith({
        where: { person_id: 5 },
      });
    });

    it('does nothing if credentials not found', async () => {
      Credentials.findOne.mockResolvedValue(null);

      await dao.deleteAccountByUsername('john');

      expect(Person.destroy).not.toHaveBeenCalled();
    });

    it('wraps DB errors', async () => {
      Credentials.findOne.mockRejectedValue(new Error());

      await expect(
        dao.deleteAccountByUsername('john'),
      ).rejects.toThrow(DatabaseError);
    });
  });
});

