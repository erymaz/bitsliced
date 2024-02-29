import 'twin.macro';

import { Fragment, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Activity, Collection, Nft } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import { ActivityData, CollectionData, NftData } from '../../type';
import { getMimeType, shortAddress } from '../../utils';

const ActivityTags: { [key: string]: string } = {
  List: 'listing',
  Sale: 'cart',
};

const ActivityItem = ({ item }: { item: ActivityData }) => {
  const { darkMode } = useContext(UserContext);

  const [nft, setNft] = useState<NftData | null>(null);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (item.nft_id) {
      Nft.getById(item.nft_id).then((res) => {
        if (res) {
          setNft(res);
          setMimeType(getMimeType(res.image));
        }
      });
    }
  }, [item.nft_id]);

  useEffect(() => {
    if (item.collection_id) {
      Collection.getById(item.collection_id).then((res) => {
        if (res) {
          setCollection(res);
        }
      });
    }
  }, [item.collection_id]);

  return (
    <>
      <div
        css={{ gridTemplateColumns: '1fr 4fr 1fr 2fr 2fr 0.6fr' }}
        tw="py-4 hidden md:grid gap-2 items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
      >
        <div tw="flex items-center gap-[9px]">
          {getIcon(
            ActivityTags[item.activity_type],
            darkMode ? '#fff' : '#000'
          )}
          <span tw="text-base tracking-tight text-dark dark:text-light/90">
            {item.activity_type}
          </span>
        </div>
        <div tw="flex items-center gap-3.5">
          <Link to={`/item/${item.nft_id}`}>
            <div
              css={{
                backgroundImage: mimeType.startsWith('video')
                  ? 'none'
                  : `url(${nft?.image})`,
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
                  <source src={nft?.image} type={mimeType} />
                </video>
              )}
            </div>
          </Link>
          <div>
            <Link to={`/item/${item.nft_id}`}>
              <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                {nft?.name}
              </div>
            </Link>
            <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
              {collection?.collection_name}
            </div>
          </div>
        </div>
        <div>
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {item.price}
          </div>
          <div tw="pt-1 text-sm tracking-tight text-gray-500 ">${0}</div>
        </div>
        <div>
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {shortAddress(item.fromAddress)}
          </div>
          <div tw="pt-1 text-sm tracking-tight text-gray-500 ">From</div>
        </div>
        <div>
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {shortAddress(item.toAddress)}
          </div>
          <div tw="pt-1 text-sm tracking-tight text-gray-500 ">To</div>
        </div>
        <div>
          <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            {item.createdAt && new Date(item.createdAt).toLocaleString()}
          </div>
          <div tw="pt-1 text-sm tracking-tight text-gray-500 ">Time</div>
        </div>
      </div>
      <div tw="block py-4 md:hidden items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]">
        <div
          css={{ gridTemplateColumns: '1fr 4fr 20px' }}
          tw="grid items-center gap-2"
          onClick={() => setExpanded(!expanded)}
        >
          <div tw="flex items-center gap-[9px]">
            {getIcon(
              ActivityTags[item.activity_type],
              darkMode ? '#fff' : '#000'
            )}
            <span tw="text-base tracking-tight text-dark dark:text-light/90">
              {item.activity_type}
            </span>
          </div>
          <div tw="flex items-center gap-3.5">
            <Link to={`/item/${item.nft_id}`}>
              <div
                css={{
                  backgroundImage: mimeType.startsWith('video')
                    ? 'none'
                    : `url(${nft?.image})`,
                }}
                tw="relative w-[60px] h-[60px] bg-no-repeat bg-center bg-cover rounded-[7px] bg-[#D9D9D9] overflow-hidden"
              >
                {mimeType.startsWith('video') && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    tw="absolute left-0 top-0 w-full h-full object-cover z-10"
                  >
                    <source src={nft?.image} type={mimeType} />
                  </video>
                )}
              </div>
            </Link>
            <div>
              <Link to={`/item/${item.nft_id}`}>
                <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {nft?.name}
                </div>
              </Link>
              <div tw="pt-1 text-sm tracking-tight text-gray-500 ">
                {collection?.collection_name}
              </div>
            </div>
          </div>
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
                {item.price}
              </div>
              <div tw="pt-1 text-sm tracking-tight text-gray-500 ">${0}</div>
            </div>
            <div>
              <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                {shortAddress(item.fromAddress)}
              </div>
              <div tw="pt-1 text-sm tracking-tight text-gray-500 ">From</div>
            </div>
            <div>
              <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                {shortAddress(item.toAddress)}
              </div>
              <div tw="pt-1 text-sm tracking-tight text-gray-500 ">To</div>
            </div>
            <div>
              <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                {item.createdAt && new Date(item.createdAt).toLocaleString()}
              </div>
              <div tw="pt-1 text-sm tracking-tight text-gray-500 ">Time</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const TabActivity = () => {
  const { user } = useContext(UserContext);

  const [activities, setActivities] = useState<ActivityData[]>([]);

  useEffect(() => {
    if (user?.walletAddress) {
      Activity.getByUser(user?.walletAddress).then((res: ActivityData[]) => {
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
      });
    }
  }, [user?.walletAddress]);

  return (
    <div tw="mx-auto px-4 pb-8 w-full max-w-[1392px]">
      <div tw="px-0 md:px-6 pb-8">
        {activities.map((item) => (
          <Fragment key={item._id}>
            <ActivityItem item={item} />
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default TabActivity;
