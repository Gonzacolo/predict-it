import type { Abi } from "viem";

import gameEscrowJson from "../../../abis/GameEscrow.json";

export const gameEscrowAbi = gameEscrowJson.abi as Abi;
