import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { Channel } from '../../api/api';
import CategorySelectorLine from '../../components/CategorySelectorLine';
import ChannelCard from '../../components/ChannelCard';
import ChannelCardShimmer from '../../components/ChannelCardShimmer';
import { getIcon } from '../../components/ColoredIcon';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData } from '../../type';

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

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`grid gap-3 py-6`,
  small
    ? tw`grid-cols-items-base`
    : tw`grid-cols-items-base md:grid-cols-items-large`,
]);

const TabCreatedChannels = (props: { gotoExplore: () => void }) => {
  const { decreaseLoading, increaseLoading, isLoading, user } =
    useContext(UserContext);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    SortOptions[0]
  );
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [keyword, setKeyword] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    if (user?.walletAddress) {
      increaseLoading(true);
      Channel.search({
        categories: selectedTags,
        channel_creator: user.walletAddress,
        channel_joined: '',
        channel_name: keyword,
        channel_owner: '',
        limit,
        page: 1,
        sortStr: selectedSortOption,
      })
        .then((res) => {
          setChannels(res.channels);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => decreaseLoading(true));
    }
  }, [
    user?.walletAddress,
    keyword,
    limit,
    selectedSortOption,
    selectedTags,
    increaseLoading,
    decreaseLoading,
  ]);

  return (
    <div tw="mx-auto px-4 lg:px-8 pb-10 w-full">
      <div tw="pb-6">
        <FilterLineWidget
          refreshMeta
          count={channels.length}
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
      {channels.length > 0 ? (
        <>
          <ItemsGrid small={viewStyle === 'small-grid'}>
            {isLoading
              ? [0, 1, 2, 3].map((item) => <ChannelCardShimmer key={item} />)
              : channels.map((item) => (
                  <ChannelCard key={item._id} data={item} />
                ))}
          </ItemsGrid>
          <div tw="pt-[60px] flex justify-center">
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
          </div>
        </>
      ) : (
        <div tw="flex gap-6 flex-wrap">
          <div tw="w-full max-w-none 2xl:max-w-[calc(61% - 24px)]">
            <div tw="mt-6 p-3 w-full bg-white dark:bg-light/5 rounded-lg">
              <div tw="p-3 flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center gap-3 md:gap-0 w-full border-dashed border-2 border-hero-purpledark dark:border-hero-bluelight bg-hero-bluedark/5 dark:bg-hero-purpledark/5 rounded-lg">
                <span tw="font-medium text-base tracking-tight text-center md:text-left text-dark dark:text-light">
                  You have no Channels created yet.
                </span>
                <Link
                  to="/create/mint-channel"
                  tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                >
                  <span tw="font-medium text-base tracking-tight">
                    Mint your Channel
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div tw="w-full max-w-none md:max-w-[39.1%]"></div>
        </div>
      )}
    </div>
  );
};

export default TabCreatedChannels;
