import Client, { auth } from "twitter-api-sdk";
import { OAuth2UserOptions } from "twitter-api-sdk/dist/OAuth2User";
import { AuthState } from "../common/types";
import { TWEET_CONTENT } from "../common/constants";

const DEFAULT_AUTH_OPTIONS: OAuth2UserOptions = {
    client_id: process.env.TWITTER_CLIENT_ID,
    client_secret: process.env.TWITTER_CLIENT_SECRET,
    callback: `${process.env.APP_URL}/api/twitter/callback`,
    scopes: ["users.read", "tweet.write", "tweet.read", "follows.write", "offline.access"],
}

class AuthClient extends auth.OAuth2User {
    constructor(options: OAuth2UserOptions) {
        super(options);
    }

    setToken(token: OAuth2UserOptions['token']) {
        this.token = token;
    }
}

class TwitterApi {
    private authClient = new AuthClient(DEFAULT_AUTH_OPTIONS);
    private client = new Client(this.authClient);

    constructor() {
        this.authClient.generateAuthURL({
            state: '',
            code_challenge: process.env.TWITTER_CODE_CHALLENGE,
            code_challenge_method: 'plain',
        });
    }

    async findMyUser() {
        await this.checkAndRefreshToken();
        return this.client.users.findMyUser();
    }

    async createTweet(id: string) {
        await this.checkAndRefreshToken();
        return this.client.tweets.createTweet({ text: `${TWEET_CONTENT}\n${process.env.APP_URL}/api/image/${id}` });
    }

    async requestToken(code: string) {
        return this.authClient.requestAccessToken(code);
    }

    async revokeToken() {
        return this.authClient.revokeAccessToken();
    }

    getAuthUrl(state: AuthState) {
        return this.authClient.generateAuthURL({
            state: state,
            code_challenge: process.env.TWITTER_CODE_CHALLENGE,
            code_challenge_method: 'plain',
        });
    }

    setToken(token: OAuth2UserOptions['token']) {
        this.authClient.setToken(token);
    }

    private async checkAndRefreshToken() {
        if (this.authClient.isAccessTokenExpired()) {
            await this.authClient.refreshAccessToken();
        }
    }
}

export const twitterApi = new TwitterApi();