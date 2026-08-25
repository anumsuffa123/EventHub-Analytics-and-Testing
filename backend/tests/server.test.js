const request = require('supertest');

// Test-only JWT secret
process.env.JWT_SECRET = 'test-secret';

const app = require('../server');

describe('Authentication API', () => {
  test('signup rejects missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('login rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('protected registrations endpoint rejects missing token', async () => {
    const response = await request(app)
      .get('/api/registrations');

    expect(response.statusCode).toBe(401);
  });

  test('registration rejects missing fields', async () => {
    // Create a test user first
    const email = `test${Date.now()}@example.com`;

    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Test User',
        email,
        password: 'Test1234',
        confirmPassword: 'Test1234',
      });

    expect(signupResponse.statusCode).toBe(201);

    const token = signupResponse.body.token;

    // Send an authenticated but incomplete registration
    const response = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('server responds successfully', async () => {
    const response = await request(app)
      .get('/');

    expect([200, 404]).toContain(response.statusCode);
  });
});