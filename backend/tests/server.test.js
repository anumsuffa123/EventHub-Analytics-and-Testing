//test 1. signup test//
const request = require('supertest');
const app = require('../server');

describe('Authentication API', () => {
  test('signup rejects missing required fields', async () => {
    const response = await request(app)
      .post('/api/signup')
      .send({});

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });
});
//login failure test//
test('login rejects invalid credentials', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({
      email: 'invalid@example.com',
      password: 'wrongpassword',
    });

  expect(response.statusCode).toBeGreaterThanOrEqual(400);
});
//Test 3: Protected endpoint without token//
describe('Registration API', () => {
  test('rejects unauthenticated registration request', async () => {
    const response = await request(app)
      .get('/api/registrations');

    expect(response.statusCode).toBe(401);
  });
});
// Backend Test 4: Invalid registration data//
test('rejects registration with missing fields', async () => {
  const response = await request(app)
    .post('/api/registrations')
    .send({});

  expect(response.statusCode).toBeGreaterThanOrEqual(400);
});
//Backend Test 5: Health/root endpoint//
describe('Server API', () => {
  test('server responds successfully', async () => {
    const response = await request(app)
      .get('/');

    expect([200, 404]).toContain(response.statusCode);
  });
});


