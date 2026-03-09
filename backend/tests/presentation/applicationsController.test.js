/**
 * @file applicationsController.test.js
 * @description Unit tests for applicationsController.
 *
 * These tests verify:
 * - listApplications(): delegates to service and returns 200
 * - submitApplication(): validation, service delegation, HTTP 201 response
 * - getApplicationStatus(): delegates to service using session user id
 * - deleteApplication(): delegates to service and returns 204
 * - validation errors: invalid input throws ValidationError
 */

const mockApplicationsService = {
  getAllApplications: jest.fn(),
  submitApplication: jest.fn(),
  getApplicationStatus: jest.fn(),
  deleteApplication: jest.fn(),
};

jest.mock('../../src/business/applicationsService', () => mockApplicationsService);

const {
  ValidationError,
} = require('../../src/business/errors/AppError');

const applicationsController = require('../../src/presentation/controllers/applicationsController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
}

describe('applicationsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listApplications: returns all applications with 200', async () => {
    /**
     * Success:
     * - service returns a list of applications
     * - controller should respond with HTTP 200
     * - response body should contain the returned applications
     */
    const req = {};
    const res = createRes();

    mockApplicationsService.getAllApplications.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);

    await applicationsController.listApplications(req, res);

    expect(mockApplicationsService.getAllApplications).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  describe('submitApplication', () => {
    test('success: validates input, delegates to service and returns 201', async () => {
      /**
       * Success:
       * - request body contains a non-empty expertise list and valid availability
       * - controller reads the authenticated user id from session
       * - controller delegates submission to applicationsService
       * - response should return HTTP 201 with the service result
       */
      const req = {
        body: {
          expertiseList: [{ area: 'lotteries', years: 2 }],
          availability: {
            startDate: '2026-01-01',
            endDate: '2026-02-01',
          },
        },
        session: {
          user: { id: 12 },
        },
      };
      const res = createRes();

      mockApplicationsService.submitApplication.mockResolvedValue({ success: true });

      await applicationsController.submitApplication(req, res);

      expect(mockApplicationsService.submitApplication).toHaveBeenCalledWith(
        12,
        [{ area: 'lotteries', years: 2 }],
        [{ startDate: '2026-01-01', endDate: '2026-02-01' }],
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    test('throws ValidationError(400) when expertiseList is missing/empty', async () => {
      /**
       * Validation:
       * - expertiseList is missing or empty
       * - controller should throw ValidationError(400)
       * - applicationsService.submitApplication must not be called
       */
      const req = {
        body: {
          expertiseList: [],
          availability: {
            startDate: '2026-01-01',
            endDate: '2026-02-01',
          },
        },
        session: {
          user: { id: 12 },
        },
      };
      const res = createRes();

      const err = await applicationsController.submitApplication(req, res).catch((e) => e);
      expect(err).toBeInstanceOf(ValidationError);
      expect(err).toMatchObject({
        message: 'Validation failed',
        statusCode: 400,
      });

      expect(mockApplicationsService.submitApplication).not.toHaveBeenCalled();
    });

    test('throws ValidationError(400) when availability is missing', async () => {
      /**
       * Validation:
       * - availability object is missing from the request body
       * - controller should throw ValidationError(400)
       * - applicationsService.submitApplication must not be called
       */
      const req = {
        body: {
          expertiseList: [{ area: 'lotteries', years: 2 }],
        },
        session: {
          user: { id: 12 },
        },
      };
      const res = createRes();

      await expect(applicationsController.submitApplication(req, res))
        .rejects.toMatchObject({
          message: 'Validation failed',
          statusCode: 400,
        });

      expect(mockApplicationsService.submitApplication).not.toHaveBeenCalled();
    });

    test('throws ValidationError(400) when availability date range is invalid', async () => {
      /**
       * Validation:
       * - availability is present but contains an invalid date range
       * - controller should throw ValidationError(400)
       * - applicationsService.submitApplication must not be called
       */
      const req = {
        body: {
          expertiseList: [{ area: 'lotteries', years: 2 }],
          availability: {
            startDate: '2026-02-01',
            endDate: '2026-01-01',
          },
        },
        session: {
          user: { id: 12 },
        },
      };
      const res = createRes();

      await expect(applicationsController.submitApplication(req, res))
        .rejects.toMatchObject({
          message: 'Validation failed',
          statusCode: 400,
        });

      expect(mockApplicationsService.submitApplication).not.toHaveBeenCalled();
    });
  });

  test('getApplicationStatus: uses session user id and returns 200', async () => {
    /**
     * Success:
     * - session contains an authenticated user id
     * - controller delegates to applicationsService using that user id
     * - response should return HTTP 200 with the application status
     */
    const req = {
      session: {
        user: { id: 12 },
      },
    };
    const res = createRes();

    mockApplicationsService.getApplicationStatus.mockResolvedValue({
      hasApplication: true,
    });

    await applicationsController.getApplicationStatus(req, res);

    expect(mockApplicationsService.getApplicationStatus).toHaveBeenCalledWith(12);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ hasApplication: true });
  });

  test('deleteApplication: delegates to service and returns 204', async () => {
    /**
     * Success:
     * - session contains an authenticated user id
     * - controller delegates deletion to applicationsService
     * - response should return HTTP 204 with no body
     */
    const req = {
      session: {
        user: { id: 12 },
      },
    };
    const res = createRes();

    mockApplicationsService.deleteApplication.mockResolvedValue(undefined);

    await applicationsController.deleteApplication(req, res);

    expect(mockApplicationsService.deleteApplication).toHaveBeenCalledWith(12);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledTimes(1);
  });
});
