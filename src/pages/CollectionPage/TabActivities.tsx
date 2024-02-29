import 'twin.macro';

import { format } from 'date-fns';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Activity, Nft } from '../../api/api';
import imgChart from '../../assets/svgs/bar-chart.svg';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import {
  ActivityData,
  ActivityIcon,
  CollectionData,
  NftData,
} from '../../type.d';
import { getMimeType, shortAddress } from '../../utils';

const ActivityTags: { [key: string]: string } = {
  List: 'listing',
  Sale: 'cart',
};

const NftItem = (props: { nftId?: string; collectionName: string }) => {
  const [nftItem, setNftItem] = useState<NftData | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (props.nftId) {
      Nft.getById(props.nftId).then((res: NftData) => {
        if (res) {
          setNftItem(res);
          setMimeType(getMimeType(res.image));
        }
      });
    }
  }, [props.nftId]);

  return (
    <div tw="flex items-center gap-3.5">
      <Link to={`/item/${nftItem?._id}`}>
        <div
          css={{
            backgroundImage: mimeType.startsWith('video')
              ? 'none'
              : `url(${nftItem?.image})`,
          }}
          tw="relative w-[60px] h-[60px] bg-no-repeat bg-center bg-contain rounded-[7px] bg-[#D9D9D9] overflow-hidden"
        >
          {mimeType.startsWith('video') && (
            <video
              autoPlay
              loop
              muted
              playsInline
              tw="absolute left-0 top-0 w-full h-full object-contain z-10"
            >
              <source src={nftItem?.image} type={mimeType} />
            </video>
          )}
        </div>
      </Link>
      <div>
        <Link to={`/item/${nftItem?._id}`}>
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {nftItem?.name}
          </div>
        </Link>
        <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
          {props.collectionName}
        </div>
      </div>
    </div>
  );
};

const ActivityItemMobile = (props: {
  item: ActivityData;
  collectionName: string;
}) => {
  const { darkMode } = useContext(UserContext);

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div tw="block py-4 md:hidden items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]">
      <div
        css={{ gridTemplateColumns: '1fr 4fr 20px' }}
        tw="grid items-center gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div tw="flex items-center gap-[9px]">
          {getIcon(
            ActivityIcon[props.item.activity_type],
            darkMode ? '#fff' : '#000'
          )}
          <span tw="text-base tracking-tight text-dark dark:text-light/90">
            {props.item.activity_type}
          </span>
        </div>
        <NftItem
          collectionName={props.collectionName ?? ''}
          nftId={props.item.nft_id}
        />
        <div
          css={expanded ? { transform: 'rotate(180deg)' } : {}}
          tw="w-5 duration-300"
        >
          {getIcon('dropdown', '#3169FA')}
        </div>
      </div>
      {expanded && (
        <div tw="pl-[120px] pt-6">
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {props.item.price}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">${0}</div>
          </div>
          <div>
            <Link
              to={`/profile/wallet-address/${props.item.fromAddress}`}
              tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
            >
              {shortAddress(props.item.fromAddress, 2, 4)}
            </Link>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">From</div>
          </div>
          <div>
            <Link
              to={`/profile/wallet-address/${props.item.toAddress}`}
              tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
            >
              {shortAddress(props.item.toAddress, 2, 4)}
            </Link>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">To</div>
          </div>
          <div>
            <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {format(
                new Date(props.item.timeStamp ?? props.item.createdAt),
                'MM/dd/yyyy, hh:mm a'
              )}
            </div>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">Time</div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabActivities = (props: {
  collection: Partial<CollectionData> | null;
}) => {
  const { darkMode } = useContext(UserContext);

  const [activities, setActivities] = useState<ActivityData[]>([]);

  useEffect(() => {
    if (props.collection?._id) {
      Activity.getByCollection(props.collection._id).then(
        (res: ActivityData[]) => {
          if (res) {
            setActivities(
              res.sort((a, b) => {
                const atime = a.timeStamp ?? a.createdAt;
                const btime = b.timeStamp ?? b.createdAt;
                if (atime > btime) {
                  return -1;
                } else if (atime < btime) {
                  return 1;
                } else {
                  return 0;
                }
              })
            );
          }
        }
      );
    }
  }, [props.collection?._id]);

  return (
    <div tw="mx-auto px-4 pb-8 w-full max-w-[1392px]">
      <div tw="flex items-center gap-[7px] cursor-pointer">
        <span tw="text-base tracking-tight text-dark dark:text-light/90">
          Sort by
        </span>
        <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
          Last 90 days
        </span>
        {getIcon('dropdown', '#3169FA')}
      </div>
      <div tw="pt-8 flex items-center gap-8">
        <div>
          <div tw="flex items-center gap-[7px]">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-base md:text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
              13.79K
            </span>
          </div>
          <div tw="pt-1 text-sm md:text-base leading-[150%] tracking-tight text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            90 day avg. price
          </div>
        </div>
        <div>
          <div tw="flex items-center gap-[7px]">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-base md:text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
              189.97K
            </span>
          </div>
          <div tw="pt-1 text-sm md:text-base leading-[150%] tracking-tight text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
            90 day volume
          </div>
        </div>
      </div>
      <div tw="pt-8">
        <img alt="chart" src={imgChart} />
      </div>
      <div tw="px-0 md:px-6 py-8">
        {activities.map((item) => (
          <Fragment key={item._id}>
            <div
              css={{ gridTemplateColumns: '1fr 4fr 1fr 2fr 2fr 2fr' }}
              tw="hidden py-4 md:grid gap-2 items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
            >
              <div tw="flex items-center gap-[9px]">
                {getIcon(
                  ActivityIcon[item.activity_type],
                  darkMode ? '#fff' : '#000'
                )}
                <span tw="text-base tracking-tight text-dark dark:text-light/90">
                  {item.activity_type}
                </span>
              </div>
              <NftItem
                collectionName={props.collection?.collection_name ?? ''}
                nftId={item.nft_id}
              />
              <div>
                <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {item.price ?? 0}
                </div>
                <div tw="pt-1 text-sm tracking-tight text-gray-500 ">${0}</div>
              </div>
              <div>
                <Link
                  to={`/profile/wallet-address/${item.fromAddress}`}
                  tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                >
                  {shortAddress(item.fromAddress, 2, 4)}
                </Link>
                <div tw="pt-1 text-sm tracking-tight text-gray-500 ">From</div>
              </div>
              <div>
                <Link
                  to={`/profile/wallet-address/${item.toAddress}`}
                  tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                >
                  {shortAddress(item.toAddress, 2, 4)}
                </Link>
                <div tw="pt-1 text-sm tracking-tight text-gray-500 ">To</div>
              </div>
              <div>
                <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {format(
                    new Date(item.timeStamp ?? item.createdAt),
                    'MM/dd/yyyy, hh:mm a'
                  )}
                </div>
                <div tw="pt-1 text-sm tracking-tight text-gray-500 ">Time</div>
              </div>
            </div>
            <ActivityItemMobile
              collectionName={props.collection?.collection_name ?? ''}
              item={item}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default TabActivities;
