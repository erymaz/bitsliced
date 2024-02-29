import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Notification } from '../api/api';
import { Auth, Channel, Follows, Nft } from '../api/api';
import iconVerified from '../assets/svgs/icon-verified.svg';
import { getIcon } from '../components/ColoredIcon';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, NotificationData, User } from '../type.d';
import { nFormatter, shortAddress } from '../utils';
import { alertError, alertInfo } from '../utils/toast';
import ShareProfilePopup from './ProfilePage/ShareProfilePopup';
import TabActivity from './ProfilePage/TabActivity';
import TabChannelTickets from './ProfilePage/TabChannelTickets';
import TabCollections from './ProfilePage/TabCollections';
import TabCreatedChannels from './ProfilePage/TabCreatedChannels';
import TabFavorited from './ProfilePage/TabFavorited';
import TabItems from './ProfilePage/TabItems';
import TabNotifications from './ProfilePage/TabNotifications';

const socialIcons = [
  {
    icon: 'website',
    key: 'website_link',
    title: 'Website',
  },
  {
    icon: 'discord',
    key: 'discord_link',
    title: 'Discord',
  },
  {
    icon: 'twitter',
    key: 'twitter_link',
    title: 'Twitter',
  },
];

const tabs = [
  { icon: 'slices', key: 'items', label: 'Items' },
  { icon: 'collection', key: 'collections', label: 'Collections' },
  { icon: 'listing', key: 'channel-tickets', label: 'Channel Tickets' },
  { icon: 'channel', key: 'created-channels', label: 'Created Channels' },
  { icon: 'heart', key: 'favorited', label: 'Favorited' },
  { icon: 'activity', key: 'activity', label: 'Activity' },
  {
    icon: 'notification',
    key: 'notifications',
    label: 'Notifications',
    private: true,
  },
];

const ProfilePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();

  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setCustomMenuItems,
    user,
  } = useContext(UserContext);

  const [userData, setUserData] = useState<User | null>(null);
  const [tab, setTab] = useState<string>(tabs[0].key);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [createdCount, setCreatedCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [channelsCount, setChannelsCount] = useState<number>(0);
  const [notificationsWeekly, setNotificationsWeekly] = useState<
    NotificationData[]
  >([]);
  const [notificationsMonthly, setNotificationsMonthly] = useState<
    NotificationData[]
  >([]);
  const [notificationsEarly, setNotificationsEarly] = useState<
    NotificationData[]
  >([]);
  const [unread, setUnread] = useState<number>(0);
  const [expanded3dots, setExpanded3dots] = useState<boolean>(false);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);

  useEffect(() => {
    if (params.id) {
      Notification.getByUser(params.id).then((res) => {
        if (res) {
          setNotificationsWeekly(res.thisweek);
          setNotificationsMonthly(res.thisMonth);
          setNotificationsEarly(res.earlier);
          setUnread(
            res.thisweek.filter((item) => item.unread).length +
              res.thisMonth.filter((item) => item.unread).length +
              res.earlier.filter((item) => item.unread).length
          );
        }
      });
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      setCustomMenuItems(
        tabs.map((item) => ({
          icon: item.icon,
          label: `My ${item.label}`,
          link: `/profile/${params.id}?tab=${item.key}`,
        }))
      );

      increaseLoading(true);
      Auth.get(params.id)
        .then((res) => {
          if (res) {
            setUserData(res);
          }
        })
        .catch((e) => {
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));

      Follows.getFollowersCount(params.id).then((res) => {
        setFollowersCount(res);
      });
      Follows.getFollowingCount(params.id).then((res) => {
        setFollowingCount(res);
      });
    }
  }, [decreaseLoading, increaseLoading, params.id, setCustomMenuItems]);

  useEffect(() => {
    if (user?._id && params.id && user._id !== params.id) {
      Follows.create({ fromId: user._id, toId: params.id });
    }
  }, [user?._id, params.id]);

  useEffect(() => {
    if (userData?.walletAddress) {
      Nft.countByOwner(userData.walletAddress)
        .then((res: number) => {
          setCollectedCount(res);
        })
        .catch((e) => {
          console.error(e);
        });
      Nft.countByCreator(userData.walletAddress)
        .then((res: number) => {
          setCreatedCount(res);
        })
        .catch((e) => {
          console.error(e);
        });
      Channel.getByCreator(userData.walletAddress)
        .then((res: ChannelData[]) => {
          if (res) {
            setChannelsCount(res.length);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [userData?.walletAddress]);

  useEffect(() => {
    if (params.addr) {
      increaseLoading(true);
      Auth.getByWallet(params.addr)
        .then((res) => {
          if (res) {
            setUserData(res);
          }
        })
        .catch((e) => {
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [decreaseLoading, increaseLoading, params.addr]);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) {
      setTab(tab);
    }
  }, [queryParams]);

  useEffect(() => {
    if (userData) {
      setExpanded(false);
    }
  }, [userData]);

  return (
    <div tw="grid md:grid-cols-page-layout place-items-start">
      {/* ------- left bar ------- */}
      <div
        tw="md:sticky md:top-16 w-full 
md:pl-4 lg:pl-8 md:pr-3 md:pb-8 md:pt-8"
      >
        <div tw="relative w-full md:rounded-xl bg-light md:bg-white dark:bg-dark border-0 md:border-[1px] border-light/10 flex flex-col gap-6 md:gap-8 p-4 items-start">
          <div
            css={{
              backgroundImage: userData?.background_image_url
                ? `url(${userData.background_image_url})`
                : 'url(/images/profile/profile1-hero.jpg)',
            }}
            tw="block md:rounded-t-xl ml-[-17px] mr-[-17px] mt-[-16px] w-[calc(100% + 34px)] h-32 bg-no-repeat bg-center bg-cover relative after:content-[''] after:absolute after:top-0 after:right-0 after:left-0 after:mx-auto after:w-full after:h-full after:bg-dark/20 after:md:rounded-t-xl after:z-20"
          ></div>
          <div tw="absolute top-3.5 left-3 font-medium text-sm text-light border-[1px] border-light bg-dark/40 backdrop-blur-md rounded-3xl px-3 py-1 z-30">
            Profile
          </div>
          <div tw="absolute top-3 right-3 flex gap-5 bg-light/80 dark:bg-dark/80 backdrop-blur-md px-3 py-1 rounded-lg z-30">
            <button
              tw="flex items-center"
              onClick={() => setShowSharePopup(true)}
            >
              {getIcon('share', darkMode ? '#fff' : '#000')}
            </button>
            <button
              title={'like this collection'}
              tw="flex items-center"
              onClick={() => setExpanded3dots(true)}
            >
              {getIcon('more', darkMode ? '#fff' : '#000')}
            </button>
            {expanded3dots && (
              <>
                <div
                  tw="fixed left-0 top-0 w-full h-full z-30"
                  onClick={() => setExpanded3dots(false)}
                />
                <ul
                  css={{
                    boxShadow: darkMode
                      ? '0px 4px 14px rgba(255, 255, 255, 0.1)'
                      : '0px 4px 14px rgba(0, 0, 0, 0.1)',
                  }}
                  tw="absolute right-0 top-[34px] bg-light/80 dark:bg-dark/80 rounded-[7px] z-40"
                >
                  <li
                    tw="px-4 h-[40px] flex items-center gap-[7px] cursor-pointer"
                    onClick={() => setExpanded3dots(false)}
                  >
                    <div tw="scale-75">
                      {getIcon('flag', darkMode ? '#fff' : '#000')}
                    </div>
                    <span tw="text-[17px] text-dark dark:text-light">
                      Report
                    </span>
                  </li>
                </ul>
              </>
            )}
          </div>
          <div>
            <div
              css={{
                backgroundImage: `url(${
                  userData?.profile_image_url ?? '/svgs/default-user.svg'
                })`,
              }}
              tw="relative z-30 mt-[-80px] md:mt-[-96px] w-20 md:w-24 h-20 md:h-24 bg-white border-4 border-light md:border-white dark:border-dark bg-no-repeat bg-center bg-cover rounded-full"
            />
            <div tw="pt-2 md:pt-4">
              <h1 tw="font-semibold text-xl tracking-tight">
                {userData?.name ?? 'Noname'}
                <span tw="inline-block h-6 align-middle ml-1">
                  <img alt="verified" src={iconVerified} tw="w-5" />
                </span>
              </h1>
            </div>
            <div tw="pt-0 md:pt-1 flex flex-col items-start gap-1.5">
              <span tw="text-sm md:text-base tracking-tight text-gray-500">
                Connected Wallet
              </span>
              <div tw="flex gap-1">
                <CopyToClipboard
                  text={userData?.walletAddress ?? ''}
                  onCopy={() => alertInfo('Copied.')}
                >
                  <div>
                    <div
                      title={userData?.walletAddress}
                      tw="text-sm md:text-base tracking-tight text-dark dark:text-light/90 cursor-pointer px-3 py-1 bg-dark/10 dark:bg-light/5 rounded-lg"
                    >
                      ({shortAddress(userData?.walletAddress)})
                      <span tw="pl-2 w-full h-full text-dark/30 dark:text-light/20 font-medium">
                        Copy
                      </span>
                    </div>
                  </div>
                </CopyToClipboard>
                <img alt="verified" src={iconVerified} tw="w-5" />
              </div>
            </div>
          </div>

          <div tw="flex gap-5">
            {socialIcons.map((item) => (
              <a
                key={item.title}
                href={userData ? (userData as any)[item.key] : '#'}
                rel="noreferrer"
                target="_blank"
                title={item.title}
                tw="flex items-center"
              >
                {getIcon(item.icon, darkMode ? '#fff' : '#000')}
              </a>
            ))}
          </div>

          <div tw="grid grid-cols-3 xs:grid-cols-5 md:grid-cols-3 justify-start items-start gap-4">
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(collectedCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Collected
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(createdCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Created
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(followersCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Followers
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(followingCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Following
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(channelsCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Channels
              </div>
            </div>
          </div>
          <div tw="mx-auto w-full">
            <div tw="max-w-[740px]">
              <p
                css={
                  expanded
                    ? { color: darkMode ? '#fff' : '#000' }
                    : {
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        backgroundImage: darkMode
                          ? 'linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.27) 53.16%, rgba(0, 0, 0, 0) 100%)'
                          : 'linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.27) 53.16%, rgba(0, 0, 0, 0) 100%)',
                        color: 'transparent',
                        maxHeight: 51,
                      }
                }
                tw="text-[14px] md:text-base tracking-tight leading-[150%] whitespace-pre-wrap duration-300"
              >
                {userData?.description}
              </p>
              <button
                tw="text-[14px] text-hero-purpledark dark:text-hero-bluelight"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '- Less' : '+ More'}
              </button>
            </div>
          </div>
          <div tw="mx-auto w-full flex items-center gap-4">
            {user?._id === userData?._id ? (
              <button
                className={
                  userData?.profile_image_url ? '' : 'hightlight-scaling'
                }
                tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light font-medium px-3.5 text-light dark:text-dark cursor-pointer"
                onClick={() => {
                  navigate(`/profile/${params?.id}/edit`);
                }}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light font-medium px-3.5 text-light dark:text-dark cursor-pointer">
                  Follow
                </button>
                <button tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light font-medium px-3.5 text-light dark:text-dark cursor-pointer">
                  Invite to Channel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* ------- right bar ------- */}
      <div tw="px-4 lg:pr-8 lg:pl-3 md:min-h-[calc(100vh + 250px)] w-full overflow-x-hidden">
        <div tw="mx-auto pt-8 w-full">
          <div
            className="no-scrollbar"
            tw="px-0 md:px-[14px] flex justify-start items-center gap-8 md:gap-[64px] overflow-x-auto"
          >
            {tabs.map((item) =>
              (item.private && user?._id === userData?._id) || !item.private ? (
                <Link
                  key={item.key}
                  css={
                    item.key === tab
                      ? {
                          borderColor: darkMode ? '#fff' : '#000',
                        }
                      : {
                          borderColor: 'transparent',
                        }
                  }
                  to={`/profile/${userData?._id}?tab=${item.key}`}
                  tw="pb-3.5 flex items-center gap-[7px] border-b-2 cursor-pointer"
                  // onClick={() => setTab(item.key)}
                >
                  <span
                    css={
                      item.key === tab
                        ? {
                            color: darkMode ? '#fff' : '#000',
                          }
                        : {
                            color: darkMode ? '#fff8' : '#0008',
                          }
                    }
                    tw="font-normal text-base tracking-tight leading-[150%] whitespace-nowrap"
                  >
                    {item.label}
                  </span>
                  {item.key === 'notifications' && (
                    <span tw="px-3.5 h-6 flex items-center text-sm tracking-tight text-light/90 bg-[#DD3939] rounded-3xl">
                      {unread}
                    </span>
                  )}
                </Link>
              ) : null
            )}
          </div>
        </div>
        <div tw="py-8 w-full border-t-2 border-dark/10 dark:border-light/5">
          {tab === 'items' && <TabItems user={userData} />}
          {tab === 'collections' && <TabCollections selectedUser={userData} />}
          {tab === 'created-channels' && (
            <TabCreatedChannels creator={userData} />
          )}
          {tab === 'channel-tickets' && <TabChannelTickets user={userData} />}
          {tab === 'favorited' && <TabFavorited />}
          {tab === 'activity' && <TabActivity />}
          {tab === 'notifications' && (
            <TabNotifications
              early={notificationsEarly}
              monthly={notificationsMonthly}
              weekly={notificationsWeekly}
            />
          )}
        </div>
      </div>
      {showSharePopup && userData && (
        <ShareProfilePopup
          profile={userData}
          onClose={() => setShowSharePopup(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
