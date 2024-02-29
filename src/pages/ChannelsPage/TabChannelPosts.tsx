import 'twin.macro';

import {
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import {
  Auth,
  Channel,
  Collection,
  Comment,
  Nft,
  Posting,
} from '../../api/api';
import ChannelCardLandscape from '../../components/ChannelCardLandscape';
import CollectionCard from '../../components/CollectionCard';
import { getIcon } from '../../components/ColoredIcon';
import Dropdown from '../../components/Dropdown';
import ItemCard from '../../components/ItemCard';
import {
  ImageSection,
  StyledButton,
} from '../../components/lib/StyledComponents';
import ProfileCard from '../../components/ProfileCard';
import { UserContext } from '../../contexts/UserContext';
import {
  ChannelData,
  ChannelPermission,
  CollectionData,
  CommentData,
  NftData,
  PostData,
  User,
} from '../../type.d';
import { getMimeType, shortAddress } from '../../utils';
import { timeAgo } from '../../utils/datetime';
import { alertError, alertInfo } from '../../utils/toast';
import CommentWidget from './CommentWidget';
import PostingWidget from './PostingWidget';

const SortOptions: { [key: string]: { by: string; id: number } } = {
  'Most downvotes': { by: 'downvotes', id: 2 },
  'Most engaging': { by: 'engaging', id: 3 },
  'Most recents': { by: 'recents', id: 0 },
  'Most upvotes': { by: 'upvotes', id: 1 },
  'Most viewed': { by: 'viewed', id: 4 },
  Pinned: { by: 'pinned', id: 5 },
};

const sortPosts = (a: PostData, b: PostData) => {
  if (!a.createdAt) {
    return 1;
  } else if (!b.createdAt) {
    return -1;
  } else if (a.createdAt < b.createdAt) {
    return 1;
  } else if (a.createdAt > b.createdAt) {
    return -1;
  }
  return 0;
};

const PostItem = (props: {
  data: PostData;
  channel?: ChannelData;
  pinned?: boolean;
  editable?: boolean;
  addRefOfPost: (id: string, ref: RefObject<HTMLDivElement>) => void;
  handleUpdated?: () => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const postRef = useRef<HTMLDivElement>(null);

  const [post, setPost] = useState<PostData>(props.data);
  const [author, setAuthor] = useState<User | null>(null);
  const [nft, setNft] = useState<NftData | null>(null);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(0);

  useEffect(() => {
    if (props.data._id) {
      Comment.getByPostId(props.data._id).then((res: CommentData[]) => {
        if (res) {
          setCommentsCount(res.length);
        }
      });
    }
  }, [props.data._id]);

  useEffect(() => {
    if (post.user_id) {
      Auth.get(post.user_id)
        .then((res) => setAuthor(res))
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
  }, [post.user_id]);

  useEffect(() => {
    if (post.channelpost_nft_id) {
      Nft.getById(post.channelpost_nft_id)
        .then((res) => setNft(res))
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
  }, [post.channelpost_nft_id]);

  useEffect(() => {
    if (post.channelpost_shared_collection_id) {
      Collection.getById(post.channelpost_shared_collection_id)
        .then((res) => setCollection(res))
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
  }, [post.channelpost_shared_collection_id]);

  useEffect(() => {
    if (post.channelpost_shared_profile_id) {
      Auth.get(post.channelpost_shared_profile_id)
        .then((res) => setProfile(res))
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
  }, [post.channelpost_shared_profile_id]);

  useEffect(() => {
    if (post.channelpost_shared_channel_id) {
      Channel.getById(post.channelpost_shared_channel_id)
        .then((res) => setChannel(res))
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
  }, [post.channelpost_shared_channel_id]);

  useEffect(() => {
    if (postRef.current && props.data._id) {
      props.addRefOfPost(props.data._id, postRef);
    }
  }, [postRef, props.data]);

  return (
    <div
      key={post._id}
      ref={postRef}
      tw="mt-6 p-3 bg-white dark:bg-light/5 rounded-lg"
    >
      <div tw="flex items-center gap-3.5">
        <Link
          css={{
            backgroundImage: `url(${author?.profile_image_url})`,
          }}
          to={`/profile/${author?._id}`}
          tw="w-[60px] h-[60px] bg-center bg-cover border-2 border-white rounded-full"
        />
        <div>
          <Link
            to={`/profile/${author?._id}`}
            tw="font-semibold text-lg tracking-tight text-dark dark:text-light/90"
          >
            {author?.name}
          </Link>
          <div tw="text-base tracking-tight text-[#2F2F2F] dark:text-[#e1e1e1]">
            ({shortAddress(author?.walletAddress)})
          </div>
        </div>
      </div>
      <div tw="pt-4 flex items-center gap-8 md:gap-12">
        <button tw="flex items-center gap-2 md:gap-3">
          {getIcon('share', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
            Share
          </span>
        </button>
        {/* <button tw="flex items-center gap-2 md:gap-3">
          {getIcon('comment', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
            Comment
          </span>
        </button> */}
        <button tw="flex items-center gap-2 md:gap-3">
          {getIcon('more', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
            More
          </span>
        </button>
        {props.channel?.channel_owner === user?.walletAddress && (
          <button
            tw="flex items-center gap-2 md:gap-3"
            onClick={() => {
              if (post._id && user?._id) {
                Posting.pinAPost({ id: post._id, user_id: user._id }).then(
                  (res) => {
                    if (res) {
                      props.handleUpdated?.();
                    }
                  }
                );
              }
            }}
          >
            {getIcon('pin', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
              {props.pinned ? 'Unpin' : 'Pin'}
            </span>
          </button>
        )}
      </div>
      <p tw="pt-4 pb-4 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)] break-words">
        {/* [Description]
        <br /> */}
        {post.createdAt && (
          <span tw="block text-xs text-dark/50 dark:text-light/50 pb-2">
            {timeAgo(new Date(post.createdAt))}
          </span>
        )}
        {post.channelpost_description || (
          <em tw="text-[#0006] dark:text-[#fff6]">(No description)</em>
        )}
      </p>
      {post.channelpost_image_url && (
        <div tw="pb-6">
          <img
            alt=""
            src={post.channelpost_image_url}
            tw="max-w-[350px] rounded-lg"
          />
        </div>
      )}
      {nft && <ItemCard data={nft} landscape={true} />}
      {collection && <CollectionCard item={collection} landscape={true} />}
      {profile && <ProfileCard landscape={true} profile={profile} />}
      {channel && <ChannelCardLandscape channel={channel} landscape={true} />}
      <div tw="pt-4 flex items-center gap-2.5 md:gap-4 flex-wrap">
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]"
          onClick={() => {
            if (!user) return;
            setShowComments(!showComments);
          }}
        >
          {getIcon('chat', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {commentsCount ?? 0}
          </span>
        </button>
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]"
          onClick={() => {
            if (!user) return;
            if (post.channelpost_downvotes?.includes(user?._id)) {
              alertError('To upvote it, cancel downvote please.');
            } else {
              Posting.upvote(post._id ?? '', user?._id ?? '')
                .then((res) => {
                  if (res) {
                    setPost(res);
                  }
                })
                .catch((e) => {
                  console.error(e);
                  alertError(e.toString());
                });
            }
          }}
        >
          {getIcon(
            'upvote',
            post.channelpost_upvotes?.includes(user?._id)
              ? '#3169FA'
              : darkMode
              ? '#fff'
              : '#000'
          )}
          <span
            css={{
              color: post.channelpost_upvotes?.includes(user?._id)
                ? '#3169FA'
                : darkMode
                ? '#fff'
                : '#000',
            }}
            tw="font-semibold text-base tracking-tight leading-[150%]"
          >
            {post.channelpost_upvotes_count ?? 0}
          </span>
        </button>
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]"
          onClick={() => {
            if (!user) return;
            if (post.channelpost_upvotes?.includes(user?._id)) {
              alertError('To downvote it, cancel upvote please.');
            } else {
              Posting.downvote(post._id ?? '', user?._id ?? '')
                .then((res) => {
                  if (res) {
                    setPost(res);
                  }
                })
                .catch((e) => {
                  console.error(e);
                  alertError(e.toString());
                });
            }
          }}
        >
          {getIcon(
            'downvote',
            post.channelpost_downvotes?.includes(user?._id)
              ? '#3169FA'
              : darkMode
              ? '#fff'
              : '#000'
          )}
          <span
            css={{
              color: post.channelpost_downvotes?.includes(user?._id)
                ? '#3169FA'
                : darkMode
                ? '#fff'
                : '#000',
            }}
            tw="font-semibold text-base tracking-tight leading-[150%]"
          >
            {post.channelpost_downvotes_count ?? 0}
          </span>
        </button>
        <button tw="px-3.5 h-10 flex items-center gap-[7px] hover:bg-[#0001] rounded-[7px]">
          {getIcon('views', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {post.views ?? 0}
          </span>
        </button>
      </div>
      {showComments && post._id && (
        <div tw="pt-3">
          <div tw="mt-3 pl-4 relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-dark before:dark:bg-light before:bg-gradient-to-b before:from-hero-purpledark before:to-hero-bluelight before:opacity-30 before:rounded-full">
            <CommentWidget
              allowMedia={
                !!props.channel?.channel_permissions?.[
                  ChannelPermission.COMMENT_MEDIA
                ] || props.channel?.channel_owner === user?.walletAddress
              }
              allowUrl={
                !!props.channel?.channel_permissions?.[
                  ChannelPermission.COMMENT_LINKS
                ] || props.channel?.channel_owner === user?.walletAddress
              }
              editable={props.editable || true}
              postId={post._id}
              setCommentsCount={setCommentsCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PinnedPostItem = ({
  gotoPost,
  handleUpdated,
  item,
}: {
  item: PostData;
  gotoPost: (postId: string) => void;
  handleUpdated?: () => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [author, setAuthor] = useState<User | null>(null);

  useEffect(() => {
    if (item.user_id) {
      Auth.get(item.user_id).then((res) => {
        if (res) {
          setAuthor(res);
        }
      });
    }
  }, [item.user_id]);

  return (
    <div
      css={{ boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}
      tw="relative px-2.5 py-[11px] rounded-lg"
    >
      <div tw="absolute right-2.5 top-[16px] text-[12px] text-gray-500 ">
        {item.createdAt && timeAgo(new Date(item.createdAt))}
      </div>
      <Link to={`/profile/${author?._id}`} tw="flex items-center gap-2.5">
        <div
          css={{
            backgroundImage: `url(${author?.profile_image_url})`,
          }}
          tw="w-[60px] h-[60px] bg-[#fff] bg-no-repeat bg-center bg-cover rounded-full"
        />
        <div>
          <div tw="font-bold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {author?.name}
          </div>
          <div tw="text-[14px] tracking-tight leading-[150%] text-[#2F2F2F] dark:text-[#e1e1e1]">
            ({shortAddress(author?.walletAddress)})
          </div>
        </div>
      </Link>
      <p tw="pt-[18px] text-[14px] tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
        [Description]
        <br />
        {item.channelpost_description}
      </p>
      <div tw="pt-[17px] flex justify-between items-center gap-2">
        <StyledButton
          onClick={() => {
            item._id && gotoPost(item._id);
          }}
        >
          View Post
        </StyledButton>
        <button
          tw="pr-1 flex items-center opacity-50 hover:opacity-100 transition-all duration-300"
          onClick={() => {
            if (item._id && user?._id) {
              Posting.pinAPost({ id: item._id, user_id: user._id }).then(
                (res) => {
                  if (res) {
                    handleUpdated?.();
                  }
                }
              );
            }
          }}
        >
          <span tw="scale-75">
            {getIcon('pin', darkMode ? '#fff' : '#000')}
          </span>
          <span tw="text-[14px] tracking-tight text-dark dark:text-light/90">
            Unpin
          </span>
        </button>
      </div>
    </div>
  );
};

const TrendingChannelItem = (props: { item: ChannelData; user?: User }) => {
  const { darkMode } = useContext(UserContext);
  const [creator, setCreator] = useState<User | null>(null);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (props.item) {
      setMimeType(getMimeType(props.item.channel_profile_image_url));

      Auth.getByWallet(props.item.channel_creator).then((res) =>
        setCreator(res)
      );
    }
  }, [props.item]);

  return (
    <div key={props.item._id} tw="flex justify-between items-center">
      <div tw="flex items-center gap-3.5">
        <Link
          css={{
            backgroundImage: mimeType.startsWith('video')
              ? 'none'
              : `url(${props.item.channel_profile_image_url})`,
          }}
          to={`/channels/${props.item._id}`}
          tw="relative w-[60px] h-[60px] bg-white bg-center bg-cover rounded-[7px] overflow-hidden"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          <ImageSection
            imagePath={props.item.channel_profile_image_url}
            mimeType={mimeType}
          />
        </Link>
        <div tw="flex flex-col">
          <Link
            to={`/channels/${props.item._id}`}
            tw="font-semibold text-base tracking-tight text-dark dark:text-light/90"
          >
            {props.item.channel_name}
          </Link>
          <Link
            to={`/profile/${creator?._id}`}
            tw="pt-1 text-sm tracking-tight text-dark dark:text-light"
          >
            {creator?.name} ({shortAddress(props.item.channel_creator, 2, 4)})
          </Link>
        </div>
      </div>
      {props.user?.walletAddress === props.item.channel_owner ||
      (props.item.joinedUsers &&
        props.item.joinedUsers
          .map((u) => u.walletAddress)
          .includes(props.user?.walletAddress)) ? (
        <span tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5 opacity-50">
          {props.user?.walletAddress === props.item.channel_owner
            ? 'Owned'
            : 'Joined'}
        </span>
      ) : (
        <Link
          to={`/channels/${props.item._id}`}
          tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          {getIcon('add', darkMode ? '#000' : '#fff')}
          Join
        </Link>
      )}
    </div>
  );
};

const TabChannelPosts = (props: {
  accessible?: boolean;
  channel?: ChannelData;
  joined?: boolean;
  openPopup: () => void;
}) => {
  const { darkMode, user } = useContext(UserContext);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions['Most recents'].by
  );
  const [posts, setPosts] = useState<PostData[]>([]);
  const [trendingChannels, setTrendingChannels] = useState<ChannelData[]>([]);
  const [connectedItems, setConnectedItems] = useState<NftData[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<PostData[]>([]);
  const [refs, setRefs] = useState<{ [id: string]: RefObject<HTMLDivElement> }>(
    {}
  );

  useEffect(() => {
    Channel.getTrendingChannels().then((res: ChannelData[]) => {
      if (res) {
        setTrendingChannels(res);
      }
    });
  }, []);

  useEffect(() => {
    if (props.channel?._id) {
      // console.log('channel', props.channel);
      Posting.getConnectedItems(props.channel._id).then((res) => {
        setConnectedItems(res);
      });
    }
  }, [props.channel]);

  useEffect(() => {
    if (props.channel?._id && user?._id) {
      Posting.getPinnedPosts(props.channel._id, user._id).then((res) => {
        setPinnedPosts(res.sort(sortPosts));
      });
    }
  }, [props.channel, user?._id]);

  const editable = useMemo(
    () =>
      user &&
      props.channel &&
      (props.channel.channel_owner === user.walletAddress ||
        props.channel.channel_permissions?.[ChannelPermission.EVERYTHING] ||
        props.channel.channel_permissions?.[ChannelPermission.CREATE_POSTS]),
    [props, user]
  );

  const getArticles = (channelId: string, sort: string = 'recents') => {
    Posting.getByChannelId(channelId, sort)
      .then((res: PostData[]) => {
        // console.log(res);
        if (res) {
          setPosts(res.sort(sortPosts));
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      });
  };

  useEffect(() => {
    if (props.channel?._id) {
      getArticles(props.channel._id, selectedSortOption);
    }
  }, [props.channel, selectedSortOption]);

  const addRefOfPost = (id: string, ref: RefObject<HTMLDivElement>) => {
    setRefs((prevRefs) => ({ ...prevRefs, [id]: ref }));
  };

  const gotoPost = (id: string) => {
    if (refs[id]?.current) {
      refs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return props.accessible ? (
    <div tw="mx-auto w-full grid grid-cols-1 xl:grid-cols-3 auto-cols-auto justify-start gap-6">
      <div tw="w-full max-w-none xl:col-span-2">
        {user ? (
          <div tw="p-3 w-full bg-white dark:bg-light/5 rounded-lg">
            {editable ? (
              <PostingWidget
                channel={props.channel}
                handleRefresh={() => {
                  props.channel?._id && getArticles(props.channel._id);
                  props.channel?._id &&
                    Posting.getConnectedItems(props.channel._id).then((res) => {
                      setConnectedItems(res);
                    });
                }}
              />
            ) : (
              <div tw="text-[17px] text-center text-dark tracking-tight dark:text-light">
                {props.channel?.channel_owner === user?.walletAddress ? (
                  <>
                    Posting is not allowed in this channel.
                    <br />
                    Please change the permission of{' '}
                    <Link
                      to={`/create/edit-channel/${props.channel?._id}`}
                      tw="font-semibold text-[17px] underline"
                    >
                      {props.channel?.channel_name}
                    </Link>{' '}
                    to allow posting here.
                  </>
                ) : (
                  <>
                    We are sorry! Posting is not allowed in this channel. Please
                    contact the{' '}
                    <Link
                      to={`/profile/wallet-address/${props.channel?.channel_owner}`}
                      tw="font-semibold text-[17px] underline"
                    >
                      channel owner
                    </Link>{' '}
                    to post articles here.
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div tw="p-3 w-full bg-white dark:bg-light/5 rounded-lg">
            <div tw="pl-6 pr-3 py-[11px] flex justify-center md:justify-between items-center flex-wrap md:flex-nowrap gap-3 md:gap-0 w-full border-dashed border-2 border-[rgba(49, 105, 250, 0.5)] bg-[rgba(49, 105, 250, 0.1)] rounded-[100px]">
              <span tw="font-semibold text-base tracking-tight text-center md:text-left text-dark dark:text-light ">
                To post your thought login please
              </span>
              <Link
                to={`/join?redirect=/channels/${props.channel?._id}`}
                tw="px-[17px] h-10 flex items-center gap-[7px] bg-[#3169FA] rounded-[100px]"
              >
                <span tw="font-semibold text-base tracking-tight text-light/90">
                  Login
                </span>
              </Link>
            </div>
          </div>
        )}
        <div tw="px-8 pt-[46px] flex justify-between items-center">
          <Dropdown
            defaultValue={SortOptions['Most recents'].by}
            options={Object.keys(SortOptions)
              .map((k: string) => SortOptions[k])
              .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
              .map((item) => item.by)}
            value={selectedSortOption}
            onChange={setSelectedSortOption}
          />
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {posts.length} of Posts
          </div>
        </div>
        {posts.map((item) => (
          <PostItem
            key={item._id}
            addRefOfPost={addRefOfPost}
            channel={props.channel}
            data={item}
            editable={editable}
            handleUpdated={() => {
              if (props.channel?._id && user?._id) {
                Posting.getPinnedPosts(props.channel._id, user._id).then(
                  (res) => {
                    setPinnedPosts(res.sort(sortPosts));
                    alertInfo('The post has been pinned!');
                  }
                );
              }
            }}
            pinned={pinnedPosts.map((item) => item._id).includes(item._id)}
          />
        ))}
      </div>
      <div tw="w-full xl:col-span-1">
        <div tw="flex flex-col gap-6">
          <div tw="p-3 bg-white dark:bg-light/5 rounded-lg">
            <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              Pinned Posts
            </h3>
            <div tw="pt-4 flex flex-col gap-3 md:gap-6">
              {pinnedPosts.map((item) => (
                <PinnedPostItem
                  key={item._id}
                  gotoPost={gotoPost}
                  handleUpdated={() => {
                    if (props.channel?._id && user?._id) {
                      Posting.getPinnedPosts(props.channel._id, user._id).then(
                        (res) => {
                          setPinnedPosts(res.sort(sortPosts));
                          alertInfo('The post has been unpinned!');
                        }
                      );
                    }
                  }}
                  item={item}
                />
              ))}
            </div>
          </div>
          <div tw="p-3 bg-white dark:bg-light/5 rounded-lg">
            <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              Connected Channel Items
            </h3>
            <div tw="pt-4 grid grid-cols-2 gap-6">
              {connectedItems.map((item) => (
                <ItemCard key={item._id} data={item} />
              ))}
            </div>
            <div tw="pt-[49px] pb-2 flex justify-center">
              <Link to="/connected-items" tw="flex items-center gap-1">
                <span tw="font-semibold text-base leading-[150%] text-dark dark:text-light ">
                  View more
                </span>
                <div tw="-rotate-90 scale-75">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
              </Link>
            </div>
          </div>
          <div tw="p-3 bg-white dark:bg-light/5 rounded-lg">
            <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              Trending Channels
            </h3>
            <div tw="pt-4 flex flex-col gap-3 md:gap-6">
              {trendingChannels.map((item) => (
                <TrendingChannelItem key={item._id} item={item} user={user} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div tw="mx-auto w-full">
      <div tw="flex gap-6 flex-wrap">
        <div tw="w-full max-w-none 2xl:max-w-[calc(61% - 24px)]">
          <div tw="p-3 w-full bg-white dark:bg-light/5 rounded-lg">
            <div tw="pl-6 pr-3 py-[11px] flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap xl:flex-nowrap gap-4 md:gap-0 w-full text-center md:text-left border-dashed border-2 border-hero-purpledark dark:border-hero-bluelight bg-hero-purpledark/10 dark:bg-hero-bluelight/5 rounded-md">
              {props.joined ? (
                <>
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                    Your ticket is expired. Please extend your ticket span here.
                  </span>
                </>
              ) : (
                <>
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                    To view content join this channel.
                  </span>
                  {user ? (
                    <button
                      tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                      onClick={props.openPopup}
                    >
                      {getIcon('add', darkMode ? '#000' : '#fff')}
                      Join
                    </button>
                  ) : (
                    <Link
                      to={'/join'}
                      tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                    >
                      {getIcon('add', darkMode ? '#000' : '#fff')}
                      Join
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div tw="w-full max-w-none md:max-w-[39.1%]"></div>
      </div>
    </div>
  );
};

export default TabChannelPosts;
