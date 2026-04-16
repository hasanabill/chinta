const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, server } = require('../server');

test('GET / returns server health text', async () => {
    const response = await request(app).get('/');
    assert.equal(response.status, 200);
    assert.equal(response.text, 'Server is running');
});

test('POST /api/follow/:id requires auth token', async () => {
    const response = await request(app).post('/api/follow/64d15f5b5f17a4ef0f0f1111');
    assert.equal(response.status, 401);
});

test('GET /api/follow/:id/followers validates malformed user id', async () => {
    const response = await request(app).get('/api/follow/not-a-valid-object-id/followers');
    assert.equal(response.status, 400);
});

test('POST /api/messages/conversations/:id requires auth token', async () => {
    const response = await request(app).post('/api/messages/conversations/64d15f5b5f17a4ef0f0f1111');
    assert.equal(response.status, 401);
});

test('GET /api/posts/:id validates malformed object id', async () => {
    const response = await request(app).get('/api/posts/not-a-valid-object-id');
    assert.equal(response.status, 400);
});

test.after(() => {
    if (server.listening) {
        server.close();
    }
});
