import 'twin.macro';

import { useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Ticket } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import TicketCard from '../../components/TicketCard';
import { ChannelData, TicketData } from '../../type';
import RenewChannelTicketPopup from '../PurchasePopups/RenewChannelTicketPopup';

const SortOptions = [
  'Recently created',
  'Oldest',
  // 'Price low to high',
  // 'Price high to low',
  // 'Expiring soon',
  // 'Most active',
  // 'Most members',
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`grid gap-3 py-6`,
  small
    ? tw`grid-cols-items-compact`
    : tw`grid-cols-items-compact md:grid-cols-items-base`,
]);

const TabTradableChannelTickets = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);
  const [openRenewPopup, setOpenRenewPopup] = useState<{
    channel: ChannelData | null;
    ticket: TicketData;
  } | null>(null);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<TicketData[]>([]);
  itemsRef.current = tickets;

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
    Ticket.search({
      categories: selectedTags,
      // is_tradable: true,
      channel_ids: [],
      channel_name: keyword,
      limit,
      owner: '',
      page,
      sortStr: selectedSortOption,
    })
      .then((res) => {
        setTotal(res?.searchResult ?? 0);
        if (page > 1) {
          setTickets((prev) => [...prev, ...res.tickets]);
        } else {
          setTickets(res.tickets);
        }
        setEod(!res.tickets || res.tickets.length < PAGESIZE);
      })
      .catch((e) => {
        console.error(e);
        // alertError(e.toString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, keyword, selectedSortOption, selectedTags]);

  useEffect(() => {
    setEod(false);
    setPage(1);
  }, [keyword, selectedSortOption, selectedTags]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
        <FilterLineWidget
          refreshMeta
          count={total}
          countLabel="of Channel Tickets"
          search={{
            label: 'Search a Channel',
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
      </div>
      <CategorySelectorLine
        selected={selectedTags}
        setSelected={setSelectedTags}
      />
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
      {/* <div tw="pt-[60px] flex justify-center">
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
      <RenewChannelTicketPopup
        channel={openRenewPopup?.channel ?? undefined}
        ticket={openRenewPopup?.ticket}
        onClose={() => setOpenRenewPopup(null)}
      />
    </div>
  );
};

export default TabTradableChannelTickets;
