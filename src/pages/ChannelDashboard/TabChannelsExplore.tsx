import 'twin.macro';

import { useContext, useEffect, useRef, useState } from 'react';
import tw, { styled } from 'twin.macro';

import { Channel } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import ChannelCard from '../../components/ChannelCard';
import ChannelCardShimmer from '../../components/ChannelCardShimmer';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, dummyChannel, IChannel } from '../../type.d';

const SortOptions = [
  'Price low to high',
  'Price high to low',
  'Recently created',
  'Most active',
  // 'Most shared',
  // 'Most viewed',
  'Most members',
  // 'Most liked',
];

const data = [
  {
    amount: 10000,
    id: '2312312000001',
    img: 'channel1.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 1]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
  {
    amount: 10000,
    id: '2312312000002',
    img: 'channel2.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 2]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
  {
    amount: 10000,
    id: '2312312000003',
    img: 'channel3.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 3]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
  {
    amount: 10000,
    id: '2312312000004',
    img: 'channel4.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 4]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
  {
    amount: 10000,
    id: '2312312000005',
    img: 'channel5.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 5]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
  {
    amount: 10000,
    id: '2312312000006',
    img: 'channel6.jpg',
    increased: 4.52,
    memberPictures: ['member1.jpg', 'member2.jpg', 'member3.jpg'],
    members: 2330,
    text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenea...',
    title: '[Channel name 6]',
    user: { address: '0xB421d2789782', name: '[Username]' },
  },
];

const PAGESIZE = 10;

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`grid gap-3 py-6`,
  small
    ? tw`grid-cols-items-compact sm:grid-cols-items-base`
    : tw`grid-cols-items-compact sm:grid-cols-items-base md:grid-cols-items-large`,
]);

const TabChannelsExplore = (props: { openPopup: () => void }) => {
  const { isLoading } = useContext(UserContext);

  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [show, setShow] = useState<number>(1);
  const [, setCards] = useState<IChannel[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(PAGESIZE);
  const [page, setPage] = useState<number>(1);
  const [, setLoading] = useState<boolean>(false);
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

  const loadData = () => {
    setLoading(true);
    Channel.search({
      categories: selectedTags,
      channel_creator: '',
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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, keyword, selectedTags, selectedSortOption]);

  useEffect(() => {
    setEod(false);
    setPage(1);
  }, [keyword, selectedTags, selectedSortOption]);

  useEffect(() => {
    if (show > 2) {
      setCards([dummyChannel, ...data, dummyChannel]);
    } else {
      setCards(data);
    }
  }, [show]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
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
      </div>
      <CategorySelectorLine
        selected={selectedTags}
        setSelected={setSelectedTags}
      />
      <ItemsGrid small={viewStyle === 'small-grid'}>
        {isLoading
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
          <span tw="font-semibold text-base tracking-tight text-dark dark:text-light">
            Load more
          </span>
        </button>
      </div> */}
    </div>
  );
};

export default TabChannelsExplore;
