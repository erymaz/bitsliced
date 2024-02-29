import 'twin.macro';

import crypto from 'crypto-js';
import { useContext, useEffect, useState } from 'react';
// import { isChrome, isEdge, isFirefox } from 'react-device-detect';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Auth, Channel, Collection, Nft } from '../api/api';
import imgLogoDark from '../assets/svgs/logo-dark.svg';
import imgLogoLight from '../assets/svgs/logo-light.svg';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, CollectionData, NftData } from '../type';
import { getMimeType, nFormatter, parseJwt } from '../utils';
import { getTokenInfoByAddress } from '../utils/tokens';
import { useWeb3Provider } from '../utils/web3/useWeb3Provider';
import { getIcon } from './ColoredIcon';
import MenuIcon from './MenuIcon';
import SwitchAppearance from './SwitchAppearance';
import WalletPopup from './WalletPopup';

export const HomeLink = { link: '/', title: 'Home' };
export const navMenu = [
  { link: '/explore', title: 'Explore' },
  { link: '/channels', title: 'Channels' },
  { link: '/sliced-nft', title: 'Sliced NFT' },
  { /* hasChildren: true,*/ link: '/earn', title: 'Earn' },
  { link: '/create', title: 'Create' },
  { link: '/help', title: 'Help' },
];

export const navMenuLoggedIn = [
  { link: '/verify-email', title: 'Verify Email' },
  { link: '/profile', title: 'Profile' },
];

const menuData = [
  {
    icon: 'profile',
    label: 'Profile',
    link: (uid?: string) => `/profile/${uid}`,
  },
  {
    icon: 'inbox',
    label: 'Notifications',
    link: (uid?: string) => `/profile/${uid}?tab=notifications`,
  },
  {
    icon: 'heart',
    label: 'Favorites',
    link: (uid?: string) => `/profile/${uid}?tab=favorited`,
  },
  {
    icon: 'views',
    label: 'Watchlist',
    link: (uid?: string) => `/profile/${uid}?tab=items`,
  },
  {
    icon: 'collection',
    label: 'My Collections',
    link: (uid?: string) => `/profile/${uid}?tab=collections`,
  },
  {
    icon: 'alert',
    label: 'My Channels',
    link: (uid?: string) => `/profile/${uid}?tab=created-channels`,
  },
  {
    icon: 'settings',
    label: 'Settings',
    link: (uid?: string) => `/profile/${uid}/edit`,
  },
];

export const socialLink = [
  {
    icon: 'discord',
    link: 'https://discord.gg/bitsliced',
    title: 'Discord',
    width: 18,
  },
  {
    icon: 'twitter',
    link: 'https://twitter.com/bitsliced',
    title: 'Twitter',
    width: 20,
  },
  {
    icon: 'telegram',
    link: 'https://t.me/bitsliced',
    title: 'Telegram',
    width: 17,
  },
  {
    icon: 'instagram',
    link: 'https://instagram.com/bitsliced',
    title: 'Instagram',
    width: 19,
  },
  {
    icon: 'linkedin',
    link: 'https://linkedin.com/bitsliced',
    title: 'LinkedIn',
    width: 17,
  },
  {
    icon: 'medium',
    link: 'https://bitsliced.medium.com/',
    title: 'Medium',
    width: 17,
  },
];

export const NftImage = (props: { image: string }) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (props.image) {
      setMimeType(getMimeType(props.image));
    }
  }, [props.image]);

  return (
    <div
      css={{
        backgroundImage: mimeType.startsWith('video')
          ? 'none'
          : `url(${props.image})`,
      }}
      tw="relative w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-md overflow-hidden"
    >
      {mimeType.startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm z-10 rounded-md"
        >
          <source src={props.image} type={mimeType} />
        </video>
      ) : (
        <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10 rounded-md">
          <source
            srcSet={props.image}
            tw="w-full h-full object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={props.image}
            tw="w-full h-full object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={props.image}
            tw="w-full h-full object-contain object-center"
          />
        </picture>
      )}
    </div>
  );
};

const Header = ({
  menuOpened,
  onToggleMenu,
}: {
  menuOpened: boolean;
  onToggleMenu: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    authData,
    darkMode,
    logout,
    // customMenuItems,
    setAuthData,
    setDarkMode,
    setUser,
    user,
    walletType,
  } = useContext(UserContext);

  const { account, activate, chainId, deactivate } = useWeb3Provider();

  const [shownMenu, setShownMenu] = useState<boolean>(false);
  const [shownSearchWidget, setShownSearchWidget] = useState<boolean>(false);
  const [showWalletPopup, setShowWalletPopup] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchItems, setSearchItems] = useState<NftData[]>([]);
  const [searchChannels, setSearchChannels] = useState<ChannelData[]>([]);
  const [searchCollections, setSearchCollections] = useState<CollectionData[]>(
    []
  );

  useEffect(() => {
    const storedtAccount = window.localStorage.getItem('account');
    if (
      account &&
      storedtAccount &&
      account !== storedtAccount &&
      chainId === 5 &&
      (walletType === 'METAMASK' || walletType === 'WALLETCONNECT')
    ) {
      window.localStorage.removeItem('accessToken');
      setAuthData(undefined);
      setUser(undefined);
      deactivate();
      activate(walletType);
      const password = crypto
        .SHA512(account + process.env.REACT_APP_API_PASSWORD)
        .toString(crypto.enc.Base64);

      Auth.login({
        password: password,
        username: account,
      })
        .then((res) => {
          if (res?.access_token) {
            window.localStorage.setItem('accessToken', res.access_token);
            const decoded = parseJwt(res.access_token);
            setAuthData({ ...res, user: decoded });
            Auth.get(decoded.userId)
              .then((res) => {
                setUser(res);
                // store account, chainId, walletType to localStorage
                window.localStorage.setItem('account', account);
              })
              .catch((e) => console.error(e));
          }
        })
        .catch((e) => {
          console.error(e);
        });
      // navigate(`/join?redirect=${location.pathname}`);
    }
  }, [account, chainId, walletType]);

  useEffect(() => {
    if (!account && authData && walletType) {
      activate(walletType);
    }
  }, [account, authData, walletType, activate]);

  useEffect(() => {
    if (searchKeyword.trim().length > 0) {
      Nft.search({
        categories: [],
        collection_ids: [],
        limit: 50,
        name: searchKeyword,
        owner: '',
        page: 1,
        sortStr: 'Trending',
      }).then((res) => {
        if (res?.nfts) {
          setSearchItems(res.nfts);
        }
      });
      Channel.search({
        categories: [],
        channel_creator: '',
        channel_joined: '',
        channel_name: searchKeyword,
        channel_owner: '',
        limit: 50,
        page: 1,
        sortStr: 'Recently created',
      }).then((res) => {
        if (res?.channels) {
          setSearchChannels(res.channels);
        }
      });
      Collection.search({
        categories: [],
        collection_name: searchKeyword,
        limit: 50,
        page: 1,
        sortStr: 'Trending',
      }).then((res) => {
        if (res?.collections) {
          setSearchCollections(res.collections);
        }
      });
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (!user) {
      const access_token = window.localStorage.getItem('accessToken');
      if (access_token) {
        const decoded = parseJwt(access_token);
        setAuthData({ access_token, user: decoded });
        Auth.get(decoded.userId)
          .then((res) => {
            setUser(res);
          })
          .catch((e) => console.error(e));
      }
    }
  }, [user, setAuthData, setUser]);

  return (
    <>
      {/* {isChrome || isEdge || isFirefox ? null : (
        <div tw="px-8 w-full min-h-[65px] flex items-center gap-4 font-medium bg-[#FFA92C]">
          <img alt="info" src={iconInfo} width={24} />
          It looks like you're using an unsupported browser. To use Metamask,
          please switch to Chrome or Firefox.
        </div>
      )} */}
      <header tw="h-16 xl:h-20 px-4 lg:px-8 w-full sticky top-0 border-b-[1px] border-dark/10 dark:border-light/10 bg-light/90 dark:bg-dark/90 backdrop-blur-lg z-50">
        <div tw="w-full h-full flex justify-between items-center space-x-5">
          <Link to="/">
            <img
              alt="logo"
              src={darkMode ? imgLogoDark : imgLogoLight}
              tw="max-w-[88px] md:max-w-[117px]"
            />
          </Link>
          <div tw="px-4 hidden xl:flex items-center gap-8">
            {navMenu.map((item) => (
              <Link
                key={item.link}
                to={item.link}
                tw="relative flex items-center gap-1.5"
              >
                <span
                  css={{
                    color: location?.pathname.startsWith(item.link)
                      ? darkMode
                        ? '#fff'
                        : '#000'
                      : '#8A8A8A',
                    textOverflow: 'ellipsis',
                  }}
                  tw="min-w-min md:text-xs lg:text-base leading-[150%] tracking-tight whitespace-nowrap overflow-hidden"
                >
                  {item.title}
                </span>
                {/* {!!item.hasChildren && (
                  getIcon('dropdown', '#8A8A8A')
                )} */}
                {location?.pathname.startsWith(item.link) && (
                  <span tw="absolute w-full h-[2px] left-1/2 translate-x-[-50%] bottom-[-29px] bg-black dark:bg-white rounded-tl-full rounded-tr-full" />
                )}
              </Link>
            ))}
          </div>
          <div tw="w-auto md:w-full flex justify-end items-center gap-6">
            <div tw="w-full relative flex items-center gap-3">
              <div tw="px-3 lg:px-4 py-2 w-full h-10 hidden md:flex items-center bg-white/50 dark:bg-light/20 border-[1px] border-dark/10 rounded-lg ">
                {getIcon('search', darkMode ? '#fff8' : '#0008')}
                <input
                  placeholder="Search"
                  tw="pl-1 w-full text-[14px] lg:text-base border-none outline-none text-dark dark:text-light bg-transparent"
                  type="search"
                  value={searchKeyword}
                  onBlur={() => setTimeout(() => setSearchKeyword(''), 500)}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <button
                tw="block md:hidden cursor-pointer"
                onClick={() => setShownSearchWidget(true)}
              >
                {getIcon('search', darkMode ? '#fff8' : '#0008')}
              </button>
              {(shownSearchWidget || searchKeyword.trim().length > 0) && (
                <div tw="md:hidden fixed left-0 top-0 w-full px-4 h-16 grid grid-cols-[48px 1fr] border-b-[1px] border-dark/10 dark:border-light/10 items-center justify-between gap-4 bg-light dark:bg-dark z-40">
                  <button
                    tw="w-full h-12 bg-white dark:bg-[#1f1f22] rotate-90 inline-flex items-center justify-center rounded-lg"
                    onClick={() => setShownSearchWidget(false)}
                  >
                    {getIcon('dropdown', darkMode ? '#fff8' : '#0008')}
                  </button>
                  <div
                    tw="px-4 w-full h-12 flex items-center gap-2 bg-white dark:bg-[#1f1f22] rounded-lg z-50 box-border"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {getIcon('search', darkMode ? '#fff8' : '#0008')}
                    <input
                      placeholder="Search"
                      tw="w-full border-none outline-none bg-white dark:bg-[#1f1f22] text-dark dark:text-light"
                      type="search"
                      value={searchKeyword}
                      onBlur={() => setTimeout(() => setSearchKeyword(''), 500)}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {searchKeyword.trim().length > 0 && (
                <div tw="fixed md:absolute left-0 top-16 md:top-14 xl:top-16 w-full h-[calc(100vh - 64px)] md:max-h-[calc(100vh - 160px)] bg-light md:bg-white dark:bg-dark md:border-[1px] md:border-dark/10 md:dark:border-light/10 md:rounded-md overflow-y-auto z-50">
                  <ul>
                    {searchItems.map((item) => (
                      <li
                        key={`searched-nft-${item._id}`}
                        tw="px-2.5 py-2 border-b border-[#0001] dark:border-[#fff1] hover:bg-[#0001] hover:dark:bg-[#fff1] cursor-pointer"
                        onClick={() => setSearchKeyword('')}
                      >
                        <Link
                          to={`/item/${item._id}`}
                          tw="flex items-center justify-between gap-2"
                        >
                          <div tw="flex items-center gap-2">
                            <NftImage image={item.image} />
                            <div>
                              <div tw="font-medium text-[12px] leading-[120%] text-dark dark:text-light/90">
                                {item.name}
                              </div>
                              <div tw="flex items-center gap-[2px]">
                                <span tw="text-[12px] text-dark dark:text-light/90">
                                  Price:
                                </span>
                                <div tw="scale-75">
                                  {item.quoteToken
                                    ? getIcon(
                                        getTokenInfoByAddress(item.quoteToken)
                                          ?.icon,
                                        darkMode ? '#fff' : '#000'
                                      )
                                    : '-'}
                                </div>
                                <span tw="font-semibold text-[12px] text-dark dark:text-light/90">
                                  {nFormatter(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div tw="px-2 h-8 font-semibold text-xs flex items-center text-light/90 bg-[#522546] bg-gradient-to-r from-[#88304E] via-[#522546] to-[#311D3F] rounded-md">
                            NFT
                          </div>
                        </Link>
                      </li>
                    ))}
                    {searchChannels.map((item) => (
                      <li
                        key={`searched-nft-${item._id}`}
                        tw="px-2.5 py-2 border-b border-[#0001] dark:border-[#fff1] hover:bg-[#0001] hover:dark:bg-[#fff1] cursor-pointer"
                        onClick={() => setSearchKeyword('')}
                      >
                        <Link
                          to={`/channels/${item._id}`}
                          tw="flex items-center justify-between gap-2"
                        >
                          <div tw="flex items-center gap-2">
                            <NftImage image={item.channel_profile_image_url} />
                            <div>
                              <div tw="font-medium text-[12px] leading-[120%] text-dark dark:text-light/90">
                                {item.channel_name}
                              </div>
                              <div tw="flex items-center gap-[2px]">
                                <span tw="text-[12px] text-dark dark:text-light/90">
                                  Ticket price:
                                </span>
                                <div tw="scale-75">
                                  {getIcon(
                                    'sliced',
                                    darkMode ? '#fff' : '#000'
                                  )}
                                </div>
                                <span tw="font-semibold text-[12px] text-dark dark:text-light/90">
                                  {nFormatter(item.channel_ticket_price)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div tw="px-2 h-8 font-semibold text-xs flex items-center text-light/90 bg-[#27496D] bg-gradient-to-r from-[#142850] via-[#27496D] to-[#0C7B93] rounded-md">
                            Channel
                          </div>
                        </Link>
                      </li>
                    ))}
                    {searchCollections.map((item) => (
                      <li
                        key={`searched-nft-${item._id}`}
                        tw="px-2.5 py-2 border-b border-[#0001] dark:border-[#fff1] hover:bg-[#0001] hover:dark:bg-[#fff1] cursor-pointer"
                        onClick={() => setSearchKeyword('')}
                      >
                        <Link
                          to={`/collection/${item._id}`}
                          tw="flex items-center justify-between gap-2"
                        >
                          <div tw="flex items-center gap-2">
                            <NftImage
                              image={item.collection_profile_image_url}
                            />
                            <div>
                              <div tw="font-medium text-[12px] leading-[120%] text-dark dark:text-light/90">
                                {item.collection_name}
                              </div>
                              <div tw="flex items-center gap-[2px]">
                                <span tw="text-[12px] text-dark dark:text-light/90">
                                  Fee:
                                </span>
                                <div tw="scale-75">
                                  {getIcon(
                                    'sliced',
                                    darkMode ? '#fff' : '#000'
                                  )}
                                </div>
                                <span tw="font-semibold text-[12px] text-dark dark:text-light/90">
                                  {nFormatter(item.collection_fee)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div tw="px-2 h-8 font-semibold text-xs flex items-center text-light/90 bg-[#5E8B7E] bg-gradient-to-r from-[#2F5D62] via-[#5E8B7E] to-[#669689] rounded-md">
                            Collection
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div tw="px-1 flex justify-between items-center">
                <SwitchAppearance
                  value={darkMode}
                  onChange={(value: boolean) => {
                    setDarkMode(value);
                  }}
                />
              </div>
              <div
                tw="relative min-w-[38px] h-[38px] flex justify-center items-center rounded-full cursor-pointer border-2 border-hero-purpledark dark:border-hero-bluelight"
                onClick={() => setShowWalletPopup(!showWalletPopup)}
              >
                <span tw="rounded-full w-full h-full flex justify-center items-center">
                  {getIcon('wallet', darkMode ? '#fff' : '#000')}
                  {showWalletPopup && (
                    <WalletPopup
                      handleClose={() => setShowWalletPopup(false)}
                    />
                  )}
                </span>
              </div>
            </div>
            <div tw="items-center hidden sm:flex">
              <ul tw="flex items-center">
                {authData ? (
                  <li tw="relative h-[44px]">
                    <button
                      tw="h-[44px] flex items-center gap-2 cursor-pointer"
                      onClick={() => setShownMenu(!shownMenu)}
                    >
                      <div tw="w-[1px] h-full bg-black/20 dark:bg-white/20 mr-4"></div>
                      <div
                        css={{
                          backgroundImage: `url(${
                            user?.profile_image_url ?? '/svgs/default-user.svg'
                          })`,
                        }}
                        tw="w-[44px] min-w-[44px] h-[44px] bg-[#D9D9D9] bg-no-repeat bg-center bg-cover rounded-full"
                      />
                      <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90 max-w-[150px] whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {user?.name ?? 'Noname'}
                      </span>
                      {getIcon('dropdown', darkMode ? '#fff8' : '#0008')}
                    </button>
                    {shownMenu && ( // user custom menu
                      <>
                        <div
                          tw="fixed left-0 top-0 w-full h-[100vh] z-30"
                          onClick={() => setShownMenu(false)}
                        />
                        <ul
                          className="dropdown-list"
                          tw="absolute top-14 xl:top-16 right-0 min-w-[250px] text-center bg-white dark:bg-dark rounded-lg shadow-lg border-[1px] border-dark/10 dark:border-light/10 overflow-hidden z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShownMenu(false);
                          }}
                        >
                          {menuData.map((item) => (
                            <li
                              key={item.label}
                              tw="border-b border-[rgba(0, 0, 0, 0.15)]"
                            >
                              <Link
                                to={item.link(authData.user?.userId)}
                                tw="px-4 h-[54px] flex items-center gap-2 hover:bg-[#0002] hover:dark:bg-[#fff2]"
                              >
                                {getIcon(
                                  item.icon,
                                  darkMode ? '#D9D9D9' : '#000'
                                )}
                                <span tw="text-base tracking-tight whitespace-nowrap text-dark dark:text-[rgba(255, 255, 255, 0.8)]">
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          ))}
                          <li>
                            <button
                              tw="flex px-4 w-full h-[54px] items-center gap-2 text-base tracking-tight whitespace-nowrap text-dark dark:text-[rgba(255, 255, 255, 0.8)] hover:bg-[#0002] hover:dark:bg-[#fff2]"
                              onClick={() => {
                                logout();
                                navigate('/');
                              }}
                            >
                              {getIcon(
                                'disconnect',
                                darkMode ? '#D9D9D9' : '#000'
                              )}
                              Sign Out
                            </button>
                          </li>
                        </ul>
                      </>
                    )}
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/join"
                      tw="h-10 flex items-center gap-2 tracking-tight rounded-lg bg-dark dark:bg-light duration-300 text-light dark:text-dark px-3.5"
                    >
                      {/* <img alt="user" src={iconUser} /> */}
                      {getIcon('profile', darkMode ? '#000' : '#fff')}
                      <div tw="text-sm lg:text-base whitespace-nowrap text-light/90 dark:text-dark">
                        Create{' '}
                        <span tw="hidden lg:inline text-sm lg:text-base whitespace-nowrap text-light/90 dark:text-dark">
                          account
                        </span>
                      </div>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <button tw="block xl:hidden" onClick={() => onToggleMenu()}>
              <MenuIcon opened={menuOpened} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
