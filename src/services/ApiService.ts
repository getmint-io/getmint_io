import { CreateMintDto, MintDto } from "../common/dto/MintDto";
import { apiClient } from "../utils/api";
import { AccountDto } from "../common/dto/AccountDto";
import { NFTDto } from "../common/dto/NFTDto";

class ApiService {
    async getAccount(): Promise<AccountDto> {
        const response = await apiClient.get('account');
        return response.data;
    }

    async createMint(image: File, data: CreateMintDto): Promise<MintDto> {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('name', data.name);
        formData.append('description', data.description ?? '');
        formData.append('tokenId', `${data.tokenId}`);
        formData.append('chainNetwork', data.chainNetwork);
        formData.append('transactionHash', data.transactionHash);

        const response = await apiClient.post('mint', formData);
        return response.data;
    }

    async getCollection() {
        const response = await apiClient.get<NFTDto[]>('collection');
        return response.data;
    }
}

export default new ApiService();