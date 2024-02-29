export interface User {
  _id?: string;
  createdAt: string;
  description: string;
  discord_link: string;
  name: string;
  background_image_url: string;
  profile_image_url: string;
  twitter_link: string;
  updatedAt: string;
  walletAddress: string;
  website_link: string;
  verified?: boolean;
}

export interface AuthResultData {
  access_token: string;
  user?: { exp: number; iat: number; userId: string; walletAddress: string };
}

export interface PasswordUpdateParam {
  email: string;
  currentPwd: string;
  newPwd: string;
}

export interface VerifyEmailParam {
  code: string;
}

export interface ResetPasswordReqParam {
  email: string;
  role: string;
}

export interface ResetPasswordParam {
  code: string;
  newPassword: string;
  repeatNewPassword: string;
}

export interface I2faSecret {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url: string;
}

export interface IVerifyTotpParam {
  userToken: string;
}
export interface IDropItem {
  id?: string;
  title: string;
  status: string;
  user: string;
  address: string;
  verified?: boolean;
  text?: string;
  thumbnail: string;
  link: string;
  dummy?: boolean;
}

export const dummyCard: IDropItem = {
  address: '',
  dummy: true,
  link: '#',
  status: '',
  text: '',
  thumbnail: '',
  title: '',
  user: '',
};

export interface IChannel {
  amount: number;
  id?: string;
  img: string;
  increased: number;
  memberPictures: string[];
  members: number;
  text: string;
  title: string;
  user: { name: string; address: string };
}

export const dummyChannel: IChannel = {
  amount: 0,
  img: '',
  increased: 0,
  memberPictures: [],
  members: 0,
  text: '',
  title: '',
  user: { address: '', name: '' },
};

export interface CollectionData {
  _id?: string;
  collection_profile_image_url: string;
  collection_background_image_url: string;
  collection_name: string;
  collection_category: string[];
  collection_telegram_link: string;
  collection_website_link: string;
  collection_twitter_link: string;
  collection_discord_link: string;
  collection_description: string;
  collection_creator: string;
  collection_owner: string;
  collection_payment_tokens: string[];
  collection_fee: number;
  collection_trending?: number;
  collection_viewed?: number;
  collection_volume?: number;
  collection_mentioned?: number;
  collection_shared?: number;
  collection_floor?: number;
  collection_sales?: number;
  nftsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
  countOfOwners?: number;
  countOfItems?: number;
  averagePriceOfItems?: number;

  accounting?: {
    volume: number;
    sales: number;
    avgPrice: number;
    owners: number;
    items: number;
  };
}

export const defaultCollectionData = {
  collection_background_image_url: '',
  collection_category: [],
  collection_creator: '',
  collection_description: '',
  collection_discord_link: '',
  collection_fee: 0,
  collection_name: '',
  collection_owner: '',
  collection_payment_tokens: [],
  collection_profile_image_url: '',
  collection_telegram_link: '',
  collection_twitter_link: '',
  collection_website_link: '',
};

export interface SearchCollectionsParam {
  sortStr: string;
  page: number;
  limit: number; // page size
  categories: string[];
  collection_name?: string;
}

export interface SearchCollectionsResult {
  total: number;
  searchResult: number;
  collections: CollectionData[];
  page: number;
  limit: number;
}

export interface Property {
  trait_type: string;
  value: string;
}

export const defaultProperty = {
  trait_type: '',
  value: '',
};

export interface AuctionData {
  _id?: string;
  auctionType: number;
  assetType: number;
  assetAmount: number;
  seller: string;
  buyer: string;
  baseToken: string;
  bidList?: {
    buyer: string;
    createdAt: Date;
    price: number;
    signature: string;
  }[];
  assetId: string;
  quoteToken: string;
  startPrice: number;
  endPrice: number;
  price: number;
  signature: string;
  transactionHash: string;
  transactionStatus: number;
  status: number;
  fraction: number;
  startTime: number;
  endTime: number;
  createdAt?: Date;
}

export interface NftData {
  _id?: string;
  name: string;
  collection_id?: string;
  collection?: Partial<CollectionData>;
  channel_id?: string;
  image: string;
  external_url: string;
  description: string;
  attributes: Property[];
  creator: string;
  owner: string;
  fee: number;
  supply?: number;
  createdAt?: string;
  endDate?: Date;
  joinedUsers?: User[];
  price?: number;
  gasFees?: number;
  orders?: OrderParam[];
  noAction?: boolean;
  viewed?: number;
  volume?: number;
  price?: number;
  quoteToken?: string;
  isBuyNow?: boolean;
  trending?: number;
  mentioned?: number;
  shared?: number;
  categories?: string[];
  auction?: AuctionData;
  isMinted?: boolean;
  external_contract_address?: string;
  external_tokenId?: string;
  isErc721?: boolean;
}

export const defaultNftData = {
  attributes: [],
  creator: '',
  description: '',
  external_url: '',
  fee: 0,
  image: '',
  name: '',
  owner: '',
  supply: 1,
};

export interface SearchNftsParam {
  collection_ids: string[];
  sortStr: string;
  page: number;
  limit: number;
  name: string;
  owner: string;
  categories: string[];
  isBuyNow?: boolean;
  quoteToken?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchNftsResult {
  total: number;
  searchResult: number;
  nfts: NftData[];
  page: number;
  limit: number;
}

export interface SearchChannelsParam {
  channel_joined: string;
  channel_creator: string;
  channel_owner: string;
  channel_name: string;
  sortStr: string;
  page: number;
  limit: number;
  categories: string[];
}

export interface SearchChannelsResult {
  total: number;
  searchResult: number;
  channels: ChannelData[];
  page: number;
  limit: number;
}

export interface IItem {
  collectionName: string;
  collectionVerified?: boolean;
  id: string;
  itemName: string;
  joinedUsers?: string[];
  pic: string;
  price: string;
  creator?: string;
  createdAt?: Date;
}

export enum OrderType {
  SELL,
  BUY,
}

export enum AuctionType {
  SELL,
  BUY,
}

export enum AssetType {
  ERC1155,
  ERC721,
}

export enum TransactionStatus {
  PENDING,
  CONFIRMED,
  FAILED,
  EXTEND_PENDING,
}

export enum OrderStatus {
  PENDING,
  ACCEPTED,
  CANCELED,
}

export interface OrderParam {
  _id?: string;
  orderType: OrderType;
  assetType: AssetType;
  seller: string; // seller address
  buyer: string; // buyer address
  baseToken: string; // NFT address
  assetId: string; // NFT id
  channelId?: string;
  badgesOrchannelOwner?: string;
  fraction: number; // NFT fraction
  assetAmount: number; // default 1
  quoteToken: string; // acceptable token
  price: number;
  signature: string;
  transactionHash: string;
  transactionStatus: TransactionStatus;
  status: OrderStatus;
  startTime?: number;
  endTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChannelofferParam {
  _id?: string;
  channelId: string;
  channel_name: string;
  channel_address: string;
  buyer: string;
  seller?: string;
  price: number;
  startTime: number;
  endTime: number;
  signature: string;
  transactionHash?: string;
  transactionStatus?: number;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TicketofferParam {
  _id?: string;
  channelId: string;
  channel_name: string;
  channel_address: string;
  ticketId: string;
  buyer: string;
  seller?: string;
  price: number;
  startTime: number;
  endTime: number;
  signature: string;
  transactionHash?: string;
  transactionStatus?: number;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuctionParam {
  _id?: string;
  auctionType: AuctionType;
  assetType: AssetType;
  seller: string; // seller address
  buyer: string; // buyer address
  baseToken: string; // NFT address
  assetId: string; // NFT id
  channelId?: string;
  badgesOrchannelOwner?: string;
  fraction: number; // NFT fraction
  assetAmount: number; // default 1
  quoteToken: string; // acceptable token
  signature: string;
  transactionHash: string;
  transactionStatus: TransactionStatus;
  status: OrderStatus;
  startPrice: number;
  endPrice: number;
  price?: number;
  startTime?: number;
  endTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuctionUpdateParam {
  buyer?: string;
  price?: number;
  signature?: string;
  transactionHash?: string;
  transactionStatus?: number;
  status?: number;
}

export interface MenuItem {
  icon?: string;
  label: string;
  link: string;
}

export interface Token {
  address: string;
  name: string;
  icon: string;
  network: string;
  required?: boolean;
}

export interface ChannelData {
  _id?: string;
  channel_profile_image_url: string;
  channel_background_image_url: string;
  channel_name: string;
  channel_category: string[];
  channel_external_link: string;
  channel_description: string;
  channel_access_limit: number;
  is_accept_offers: boolean;
  is_tradable_tickets: boolean;
  attributes: Property[];
  channel_permissions: boolean[];
  channel_royalties: number;
  channel_ticket_price: number;
  channel_creator: string;
  channel_owner: string;
  channel_address: string;
  transactionHash: string;
  transactionStatus: TransactionStatus;
  items?: Partial<NftData>[];
  itemsCount?: number;
  joinedUsersCount?: number;
  joinedUsers?: Partial<User>[];
  activeUsersCount?: number;
  createdAt?: string;
}

export const defaultChannelData = {
  attributes: [],
  channel_access_limit: 0,
  channel_address: '',
  channel_background_image_url: '',
  channel_category: [],
  channel_creator: '',
  channel_description: '',
  channel_external_link: '',
  channel_name: '',
  channel_owner: '',
  channel_permissions: [false, false, false, false],
  channel_profile_image_url: '',
  channel_royalties: 2.5,
  channel_ticket_price: 0,
  is_accept_offers: true,
  is_tradable_tickets: true,
  transactionHash: '',
  transactionStatus: TransactionStatus.PENDING,
};

export enum ChannelPermission {
  EVERYTHING,
  CREATE_POSTS,
  COMMENT_LINKS,
  COMMENT_MEDIA,
}

export const ChannelPermissionTitle = {
  [ChannelPermission.EVERYTHING]: 'Everything',
  [ChannelPermission.CREATE_POSTS]: 'Users are allowed to create posts.',
  [ChannelPermission.COMMENT_LINKS]:
    'Users are allowed to send embed links in the comments.',
  [ChannelPermission.COMMENT_MEDIA]:
    'Users are allowed to send media (gif, png, jpeg, jpg) in the comments.',
};

export const defaultChannelPermission = [false, false, false, false];

export interface TicketData {
  _id?: string;
  channel_id: string;
  channel_name?: string;
  ticketId: string;
  owner: string;
  price?: number;
  is_tradable: boolean;
  expiredTimestamp: number;
  transactionHash: string;
  status: TransactionStatus;
  createdAt?: string;
}

export interface PostData {
  _id?: string;
  channel_id: string;
  user_id: string;
  channelpost_description: string;
  channelpost_image_url: string | null;
  channelpost_nft_id: string | null;
  channelpost_shared_channel_id?: string;
  channelpost_shared_collection_id?: string;
  channelpost_shared_profile_id?: string;
  comments?: number;
  views?: number;
  channelpost_upvotes?: any[];
  channelpost_upvotes_count?: number;
  channelpost_downvotes?: any[];
  channelpost_downvotes_count?: number;
  channelpost_pinned?: string[];
  createdAt?: string;
}

export const defaultPostData = {
  channel_id: '',
  channelpost_description: '',
  channelpost_image_url: null,
  channelpost_nft_id: null,
  user_id: '',
};

export interface CommentData {
  _id?: string;
  channelpost_id: string;
  user_id: string;
  comment_content: string;
  commentedBy?: Partial<User>;
  comment_upvotes?: any[];
  comment_upvotes_count?: number;
  comment_downvotes?: any[];
  comment_downvotes_count?: number;
  createdAt?: string;
}

export interface FavoriteData {
  typeName: string;
  itemId: string;
  userId: string;
}

export interface VisitorData {
  typeName: string;
  itemId: string;
  userId: string;
}

export interface ActivityData {
  _id?: string;
  collection_id: string;
  nft_id: string;
  activity_type: string;
  fromAddress?: string;
  toAddress?: string;
  timeStamp: string;
  transactionHash?: string;
  quoteToken?: string;
  price?: number;
  endDate?: Date;
  timeStamp?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export const ActivityIcon: { [key: string]: string } = {
  'Canceled Listing': 'minted',
  'Canceled Offer': 'offer',
  Listing: 'listing',
  Mint: 'minted',
  Offer: 'offer',
  Sale: 'cart',
  Transfer: 'transfer',
};

export interface ChannelActivityData {
  _id: string;
  channel_id: string;
  activity_type: string; // 'Join', "Sale", "List", "Pin", "Post"
  joined_user_wallet?: string;
  channelpost_id?: string;
  user_id?: string;
  price?: number;
  createdAt: Date;
}

export interface ChannelOfferData {
  _id: string;
  channelId: string;
  channel_name: string;
  channel_address: string;
  buyer: string;
  price: number;
  startTime: number;
  endTime: number;
  signature?: string;
  transactionHash?: string;
  transactionStatus?: number;
  status: number;
  createdAt?: Date;
  usersInfo: {
    buyer: {
      _id: string;
      walletAddress: string;
      createdAt?: Date;
    };
  };
}

export interface TicketOfferData {
  _id: string;
  channelId: string;
  channel_name: string;
  channel_address: string;
  ticketId: string;
  buyer: string;
  price: number;
  startTime: number;
  endTime: number;
  signature?: string;
  transactionHash?: string;
  transactionStatus?: number;
  status: number;
  createdAt?: Date;
  usersInfo: {
    buyer: {
      _id: string;
      walletAddress: string;
      createdAt?: Date;
    };
  };
}

export interface NotificationData {
  _id: string;
  title: string;
  channel_id: string;
  channel_name: string;
  channel_post_id: string;
  nft_id?: string;
  owner_id: string;
  unread: true;
  createdAt: Date;
}
