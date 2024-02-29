import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Activity, Auth, Posting } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelActivityData, ChannelData, PostData, User } from '../../type';
import { shortAddress } from '../../utils';

const filterOptions = [
  'Recently created',
  'Oldest',
  // 'Today',
  // 'Yesterday',
  // 'This week',
  // 'Last week',
  // 'Last 7 days',
  // 'Last 30 days',
  // 'Last 90 days',
  // 'Last 12 months',
  // 'Last calendar year',
];

const iconByType: { [key: string]: string } = {
  Join: 'profile',
  List: 'listing',
  Pin: 'pin',
  Post: 'collection',
  Sale: 'cart',
};

const ActivityTags: { [key: string]: string } = {
  Join: 'profile',
  List: 'listing',
  Pin: 'pin',
  Sale: 'cart',
};

const ActivityItemMobile = (item: {
  activity: string;
  at: string;
  from: string;
  id: string;
  item: {
    collectionName: string;
    id: string;
    name: string;
    pic: string;
  };
  price: string;
  to: string;
  usdPrice: string;
}) => {
  const { darkMode } = useContext(UserContext);

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div tw="block py-4 md:hidden items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]">
      <div
        css={{ gridTemplateColumns: '1fr 4fr 20px' }}
        tw="grid items-center gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div tw="flex items-center gap-[9px]">
          {getIcon(ActivityTags[item.activity], darkMode ? '#fff' : '#000')}
          <span tw="text-base tracking-tight text-dark dark:text-light/90">
            {item.activity}
          </span>
        </div>
        <div tw="flex items-center gap-3.5">
          <Link to={`/item/${item.item.id}`}>
            <div
              css={{
                backgroundImage: `url(/images/collections/${item.item.pic})`,
              }}
              tw="w-[60px] h-[60px] bg-no-repeat bg-center bg-cover rounded-[7px] bg-[#D9D9D9]"
            />
          </Link>
          <div>
            <Link to={`/item/${item.item.id}`}>
              <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                {item.item.name}
              </div>
            </Link>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
              {item.item.collectionName}
            </div>
          </div>
        </div>
        <div
          css={expanded ? { transform: 'rotate(180deg)' } : {}}
          tw="w-5 duration-300"
        >
          {getIcon('dropdown', '#3169FA')}
        </div>
      </div>
      {expanded && (
        <div tw="pl-[120px] pt-6">
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.price}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
              ${item.usdPrice}
            </div>
          </div>
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.from}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">From</div>
          </div>
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.to}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">To</div>
          </div>
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.at}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">Time</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ item }: { item: ChannelActivityData }) => {
  const { darkMode } = useContext(UserContext);

  const [post, setPost] = useState<PostData | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (item.channelpost_id) {
      Posting.getById(item.channelpost_id).then((res) => {
        setPost(res);
      });
    }
  }, [item.channelpost_id]);

  useEffect(() => {
    if (item.user_id) {
      Auth.get(item.user_id).then((res) => {
        setUser(res);
      });
    }
  }, [item.user_id]);

  useEffect(() => {
    if (item.joined_user_wallet) {
      Auth.getByWallet(item.joined_user_wallet).then((res) => {
        setUser(res);
      });
    }
  }, [item.joined_user_wallet]);

  return (
    <div
      css={{ gridTemplateColumns: '1fr 4fr 1fr 2fr 2fr 0.6fr' }}
      tw="py-4 hidden md:grid gap-2 items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
    >
      <div tw="flex items-center gap-[9px]">
        {getIcon(iconByType[item.activity_type], darkMode ? '#fff' : '#000')}
        <span tw="text-base tracking-tight text-dark dark:text-light/90">
          {item.activity_type}
        </span>
      </div>
      <div tw="flex items-center gap-3.5">
        <Link
          to={
            user
              ? `/profile/${user._id}`
              : `/channels/${item.channel_id}?tab=channel-posts`
          }
        >
          <div
            css={{
              backgroundImage: user
                ? `url(${user.profile_image_url})`
                : `url(${post?.channelpost_image_url})`,
            }}
            tw="w-[60px] h-[60px] bg-no-repeat bg-center bg-cover rounded-[7px] bg-[#D9D9D9]"
          />
        </Link>
        <div>
          <Link
            to={
              user
                ? `/profile/${user._id}`
                : `/channels/${item.channel_id}?tab=channel-posts`
            }
          >
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {user ? user.name : post?._id}
            </div>
          </Link>
          <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
            {user ? shortAddress(user.walletAddress) : null}
          </div>
        </div>
      </div>
      <div>
        <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          {user ? item.price : post?.channelpost_pinned?.[0]}
        </div>
        <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
          {user ? 'USD price' : 'Pinned by'}
        </div>
      </div>
      <div>
        <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          {user || post ? new Date(item.createdAt).toLocaleDateString() : ''}
        </div>
        <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
          {user || post ? 'Date' : 'From'}
        </div>
      </div>
      <div>
        <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          {user || post ? new Date(item.createdAt).toLocaleTimeString() : ''}
        </div>
        <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
          {user || post ? 'Time' : 'To'}
        </div>
      </div>
      <div>
        <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          {user || post ? '' : new Date(item.createdAt).toLocaleString()}
        </div>
        <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
          {user || post ? '' : 'Time'}
        </div>
      </div>
    </div>
  );
};

const TabActivities = ({
  accessible,
  channel,
  joined,
  openPopup,
}: {
  accessible?: boolean;
  channel?: ChannelData;
  joined?: boolean;
  openPopup: () => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [sortBy, setSortBy] = useState<string>(filterOptions[0]);
  const [countOfPosts, setCountOfPosts] = useState<number>(0);
  const [countOfListedItems, setCountOfListedItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [activities, setActivities] = useState<ChannelActivityData[]>([]);

  useEffect(() => {
    if (channel?._id) {
      Posting.getCountById(channel?._id).then((res) => setCountOfPosts(res));
      Posting.getCountListedItemsById(channel?._id).then((res) =>
        setCountOfListedItems(res)
      );

      Activity.getByChannel({
        channel_id: channel?._id,
        limit,
        page,
        sortStr: sortBy,
        text: '',
      }).then((res) => {
        if (res) {
          setActivities(res.channelactivities);
        }
      });
    }
  }, [channel, limit, page, sortBy]);

  return accessible ? (
    <div tw="mx-auto px-4 pb-8 w-full max-w-[1392px]">
      <FilterLineWidget
        refreshMeta
        count={activities.length}
        countLabel="of performed Activities"
        sortOption={{
          onChange: setSortBy,
          options: filterOptions,
          value: sortBy,
        }}
      />
      <div tw="pt-8 flex items-center gap-6 flex-wrap">
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              136.79K
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Total volume traded
          </div>
        </div>
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('transfer', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              {channel?.itemsCount}
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Items traded
          </div>
        </div>
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('listing', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              {countOfListedItems}
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Listed Items
          </div>
        </div>
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('profile', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              {channel?.joinedUsersCount}
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Joined users
          </div>
        </div>
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('collection', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              {countOfPosts}
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Created posts
          </div>
        </div>
        <div tw="p-8 bg-white dark:bg-[#fff1] rounded-lg">
          <div tw="flex items-center gap-[7px]">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              [Formular will come]
            </span>
          </div>
          <div tw="pt-1 text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            Channel value
          </div>
        </div>
      </div>
      <div tw="px-0 pt-[46px] pb-8">
        {activities.map((item) => (
          <ActivityItem key={item._id} item={item} />
        ))}
        <div tw="pt-[60px] flex justify-center">
          <button
            tw="flex items-center gap-2.5 hover:opacity-75"
            onClick={() => setLimit((prevValue) => prevValue + 10)}
          >
            {getIcon('loading', '#3169FA')}
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light">
              Load more
            </span>
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div tw="mx-auto w-full">
      <div tw="flex gap-6 flex-wrap">
        <div tw="w-full max-w-none 2xl:max-w-[calc(61% - 24px)]">
          <div tw="p-3 w-full bg-white dark:bg-light/5 rounded-lg">
            <div tw="pl-6 pr-3 py-[11px] flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap xl:flex-nowrap gap-4 md:gap-0 w-full text-center md:text-left border-dashed border-2 border-hero-purpledark dark:border-hero-bluelight bg-hero-purpledark/10 dark:bg-hero-bluelight/5 rounded-md">
              {joined ? (
                <>
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                    Your ticket is expired. Please extend your ticket span here.
                  </span>
                </>
              ) : (
                <>
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light">
                    To view content join this channel.
                  </span>
                  {user ? (
                    <button
                      tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                      onClick={openPopup}
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

export default TabActivities;
