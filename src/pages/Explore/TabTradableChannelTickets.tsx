import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Channel, Ticket } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import { getIcon } from '../../components/ColoredIcon';
import {
  AccrodionPanel,
  Avatar,
  FilterLineWidget,
  StyledButton,
} from '../../components/lib/StyledComponents';
import TicketCard from '../../components/TicketCard';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, TicketData, Token } from '../../type.d';
import { nFormatter } from '../../utils';
import { getTokenInfoByAddress, tokens } from '../../utils/tokens';
import RenewChannelTicketPopup from '../PurchasePopups/RenewChannelTicketPopup';

const SortOptions = [
  // 'Trending',
  // 'Highest volume',
  'Recently created',
  // 'Ending soon',
  // 'Floor price low to high',
  // 'Floor price high to low',
  // 'Most viewed',
  // 'Most mentioned',
  // 'Most shared',
  'Oldest',
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`grid gap-3 py-6`,
  small
    ? tw`grid-cols-items-compact`
    : tw`grid-cols-items-compact md:grid-cols-items-base`,
]);

const TabTradableChannelTickets = () => {
  const { darkMode, decreaseLoading, increaseLoading } =
    useContext(UserContext);

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('small-grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
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
  const [keyword, setKeyword] = useState<string>('');
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openRenewPopup, setOpenRenewPopup] = useState<{
    channel: ChannelData | null;
    ticket: TicketData;
  } | null>(null);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<TicketData[]>([]);
  itemsRef.current = tickets;

  useEffect(() => {
    increaseLoading(true);
    Channel.getAll()
      .then((res: ChannelData[]) => {
        if (res) {
          setChannels(
            res.sort((a, b) => {
              const aName = a.channel_name.trim().toLowerCase();
              const bName = b.channel_name.trim().toLowerCase();
              return aName > bName ? 1 : aName < bName ? -1 : 0;
            })
          );
        }
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => decreaseLoading(true));
  }, []);

  useEffect(() => {
    setFilteredChannels(
      channels.filter((item) =>
        item.channel_name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }, [keyword, channels]);

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
      setSelectedIds((prev) =>
        selectedIds.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
      );
    }
  };

  const loadData = () => {
    setLoading(true);
    Ticket.search({
      categories: selectedTags,
      // expired: false,
      // is_tradable: true,
      channel_ids: selectedIds,
      channel_name: '',
      limit,
      owner: '',
      page,
      sortStr: selectedSortOption,
      ...(selectedToken
        ? {
            maxPrice: priceRange[1],
            minPrice: priceRange[0],
            quoteToken: selectedToken,
          }
        : {}),
    })
      .then((res) => {
        if (res) {
          setTotal(res?.searchResult ?? 0);
          if (page > 1) {
            setTickets((prev) => [...prev, ...res.tickets]);
          } else {
            setTickets(res.tickets);
          }
          setEod(!res.tickets || res.tickets.length < PAGESIZE);
        }
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [
    page,
    selectedSortOption,
    selectedTags,
    selectedIds,
    selectedToken,
    priceRange,
  ]);

  useEffect(() => {
    setEod(false);
    setPage(1);
  }, [
    selectedSortOption,
    selectedTags,
    selectedIds,
    selectedToken,
    priceRange,
  ]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
        <FilterLineWidget
          count={total}
          countLabel="of Tickets"
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
                tw="w-full justify-center"
                onClick={() => {
                  setPriceRange([minPrice ?? 0, maxPrice ?? Infinity]);
                }}
              >
                Apply
              </StyledButton>
            </div>
          </AccrodionPanel>
          <AccrodionPanel darkMode={darkMode} title="Channels">
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
                {filteredChannels.map((item: ChannelData) => (
                  <div key={item._id} tw="flex justify-between items-center">
                    <div tw="flex items-center gap-1 overflow-hidden">
                      <Avatar pic={item.channel_profile_image_url} size={32} />
                      <label
                        css={{ textOverflow: 'ellipsis' }}
                        htmlFor={`collection-${item._id}`}
                        tw="text-[14px] tracking-tight leading-[150%] whitespace-nowrap overflow-hidden text-dark dark:text-light/90 cursor-pointer"
                      >
                        {item.channel_name}
                      </label>
                    </div>
                    <div tw="flex items-center gap-1.5">
                      <label
                        htmlFor={`collection-${item._id}`}
                        tw="text-[12px] tracking-tight text-gray-500  cursor-pointer"
                      >
                        {nFormatter(item.itemsCount ?? 0)}
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
          {(selectedIds?.length ?? 0) > 0 && (
            <ul tw="flex items-center flex-wrap gap-3.5">
              {channels.map((item: ChannelData) => {
                return selectedIds.includes(item._id ?? '') ? (
                  <li
                    key={`selected-channel-${item._id}`}
                    tw="px-3.5 h-[50px] flex items-center gap-[14px] border border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)] rounded-[7px]"
                  >
                    <Avatar pic={item.channel_profile_image_url} size={28} />
                    <span tw="text-[17px] text-dark dark:text-light">
                      {item.channel_name}
                    </span>
                    <button
                      tw="rotate-45"
                      onClick={() =>
                        setSelectedIds((prev) =>
                          prev.filter((id) => id !== item._id)
                        )
                      }
                    >
                      {getIcon('add', darkMode ? '#fff' : '#000')}
                    </button>
                  </li>
                ) : null;
              })}
              <ul>
                <button
                  tw="px-6 font-semibold text-[17px] text-[#3169FA]"
                  onClick={() => setSelectedIds([])}
                >
                  Clear all
                </button>
              </ul>
            </ul>
          )}
          <ItemsGrid small={viewStyle === 'small-grid'}>
            {tickets?.map((item: TicketData) => (
              <TicketCard
                key={item._id}
                item={item}
                onRenewPopup={({
                  channel,
                  ticket,
                }: {
                  channel: ChannelData | null;
                  ticket: TicketData;
                }) => setOpenRenewPopup({ channel, ticket })}
              />
            ))}
          </ItemsGrid>
          <div ref={loadingRef} tw="py-6 flex justify-center items-center">
            <span tw="text-[17px] text-transparent">
              {tickets.length > 0 ? 'Loading...' : ''}
            </span>
          </div>
          {/* <div tw="pt-[40px] flex justify-center">
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
      </div>
      <RenewChannelTicketPopup
        channel={openRenewPopup?.channel ?? undefined}
        ticket={openRenewPopup?.ticket}
        onClose={() => setOpenRenewPopup(null)}
      />
    </div>
  );
};

export default TabTradableChannelTickets;
