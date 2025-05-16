import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../lib/logger';

// Read the Mastra service BASE URL from environment variables
const MASTRA_SERVICE_BASE_URL = process.env.MASTRA_SERVICE_BASE_URL;
const MASTRA_WORKFLOW_PATH =
  '/api/workflows/lootGenerationWorkflow/start-async';

type LootItem = { coins?: string; item?: string; note?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LootItem[] | { error: string }>,
) {
  if (!MASTRA_SERVICE_BASE_URL) {
    logger.error('[generate-loot] MASTRA_SERVICE_BASE_URL is not defined');

    return res.status(500).json({
      error: 'Server configuration error: Mastra service base URL not set.',
    });
  }

  const fullMastraUrl = `${MASTRA_SERVICE_BASE_URL.replace(/\/$/, '')}${MASTRA_WORKFLOW_PATH}`;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { partyLevel, srdItemCount, randomItemCount, context } = req.body;
  logger.info('[generate-loot] Incoming request:', {
    partyLevel,
    srdItemCount,
    randomItemCount,
    context,
  });

  if (typeof partyLevel !== 'number' || partyLevel < 1 || partyLevel > 20) {
    logger.warn('[generate-loot] Invalid partyLevel:', partyLevel);

    return res.status(400).json({
      error: 'Invalid partyLevel: must be a number between 1 and 20.',
    });
  }
  if (
    typeof srdItemCount !== 'number' ||
    srdItemCount < 1 ||
    srdItemCount > 10
  ) {
    logger.warn('[generate-loot] Invalid srdItemCount:', srdItemCount);

    return res.status(400).json({
      error: 'Invalid srdItemCount: must be a number between 1 and 10.',
    });
  }
  if (
    randomItemCount !== undefined &&
    (typeof randomItemCount !== 'number' ||
      randomItemCount < 0 ||
      randomItemCount > 10)
  ) {
    logger.warn('[generate-loot] Invalid randomItemCount:', randomItemCount);

    return res.status(400).json({
      error:
        'Invalid randomItemCount: must be a number between 0 and 10 if provided.',
    });
  }
  if (context && typeof context !== 'string') {
    logger.warn('[generate-loot] Invalid context:', context);

    return res
      .status(400)
      .json({ error: 'Invalid context: must be a string.' });
  }

  // Build request body for workflow trigger
  const requestBody = {
    partyLevel,
    srdItemCount,
    randomItemCount,
    context: context || undefined,
  };

  logger.info('[generate-loot] Sending request to Mastra:', {
    url: fullMastraUrl,
    body: requestBody,
  });

  try {
    const mastraResponse = await fetch(fullMastraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await mastraResponse.clone().text();
    logger.info('[generate-loot] Raw response from Mastra:', responseText);

    if (!mastraResponse.ok) {
      throw new Error(
        `Mastra service error: ${mastraResponse.status} - ${responseText || mastraResponse.statusText}`,
      );
    }

    const lootData = JSON.parse(responseText);
    let lootArray: LootItem[] | undefined;
    if (Array.isArray(lootData)) {
      lootArray = lootData;
    } else if (lootData && Array.isArray(lootData.output)) {
      lootArray = lootData.output;
    } else if (
      lootData?.results?.formatLoot?.output &&
      Array.isArray(lootData.results.formatLoot.output)
    ) {
      lootArray = lootData.results.formatLoot.output;
    } else if (lootData && typeof lootData.text === 'string') {
      try {
        const inner = JSON.parse(lootData.text);
        if (Array.isArray(inner)) {
          lootArray = inner;
        } else if (inner && Array.isArray(inner.output)) {
          lootArray = inner.output;
        }
      } catch {
        // ignore parse error
      }
    }

    if (!lootArray) {
      logger.error(
        '[generate-loot] Mastra service did not return an array:',
        lootData,
      );
      throw new Error('Mastra service did not return an array.');
    }
    logger.info('[generate-loot] Returning lootData:', lootArray);

    return res.status(200).json(lootArray);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('[generate-loot] Error:', error.message);
    } else {
      logger.error('[generate-loot] Error:', error);
    }

    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to generate loot.',
    });
  }
}
