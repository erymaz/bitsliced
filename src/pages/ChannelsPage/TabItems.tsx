import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

import { getIcon } from '../../components/ColoredIcon';
import ItemCard from '../../components/ItemCard';
import ItemCardShimmer from '../../components/ItemCardShimmer';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, NftData, OrderStatus, OrderType } from '../../type.d';

const sortOptions = ['Price low to high', 'Price hight to low'];

const ItemsGrid = styled.div(({ small }: { small?: boolean }) => [
  tw`mx-auto pt-[60px] px-4 w-full hidden md:grid gap-3`,
  small
    ? tw`grid-cols-items-compact`
    : tw`grid-cols-items-compact md:grid-cols-items-base`,
]);

const TabItems = (props: {
  items?: Partial<NftData>[];
  channelName?: string;
  channel?: ChannelData;
  accessible?: boolean;
  joined?: boolean;
  openPopup: () => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [filteredItems, setFilteredItems] = useState<Partial<NftData>[]>([]);
  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [sortBy, setSortBy] = useState<string>(sortOptions[0]);
  const [keyword, setKeyword] = useState<string>('');

  useEffect(() => {
    // console.log(props.items);
    if (props.items) {
      const filtered = props.items.filter((item) => {
        const includedKeyword = item?.name
          ?.toLowerCase()
          .includes(keyword.trim().toLowerCase());

        const sold = item?.orders?.find(
          (o) =>
            o.orderType === OrderType.SELL && o.status === OrderStatus.ACCEPTED
        );

        return includedKeyword && !sold;
      });

      const ids = filtered.map((item) => item._id);
      const uniqueItems = filtered.filter(
        (value, index) => ids.indexOf(value._id) === index
      );
      console.log('nft items:', uniqueItems);

      uniqueItems.sort((a, b) => {
        const offset = sortBy === sortOptions[0] ? -1 : 1;
        if (typeof a.price === 'undefined') {
          return offset;
        }
        if (typeof b.price === 'undefined') {
          return -offset;
        }
        // ascending
        if (a.price > b.price) {
          return offset;
        } else if (a.price > b.price) {
          return -offset;
        } else {
          return 0;
        }
      });
      setFilteredItems(uniqueItems);
      console.log(props.items.length, filtered.length, uniqueItems.length);
    }
  }, [props.items, keyword, sortBy]);

  return (
    <div tw="mx-auto w-full">
      {props.accessible ? (
        <>
          <FilterLineWidget
            refreshMeta
            count={filteredItems.length}
            countLabel="connected Channel Items"
            search={{
              label: 'Search by name or attribute',
              onChange: setKeyword,
              value: keyword,
            }}
            sortOption={{
              onChange: setSortBy,
              options: sortOptions,
              value: sortBy,
            }}
            viewStyle={{
              onChange: setViewStyle,
              options: ['large-grid', 'small-grid'],
              value: viewStyle,
            }}
          />
          <ItemsGrid small={viewStyle === 'small-grid'}>
            {false
              ? [0, 1, 2, 3].map((item) => <ItemCardShimmer key={item} />)
              : filteredItems.map((item, index) =>
                  item ? (
                    <ItemCard
                      key={`${item._id}-${index}`}
                      data={item}
                      inChannel={true}
                    />
                  ) : null
                )}
          </ItemsGrid>
        </>
      ) : (
        // props.channel?.channel_creator !== user?.walletAddress && (
        <div tw="flex gap-6 flex-wrap">
          <div tw="w-full max-w-none 2xl:max-w-[calc(61% - 24px)]">
            <div tw="p-3 w-full bg-white dark:bg-light/5 rounded-lg">
              <div tw="pl-6 pr-3 py-[11px] flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap xl:flex-nowrap gap-4 md:gap-0 w-full text-center md:text-left border-dashed border-2 border-hero-purpledark dark:border-hero-bluelight bg-hero-purpledark/10 dark:bg-hero-bluelight/5 rounded-md">
                {props.joined ? (
                  <>
                    <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                      Your ticket is expired. Please extend your ticket span
                      here.
                    </span>
                  </>
                ) : (
                  <>
                    <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                      To view content join this channel.
                    </span>
                    {user ? (
                      <button
                        tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                        onClick={props.openPopup}
                      >
                        {getIcon('add', darkMode ? '#000' : '#fff')}
                        Join
                      </button>
                    ) : (
                      <Link
                        to={'/join'}
                        tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                      >
                        {getIcon('add', darkMode ? '#000' : '#fff')}
                        Join
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div tw="w-full max-w-none md:max-w-[39.1%]"></div>
        </div>
        // )
      )}
    </div>
  );
};

export default TabItems;
