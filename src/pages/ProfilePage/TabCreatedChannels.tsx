import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Channel } from '../../api/api';
import ChannelCard from '../../components/ChannelCard';
import ChannelCardShimmer from '../../components/ChannelCardShimmer';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, User } from '../../type.d';

const SortOptions = [
  'Recently created',
  'Oldest',
  // 'Price low to high',
  // 'Price high to low',
  // 'Most active',
  // 'Most members',
  // 'Most viewed',
  // 'Most liked',
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`grid gap-3 py-6`,
  small
    ? tw`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
    : tw`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`,
]);

const TabCreatedChannels = ({ creator }: { creator: User | null }) => {
  const { decreaseLoading, increaseLoading } = useContext(UserContext);

  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('small-grid');
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [eod, setEod] = useState<boolean>(false); // end of data
  const [total, setTotal] = useState<number>(0);

  const eodRef = useRef<boolean>(false);
  eodRef.current = eod;
  const itemsRef = useRef<ChannelData[]>([]);
  itemsRef.current = channels;

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

  const loadData = (creator: User) => {
    increaseLoading(true);
    Channel.search({
      categories: [],
      channel_creator: creator?.walletAddress,
      channel_joined: '',
      channel_name: keyword,
      channel_owner: '',
      limit,
      page,
      sortStr: selectedSortOption,
    })
      .then((res) => {
        setTotal(res?.searchResult ?? 0);
        if (page > 1) {
          setChannels((prev) => [...prev, ...res.channels]);
        } else {
          setChannels(res.channels);
        }
        setEod(!res.channels || res.channels.length < PAGESIZE);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => decreaseLoading(true));
  };

  useEffect(() => {
    if (creator) {
      loadData(creator);
    }
  }, [creator, page, keyword, selectedSortOption]);

  useEffect(() => {
    if (creator) {
      setEod(false);
      setPage(1);
    }
  }, [creator, keyword, selectedSortOption]);

  return (
    <div tw="mx-auto pb-10 w-full max-w-[1392px]">
      <FilterLineWidget
        refreshMeta
        count={total}
        countLabel="of Channels"
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
      <ItemsGrid small={viewStyle === 'small-grid'}>
        {loading
          ? [0, 1, 2, 3].map((item) => <ChannelCardShimmer key={item} />)
          : channels.map((item) => (
              <ChannelCard
                key={item._id}
                data={item}
                small={viewStyle === 'small-grid'}
              />
            ))}
      </ItemsGrid>
      <div ref={loadingRef} tw="py-6 flex justify-center items-center">
        <span tw="text-[17px] text-transparent">
          {channels.length > 0 ? 'Loading...' : ''}
        </span>
      </div>
      {/* <div tw="pt-[60px] flex justify-center">
        <button
          tw="flex items-center gap-2.5 hover:opacity-75"
          onClick={() => {
            setLimit((prevValue) => prevValue + 10);
          }}
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

export default TabCreatedChannels;
