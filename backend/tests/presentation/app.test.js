const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../models/index.js'); // Mock the database models to prevent actual DB calls during tests

/**
 * Test for basic health endpoint to ensure the server is running and responding correctly.
 */
describe('GET /', () => {
  it('should return 200 and hello message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello backend');
  });
});
