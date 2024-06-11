import { describe } from '@jest/globals';
import z from 'zod';
import { defineTool } from '@genkit-ai/ai';
import { ToolDefinition } from '@genkit-ai/ai/model';
import { toToolDefinition } from '@genkit-ai/ai/tool';
import { toCohereTool, jsonSchemaToPythonType } from './command';

describe('jsonSchemaToPythonType', () => {
  const testCases: {
    jsonSchema: Record<string, any>;
    expectedPythonType: string;
  }[] = [
    {
      jsonSchema: { type: 'string' },
      expectedPythonType: 'str',
    },
    {
      jsonSchema: { type: 'number' },
      expectedPythonType: 'float',
    },
    {
      jsonSchema: { type: 'integer' },
      expectedPythonType: 'int',
    },
    {
      jsonSchema: { type: 'boolean' },
      expectedPythonType: 'bool',
    },
    {
      jsonSchema: { type: 'array' },
      expectedPythonType: 'List',
    },
    {
      jsonSchema: { type: 'object' },
      expectedPythonType: 'Dict',
    },
    {
      jsonSchema: { type: 'null' },
      expectedPythonType: 'None',
    },
  ];

  for (const test of testCases) {
    it(`should convert JSON schema type "${test.jsonSchema.type}" to Python type "${test.expectedPythonType}"`, () => {
      expect(jsonSchemaToPythonType(test.jsonSchema)).toBe(
        test.expectedPythonType
      );
    });
  }

  it('should throw an error if the JSON schema type is not supported', () => {
    expect(() => jsonSchemaToPythonType({ type: 'unsupported' })).toThrow(
      'Unsupported JSON schema type: {"type":"unsupported"}'
    );
  });
});

describe('toCohereTool', () => {
  const testCases: {
    tool: ToolDefinition;
  }[] = [
    {
      tool: toToolDefinition(
        defineTool(
          {
            name: 'getStockPrice',
            description: 'Get the price for the given stock ticker.',
            inputSchema: z.object({
              symbol: z.string(),
              timestamp: z.number().int().optional(),
            }),
            outputSchema: z.number(),
          },
          async () => 123
        )
      ),
    },
  ];

  for (const test of testCases) {
    it(`should convert tool "${test.tool.name}" to Cohere Python tool`, () => {
      expect(toCohereTool(test.tool)).toStrictEqual({
        name: 'getStockPrice',
        description: 'Get the price for the given stock ticker.',
        parameterDefinitions: {
          symbol: {
            type: 'str',
            required: true,
          },
          timestamp: {
            type: 'int',
            required: false,
          },
        },
      });
    });
  }
});
