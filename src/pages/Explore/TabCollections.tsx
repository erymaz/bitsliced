import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Collection } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import CollectionCard from '../../components/CollectionCard';
import CollectionCardShimmer from '../../components/CollectionCardShimmer';
import { getIcon } from '../../components/ColoredIcon';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, SearchCollectionsResult, User } from '../../type.d';
import { nFormatter, shortAddress } from '../../utils';

const SortOptions = [
  'Trending',
  'Highest volume',
  'Recently created',
  // 'Ending soon',
  'Floor price low to high',
  'Floor price high to low',
  'Most viewed',
  // 'Most mentioned',
  // 'Most shared',
  'Oldest',
];

const PAGESIZE = 10;

const ListItem = ({ item }: { item: CollectionData }) => {
  const { darkMode } = useContext(UserContext);

  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    Auth.getByWallet(item.collection_owner).then((res) => {
      if (res) {
        setOwner(res as User);
      }
    });
  }, [item]);

  return (
    <div
      key={item._id}
      css={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr' }}
      tw="py-[22px] grid border-b-2 border-[#E8E8E8] dark:border-[#282828]"
    >
      <div tw="flex items-center gap-5">
        <Link
          css={{
            backgroundImage: `url(${item.collection_profile_image_url})`,
          }}
          to={`/collection/${item._id}`}
          tw="w-[60px] h-[60px] bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
        />
        <div tw="flex flex-col">
          <Link
            to={`/collection/${item._id}`}
            tw="font-semibold text-2xl tracking-tight text-dark dark:text-light/90"
          >
            {item.collection_name}
          </Link>
          <Link
            to={`/profile/${owner?._id}`}
            tw="text-base tracking-tight text-[#2F2F2F] dark:text-[#e1e1e1]"
          >
            by {owner?.name} ({shortAddress(item.collection_owner, 2, 2)})
          </Link>
        </div>
      </div>
      <div tw="flex flex-col gap-[5px]">
        <div tw="flex items-center gap-[7px]">
          {getIcon('sliced', darkMode ? '#fff' : '#000')}
          <span tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
            {nFormatter(item.collection_volume)}
          </span>
        </div>
        <div tw="text-sm tracking-tight text-[#8A8A8A]">Volume</div>
      </div>
      <div tw="flex flex-col gap-[5px]">
        <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
          {nFormatter(item.collection_sales)}
        </div>
        <div tw="text-sm tracking-tight text-[#8A8A8A]">Sales</div>
      </div>
      <div tw="flex flex-col gap-[5px]">
        <div tw="flex items-center gap-[7px]">
          {getIcon('sliced', darkMode ? '#fff' : '#000')}
          <span tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
            {nFormatter(item.averagePriceOfItems, 2)}
          </span>
        </div>
        <div tw="text-sm tracking-tight text-[#8A8A8A]">Avg. price</div>
      </div>
      <div tw="flex flex-col gap-[5px]">
        <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
          {nFormatter(item.countOfOwners)}
        </div>
        <div tw="text-sm tracking-tight text-[#8A8A8A]">Owners</div>
      </div>
      <div tw="flex flex-col gap-[5px]">
        <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
          {nFormatter(item.countOfItems)}
        </div>
        <div tw="text-sm tracking-tight text-[#8A8A8A]">Items</div>
      </div>
    </div>
  );
};

const ListItemMobile = ({ item }: { item: CollectionData }) => {
  const { darkMode } = useContext(UserContext);

  const [expanded, setExpanded] = useState<boolean>(false);
  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    Auth.getByWallet(item.collection_owner).then((res) => {
      if (res) {
        setOwner(res as User);
      }
    });
  }, [item]);

  return (
    <div tw="py-[14px] border-b-2 border-[#E8E8E8] dark:border-[#282828]">
      <div
        tw="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div tw="flex items-center gap-2.5">
          <Link
            css={{
              backgroundImage: `url(${item.collection_profile_image_url})`,
            }}
            to={`/collection/${item._id}`}
            tw="w-[50px] h-[50px] bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
          />
          <div>
            <div tw="font-semibold text-[18px] tracking-tight leading-[150%] text-dark dark:text-light/90">
              {item.collection_name}
            </div>
            <div tw="text-[14px] tracking-tight leading-[150%] text-[#2F2F2F] dark:text-[#e1e1e1]">
              by {owner?.name} ({shortAddress(item.collection_owner, 2, 2)})
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
        <div tw="pl-[62px] pt-6 grid grid-cols-2 gap-3">
          <div tw="flex flex-col gap-[5px]">
            <div tw="flex items-center gap-[7px]">
              {getIcon('sliced', darkMode ? '#fff' : '#000')}
              <span tw="font-bold text-[18px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                {nFormatter(item.collection_volume)}
              </span>
            </div>
            <div tw="text-sm tracking-tight text-[#8A8A8A]">Volume</div>
          </div>
          <div tw="flex flex-col gap-[5px]">
            <div tw="font-bold text-[18px] leading-[150%] tracking-tight text-dark dark:text-light/90">
              {nFormatter(item.collection_sales)}
            </div>
            <div tw="text-sm tracking-tight text-[#8A8A8A]">Sales</div>
          </div>
          <div tw="flex flex-col gap-[5px]">
            <div tw="flex items-center gap-[7px]">
              {getIcon('sliced', darkMode ? '#fff' : '#000')}
              <span tw="font-bold text-[18px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                {nFormatter(item.averagePriceOfItems, 2)}
              </span>
            </div>
            <div tw="text-sm tracking-tight text-[#8A8A8A]">Avg. price</div>
          </div>
          <div tw="flex flex-col gap-[5px]">
            <div tw="font-bold text-[18px] leading-[150%] tracking-tight text-dark dark:text-light/90">
              {nFormatter(item.countOfOwners)}
            </div>
            <div tw="text-sm tracking-tight text-[#8A8A8A]">Owners</div>
          </div>
          <div tw="flex flex-col gap-[5px]">
            <div tw="font-bold text-[18px] leading-[150%] tracking-tight text-dark dark:text-light/90">
              {nFormatter(item.countOfItems)}
            </div>
            <div tw="text-sm tracking-tight text-[#8A8A8A]">Items</div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabCollections = () => {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<CollectionData[]>([]);
  itemsRef.current = collections;

  useEffect(() => {
    const handleObserve = (entries: IntersectionObserverEntry[]) => {
      const [el] = entries;
      if (
        itemsRef.current?.length > 0 &&
        el.isIntersecting &&
        !eodRef.current
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    const observer = new IntersectionObserver(handleObserve, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loadingRef]);

  const loadData = () => {
    setLoading(true);
    Collection.search({
      categories: selectedTags,
      limit,
      page,
      sortStr: selectedSortOption,
    })
      .then((res: SearchCollectionsResult) => {
        setTotal(res?.searchResult ?? 0);
        if (page > 1) {
          setCollections((prev) => [...prev, ...res.collections]);
        } else {
          setCollections(res.collections);
        }
        setEod(!res.collections || res.collections.length < PAGESIZE);
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, selectedSortOption, selectedTags]);

  useEffect(() => {
    setEod(false);
    setPage(1);
  }, [selectedSortOption, selectedTags]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
        <FilterLineWidget
          count={total}
          countLabel="of Collections"
          sortOption={{
            noLabel: true,
            onChange: (opt: string) => {
              setLimit(parseInt(process.env.REACT_APP_PAGE_SIZE ?? '8'));
              setSelectedSortOption(opt);
            },
            options: SortOptions,
            value: selectedSortOption,
          }}
          viewStyle={{
            onChange: setViewStyle,
            options: ['large-grid', 'list'],
            value: viewStyle,
          }}
        />
      </div>
      <CategorySelectorLine
        selected={selectedTags}
        setSelected={setSelectedTags}
      />
      {viewStyle === 'large-grid' && (
        <>
          <div tw="grid gap-3 py-6 grid-cols-items-compact sm:grid-cols-items-base md:grid-cols-items-large">
            {loading
              ? [0, 1, 2, 3].map((item) => <CollectionCardShimmer key={item} />)
              : collections?.map((item: CollectionData) => (
                  <CollectionCard key={item._id} item={item} />
                ))}
          </div>
        </>
      )}
      {viewStyle === 'list' && (
        <>
          <div tw="px-8 py-8 hidden md:block">
            {collections.map((item: CollectionData) => {
              return <ListItem key={item._id} item={item} />;
            })}
          </div>
          <div tw="px-0 py-8 block md:hidden">
            {collections.map((item: CollectionData) => {
              return <ListItemMobile key={item._id} item={item} />;
            })}
          </div>
        </>
      )}
      <div ref={loadingRef} tw="py-6 flex justify-center items-center">
        <span tw="text-[17px] text-transparent">
          {collections.length > 0 ? 'Loading...' : ''}
        </span>
      </div>
      {/* <div tw="pt-[40px] flex justify-center">
        <button
          tw="flex items-center gap-2.5 hover:opacity-75"
          onClick={
            eoa
              ? () => {
                  return;
                }
              : () => setLimit((prev) => prev + 10)
          }
        >
          {getIcon('loading', '#3169FA')}
          <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
            Load more
          </span>
        </button>
      </div> */}
    </div>
  );
};

export default TabCollections;
