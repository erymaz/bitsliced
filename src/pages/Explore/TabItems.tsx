import 'twin.macro';

import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Collection, Nft } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import { getIcon } from '../../components/ColoredIcon';
import ItemCard from '../../components/ItemCard';
import ItemCardShimmer from '../../components/ItemCardShimmer';
import {
  AccrodionPanel,
  FilterLineWidget,
  StyledButton,
} from '../../components/lib/StyledComponents';
import SwitchControl from '../../components/SwitchControl';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, NftData, SearchNftsParam, Token } from '../../type.d';
import { nFormatter } from '../../utils';
import { getTokenInfoByAddress, tokens } from '../../utils/tokens';

const SortOptions = [
  'Recently listed',
  'Ending soon',
  'Recently created',
  'Recently sold',
  'Highest volume',
  'Price low to high',
  'Price high to low',
  'Most viewed',
  'Most liked',
  // 'Most shared',
  // 'Highest last sale',
];

const PAGESIZE = 20;

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

const TabItems = () => {
  const { darkMode, decreaseLoading, increaseLoading, isLoading } =
    useContext(UserContext);

  const [keyword, setKeyword] = useState<string>('');
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionData[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [items, setItems] = useState<NftData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [filterBuyNow, setFilterBuyNow] = useState<boolean>(false);
  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string | undefined>(
    undefined // process.env.REACT_APP_SLICED_ADDRESS
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<number[]>([
    0,
    Number.MAX_SAFE_INTEGER,
  ]);
  const [viewStyle, setViewStyle] = useState<string>('small-grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<NftData[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    increaseLoading(true);
    Collection.getAll()
      .then((res: CollectionData[]) => {
        if (res) {
          setCollections(
            res.sort((a, b) =>
              a.collection_name.toLowerCase() > b.collection_name.toLowerCase()
                ? 1
                : a.collection_name.toLowerCase() <
                  b.collection_name.toLowerCase()
                ? -1
                : 0
            )
          );
          // setSelectedIds(res.map((item) => item._id));
        }
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => decreaseLoading(true));
  }, []);

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

  const toggleId = (id?: string) => {
    if (id) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  useEffect(() => {
    setFilteredCollections(
      collections.filter((item) =>
        item.collection_name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }, [keyword, collections]);

  const loadData = () => {
    let param: SearchNftsParam = {
      categories: selectedTags,
      collection_ids: selectedIds ?? [],
      isBuyNow: filterBuyNow,
      limit,
      name: '',
      owner: '',
      page,
      sortStr: selectedSortOption,
    };
    if (filterBuyNow) {
      param = {
        ...param,
        maxPrice: priceRange[1] ?? Number.MAX_SAFE_INTEGER,
        minPrice: priceRange[0] ?? 0,
        quoteToken: selectedToken,
      };
    }

    setLoading(true);
    Nft.search(param)
      .then((res) => {
        setTotal(res?.searchResult ?? 0);
        if (page > 1) {
          setItems((prevItems) => [...prevItems, ...res.nfts]);
        } else {
          setItems(res.nfts);
        }
        setEod(!res.nfts || res.nfts.length < PAGESIZE);
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [
    page,
    selectedTags,
    selectedIds,
    selectedToken,
    selectedSortOption,
    priceRange,
    filterBuyNow,
  ]);

  useEffect(() => {
    setEod(false);
    setPage(1);
  }, [
    selectedTags,
    selectedIds,
    selectedToken,
    selectedSortOption,
    priceRange,
    filterBuyNow,
  ]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
        <FilterLineWidget
          count={total}
          countLabel="of Items"
          filter={{
            show: showFilters,
            toggle: () => setShowFilters((prev) => !prev),
          }}
          sortOption={{
            noLabel: true,
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
      </div>
      <CategorySelectorLine
        selected={selectedTags}
        setSelected={setSelectedTags}
      />
      <div
        css={{
          gap: showFilters ? 32 : 0,
          gridTemplateColumns: showFilters ? '300px 1fr' : '0 1fr',
        }}
        tw="py-6 grid"
      >
        <div css={{ maxWidth: showFilters ? 300 : 0 }} tw="overflow-hidden">
          <div tw="pb-3.5 flex justify-between items-center">
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
              Buy now
            </span>
            <SwitchControl value={filterBuyNow} onChange={setFilterBuyNow} />
          </div>
          <AccrodionPanel darkMode={darkMode} title="Price">
            <div tw="pb-3.5">
              <div tw="relative">
                <div
                  tw="px-2.5 h-[46px] flex items-center gap-2 text-dark dark:text-light/90 bg-white dark:bg-[#fff2] rounded-[7px] cursor-pointer"
                  onClick={() => setShowTokens(true)}
                >
                  {getIcon(
                    getTokenInfoByAddress(selectedToken ?? '')?.icon ?? '',
                    darkMode ? '#fff' : '#000'
                  )}
                  <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90">
                    {selectedToken
                      ? getTokenInfoByAddress(selectedToken)?.name.toLowerCase()
                      : 'Select token'}
                  </span>
                </div>
                {showTokens && (
                  <>
                    <div
                      tw="fixed left-0 top-0 w-full h-full z-20"
                      onClick={() => setShowTokens(false)}
                    />
                    <ul tw="absolute left-0 top-[45px] w-full max-h-[320px] bg-white dark:bg-[#252236] shadow-lg rounded-[7px] overflow-auto z-30">
                      {tokens.length === 0 && (
                        <li
                          tw="px-2.5 py-[7px] flex items-center text-center text-[#0004] cursor-pointer"
                          onClick={() => {
                            setShowTokens(false);
                          }}
                        >
                          No token in the collection
                        </li>
                      )}
                      {tokens.length > 0 && (
                        <>
                          <li tw="px-2.5 h-10 flex items-center hover:bg-[#0001] gap-2 border-t border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)] cursor-pointer">
                            <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90">
                              Select token
                            </span>
                          </li>
                          {tokens.map((item: Token) => (
                            <li
                              key={item.name}
                              tw="px-2.5 h-10 flex items-center hover:bg-[#0001] hover:dark:bg-[#fff1] gap-2 border-t border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)] cursor-pointer"
                              onClick={() => {
                                setSelectedToken(item.address);
                                setShowTokens(false);
                              }}
                            >
                              {getIcon(item.icon, darkMode ? '#fff' : '#000')}
                              <span
                                css={
                                  selectedToken === item.address
                                    ? { fontWeight: 600 }
                                    : {}
                                }
                                tw="text-base tracking-tight capitalize text-dark dark:text-light/90"
                              >
                                {item.name.toLowerCase()}
                              </span>
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  </>
                )}
              </div>
              <div tw="py-3.5 grid grid-cols-2 gap-3.5">
                <input
                  disabled={!filterBuyNow}
                  max={maxPrice}
                  min={0}
                  placeholder="Min"
                  step={0.1}
                  title="Min price (incl.)"
                  tw="px-2.5 h-[46px] flex items-center text-dark dark:text-light/90 bg-white dark:bg-[#fff2] rounded-[7px]"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
                <input
                  disabled={!filterBuyNow}
                  min={minPrice}
                  placeholder="Max"
                  step={0.1}
                  title="Max price (incl.)"
                  tw="px-2.5 h-[46px] flex items-center text-dark dark:text-light/90 bg-white dark:bg-[#fff2] rounded-[7px]"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
              <StyledButton
                disabled={!filterBuyNow}
                tw="w-full justify-center"
                onClick={
                  filterBuyNow
                    ? () => {
                        setPriceRange([minPrice ?? 0, maxPrice ?? Infinity]);
                      }
                    : () => {
                        return;
                      }
                }
              >
                Apply
              </StyledButton>
            </div>
          </AccrodionPanel>
          <AccrodionPanel darkMode={darkMode} title="Collections">
            <>
              <div tw="pb-3.5">
                <input
                  placeholder="Search"
                  tw="px-2.5 w-full h-[46px] flex items-center text-dark dark:text-light/90 bg-white dark:bg-[#fff2] rounded-[7px]"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div tw="pt-2.5 flex flex-col gap-3.5">
                {/* <div tw="flex justify-end items-center">
                  <div tw="flex items-center gap-1.5">
                    <input tw="w-4 h-4" type="checkbox" onClick={() => {}} />
                  </div>
                </div> */}
                {filteredCollections.map((item: CollectionData) => (
                  <div key={item._id} tw="flex justify-between items-center">
                    <div tw="flex items-center gap-1 overflow-hidden">
                      <div
                        css={{
                          backgroundImage: `url(${item.collection_profile_image_url})`,
                        }}
                        tw="w-[32px] h-[32px] bg-[#0002] dark:bg-[#fff2] bg-no-repeat bg-center bg-cover rounded-full"
                      />
                      <label
                        css={{ textOverflow: 'ellipsis' }}
                        htmlFor={`collection-${item._id}`}
                        tw="text-[14px] tracking-tight leading-[150%] whitespace-nowrap overflow-hidden text-dark dark:text-light/90 cursor-pointer"
                      >
                        {item.collection_name}
                      </label>
                    </div>
                    <div tw="flex items-center gap-1.5">
                      <label
                        htmlFor={`collection-${item._id}`}
                        tw="text-[12px] tracking-tight text-gray-500  cursor-pointer"
                      >
                        {nFormatter(item.nftsCount ?? 0)}
                      </label>
                      <input
                        checked={selectedIds.includes(item._id ?? '')}
                        id={`collection-${item._id}`}
                        tw="w-4 h-4"
                        type="checkbox"
                        onChange={() => {
                          return;
                        }}
                        onClick={() => toggleId(item._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          </AccrodionPanel>
        </div>
        <div>
          {items?.length > 0 || isLoading ? (
            <>
              <ItemsGrid
                showFilters={showFilters}
                small={viewStyle === 'small-grid'}
              >
                {loading
                  ? [
                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                      17, 18, 19,
                    ].map((item, index) => (
                      <ItemCardShimmer key={`shimmer-${index}`} />
                    ))
                  : items.map((item: NftData, index: number) => (
                      <ItemCard key={`item-${item._id}-${index}`} data={item} />
                    ))}
              </ItemsGrid>

              {/* <div tw="pt-[40px] flex justify-center">
                <button
                  tw="flex items-center gap-2.5 hover:opacity-75"
                  onClick={() => {
                    setLimit(limit + 10);
                  }}
                >
                  {getIcon('loading', '#3169FA')}
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                    Load more
                  </span>
                </button>
              </div> */}
            </>
          ) : (
            <div tw="h-[80px] flex justify-center items-center text-[14px] text-[#888]">
              There is no item. Please change the filter options to see the
              items.
            </div>
          )}
          <div ref={loadingRef} tw="py-6 flex justify-center items-center">
            <span tw="text-base text-transparent">
              {items.length > 0 ? 'Loading...' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabItems;
