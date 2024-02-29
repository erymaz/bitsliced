import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Auth, Collection, Favorite, Nft } from '../api/api';
import iconVerified from '../assets/svgs/icon-verified.svg';
import { getIcon } from '../components/ColoredIcon';
import { StyledButton } from '../components/lib/StyledComponents';
import { UserContext } from '../contexts/UserContext';
import { CollectionData, User } from '../type.d';
import { nFormatter, shortAddress } from '../utils';
import { alertError } from '../utils/toast';
import ShareCollectionPopup from './CollectionPage/ShareCollectionPopup';
import TabActivities from './CollectionPage/TabActivities';
import TabItems from './CollectionPage/TabItems';

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
  { key: 'items', label: 'Items' },
  { key: 'activities', label: 'Activities' },
];

const CollectionPage = () => {
  const params = useParams();
  const { darkMode, decreaseLoading, increaseLoading, user } =
    useContext(UserContext);

  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [owners, setOwners] = useState<number>(0);
  const [favoriteStatus, setFavoriteStatus] = useState<boolean>(false);
  const [tab, setTab] = useState<string>(tabs[0].key);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [expanded3dots, setExpanded3dots] = useState<boolean>(false);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);

  useEffect(() => {
    if (params?.id) {
      increaseLoading(true);
      Collection.getById(params.id)
        .then((res: CollectionData) => {
          if (res) {
            setCollection(res);
            Auth.getByWallet(res.collection_creator).then((u) => {
              setCreator(u);
            });
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [decreaseLoading, increaseLoading, params.id]);

  useEffect(() => {
    if (params.id) {
      increaseLoading(true);
      Nft.getOwners(params.id)
        .then((res: number) => {
          setOwners(res);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => decreaseLoading(true));
    }
  }, [decreaseLoading, increaseLoading, params.id]);

  useEffect(() => {
    if (collection && collection._id && user && user._id) {
      increaseLoading(true);
      Favorite.check('collection', collection._id, user._id)
        .then((res: boolean) => {
          setFavoriteStatus(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [decreaseLoading, increaseLoading, collection, user]);

  const handleFavorite = () => {
    if (collection && collection._id && user && user._id) {
      increaseLoading(true);
      Favorite.create({
        itemId: collection._id,
        typeName: 'collection',
        userId: user._id,
      })
        .then((res: boolean) => {
          setFavoriteStatus(!favoriteStatus);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  };
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
              backgroundImage: `url(${collection?.collection_background_image_url})`,
            }}
            tw="block md:rounded-t-xl ml-[-17px] mr-[-17px] mt-[-16px] w-[calc(100% + 34px)] h-32 bg-no-repeat bg-center bg-cover relative after:content-[''] after:absolute after:top-0 after:right-0 after:left-0 after:mx-auto after:w-full after:h-full after:bg-dark/20 after:md:rounded-t-xl after:z-20"
          ></div>
          <div tw="absolute top-3.5 left-3 font-medium text-sm text-light border-[1px] border-light bg-dark/40 backdrop-blur-md rounded-3xl px-3 py-1 z-30">
            Collection
          </div>
          <div tw="absolute top-3 right-3 flex gap-5 bg-light/80 dark:bg-dark/80 backdrop-blur-md px-3 py-1 rounded-lg z-30">
            <button
              title={'like this collection'}
              tw="flex items-center"
              onClick={() => handleFavorite()}
            >
              {getIcon(
                favoriteStatus ? 'heart-red' : 'heart',
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
                backgroundImage: `url(${collection?.collection_profile_image_url})`,
              }}
              tw="relative z-30 mt-[-80px] md:mt-[-96px] w-20 md:w-24 h-20 md:h-24 bg-white border-4 border-light md:border-white dark:border-dark bg-no-repeat bg-center bg-cover rounded-full"
            />
            <div tw="pt-2 md:pt-4 flex items-center gap-1">
              <h1 tw="font-semibold text-xl tracking-tight leading-[150%]">
                {collection?.collection_name}
                <span tw="inline-block h-6 align-middle ml-1">
                  <img alt="verified" src={iconVerified} tw="w-5" />
                </span>
              </h1>
            </div>
            <div tw="pt-0 md:pt-1 flex flex-row items-center gap-1.5">
              <span tw="text-base tracking-tight text-gray-500">by</span>
              <Link
                to={`/profile/wallet-address/${collection?.collection_creator}`}
                tw="flex text-base tracking-tight text-dark dark:text-light/90"
              >
                <span tw="inline-block align-middle font-semibold truncate max-w-[100px] mr-1">
                  {creator?.name}
                </span>{' '}
                <span tw="inline-block align-middle font-normal text-gray-500">
                  {collection?.collection_creator
                    ? shortAddress(collection?.collection_creator)
                    : ''}
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

          <div tw="grid grid-cols-3 xs:grid-cols-5 md:grid-cols-3 justify-start items-start gap-4">
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(collection?.nftsCount || 0)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Items
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(owners)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Owners
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(collection?.collection_volume || 0)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Vol. (Sliced)
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                {nFormatter(collection?.collection_floor || 0)}
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Floor (Sliced)
              </div>
            </div>
            <div>
              <div tw="font-semibold text-base md:text-lg tracking-tight text-dark dark:text-light/90">
                --
              </div>
              <div tw="text-xs md:text-sm tracking-tight leading-[150%] text-gray-500">
                Avg. price
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
                {collection?.collection_description}
              </p>
              <button
                tw="text-[14px] text-hero-purpledark dark:text-hero-bluelight"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '- Less' : '+ More'}
              </button>
            </div>
          </div>
          <div tw="mx-auto w-full flex flex-wrap items-center gap-4">
            <StyledButton>
              View
              <span tw="max-w-[80px] truncate">
                {collection?.collection_name}
              </span>
              Channel
            </StyledButton>
            {user?.walletAddress === collection?.collection_creator && (
              <Link
                to={`/create/edit-collection/${params?.id}`}
                tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
              >
                {getIcon('edit', '#6B7280')}Edit Collection
              </Link>
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
            {tabs.map((item) => (
              <div
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
                tw="pb-3.5 border-b-2 cursor-pointer"
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div tw="py-8 w-full border-t-2 border-dark/10 dark:border-light/5">
          {tab === 'items' && (
            <TabItems collection={collection} setItemsCount={setItemsCount} />
          )}
          {tab === 'activities' && <TabActivities collection={collection} />}
        </div>
      </div>
      {showSharePopup && collection && (
        <ShareCollectionPopup
          collection={collection}
          onClose={() => setShowSharePopup(false)}
        />
      )}
    </div>
  );
};

export default CollectionPage;
