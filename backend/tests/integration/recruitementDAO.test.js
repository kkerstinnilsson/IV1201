const RecruitementDAO = require('../../src/integration/RecruitementDAO');

const {
  Application,
  Availability,
  Competence,
  CompetenceProfile,
} = require('../../models');

const {
  validateInteger,
  validateDecimal,
  validateString,
  validateDateStr,
} = require('../../src/integration/utils/validateIntegration');

const {
  DatabaseError,
  ValidationError,
} = require('../../src/business/errors/AppError');

jest.mock('../../models');
jest.mock('../../src/integration/utils/validateIntegration');

describe('RecruitementDAO', () => {
  let dao;
  const t = {};

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    dao = new RecruitementDAO();

    validateInteger.mockReturnValue(true);
    validateDecimal.mockReturnValue(true);
    validateString.mockReturnValue(true);
    validateDateStr.mockReturnValue(true);
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('getAllApplicants', () => {
    it('returns mapped applicants', async () => {
      Application.findAll.mockResolvedValue([
        { status: 'submitted', Person: { person_id: 1, name: 'John', surname: 'Doe' } },
        { status: 'accepted', Person: { person_id: 2, name: 'Jane', surname: 'Smith' } },
      ]);

      const result = await dao.getAllApplicants();

      expect(result).toEqual([
        {
          id: 1, firstName: 'John', lastName: 'Doe', status: 'submitted',
        },
        {
          id: 2, firstName: 'Jane', lastName: 'Smith', status: 'accepted',
        },
      ]);

      expect(Application.findAll).toHaveBeenCalledWith(expect.objectContaining({
        attributes: ['status'],
        include: expect.any(Array),
        transaction: undefined,
      }));
    });

    it('passes transaction when provided', async () => {
      Application.findAll.mockResolvedValue([]);

      await dao.getAllApplicants(t);

      expect(Application.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: t }),
      );
    });

    it('throws DatabaseError on DB failure', async () => {
      Application.findAll.mockRejectedValue(new Error('db fail'));

      await expect(dao.getAllApplicants()).rejects.toThrow(DatabaseError);
    });
  });

  describe('createApplication', () => {
    it('creates application', async () => {
      Application.create.mockResolvedValue({ application_id: 1 });

      const res = await dao.createApplication(1, t);

      expect(Application.create).toHaveBeenCalledWith(
        { person_id: 1 },
        { transaction: t },
      );

      expect(res).toEqual({ application_id: 1 });
    });

    it('throws ValidationError for bad id', async () => {
      validateInteger.mockReturnValue(false);

      await expect(dao.createApplication('x', t)).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(dao.createApplication(1)).rejects.toThrow(
        'A transaction is required to create an application row!',
      );
    });

    it('wraps DB errors', async () => {
      Application.create.mockRejectedValue(new Error('db'));

      await expect(dao.createApplication(1, t)).rejects.toThrow(DatabaseError);
    });
  });

  describe('createAvailability', () => {
    it('creates availability', async () => {
      Availability.create.mockResolvedValue({ availability_id: 1 });

      await dao.createAvailability(
        1,
        { startDate: '2025-01-01', endDate: '2025-02-01' },
        t,
      );

      expect(Availability.create).toHaveBeenCalledWith(
        {
          person_id: 1,
          from_date: '2025-01-01',
          to_date: '2025-02-01',
        },
        { transaction: t },
      );
    });

    it('throws ValidationError for invalid start date', async () => {
      validateDateStr.mockReturnValue(false);

      await expect(
        dao.createAvailability(1, { startDate: 'bad', endDate: '2025-02-01' }, t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(
        dao.createAvailability(1, { startDate: '2025-01-01', endDate: '2025-02-01' }),
      ).rejects.toThrow(
        'A transaction is required to create availability records!',
      );
    });

    it('wraps DB errors', async () => {
      Availability.create.mockRejectedValue(new Error('db'));

      await expect(
        dao.createAvailability(1, { startDate: '2025-01-01', endDate: '2025-02-01' }, t),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('createCompetenceProfile', () => {
    it('creates competence profile', async () => {
      CompetenceProfile.create.mockResolvedValue({ competence_profile_id: 1 });

      await dao.createCompetenceProfile(1, 2, 3.5, t);

      expect(CompetenceProfile.create).toHaveBeenCalledWith(
        {
          person_id: 1,
          competence_id: 2,
          years_of_experience: 3.5,
        },
        { transaction: t },
      );
    });

    it('throws ValidationError for invalid competenceId', async () => {
      validateInteger
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(
        dao.createCompetenceProfile(1, 'bad', 3, t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws ValidationError for invalid years', async () => {
      validateDecimal.mockReturnValue(false);

      await expect(
        dao.createCompetenceProfile(1, 2, 'bad', t),
      ).rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(
        dao.createCompetenceProfile(1, 2, 3),
      ).rejects.toThrow(
        'A transaction is required to create a competence profile!',
      );
    });

    it('wraps DB errors', async () => {
      CompetenceProfile.create.mockRejectedValue(new Error());

      await expect(
        dao.createCompetenceProfile(1, 2, 3, t),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('getCompetenceIdByName', () => {
    it('returns id if found', async () => {
      Competence.findOne.mockResolvedValue({ competence_id: 5 });

      const res = await dao.getCompetenceIdByName('Java');

      expect(res).toBe(5);
    });

    it('returns null if not found', async () => {
      Competence.findOne.mockResolvedValue(null);

      const res = await dao.getCompetenceIdByName('Unknown');

      expect(res).toBeNull();
    });

    it('throws ValidationError for invalid name', async () => {
      validateString.mockReturnValue(false);

      await expect(dao.getCompetenceIdByName(123))
        .rejects.toThrow(ValidationError);
    });

    it('wraps DB errors', async () => {
      Competence.findOne.mockRejectedValue(new Error());

      await expect(dao.getCompetenceIdByName('Java'))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('hasApplication', () => {
    it('returns true if application exists', async () => {
      Application.findOne.mockResolvedValue({ application_id: 1 });

      const res = await dao.hasApplication(1);

      expect(res).toBe(true);
    });

    it('returns true if availability exists', async () => {
      Application.findOne.mockResolvedValue(null);
      Availability.findOne.mockResolvedValue({ availability_id: 1 });

      const res = await dao.hasApplication(1);

      expect(res).toBe(true);
    });

    it('returns true if competence profile exists', async () => {
      Application.findOne.mockResolvedValue(null);
      Availability.findOne.mockResolvedValue(null);
      CompetenceProfile.findOne.mockResolvedValue({ competence_profile_id: 1 });

      const res = await dao.hasApplication(1);

      expect(res).toBe(true);
    });

    it('returns false if nothing exists', async () => {
      Application.findOne.mockResolvedValue(null);
      Availability.findOne.mockResolvedValue(null);
      CompetenceProfile.findOne.mockResolvedValue(null);

      const res = await dao.hasApplication(1);

      expect(res).toBe(false);
    });

    it('wraps DB errors', async () => {
      Application.findOne.mockRejectedValue(new Error());

      await expect(dao.hasApplication(1))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteApplication', () => {
    it('deletes application data', async () => {
      CompetenceProfile.destroy.mockResolvedValue();
      Availability.destroy.mockResolvedValue();
      Application.destroy.mockResolvedValue(1);

      const res = await dao.deleteApplication(1, t);

      expect(CompetenceProfile.destroy).toHaveBeenCalledWith({
        where: { person_id: 1 },
        transaction: t,
      });

      expect(Availability.destroy).toHaveBeenCalledWith({
        where: { person_id: 1 },
        transaction: t,
      });

      expect(Application.destroy).toHaveBeenCalledWith({
        where: { person_id: 1 },
        transaction: t,
      });

      expect(res).toBe(1);
    });

    it('throws ValidationError for bad id', async () => {
      validateInteger.mockReturnValue(false);

      await expect(dao.deleteApplication('bad', t))
        .rejects.toThrow(ValidationError);
    });

    it('throws error if transaction missing', async () => {
      await expect(dao.deleteApplication(1))
        .rejects.toThrow('A transaction is required to delete an application!');
    });

    it('wraps DB errors', async () => {
      CompetenceProfile.destroy.mockRejectedValue(new Error());

      await expect(dao.deleteApplication(1, t))
        .rejects.toThrow(DatabaseError);
    });
  });
});
