import { ethers } from "ethers";
import { hexToNumber } from "web3-utils";
import axios, { AxiosResponse } from "axios";

import lzAbi from "./abi.json";
import hyperlineAbi from "./hyperlane-abi.json";
import { NetworkName } from "../common/enums/NetworkName";
import { DEFAULT_REFUEL_COST_USD, HYPERLANE_CONTRACT_ADDRESS, LZ_CONTRACT_ADDRESS, getContractAddress } from "../common/constants";
import { AccountDto } from "../common/dto/AccountDto";
import { wait } from "../utils/wait";
import { ChainDto } from "../common/dto/ChainDto";
import { BridgeType } from "../common/enums/BridgeType";
import { estimateFeeForBridge, getGasLimitForBridge } from "./helpers";
import { DEFAULT_REFERER_EARNINGS, LZ_VERSION } from "./constants";

interface ChainToSend {
    id: number;
    name: string;
    network: string;
    lzChain: number | null;
    hyperlaneChain: number | null;
    token: string;
}

interface ControllerFunctionProps {
    account: AccountDto | null;
    accountAddress: string;
    contractAddress: string;
    networkType: BridgeType;
    chainToSend: ChainToSend;
}

export interface ControllerFunctionResult {
    result: boolean;
    message: string;
    receipt?: any;
    transactionHash: string;
    blockId?: number;
}

const TRANSACTION_WAIT: number = 60000;
const NFTS_COUNT = 1;

const getAbi = (type: BridgeType) => {
    if (type === BridgeType.LayerZero) {
        return lzAbi;
    }

    if (type === BridgeType.Hyperlane) {
        return hyperlineAbi;
    }

    return lzAbi;
}

/**
 * Mint NFT Functionality
 * @param contractAddress Contract address for selected chain
 * @param chainToSend Current chain to send NFT
 * @param account User account
 */
export const mintNFT = async ({ contractAddress, chainToSend, account, networkType }: ControllerFunctionProps): Promise<ControllerFunctionResult> => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();
    const sender = await signer.getAddress();

    const abi = getAbi(networkType);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const mintFee = await contract.mintFee();

    const userBalance = await provider.getBalance(sender);

    if (userBalance < mintFee) {
        return {
            result: false,
            message: 'Not enough funds to mint',
            transactionHash: ''
        };
    }

    let options: any = { value: BigInt(mintFee), gasLimit: BigInt(0) };
    let gasLimit, txResponse;

    if (account?.refferer) {
        if (networkType === BridgeType.LayerZero) {
            gasLimit = await contract['mint(address)'].estimateGas(account.refferer, options);
            options.gasLimit = gasLimit;

            txResponse = await contract['mint(address)'](account.refferer, options);
        } else {
            gasLimit = await contract.batchMintWithReferrer.estimateGas(NFTS_COUNT, account.refferer, options);
            options.gasLimit = gasLimit;
            txResponse = await contract.batchMintWithReferrer(NFTS_COUNT, account.refferer, options);
        }
    } else {
        gasLimit = await contract['mint()'].estimateGas(options);
        options.gasLimit = gasLimit;

        txResponse = await contract['mint()'](options);
    }

    await wait();

    // Magic for working functionality. Don't remove
    console.log("Minting..", { id: chainToSend.id, network: chainToSend.network, hash: txResponse?.hash });

    const receipt = await txResponse.wait(null, TRANSACTION_WAIT);

    const log = (receipt.logs as any[]).find(x => x.topics.length === 4);
    let blockId: number;

    if (chainToSend.network === NetworkName.Polygon) {
        blockId = parseInt(`${hexToNumber(receipt.logs[1].topics[3])}`);
    } else {
        blockId = parseInt(`${hexToNumber(log.topics[3])}`);
    }

    return {
        result: receipt?.status === 1,
        message: receipt?.status === 1 ? 'Successful send' : (receipt?.status == null ? 'Send not confirmed' : 'Send failed'),
        transactionHash: txResponse?.hash,
        receipt,
        blockId
    }
}

export interface EstimationBridge {
    network: NetworkName;
    price: string;
}

export type EstimationBridgeType = (EstimationBridge | null)[]

export const estimateBridge = async (
    chains: ChainDto[],
    token: string,
    { contractAddress, networkType }: ControllerFunctionProps,
    tokenId: number,
    refuel: boolean = false,
    refuelCost: number = DEFAULT_REFUEL_COST_USD
): Promise<EstimationBridgeType> => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();
    const sender = await signer.getAddress();

    const price = await fetchPrice(token);

    const abi = getAbi(networkType);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    return Promise.all(chains.map(chain => {
        return estimateFeeForBridge(
            contract, 
            sender, 
            networkType, 
            refuel,
            refuelCost,
            price, 
            tokenId,
            {
                id: chain.chainId,
                name: chain.name,
                network: chain.network,
                lzChain: chain.lzChain,
                hyperlaneChain: chain.hyperlaneChain,
                token: chain.token
            }
        )
    }))
};

const lzBridge = async (
    { contractAddress, chainToSend, networkType }: ControllerFunctionProps,
    tokenId: number,
    refuel: boolean = false,
    refuelCost: number = DEFAULT_REFUEL_COST_USD
): Promise<ControllerFunctionResult> => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();
    const sender = await signer.getAddress();

    const _toAddress = ethers.solidityPacked(
        ["address"], [sender]
    );

    const abi = getAbi(networkType);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const _dstChainId = chainToSend?.lzChain;

    const MIN_DST_GAS = await contract.minDstGasLookup(_dstChainId, LZ_VERSION);

    let adapterParams;
    if (refuel) {
        const price = await fetchPrice(chainToSend?.token);

        if (!price) {
            return {
                result: false,
                message: 'Something went wrong :(',
                transactionHash: ''
            }
        }

        const REFUEL_AMOUNT = (refuelCost / price).toFixed(8);

        const refuelAmountEth = ethers.parseUnits(
            REFUEL_AMOUNT,
            18
        );

        adapterParams = ethers.solidityPacked(
            ["uint16", "uint256", "uint256", "address"],
            [2, MIN_DST_GAS, refuelAmountEth, sender]
        );
    } else {
        adapterParams = ethers.solidityPacked(
            ["uint16", "uint256"],
            [LZ_VERSION, MIN_DST_GAS]
        );
    }

    const { nativeFee } = await contract.estimateSendFee(
        _dstChainId,
        _toAddress,
        tokenId,
        false,
        adapterParams
    );

    const userBalance = await provider.getBalance(sender);

    if (userBalance < nativeFee) {
        return {
            result: false,
            message: 'Not enough funds to send',
            transactionHash: ''
        }
    }

    const bridgeOptions = {
        value: nativeFee,
        gasLimit: BigInt(0)
    }

    const defaultGasLimit = await contract.sendFrom.estimateGas(
        sender,
        _dstChainId,
        _toAddress,
        tokenId,
        sender,
        ethers.ZeroAddress,
        adapterParams,
        bridgeOptions
    );

    bridgeOptions.gasLimit = getGasLimitForBridge(defaultGasLimit)
    
    const transaction = await contract.sendFrom(
        sender,
        _dstChainId,
        _toAddress,
        tokenId,
        sender,
        ethers.ZeroAddress,
        adapterParams,
        bridgeOptions
    );

    await wait();

    // Magic for working functionality. Don't remove
    console.log("Bridging..", { id: chainToSend?.id, name: chainToSend?.name, hash: transaction?.hash });

    const receipt = await transaction.wait(null, TRANSACTION_WAIT)

    return {
        result: receipt?.status === 1,
        message: receipt?.status === 1 ? 'Successful send' : (receipt?.status == null ? 'Send not confirmed' : 'Send failed'),
        receipt,
        transactionHash: transaction?.hash
    };
}

const hyperlaneBridge = async (
    { contractAddress, chainToSend, networkType }: ControllerFunctionProps,
    tokenId: number,
): Promise<ControllerFunctionResult> => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    const signer = await provider.getSigner();
    const sender = await signer.getAddress();

    const abi = getAbi(networkType);

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const _dstChainId = chainToSend?.hyperlaneChain;
    const _receiver = sender.replace('0x', '0x000000000000000000000000');

    const nativeFee = await contract.getHyperlaneMessageFee(_dstChainId);
    const userBalance = await provider.getBalance(sender);

    if (userBalance < nativeFee) {
        return {
            result: false,
            message: 'Not enough funds to send',
            transactionHash: ''
        }
    }

    const defaultGasLimit = await contract.transferRemote.estimateGas( _dstChainId,
        _receiver,
        tokenId,
        {
            value: nativeFee + await contract.bridgeFee(),
        }) 

    const transaction = await contract.transferRemote(
        _dstChainId,
        _receiver,
        tokenId,
        {
            value: nativeFee + await contract.bridgeFee(),
            gasLimit: getGasLimitForBridge(defaultGasLimit)
        }
    );

    await wait();

    // Magic for working functionality. Don't remove
    console.log("Bridging..", { id: chainToSend?.id, name: chainToSend?.name, hash: transaction?.hash });

    const receipt = await transaction.wait(null, TRANSACTION_WAIT)

    return {
        result: receipt?.status === 1,
        message: receipt?.status === 1 ? 'Successful send' : (receipt?.status == null ? 'Send not confirmed' : 'Send failed'),
        receipt,
        transactionHash: transaction?.hash
    };
}

/**
 * Bridge NFT Functionality
 * @param contractAddress Contract address for selected chain
 * @param chainToSend Current chain to send NFT
 * @param account User account
 * @param tokenId NFT token id for sending to another chain
 * @param refuel Refuel enabled
 * @param refuelCost Refuel cost in dollars
 *
 */
export const bridgeNFT = async (
    { contractAddress, chainToSend, networkType }: ControllerFunctionProps,
    tokenId: number,
    refuel: boolean = false,
    refuelCost: number = DEFAULT_REFUEL_COST_USD
): Promise<ControllerFunctionResult> => {
    if (networkType === BridgeType.LayerZero) {
        return lzBridge(
            {contractAddress, chainToSend, networkType, account: null, accountAddress: ''},
            tokenId,
            refuel,
            refuelCost
        );
    }

    if (networkType === BridgeType.Hyperlane) {
        return hyperlaneBridge(
            {contractAddress, chainToSend, networkType, account: null, accountAddress: ''},
            tokenId
        );
    }

    return {
        result: false,
        message: 'Something went wrong :(',
        transactionHash: ''
    };
};

export async function claimReferralFee(chain: ChainDto, bridgeType: BridgeType) {
    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);

        const signer = await provider.getSigner();
    
        const abi = getAbi(bridgeType);
        const contractAddress = getContractAddress(bridgeType, chain.network as NetworkName)
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const isHyperlaneBridgeType = bridgeType === BridgeType.Hyperlane;
        const txResponse = isHyperlaneBridgeType ? await contract.claimRefEarnings() : await contract.claimReferrerEarnings();
        const receipt = await txResponse.wait(null, 60000);

        return {
            result: receipt.status === 1,
            message: receipt.status === 1
                ? 'Successful Claim'
                : (receipt.status == null ? 'Claim not confirmed' : 'Claim Failed'),
            receipt
        };
    } catch (e) {
        console.error(e);

        return {
            result: false,
            message: 'Something went wrong :(',
        }
    }
}

export async function getLZRefererEarnedInNetwork(chain: ChainDto, accountAddress: string) {
    try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        const LZ_contract = new ethers.Contract(LZ_CONTRACT_ADDRESS[chain.network as NetworkName], lzAbi, provider);
    
        const LZ_earned = await LZ_contract.referrersEarnedAmount(accountAddress);
    
        return ethers.formatEther(LZ_earned);
    } catch {
        return DEFAULT_REFERER_EARNINGS;
    }
}

export async function getHyperlaneRefererEarnedInNetwork(chain: ChainDto, accountAddress: string) {
    try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        const hyperlaneContract = new ethers.Contract(HYPERLANE_CONTRACT_ADDRESS[chain.network as NetworkName], hyperlineAbi, provider);
    
        const hyperlaneEarned = await hyperlaneContract.refAmountToClaim(accountAddress);
    
        return ethers.formatEther(hyperlaneEarned)
    } catch {
        return DEFAULT_REFERER_EARNINGS;
    }
}

export async function fetchPrice(symbol: string): Promise<number | null> {
    let fetchSymbol = ""
    if (symbol == "MNT") {
        fetchSymbol = "MANTLE"
    } else {
        fetchSymbol = symbol
    }

    const url: string = `https://min-api.cryptocompare.com/data/price?fsym=${fetchSymbol.toUpperCase()}&tsyms=USDT`

    try {
        const response: AxiosResponse = await axios.get(url, { timeout: 10000 })

        if (response.status === 200 && response.data) {
            return parseFloat(response.data.USDT) || 0
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return fetchPrice(symbol)
        }
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchPrice(symbol)
    }
}

export const convertAddress = (hexString: string): string => {
    try {
        if (hexString.startsWith('0x')) hexString = hexString.substring(2)

        const byteArray = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

        let binaryString = ''
        byteArray.forEach(byte => binaryString += String.fromCharCode(byte))

        binaryString = btoa(binaryString)
        return binaryString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    } catch (error) {
        return ''
    }
}

export const decodeAddress = (encodedString: string): string => {
    try {
        encodedString = encodedString.replace(/-/g, '+').replace(/_/g, '/')

        const binaryString = atob(encodedString)

        let hexString = ''
        for (let i = 0; i < binaryString.length; i++) {
            let hex = binaryString.charCodeAt(i).toString(16)
            hexString += (hex.length === 2 ? hex : '0' + hex)
        }

        hexString = '0x' + hexString

        return hexString
    } catch (error) {
        return ''
    }
}