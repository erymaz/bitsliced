import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Auth, Channel, Ticket } from '../api/api';
import iconVerified from '../assets/svgs/icon-verified.svg';
import { getIcon } from '../components/ColoredIcon';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, TransactionStatus, User } from '../type.d';
import { nFormatter, shortAddress } from '../utils';
import { alertError } from '../utils/toast';
import ShareChannelPopup from './ChannelsPage/ShareChannelPopup';
import TabActivities from './ChannelsPage/TabActivities';
import TabChannelPosts from './ChannelsPage/TabChannelPosts';
import TabItems from './ChannelsPage/TabItems';
import TabOffers from './ChannelsPage/TabOffers';
import ClaimChannelPopup from './PurchasePopups/ClaimChannelPopup';

const socialIcons = [
  {
    icon: 'etherscan',
    link: 'https://etherscan.com',
    title: 'EtherScan',
  },
  { icon: 'website', link: 'https://google.com', title: 'Website', width: 20 },
  {
    icon: 'discord',
    link: 'https://discord.com',
    title: 'Discord',
  },
  {
    icon: 'twitter',
    link: 'https://twitter.com',
    title: 'Twitter',
  },
];

const tabs = [
  { icon: 'traitsniper', key: 'items', label: 'Items' },
  { icon: 'contract', key: 'channel-posts', label: 'Channel Posts' },
  { icon: 'activity', key: 'activities', label: 'Activities' },
  { icon: 'activity', key: 'offers', label: 'Offers', private: true },
];

const ChannelsPage = (props: { joined?: boolean }) => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setChannelToOffer,
    setCustomMenuItems,
    user,
  } = useContext(UserContext);
  const [queryParams] = useSearchParams();

  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [tab, setTab] = useState<string>(tabs[0].key);
  const [openClaimPopup, setOpenClaimPopup] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [owned, setOwned] = useState<boolean>(false);
  const [joined, setJoined] = useState<boolean>(false);
  const [hasTicket, setHasTicket] = useState<boolean>(false);
  const [expanded3dots, setExpanded3dots] = useState<boolean>(false);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);

  useEffect(() => {
    if (channel && user) {
      setOwned(channel.channel_owner === user?.walletAddress);
      setJoined(
        channel.joinedUsers?.map((item) => item._id).includes(user?._id) ??
          false
      );

      Ticket.getByOwner(user.walletAddress).then((res) => {
        if (res && channel._id) {
          const now = new Date().getTime();
          setHasTicket(
            res.filter(
              (i) =>
                i.expiredTimestamp > now &&
                i.status === TransactionStatus.CONFIRMED &&
                channel._id === i.channel_id
            ).length > 0
          );
        }
      });
    }
  }, [channel, user]);

  useEffect(() => {
    if (params.id) {
      setCustomMenuItems(
        tabs.map((item) => ({
          icon: item.icon,
          label: item.label,
          link: `/channels/${params.id}?tab=${item.key}`,
        }))
      );
      increaseLoading(true);
      Channel.getById(params.id)
        .then((res: ChannelData) => {
          if (res) {
            // console.log(res);
            setChannel(res);
            Auth.getByWallet(res.channel_creator).then((user: User) => {
              setCreator(user);
            });
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [decreaseLoading, increaseLoading, params.id, setCustomMenuItems]);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) {
      setTab(tab);
    }
  }, [queryParams]);

  return (
    <div tw="grid md:grid-cols-page-layout items-start">
      {/* ------- left bar ------- */}
      <div
        tw="md:sticky md:top-16 w-full 
md:pl-4 lg:pl-8 md:pr-3 md:pb-8 md:pt-8"
      >
        <div tw="relative w-full md:rounded-xl bg-light md:bg-white dark:bg-dark border-0 md:border-[1px] border-light/10 flex flex-col gap-6 md:gap-8 p-4 items-start">
          <div
            css={{
              backgroundImage: `url(${channel?.channel_background_image_url})`,
            }}
            tw="block md:rounded-t-xl ml-[-17px] mr-[-17px] mt-[-16px] w-[calc(100% + 34px)] h-32 bg-no-repeat bg-center bg-cover relative after:content-[''] after:absolute after:top-0 after:right-0 after:left-0 after:mx-auto after:w-full after:h-full after:bg-dark/20 after:md:rounded-t-xl after:z-20"
          ></div>
          <div tw="absolute top-3.5 left-3 font-medium text-sm text-light border-[1px] border-light bg-dark/40 backdrop-blur-md rounded-3xl px-3 py-1 z-30">
            Channel
          </div>
          <div tw="absolute top-3 right-3 flex gap-5 bg-light/80 dark:bg-dark/80 backdrop-blur-md px-3 py-1 rounded-lg z-30">
            <button
              title={'like this channel'}
              tw="flex items-center cursor-pointer"
              // onClick={() => handleFavorite()}
            >
              {getIcon(
                false /* favoriteStatus */ ? 'heart-red' : 'heart',
                darkMode ? '#fff' : '#000'
              )}
            </button>
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
                backgroundImage: `url(${channel?.channel_profile_image_url})`,
              }}
              tw="relative z-30 mt-[-80px] md:mt-[-96px] w-20 md:w-24 h-20 md:h-24 bg-white border-4 border-light md:border-white dark:border-dark bg-no-repeat bg-center bg-cover rounded-full"
            >
              <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-xl rounded-full overflow-hidden z-30">
                <source
                  srcSet={channel?.channel_profile_image_url}
                  tw="w-full h-full object-contain object-center"
                  type="image/avif"
                />
                <source
                  srcSet={channel?.channel_profile_image_url}
                  tw="w-full h-full object-contain object-center"
                  type="image/webp"
                />
                <img
                  alt=""
                  src={channel?.channel_profile_image_url}
                  tw="w-full h-full object-contain object-center"
                />
              </picture>
            </div>
            <div tw="pt-2 md:pt-4 flex items-center gap-1">
              <h1 tw="font-semibold text-xl tracking-tight leading-[150%]">
                {channel?.channel_name}
                <span tw="inline-block h-6 align-middle ml-1">
                  <img alt="verified" src={iconVerified} tw="w-5" />
                </span>
              </h1>
            </div>
            <div tw="pt-0 md:pt-1 flex flex-row items-center gap-1.5">
              <span tw="text-base tracking-tight text-gray-500">by</span>
              <Link
                to={`/profile/wallet-address/${channel?.channel_creator}`}
                tw="flex text-base tracking-tight text-dark dark:text-light/90"
              >
                <span tw="inline-block align-middle font-semibold truncate max-w-[100px] mr-1">
                  {creator?.name}
                </span>{' '}
                <span tw="inline-block align-middle font-normal text-gray-500">
                  ({shortAddress(channel?.channel_creator)})
                </span>
              </Link>
              <img alt="verified" src={iconVerified} tw="w-5" />
              {/* <Link to="/message">
                {getIcon('chat', darkMode ? '#fff' : '#000')}
              </Link> */}
            </div>
          </div>

          <div tw="flex gap-5">
            {socialIcons.map((item) => (
              <a
                key={item.title}
                href={item.link}
                rel="noreferrer"
                target="_blank"
                title={item.title}
                tw="flex items-center"
              >
                {getIcon(item.icon, darkMode ? '#fff' : '#000')}
              </a>
            ))}
          </div>

          <div tw="grid grid-cols-4 justify-start items-start gap-4 md:gap-6">
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(channel?.itemsCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Listed Items
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(channel?.activeUsersCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Active Users
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(channel?.joinedUsersCount)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Users Joined
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(channel?.channel_ticket_price)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Ticket Price
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
                          ? 'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.27) 53.16%, rgba(255, 255, 255, 0) 100%)'
                          : 'linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0.27) 53.16%, rgba(0, 0, 0, 0) 100%)',
                        color: 'transparent',
                        maxHeight: 85,
                      }
                }
                tw="text-[14px] md:text-base tracking-tight leading-[150%] whitespace-pre-wrap duration-300"
              >
                {channel?.channel_description}
              </p>
              <button
                tw="text-[14px] text-hero-purpledark dark:text-hero-bluelight"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '- Less' : '+ More'}
              </button>
            </div>
          </div>
          <div tw="mx-auto w-full">
            {channel?.joinedUsers && channel.joinedUsers.length > 0 && (
              <div tw="flex items-center">
                <div tw="flex items-center">
                  {channel.joinedUsers.slice(0, 3).map((member) => (
                    <div
                      key={member._id}
                      css={{
                        backgroundImage: `url(${member.profile_image_url})`,
                      }}
                      title={member.name}
                      tw="mr-[-16px] w-12 h-12 border-4 bg-dark/10 dark:bg-light/5 bg-no-repeat bg-center bg-cover backdrop-blur-lg border-light md:border-white dark:border-dark rounded-full"
                    />
                  ))}
                </div>
                <div tw="ml-5 text-sm tracking-tight leading-[150%] text-gray-500">
                  Joined by{' '}
                  <span tw="font-medium text-sm text-black dark:text-light">
                    {channel.joinedUsers[0].name}
                  </span>
                  {channel.joinedUsers.length > 1 && (
                    <>
                      , and{' '}
                      <span tw="font-medium text-sm text-black dark:text-light">
                        {channel.joinedUsers.length - 1} others
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div tw="mx-auto w-full flex flex-wrap items-center gap-4">
            {channel?.channel_owner !== user?.walletAddress &&
              !channel?.joinedUsers
                ?.map((item) => item._id)
                .includes(user?._id) &&
              (user ? (
                <>
                  <button
                    tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light font-medium px-3.5 text-light dark:text-dark"
                    onClick={() => setOpenClaimPopup(true)}
                  >
                    Join {channel?.channel_name}
                  </button>
                </>
              ) : (
                <Link
                  to={`/join?redirect=/channels/${params.id}`}
                  tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light font-medium px-3.5 text-light dark:text-dark"
                >
                  Join {channel?.channel_name}
                </Link>
              ))}
            {user?.walletAddress === channel?.channel_owner && (
              <Link
                to={`/create/edit-channel/${params?.id}`}
                tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
              >
                {getIcon('edit', darkMode ? '#fff' : '#000')}Edit Channel
              </Link>
            )}
            {user?.walletAddress !== channel?.channel_owner &&
              channel?.is_accept_offers && (
                <button
                  tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
                  onClick={
                    user
                      ? () => setChannelToOffer(channel as Partial<ChannelData>)
                      : () => {
                          alertError('To make offer, join please.');
                          navigate(`/join?redirect=/channels/${channel?._id}`);
                        }
                  }
                >
                  Make Channel Offer
                </button>
              )}

            {/* <button tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5">
        Make Collection Offer
      </button> */}
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
              (item.private &&
                user?.walletAddress === channel?.channel_owner) ||
              !item.private ? (
                <Link
                  key={item.key}
                  css={
                    item.key === tab
                      ? {
                          borderColor: darkMode ? '#fff' : '#000',
                          color: darkMode ? '#fff' : '#000',
                        }
                      : {
                          borderColor: 'transparent',
                          color: darkMode ? '#fff8' : '#0008',
                        }
                  }
                  to={`/channels/${channel?._id}?tab=${item.key}`}
                  tw="pb-3.5 font-normal text-base tracking-tight leading-[150%] border-b-2 whitespace-nowrap cursor-pointer duration-300"
                  // onClick={() => setTab(item.key)}
                >
                  {item.label}
                </Link>
              ) : null
            )}
          </div>
        </div>
        <div tw="py-8 w-full border-t-2 border-dark/10 dark:border-light/5">
          {tab === 'items' && (
            <TabItems
              accessible={owned || hasTicket}
              channel={channel ?? undefined}
              channelName={channel?.channel_name}
              items={channel?.items}
              joined={joined || owned || hasTicket}
              openPopup={() => setOpenClaimPopup(true)}
            />
          )}
          {tab === 'channel-posts' && (
            <TabChannelPosts
              accessible={owned || hasTicket}
              channel={channel ?? undefined}
              joined={joined || owned || hasTicket}
              openPopup={() => setOpenClaimPopup(true)}
            />
          )}
          {tab === 'activities' && (
            <TabActivities
              accessible={owned || hasTicket}
              channel={channel ?? undefined}
              joined={joined || owned || hasTicket}
              openPopup={() => setOpenClaimPopup(true)}
            />
          )}
          {tab === 'offers' &&
            channel?.channel_owner === user?.walletAddress && (
              <TabOffers channel={channel ?? undefined} />
            )}
        </div>
        {channel && creator && (
          <ClaimChannelPopup
            channel={channel}
            creator={creator}
            isOpen={openClaimPopup}
            onClose={() => setOpenClaimPopup(false)}
          />
        )}
        {showSharePopup && channel && (
          <ShareChannelPopup
            channel={channel}
            onClose={() => setShowSharePopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChannelsPage;
