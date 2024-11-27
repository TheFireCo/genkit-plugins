import { EmbedderArgument } from '@genkit-ai/ai/embedder';
import { CommonRetrieverOptionsSchema,} from '@genkit-ai/ai/retriever';
import { GenkitPlugin, genkitPlugin } from 'genkit/plugin';
import { Genkit, z, Document, indexerRef, retrieverRef } from 'genkit';
import {
  MilvusClient,
  ClientConfig as MilvusClientParams,
  RowData,
} from '@zilliz/milvus2-sdk-node';

export const DocumentSchema = z.object({
  id: z.number(),
  vector: z.array(z.number()),
  metadata: z.record(z.string(), z.any()).optional(),
});

const MilvusRetrieverOptionsSchema = CommonRetrieverOptionsSchema.extend({
  k: z.number().max(1000).default(10),
  filter: z.record(z.string(), z.any()).optional(),
  limit: z.number().optional(),
});

const MilvusIndexerOptionsSchema = z.null().optional();

interface MilvusPluginOptions<
  EmbedderCustomOptions extends z.ZodTypeAny = z.ZodTypeAny,
> {
  collectionName: string;
  dbName?: string;
  clientParams?: MilvusClientParams;
  embedder: EmbedderArgument<EmbedderCustomOptions>;
  embedderOptions?: z.infer<EmbedderCustomOptions>;
}

/**
 * Milvus plugin that provides a milvus retriever and indexer.
 */
export function milvus<EmbedderCustomOptions extends z.ZodTypeAny>(
  params: MilvusPluginOptions<EmbedderCustomOptions>[]
): GenkitPlugin {
  return genkitPlugin('milvus', async (ai: Genkit) => {
    params.map((i) => milvusRetriever(ai, i));
    params.map((i) => milvusIndexer(ai, i));
  });
}

export default milvus;

export const milvusRetrieverRef = (params: {
  collectionName: string;
  displayName?: string;
}) => {
  return retrieverRef({
    name: `milvus/${params.collectionName}`,
    info: {
      label: params.displayName ?? `Milvus - ${params.collectionName}`,
    },
    configSchema: MilvusRetrieverOptionsSchema.optional(),
  });
};

export const milvusIndexerRef = (params: {
  collectionName: string;
  displayName?: string;
}) => {
  return indexerRef({
    name: `milvus/${params.collectionName}`,
    info: {
      label: params.displayName ?? `Milvus - ${params.collectionName}`,
    },
    configSchema: MilvusIndexerOptionsSchema.optional(),
  });
};

/**
 * Configures a Milvus vector store retriever.
 */
export function milvusRetriever<EmbedderCustomOptions extends z.ZodTypeAny>(
  ai: Genkit,
  params: MilvusPluginOptions<EmbedderCustomOptions>
) {
  const { collectionName, embedder, embedderOptions, dbName } = params;
  const milvusConfig = params.clientParams ?? getDefaultConfig();

  return ai.defineRetriever(
    {
      name: `milvus/${collectionName}`,
      configSchema: MilvusRetrieverOptionsSchema,
    },
    async (content, options) => {
      const queryEmbeddings = await ai.embed({
        embedder,
        content,
        options: embedderOptions,
      });

      const isCollectionExists = await hasMilvusCollection({
        collectionName,
        dbName,
        clientParams: milvusConfig,
      });
      if (!isCollectionExists) {
        await createMilvusCollection({
          dbName,
          collectionName,
          dimension: queryEmbeddings.length,
          clientParams: milvusConfig,
        });
      }

      const response = await searchMilvusData({
        collectionName,
        dbName,
        query: queryEmbeddings,
        limit: options.limit,
        filter: JSON.stringify(options.filter),
        topk: options.k,
        clientParams: milvusConfig,
      });

      return {
        documents: response.results
          .map((result) => result['$meta'])
          .filter(
            (m): m is { document: string; metadata: Record<string, any> } => !!m
          )
          .map((m) => {
            return Document.fromText(m.document, m.metadata).toJSON();
          }),
      };
    }
  );
}

/**
 * Configures a Milvus vector store indexer.
 */
export function milvusIndexer<EmbedderCustomOptions extends z.ZodTypeAny>(
  ai: Genkit,
  params: MilvusPluginOptions<EmbedderCustomOptions>
) {
  const { collectionName, embedder, embedderOptions, dbName } = params;
  const milvusConfig = params.clientParams ?? getDefaultConfig();

  return ai.defineIndexer(
    {
      name: `milvus/${collectionName}`,
      configSchema: MilvusIndexerOptionsSchema.optional(),
    },
    async (docs) => {
      const embeddings = await Promise.all(
        docs.map((doc) =>
          ai.embed({
            embedder,
            content: doc,
            options: embedderOptions,
          })
        )
      );

      const entries = embeddings.map((value, i) => {
        const metadata: RowData = {
          ...docs[i].metadata,
        };

        return {
          vector: value,
          document: docs[i].text,
          metadata,
        };
      });

      const isCollectionExists = await hasMilvusCollection({
        collectionName,
        dbName,
        clientParams: milvusConfig,
      });
      if (!isCollectionExists) {
        await createMilvusCollection({
          dbName,
          collectionName,
          dimension: embeddings[0].length,
          clientParams: milvusConfig,
        });
      }

      await insertMilvusData({
        collectionName: collectionName,
        dbName,
        entries,
        clientParams: milvusConfig,
      });
    }
  );
}

export async function createMilvusCollection(params: {
  collectionName: string;
  dimension: number;
  dbName?: string;
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dimension, dbName } = params;
  const milvus = getMilvusInstance(clientParams);

  return milvus.createCollection({
    collection_name: collectionName,
    db_name: dbName,
    dimension,
    auto_id: true,
    enable_dynamic_field: true,
  });
}

export async function describeMilvusCollection(params: {
  collectionName: string;
  dbName?: string;
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dbName } = params;
  const milvus = getMilvusInstance(clientParams);

  return await milvus.describeCollection({
    collection_name: collectionName,
    db_name: dbName,
  });
}

export async function insertMilvusData(params: {
  collectionName: string;
  dbName?: string;
  entries: RowData[];
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dbName, entries } = params;
  const milvus = getMilvusInstance(clientParams);

  return milvus.insert({
    collection_name: collectionName,
    db_name: dbName,
    fields_data: entries,
  });
}

export async function searchMilvusData(params: {
  collectionName: string;
  dbName?: string;
  query: number[];
  limit?: number;
  filter?: string;
  topk?: number;
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dbName, query, ...restParams } = params;
  const milvus = getMilvusInstance(clientParams);

  return milvus.search({
    collection_name: collectionName,
    db_name: dbName,
    data: query,
    ...restParams,
  });
}

export async function deleteMilvusCollection(params: {
  collectionName: string;
  dbName?: string;
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dbName } = params;
  const milvus = getMilvusInstance(clientParams);

  try {
    return await milvus.dropCollection({
      collection_name: collectionName,
      db_name: dbName,
    });
  } catch (error) {
    console.error('Failed to delete Milvus collection:', error);
    throw error;
  }
}

export async function hasMilvusCollection(params: {
  collectionName: string;
  dbName?: string;
  clientParams?: MilvusClientParams;
}) {
  const { clientParams, collectionName, dbName } = params;
  const milvus = getMilvusInstance(clientParams);

  const response = await milvus.hasCollection({
    collection_name: collectionName,
    db_name: dbName,
  });

  return response.value;
}

function getMilvusInstance(clientParams?: MilvusClientParams) {
  const milvusConfig = clientParams ?? getDefaultConfig();
  return new MilvusClient(milvusConfig);
}

function getDefaultConfig(): MilvusClientParams {
  const configOrAddress = process.env.MILVUS_URI ?? 'http://localhost:19530';

  return {
    address: configOrAddress,
    token: '', // Default token is an empty string
    username: '', // Default username is an empty string
    password: '', // Default password is an empty string
  };
}
