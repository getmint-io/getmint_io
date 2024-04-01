import { CryptoAddress } from "./types";
import { NetworkName } from "./enums/NetworkName";
import { BridgeType } from "./enums/BridgeType";


export const LZ_CONTRACT_ADDRESS: Record<NetworkName, CryptoAddress> = {
    [NetworkName.Base]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.ArbitrumNova]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.LineaMainnet]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Optimism]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.PolygonzkEVM]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Polygon]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Zora]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Scroll]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Mantle]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Arbitrum]: '0x809E8c06e6110CD6a055a7d2044EF7e0B29Ce2e3',
    [NetworkName.Avalanche]: '0x7a9ed9A5EF8dF626Bf934AaCe84c66267b37842c',
    [NetworkName.ZkSync]: '0x569aA521b05752D22de8B3DBb91D92f65baa7E6f',
    [NetworkName.BSC]: '0x991fC265f163fc33328FBD2b7C8aa9B77840Ed42',
    [NetworkName.Celo]: '0x',
    [NetworkName.Gnosis]: '0x',
};

export const LZAvailableNetworks = [
    NetworkName.Base,
    NetworkName.ArbitrumNova,
    NetworkName.LineaMainnet,
    NetworkName.PolygonzkEVM,
    NetworkName.Polygon,
    NetworkName.Arbitrum,
    NetworkName.Optimism,
    NetworkName.Scroll,
    NetworkName.Avalanche,
    NetworkName.BSC,
    NetworkName.Zora,
    NetworkName.Mantle,
    NetworkName.ZkSync
];

export const HYPERLANE_CONTRACT_ADDRESS: Record<NetworkName, CryptoAddress> = {
    [NetworkName.Base]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.ArbitrumNova]: '0x',
    [NetworkName.LineaMainnet]: '0x',
    [NetworkName.Optimism]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.PolygonzkEVM]: '0x',
    [NetworkName.Polygon]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.Zora]: '0x',
    [NetworkName.Scroll]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.Mantle]: '0x',
    [NetworkName.Arbitrum]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.Avalanche]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.ZkSync]: '0x',
    [NetworkName.BSC]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.Celo]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
    [NetworkName.Gnosis]: '0x7e67c93cd0059B9957dF63Df6418B394D1070627',
};

export const HyperlaneAvailableNetworks = [
    NetworkName.Base,
    NetworkName.Polygon,
    NetworkName.Arbitrum,
    NetworkName.Optimism,
    NetworkName.Scroll,
    NetworkName.Avalanche,
    NetworkName.BSC,
    NetworkName.Gnosis,
    NetworkName.Celo
];

export function getContractAddress(ntType: BridgeType, network: NetworkName): CryptoAddress {
    if (ntType === BridgeType.LayerZero) {
        return LZ_CONTRACT_ADDRESS[network as NetworkName];
    }

    if (ntType === BridgeType.Hyperlane) {
        return HYPERLANE_CONTRACT_ADDRESS[network as NetworkName];
    }

    return '' as CryptoAddress;
}

export const UnailableLZNetworks: Record<NetworkName, NetworkName[]> = {
    [NetworkName.ArbitrumNova]: [
        NetworkName.Mantle,
        NetworkName.PolygonzkEVM,
        NetworkName.Scroll,
        NetworkName.Zora
    ],
    [NetworkName.Arbitrum]: [],
    [NetworkName.Avalanche]: [
        NetworkName.Zora
    ],
    [NetworkName.Base]: [],
    [NetworkName.BSC]: [
        NetworkName.Zora
    ],
    [NetworkName.LineaMainnet]: [],
    [NetworkName.Mantle]: [
        NetworkName.ArbitrumNova,
        NetworkName.Zora
    ],
    [NetworkName.Optimism]: [],
    [NetworkName.Polygon]: [],
    [NetworkName.PolygonzkEVM]: [
        NetworkName.ArbitrumNova,
        NetworkName.Zora
    ],
    [NetworkName.Scroll]: [
        NetworkName.ArbitrumNova,
        NetworkName.Zora
    ],
    [NetworkName.ZkSync]: [
        NetworkName.Zora
    ],
    [NetworkName.Zora]: [
        NetworkName.ArbitrumNova,
        NetworkName.Avalanche,
        NetworkName.BSC,
        NetworkName.Mantle,
        NetworkName.Scroll,
    ],
    [NetworkName.Celo]: [],
    [NetworkName.Gnosis]: [],
}

export const DEFAULT_REFUEL_COST_USD = 0.25;
export const REFUEL_AMOUNT_USD = [DEFAULT_REFUEL_COST_USD, 0.5, 0.75, 1];

export const TWEET_CONTENT = "Just created a unique omnichain NFT at @GetMint_io. Mint NFT, and make bridges using Layer Zero and earn future project tokens.\nCheck out my NFT: ";