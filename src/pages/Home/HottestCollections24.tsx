import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Collection } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import useWindowSize, { breakpoints } from '../../contexts/useWindowSize';
import { CollectionData, SearchCollectionsResult, User } from '../../type.d';
import { nFormatter, shortAddress } from '../../utils';

const tabs = [
  {
    icon: null,
    title: 'Overall',
  },
  {
    icon: 'sliced',
    title: 'Sliced',
  },
  {
    icon: 'opensea',
    title: 'OpenSea',
  },
  {
    icon: 'looksrare',
    title: 'LooksRare',
  },
  {
    icon: 'x2y2',
    title: 'X2Y2',
  },
];

const TimeOptions: { [key: string]: string } = {
  '1h': '1 hour',
  '24h': '24 hours',
  '30d': '30 days',
  '7d': '7 days',
};

const SortBy = [
  { key: 'volume', label: 'Volume' },
  { key: 'most-sales', label: 'Most sales' },
  { key: 'most-mentioned', label: 'Most mentioned' },
  { key: 'most-owners', label: 'Most owners' },
  { key: 'highers-avg-price', label: 'Highers avg price' },
];

const CollectionItemMobile = (props: {
  data: CollectionData;
  index: number;
}) => {
  const { darkMode } = useContext(UserContext);

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div tw="block py-2 md:hidden border-b-[1px] border-dark/10 dark:border-light/10 duration-300">
      <div
        tw="flex items-center gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div tw="w-4 flex justify-center items-center font-normal text-sm tracking-tight text-dark dark:text-light/90">
          {props.index + 1}
        </div>
        <Link to={`/collection/${props.data._id}`}>
          <div
            css={{
              backgroundImage: `url(${props.data.collection_profile_image_url})`,
            }}
            tw="w-12 h-12 bg-[#0002] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
          />
        </Link>
        <div tw="w-[calc(100% - 122px)] flex flex-col justify-center">
          <div
            css={{ textOverflow: 'ellipsis' }}
            title={props.data.collection_name}
            tw="font-semibold text-base tracking-tight whitespace-nowrap overflow-hidden text-dark dark:text-light"
          >
            {props.data.collection_name}
          </div>
          <div
            css={{ textOverflow: 'ellipsis' }}
            title={props.data.collection_owner}
            tw="text-xs tracking-tight whitespace-nowrap overflow-hidden text-gray-500"
          >
            {shortAddress(props.data.collection_owner, 2, 4)}
          </div>
        </div>
        <div
          css={expanded ? { transform: 'rotate(180deg)' } : {}}
          tw="duration-300"
        >
          {getIcon('dropdown', darkMode ? '#fff' : '#000')}
        </div>
      </div>
      {expanded && (
        <div tw="mt-4 p-3 bg-white dark:bg-light/5 rounded-md">
          <div tw="w-auto grid grid-cols-3 xs:grid-cols-6 gap-3.5">
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.collection_floor ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Floor price</div>
            </div>
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.collection_volume ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Volume</div>
            </div>
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.collection_sales ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Sales</div>
            </div>
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.averagePriceOfItems ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Avg. price</div>
            </div>
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.countOfOwners ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Owners</div>
            </div>
            <div tw="flex flex-col gap-1">
              <div tw="flex items-center gap-1">
                <span tw="font-medium text-sm tracking-tight text-dark dark:text-light/90">
                  {nFormatter(props.data.countOfItems ?? 0)}
                </span>
              </div>
              <div tw="text-xs text-gray-500">Items</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CollectionItem = (props: { item: CollectionData; index: number }) => {
  const { darkMode } = useContext(UserContext);

  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    // if (props.item) console.log(props.item);
    Auth.getByWallet(props.item.collection_owner).then((res) => {
      setOwner(res);
    });
  }, [props.item]);

  return (
    <>
      <div
        key={props.item._id}
        css={{
          gridTemplateColumns: '24px 60px 2fr 1fr 1fr 0.8fr 1fr 0.8fr 0.8fr',
        }}
        tw="py-4 hidden md:grid gap-5 border-b-2 border-[#E8E8E8] dark:border-[#181818]"
      >
        <div tw="flex justify-center items-center font-normal text-base tracking-tight text-dark dark:text-light/90">
          {props.index + 1}
        </div>
        <Link
          to={`/collection/${props.item._id}`}
          tw="flex justify-center items-center"
        >
          <div
            css={{
              backgroundImage: `url(${props.item.collection_profile_image_url})`,
            }}
            tw="w-14 h-14 bg-[#0002] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
          />
        </Link>
        <div tw="flex flex-col justify-center overflow-hidden">
          <Link
            css={{ textOverflow: 'ellipsis' }}
            to={`/collection/${props.item._id}`}
            tw="font-semibold text-lg tracking-tight text-dark dark:text-light overflow-hidden"
          >
            {props.item.collection_name}
          </Link>
          <Link
            to={
              owner
                ? `/profile/${owner?._id}`
                : `/profile/wallet-address/${props.item.collection_owner}`
            }
            tw="text-base tracking-tight text-gray-500"
          >
            {owner?.name} ({shortAddress(props.item.collection_owner, 2, 4)})
          </Link>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.collection_floor ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Floor price</div>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.collection_volume ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Volume</div>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.collection_sales ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Sales</div>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.averagePriceOfItems ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Avg. price</div>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.countOfOwners ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Owners</div>
        </div>
        <div tw="flex flex-col justify-center gap-[5px]">
          <div tw="flex items-center gap-1">
            <span tw="font-bold text-lg tracking-tight text-dark dark:text-light/90">
              {nFormatter(props.item.countOfItems ?? 0)}
            </span>
          </div>
          <div tw="text-sm text-gray-500">Items</div>
        </div>
      </div>
      <CollectionItemMobile data={props.item} index={props.index} />
    </>
  );
};

const HottestCollections24 = () => {
  const { darkMode } = useContext(UserContext);

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0].title);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('24h');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const size = useWindowSize();
  const [collections, setCollections] = useState<CollectionData[]>([]);

  useEffect(() => {
    setPage(1);
    Collection.search({
      categories: [],
      limit: pageSize,
      page: 1,
      sortStr: 'Trending',
    }).then((res: SearchCollectionsResult) => {
      setCollections(res.collections);
    });
  }, [pageSize]);

  useEffect(() => {
    Collection.search({
      categories: [],
      limit: pageSize,
      page,
      sortStr: 'Trending',
    }).then((res: SearchCollectionsResult) => {
      setCollections([...collections, ...res.collections]);
    });
  }, [page]);

  useEffect(() => {
    if (size.width < breakpoints.md) {
      setPageSize(5);
    } else {
      setPageSize(10);
    }
  }, [size]);

  return (
    <section tw="w-full pt-[60px] md:pt-[200px]">
      <h2 tw="flex px-4 justify-start md:justify-center items-center gap-2 flex-wrap  text-left md:text-center">
        <span tw="text-2xl md:text-4xl font-semibold leading-[120%] text-dark/60 dark:text-light/60">
          Hottest collections{' '}
          <span tw="hidden md:inline text-2xl md:text-4xl">over</span>
        </span>
        <div
          tw="relative flex text-left items-center gap-2 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span tw="text-2xl md:text-4xl font-semibold leading-[120%] text-dark dark:text-light">
            last {TimeOptions[selectedTime]}
          </span>
          <div
            css={showDropdown ? { transform: 'rotate(180deg)' } : {}}
            tw="w-[32px] lg:w-[40px] h-[32px] lg:h-[40px] inline-flex justify-center items-center bg-dark dark:bg-light rounded-full duration-300"
          >
            {getIcon('dropdown', darkMode ? '#000' : '#fff')}
          </div>

          {showDropdown && (
            <>
              <div
                tw="fixed left-0 top-0 w-full h-full z-20"
                onClick={() => setShowDropdown(false)}
              />
              <ul
                className="dropdown-list"
                tw="absolute left-0 md:right-3 top-[40px] md:top-[60px] w-full flex flex-col gap-[1px] shadow-lg bg-dark/10 dark:bg-light/5 backdrop-blur-lg rounded-lg z-30"
              >
                {Object.keys(TimeOptions).map((item) => (
                  <li
                    key={item}
                    tw="py-2 md:py-4 font-semibold text-base md:text-lg text-center text-dark dark:text-light hover:bg-dark/5 dark:hover:bg-light/5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTime(item);
                      setShowDropdown(false);
                    }}
                  >
                    {TimeOptions[item]}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </h2>
      <div tw="px-4 lg:px-8 pt-8 md:pt-14 mx-auto w-full max-w-screen-xl">
        <div tw="relative flex justify-between border-b-2 border-dark/5 dark:border-light/5">
          <div tw="w-full md:w-auto flex justify-between md:justify-center items-end gap-0 md:gap-6">
            {tabs.map((item) => (
              <div
                key={item.title}
                css={
                  selectedTab === item.title
                    ? {
                        borderBottomColor: darkMode ? '#fff' : '#000',
                        opacity: 1,
                      }
                    : { borderBottomColor: 'transparent', opacity: 0.4 }
                }
                tw="pb-2.5 min-w-[56px] flex justify-center items-center gap-1 border-b-2 cursor-pointer"
                onClick={() => setSelectedTab(item.title)}
              >
                <div tw="[&>svg]:w-5 [&>svg]:h-5">
                  {item.icon && getIcon(item.icon, darkMode ? '#fff' : '#000')}
                </div>

                {!item.icon && (
                  <span tw="block md:hidden h-[21px] font-semibold text-base tracking-tight text-dark dark:text-light/90">
                    {item.title}
                  </span>
                )}
                <span tw="hidden md:block font-semibold text-base tracking-tight text-dark dark:text-light/90">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
          <div tw="absolute top-12 md:static pb-3 pt-0 flex items-center gap-1">
            <span tw="text-base text-gray-500 tracking-tight">Sort by</span>
            <select
              css={{
                backgroundImage: 'url(/svgs/carrot-lined.svg)',
                backgroundSize: 14,
              }}
              tw="font-semibold text-base tracking-tight text-center appearance-none text-dark bg-transparent focus:outline-none bg-right bg-no-repeat cursor-pointer dark:invert"
            >
              {SortBy.map((item) => (
                <option key={item.key} tw="text-dark" value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div tw="pt-[60px] md:pt-2.5">
          {collections.map((item: CollectionData, index: number) => (
            <CollectionItem key={item._id} index={index} item={item} />
          ))}
        </div>
      </div>
      <div tw="pt-[30px] md:pt-[60px] flex justify-center">
        <button
          tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
          onClick={() => {
            setPage(page + 1);
          }}
        >
          View more
        </button>
      </div>
    </section>
  );
};

export default HottestCollections24;
