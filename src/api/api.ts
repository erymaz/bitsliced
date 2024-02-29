import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';

import {
  ActivityData,
  AuctionParam,
  AuctionUpdateParam,
  ChannelActivityData,
  ChannelData,
  ChannelOfferData,
  ChannelofferParam,
  CollectionData,
  CommentData,
  FavoriteData,
  NftData,
  NotificationData,
  OrderParam,
  PostData,
  SearchChannelsParam,
  SearchChannelsResult,
  SearchCollectionsParam,
  SearchCollectionsResult,
  SearchNftsParam,
  SearchNftsResult,
  TicketData,
  TicketOfferData,
  TicketofferParam,
  User,
  VisitorData,
} from '../type.d';

let instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
});

export function setAuthHeader(token: string) {
  instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000,
  });
}

instance.interceptors.request.use(function (config) {
  const access_token = window.localStorage.getItem('accessToken');
  if (access_token) {
    return {
      ...config,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };
  }

  return config;
});

const responseBody = (response: AxiosResponse) => response.data;

const requests = {
  delete: (url: string) => instance.delete(url).then(responseBody),
  get: (url: string, body?: any) => {
    let endpoint = url;
    if (body) endpoint += `?${qs.stringify(body)}`;
    return instance.get(endpoint, body).then(responseBody);
  },
  post: (url: string, body: {}, config?: AxiosRequestConfig) =>
    instance.post(url, body, config).then(responseBody),
  postFile: (url: string, body: {}) =>
    instance
      .post(url, body, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(responseBody),
  put: (url: string, body: {}) => instance.put(url, body).then(responseBody),
};
export default requests;

export const Auth = {
  delete: (id: string): Promise<any> => requests.delete(`users/${id}`),
  edit: (id: string, payload: any): Promise<any> =>
    requests.put(`users/${id}`, payload),
  get: (id: string): Promise<User> => requests.get(`users/${id}`),
  getByWallet: (wallet: string): Promise<User> =>
    requests.get(`users/wallet/${wallet}`),
  login: (user: {
    username: string;
    password: string;
  }): Promise<{ access_token: string } | any> =>
    requests.post('users/login', user),
};

export const Generic = {
  upload: (payload: any, onProgress?: (value: number) => void): Promise<any> =>
    requests.post('upload/', payload, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          onProgress(progressEvent.loaded);
        }
      },
      timeout: 300000,
    }),
};

export const Collection = {
  create: (payload: CollectionData): Promise<any> =>
    requests.post('collections/', payload),
  getAll: (): Promise<CollectionData[]> => requests.get('collections/'),
  getByCreator: (id: string): Promise<CollectionData[]> =>
    requests.get(`collections/creator/${id}`),
  getById: (id: string): Promise<CollectionData> =>
    requests.get(`collections/${id}`),
  getByName: (name: string): Promise<CollectionData> =>
    requests.get(`collections/collection_name/${name}`),
  getByOwner: (id: string): Promise<CollectionData[]> =>
    requests.get(`collections/owner/${id}`),
  search: (params: SearchCollectionsParam): Promise<SearchCollectionsResult> =>
    requests.post('collections/search', params),
  update: (payload: CollectionData): Promise<any> =>
    requests.put(`collections/${payload._id}`, payload),
};

export const Nft = {
  countByCreator: (wallet: string): Promise<number> =>
    requests.get(`nfts/countbycreator/${wallet}`),
  countByOwner: (wallet: string): Promise<number> =>
    requests.get(`nfts/countbyowner/${wallet}`),
  create: (payload: NftData): Promise<NftData> =>
    requests.post('nfts/', payload),
  delete: (id: string): Promise<NftData> => requests.delete(`nfts/${id}`),
  getAll: (): Promise<NftData[]> => requests.get('nfts/'),
  getByCollectionIds: (ids: (string | undefined)[]): Promise<NftData[]> =>
    requests.post('nfts/collection_ids', { collection_ids: ids }),
  getByCreator: (id: string): Promise<NftData[]> =>
    requests.get(`nfts/creator/${id}`),
  getById: (id: string): Promise<NftData> => requests.get(`nfts/${id}`),
  getByOwner: (id: string): Promise<NftData[]> =>
    requests.get(`nfts/owner/${id}`),
  getOwners: (collection_id: string): Promise<number> =>
    requests.get(`nfts/owners/${collection_id}`),
  search: (params: SearchNftsParam): Promise<SearchNftsResult> =>
    requests.post('nfts/search', params),
  transfer: (id: string, owner: string): Promise<NftData> =>
    requests.put(`nfts/transfer/${id}/${owner}`, {}),
  update: (id: string, payload: Partial<NftData>): Promise<NftData> =>
    requests.put(`nfts/${id}`, payload),
};

export const Order = {
  cancel: ({
    assetId,
    collectionId,
    nftId,
  }: {
    collectionId: string;
    nftId: string;
    assetId: string;
  }): Promise<boolean> =>
    requests.put(`orders/cancel/${collectionId}/${nftId}/${assetId}`, {}),
  create: (payload: OrderParam): Promise<OrderParam> =>
    requests.post('orders/', payload),
  getById: (id: string): Promise<OrderParam> => requests.get(`orders/${id}`),
  update: (id: string, payload: Partial<OrderParam>): Promise<OrderParam> =>
    requests.put(`orders/${id}`, payload),
};

export const Channeloffer = {
  create: (payload: ChannelofferParam): Promise<ChannelofferParam> =>
    requests.post('channeloffers/', payload),
  getByChannelId: (channelId: string): Promise<ChannelOfferData[]> =>
    requests.get(`channeloffers/channelId/${channelId}`),
  getById: (id: string): Promise<ChannelofferParam> =>
    requests.get(`channeloffers/${id}`),
  update: (
    id: string,
    payload: Partial<ChannelofferParam>
  ): Promise<ChannelofferParam> => requests.put(`channeloffers/${id}`, payload),
};

export const Ticketoffer = {
  create: (payload: TicketofferParam): Promise<TicketofferParam> =>
    requests.post('ticketoffers/', payload),
  getByChannelId: (
    channelId: string,
    ticketId: string
  ): Promise<TicketOfferData[]> =>
    requests.get(`ticketoffers/channelId/${channelId}/ticketId/${ticketId}`),
  getById: (id: string): Promise<TicketofferParam> =>
    requests.get(`ticketoffers/${id}`),
  update: (
    id: string,
    payload: Partial<TicketofferParam>
  ): Promise<TicketofferParam> => requests.put(`ticketoffers/${id}`, payload),
};

export const Auction = {
  cancel: (id: string): Promise<AuctionParam> =>
    requests.delete(`auctions/${id}`),
  create: (payload: AuctionParam): Promise<AuctionParam> =>
    requests.post('auctions/', payload),
  update: (id: string, payload: AuctionUpdateParam) =>
    requests.put(`auctions/${id}`, payload),
};

export const Channel = {
  create: (payload: ChannelData): Promise<ChannelData> =>
    requests.post('channels/', payload),
  delete: (id: string): Promise<ChannelData> =>
    requests.delete(`channels/${id}`),
  getAll: (): Promise<ChannelData[]> => requests.get('channels/'),
  getByCreator: (wallet: string): Promise<ChannelData[]> =>
    requests.get(`channels/creator/${wallet}`),
  getById: (id: string): Promise<ChannelData> => requests.get(`channels/${id}`),
  getByName: (name: string): Promise<ChannelData> =>
    requests.get(`channels/channel_name/${name}`),
  getByOwner: (wallet: string): Promise<ChannelData[]> =>
    requests.get(`channels/owner/${wallet}`),
  getTrendingChannels: (): Promise<ChannelData[]> =>
    requests.get('channels/trending'),
  search: (params: SearchChannelsParam): Promise<SearchChannelsResult> =>
    requests.post('channels/search', params),
  update: (id: string, payload: Partial<ChannelData>): Promise<ChannelData> =>
    requests.put(`channels/${id}`, payload),
};

export const Ticket = {
  create: (payload: TicketData): Promise<TicketData> =>
    requests.post('tickets/', payload),
  getAll: (): Promise<TicketData[]> => requests.get('tickets/'),
  getById: (id: string): Promise<TicketData> => requests.get(`tickets/${id}`),
  getByOwner: (wallet: string): Promise<TicketData[]> =>
    requests.get(`tickets/owner/${wallet}`),
  search: (payload: {
    channel_name: string;
    expired?: boolean;
    is_tradable?: boolean;
    sortStr: string;
    owner: string;
    page: number;
    channel_ids?: string[];
    limit: number;
    categories: string[];
    quoteToken?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{
    total: number;
    searchResult: number;
    page: number;
    limit: number;
    tickets: TicketData[];
  }> => requests.post('tickets/search/', payload),
  update: (id: string, payload: Partial<TicketData>): Promise<TicketData> =>
    requests.put(`tickets/${id}`, payload),
};

export const Posting = {
  create: (payload: PostData): Promise<PostData> =>
    requests.post('channelposts/', payload),
  downvote: (id: string, user_id: string): Promise<PostData> =>
    requests.put(`channelposts/downvote/${id}/${user_id}`, {}),
  getByChannelId: (id: string, sort: string = 'recents'): Promise<PostData[]> =>
    requests.get(`channelposts/channel_id/${id}/${sort}`),
  getById: (id: string): Promise<PostData> =>
    requests.get(`channelposts/${id}`),
  getConnectedItems: (channelId: string): Promise<NftData[]> =>
    requests.get(`channelposts/connected_nfts/${channelId}`),
  getCountById: (id: string): Promise<number> =>
    requests.get(`channelposts/countbychannelid/${id}`),
  getCountListedItemsById: (id: string): Promise<number> =>
    requests.get(`channelposts/countlistedItemsbychannelid/${id}`),
  getPinnedPosts: (channelId: string, userId: string): Promise<PostData[]> =>
    requests.get(`channelposts/pinned/${channelId}/${userId}`),
  pinAPost: (payload: { id: string; user_id: string }): Promise<PostData> =>
    requests.post('channelposts/pin', payload),
  upvote: (id: string, user_id: string): Promise<PostData> =>
    requests.put(`channelposts/upvote/${id}/${user_id}`, {}),
};

export const Comment = {
  create: (payload: CommentData): Promise<CommentData> =>
    requests.post('channelcomments/', payload),
  downvote: (id: string, user_id: string): Promise<CommentData> =>
    requests.put(`channelcomments/downvote/${id}/${user_id}`, {}),
  getByPostId: (id: string): Promise<CommentData[]> =>
    requests.get(`channelcomments/channelpost_id/${id}`),
  upvote: (id: string, user_id: string): Promise<CommentData> =>
    requests.put(`channelcomments/upvote/${id}/${user_id}`, {}),
};

export const Favorite = {
  check: (typeName: string, itemId: string, userId: string): Promise<boolean> =>
    requests.get(`favorites/${typeName}/${itemId}/${userId}`),
  count: (typeName: string, itemId: string): Promise<number> =>
    requests.get(`favorites/count/${typeName}/${itemId}`),
  create: (payload: FavoriteData): Promise<boolean> =>
    requests.post('favorites/', payload),
};

export const Visitor = {
  create: (payload: VisitorData): Promise<number> =>
    requests.post('visitors/', payload),
};

export const Activity = {
  getByChannel: (params: {
    channel_id: string;
    text: string;
    sortStr: string;
    page: number;
    limit: number;
  }): Promise<{
    total: number;
    searchResult: number;
    page: number;
    limit: number;
    channelactivities: ChannelActivityData[];
  }> => requests.post('channelactivities/search', params),
  getByCollection: (id: string): Promise<ActivityData[]> =>
    requests.get(`activities/collection/${id}`),
  getByNft: (id: string): Promise<ActivityData[]> =>
    requests.get(`activities/nft/${id}`),
  getByUser: (wallet: string): Promise<ActivityData[]> =>
    requests.get(`activities/walletAddress/${wallet}`),
};

export const TokenAPI = {
  getPrice: (addr: string): Promise<number> => requests.get(`tokens/${addr}`),
};

export const Follows = {
  create: (payload: { fromId: string; toId: string }): Promise<void> =>
    requests.post('follows/', payload),
  getFollowersCount: (id: string): Promise<number> =>
    requests.get(`follows/numberoffollowers/${id}`),
  getFollowingCount: (id: string): Promise<number> =>
    requests.get(`follows/numberoffollowings/${id}`),
};

export const Notification = {
  getByUser: (
    id: string
  ): Promise<{
    thisweek: NotificationData[];
    thisMonth: NotificationData[];
    earlier: NotificationData[];
  }> => requests.get(`notifications/${id}`),
};
