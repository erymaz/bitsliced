import 'twin.macro';

import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Collection } from '../api/api';
import iconVerified from '../assets/svgs/icon-verified.svg';
import { UserContext } from '../contexts/UserContext';
import {
  CollectionData,
  defaultCollectionData,
  NftData,
  OrderParam,
  OrderStatus,
  OrderType,
} from '../type.d';
import { getMimeType, nFormatter } from '../utils';
import { time2ms } from '../utils/datetime';
import { alertError } from '../utils/toast';
import { getIcon } from './ColoredIcon';
import { StyledButton } from './lib/StyledComponents';

const ItemCardLandscape = ({
  amount,
  data,
  period,
  token,
}: {
  data: Partial<NftData> | null;
  amount?: number;
  period?: {
    startDate?: Date;
    endDate?: Date;
    key?: string;
  };
  token?: string;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [collection, setCollection] = useState<CollectionData>(
    defaultCollectionData
  );
  const [owned, setOwned] = useState<boolean>(false);
  const [listed, setListed] = useState<OrderParam | null>(null);
  const [buyable, setBuyable] = useState<boolean>(false);
  const [sold, setSold] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setMimeType(getMimeType(data?.image));

    // console.log('NFT data:', data);

    const listOrder = data?.orders?.find(
      (item) => item.orderType === OrderType.SELL
    );
    const buyable = data?.orders?.find(
      (item) =>
        item.orderType === OrderType.SELL && item.status === OrderStatus.PENDING
    );
    setBuyable(!!buyable);
    const sold = data?.orders?.find(
      (item) =>
        item.orderType === OrderType.SELL &&
        item.status === OrderStatus.ACCEPTED
    );
    setSold(!!sold);
    if (listOrder) {
      setListed(listOrder);
      // console.log('listOrder', listOrder);
    } else {
      setListed(null);
    }
    if (data?.collection_id) {
      Collection.getById(data.collection_id)
        .then((res: CollectionData) => {
          setCollection(res);
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode}: ${e.response.data.message}`
            );
          } else {
            alertError('Cannot get the collection data.');
          }
        });
    }
  }, [data]);

  useEffect(() => {
    if (data && user) {
      setOwned(data?.owner === user?.walletAddress);
    }
  }, [data, user]);

  return data ? (
    <div
      key={data._id}
      tw="inline-flex flex-wrap sm:flex-nowrap bg-white dark:bg-light/5 rounded-lg overflow-hidden shadow-xl"
    >
      <Link to={`/item/${data._id}`}>
        <div
          css={
            data.joinedUsers
              ? {
                  backgroundImage: mimeType.startsWith('video')
                    ? 'none'
                    : `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0.189) 73.96%, rgba(0, 0, 0, 0.3) 100%), url(${data.image})`,
                }
              : {
                  backgroundImage: mimeType.startsWith('video')
                    ? 'none'
                    : `linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 29.92%, rgba(0, 0, 0, 0) 73.96%, rgba(0, 0, 0, 0.05) 100%), url(${data.image})`,
                }
          }
          tw="w-[220px] h-[220px] relative bg-white bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden"
        >
          {mimeType.startsWith('video') ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm z-10"
            >
              <source src={data.image} type={mimeType} />
            </video>
          ) : (
            <picture
              // css={{ backgroundImage: `url(${data.image})` }}
              tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl rounded-lg z-10"
            >
              <source
                srcSet={data.image}
                tw="w-full h-full object-contain object-center"
                type="image/avif"
              />
              <source
                srcSet={data.image}
                tw="w-full h-full object-contain object-center"
                type="image/webp"
              />
              <img
                alt=""
                src={data.image}
                tw="w-full h-full object-contain object-center"
              />
            </picture>
          )}
          {data.joinedUsers && (
            <div tw="absolute left-2.5 bottom-2.5 flex items-center">
              {data.joinedUsers.map((u) => (
                <div
                  key={u._id}
                  css={{ backgroundImage: `url(/images/${u})` }}
                  tw="mr-[-14px] w-[30px] h-[30px] box-border bg-no-repeat bg-center bg-cover border-2 border-[#666] rounded-full"
                />
              ))}
              <span tw="ml-[21px] text-[10px] tracking-tight">
                Joined by {data.joinedUsers?.length} users
              </span>
            </div>
          )}
        </div>
      </Link>
      <div tw="px-4 py-2">
        <div tw="flex items-center gap-1.5 text-[10px] tracking-tight leading-[150%] capitalize text-gray-500 ">
          {data.collection?.collection_name ??
            collection.collection_name ??
            'Unknown'}
          {(data.collection?.verified || collection.verified) && (
            <img alt="verified" src={iconVerified} width={11} />
          )}
        </div>
        <Link to={`/item/${data._id}`}>
          <div tw="pt-1 font-semibold text-[12px] tracking-tight leading-[150%] capitalize text-dark dark:text-light/90">
            {data.name}
          </div>
        </Link>
        {listed ? (
          <>
            <div tw="pt-2.5 flex items-center gap-0.5">
              {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-[14px] tracking-tight leading-[150%] text-dark dark:text-light/90">
                {listed.price ? nFormatter(listed.price, 1) : 0}
              </span>
            </div>
            {listed.startTime && listed.endTime && (
              <div tw="pt-[12px]">
                <div tw="h-10 flex justify-start items-center gap-[4px]">
                  <span tw="text-[14px] text-dark dark:text-light/90">
                    {format(
                      new Date(time2ms(listed.startTime)),
                      'MM/dd/yyyy' // 'MM/dd/yyyy, hh:mm a'
                    )}
                    {' - '}
                    {format(
                      new Date(time2ms(listed.endTime)),
                      'MM/dd/yyyy' // 'MM/dd/yyyy, hh:mm a'
                    )}
                  </span>
                </div>
                <StyledButton
                  bold
                  outlined
                  wide
                  tw="mt-[16px] w-full justify-center"
                >
                  {sold ? 'SOLD OUT' : 'LISTED'}
                </StyledButton>
              </div>
            )}
          </>
        ) : (
          <>
            <div tw="pt-2.5 flex items-center gap-0.5">
              {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-[14px] tracking-tight leading-[150%] text-dark dark:text-light/90">
                {amount ? nFormatter(amount, 1) : 0}
              </span>
            </div>
            {period && period.startDate && period.endDate && (
              <div tw="pt-[12px]">
                <div tw="h-10 flex justify-start items-center gap-[4px]">
                  <span tw="text-[14px] text-dark dark:text-light/90">
                    {format(new Date(period.startDate), 'MM/dd/yyyy')}
                    {' - '}
                    {format(new Date(period.endDate), 'MM/dd/yyyy')}
                  </span>
                </div>
                <StyledButton
                  bold
                  outlined
                  wide
                  tw="mt-[16px] w-full justify-center"
                >
                  TO BE LISTED
                </StyledButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ) : null;
};

export default ItemCardLandscape;
