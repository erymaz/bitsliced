import { useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Nft } from '../../api/api';
import ItemCard from '../../components/ItemCard';
import ItemCardShimmer from '../../components/ItemCardShimmer';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { NftData, User } from '../../type.d';

const SortOptions = [
  'Price low to high',
  'Price high to low',
  // 'Recently received',
  'Most viewed',
  // 'Most shared',
  'Most liked',
  // 'Recently listed',
  // 'Most mentioned',
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(
  ({ showFilters, small }: { showFilters: boolean; small?: boolean }) => [
    tw`grid gap-3`,
    showFilters
      ? small
        ? tw`grid-cols-items-compact`
        : tw`grid-cols-items-compact md:grid-cols-items-base`
      : small
      ? tw`grid-cols-items-compact`
      : tw`grid-cols-items-compact md:grid-cols-items-base`,
  ]
);

const TabItems = ({ user }: { user: User | null }) => {
  const [ownedItems, setOwnedItems] = useState<NftData[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<NftData[]>([]);
  itemsRef.current = ownedItems;

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

  const loadData = (user: User) => {
    setLoading(true);
    Nft.search({
      categories: [],
      collection_ids: [],
      limit,
      name: keyword,
      owner: user.walletAddress,
      page,
      sortStr: selectedSortOption,
    })
      .then((res) => {
        setTotal(res?.searchResult ?? 0);
        if (page > 1) {
          setOwnedItems((prev) => [...prev, ...res.nfts]);
        } else {
          setOwnedItems(res.nfts);
        }
        setEod(!res.nfts || res.nfts.length < PAGESIZE);
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user, page, keyword, selectedSortOption]);

  useEffect(() => {
    if (user) {
      setEod(false);
      setPage(1);
    }
  }, [user, keyword, selectedSortOption]);

  return (
    <div tw="mx-auto w-full">
      <FilterLineWidget
        refreshMeta
        count={total}
        countLabel="of Items"
        search={{
          label: 'Search by name or attribute',
          onChange: setKeyword,
          value: keyword,
        }}
        sortOption={{
          onChange: setSelectedSortOption,
          options: SortOptions,
          value: selectedSortOption,
        }}
        viewStyle={{
          onChange: setViewStyle,
          options: ['large-grid', 'small-grid'],
          value: viewStyle,
        }}
      />
      <ItemsGrid
        showFilters={false}
        small={viewStyle === 'small-grid'}
        tw="pt-10"
      >
        {loading
          ? [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
              19,
            ].map((item) => <ItemCardShimmer key={item} />)
          : ownedItems.map((item) => <ItemCard key={item._id} data={item} />)}
      </ItemsGrid>
      <div ref={loadingRef} tw="py-6 flex justify-center items-center">
        <span tw="text-[17px] text-transparent">
          {ownedItems.length > 0 ? 'Loading...' : ''}
        </span>
      </div>
      {/* <div tw="py-8 flex justify-center">
        <button
          tw="flex items-center gap-2.5 hover:opacity-75"
          onClick={() => setLimit((prev) => prev + 10)}
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

export default TabItems;
