import 'twin.macro';

import { useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Ticket } from '../../api/api';
import MultiCarousel from '../../components/lib/multi-carousel';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import TicketCard from '../../components/TicketCard';
import { ChannelData, TicketData, User } from '../../type.d';
import RenewChannelTicketPopup from '../PurchasePopups/RenewChannelTicketPopup';

const SortOptions = [
  'Recently created',
  // 'Price low to high',
  // 'Price high to low',
  // 'Recently joined',
  // 'Last bought',
  // 'Expiring soon',
  // 'Most active',
  // 'Most members',
  // 'Most liked',
  // 'Tradable tickets',
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`mx-auto pt-[60px] w-full hidden md:grid gap-3`,
  small
    ? tw`grid-cols-items-compact`
    : tw`grid-cols-items-compact md:grid-cols-items-base`,
]);

const TabChannelTickets = ({ user }: { user: User | null }) => {
  const [, setCurrent] = useState<number>(0);
  const [, setShow] = useState<number>(1);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
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

  const loadData = (user: User) => {
    Ticket.search({
      categories: [],
      channel_ids: [],
      channel_name: keyword,
      // is_tradable: true, // <- true or false?, what for all?
      limit,
      owner: user.walletAddress,
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
      });
  };

  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user, page, selectedSortOption, keyword]);

  useEffect(() => {
    if (user) {
      setEod(false);
      setPage(1);
    }
  }, [user, selectedSortOption, keyword]);

  return (
    <div tw="mx-auto w-full">
      <FilterLineWidget
        refreshMeta
        count={total}
        countLabel="of Tickets"
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
      <ItemsGrid small={viewStyle === 'small-grid'}>
        {tickets.map((item: TicketData) => (
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
      <div tw="block md:hidden pt-[86px] md:pt-[32px] overflow-hidden">
        <MultiCarousel
          breakpoints={[
            { 1400: 6 },
            { 1200: 5 },
            { 992: 4 },
            { 768: 3 },
            { 600: 2 },
            { 0: 1 },
          ]}
          setCurrent={setCurrent}
          setShow={setShow}
          show={4}
        >
          {tickets.map((item) => (
            <div key={item._id} tw="px-2">
              <TicketCard
                item={item}
                onRenewPopup={({
                  channel,
                  ticket,
                }: {
                  channel: ChannelData | null;
                  ticket: TicketData;
                }) => setOpenRenewPopup({ channel, ticket })}
              />
            </div>
          ))}
        </MultiCarousel>
      </div>
      <div ref={loadingRef} tw="py-6 flex justify-center items-center">
        <span tw="text-[17px] text-transparent">
          {tickets.length > 0 ? 'Loading...' : ''}
        </span>
      </div>
      <RenewChannelTicketPopup
        channel={openRenewPopup?.channel ?? undefined}
        ticket={openRenewPopup?.ticket}
        onClose={() => setOpenRenewPopup(null)}
      />
    </div>
  );
};

export default TabChannelTickets;
