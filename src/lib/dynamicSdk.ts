import { Configuration } from "@dynamic-labs/sdk-api";

const dynamicToken = process.env.DYNAMIC_API_KEY?.trim();

/**
 * Dynamic REST client when `DYNAMIC_API_KEY` is set. Extend with GlobalWalletsApi
 * or EnvironmentsApi for server-side wallet flows beyond MVP viem signing.
 */
export const dynamicRestConfigOrNull =
  dynamicToken && dynamicToken.length > 0
    ? new Configuration({ accessToken: dynamicToken })
    : null;
