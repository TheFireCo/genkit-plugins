// __tests__/checkApiKey.test.js
const { GenkitError } = require('@genkit-ai/core');
const { checkApiKey } = require('./index'); // Adjust the path as necessary
import { ERROR_INVALID_ARGUMENT, ERROR_NO_API_KEY } from '../constants';

jest.mock('@genkit-ai/core');

describe('checkApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if apiKey is not provided', () => {
    const pluginOptions = { apiKey: undefined };

    expect(() => checkApiKey(pluginOptions)).toThrow(GenkitError);
    expect(GenkitError).toHaveBeenCalledWith({
      status: ERROR_INVALID_ARGUMENT,
      message: ERROR_NO_API_KEY,
    });
  });

  it('should not throw an error if apiKey is provided', () => {
    const pluginOptions = { apiKey: 'valid-api-key' };

    expect(() => checkApiKey(pluginOptions)).not.toThrow();
  });
});
