const request = require('supertest');
const { app, logger, FeatureFlagClient } = require('../src/app');

jest.mock('../src/utils/featureFlagClient');
jest.mock('../src/routes/userRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../src/routes/roleRoutes', () => jest.fn((req, res, next) => next()));

describe('Express App', () => {
    beforeEach(() => {
        logger.info = jest.fn();
        logger.error = jest.fn();
        FeatureFlagClient.init = jest.fn().mockResolvedValue();
    });

    it('should log the URI of each request', async () => {
        await request(app)
            .get('/health-check')
        expect(logger.info).toHaveBeenCalledWith('uri : /health-check');
    });

    it('should respond for /health-check route', async () => {
        const response = await request(app)
            .get('/health-check')
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('app is up and running at port 4000');
    });

});
