import { BadRequest } from "../utils/responses";
import prisma from "../../../utils/prismaClient";
import { NetworkType } from "../../../common/enums/NetworkType";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    console.log(request.nextUrl.searchParams)
    const metamaskWalletAddress = request.headers.get('X-Metamask-Address');

    if (!metamaskWalletAddress) {
        return new BadRequest('Metamask account not provided');
    }

    const user = await prisma.user.findFirst({
        where: { metamaskWalletAddress }
    });

    if (!user) {
        return new BadRequest('User not found');
    }

    const params = request.nextUrl.searchParams;

    const nfts = await prisma.nft.findMany({
        where: {
            userId: user.id,
            networkType: params.get('type') as NetworkType
        },
        select: {
            id: true,
            pinataImageHash: true,
            name: true,
            description: true,
            createdAt: true,
            tokenId: true,
            tweetLog: true,
            chain: true,
            user: true,
            networkType: true
        }
    }).then(list => list.map(item => {
        return ({
            id: item.id,
            name: item.name,
            pinataImageHash: item.pinataImageHash,
            description: item.description,
            createdAt: item.createdAt,
            tokenId: item.tokenId,
            chainNativeId: item.chain.chainId,
            chainId: item.chain.id,
            chainNetwork: item.chain.network,
            chainName: item.chain.name,
            userId: item.user.id,
            userWalletAddress: item.user.metamaskWalletAddress,
            userName: item.user.twitterLogin,
            tweeted: !!item.tweetLog,
            networkType: item.networkType
        })
    }));

    return Response.json(nfts);
}