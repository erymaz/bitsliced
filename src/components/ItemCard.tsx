import { format } from 'date-fns';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import tw from 'twin.macro';

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
import { getMimeType, getTickerFromName, nFormatter } from '../utils';
import { time2ms, timeAgo } from '../utils/datetime';
import { alertError } from '../utils/toast';
import { getTokenInfoByAddress } from '../utils/tokens';
import { getIcon } from './ColoredIcon';
import { StyledButton } from './lib/StyledComponents';

const ItemCard = ({
  data,
  inChannel,
  landscape,
}: {
  data: Partial<NftData> | null;
  inChannel?: boolean;
  landscape?: boolean;
}) => {
  const { darkMode, setMakeOfferData, setNftToBid, setNftToBuy, user } =
    useContext(UserContext);

  const [collection, setCollection] = useState<CollectionData>(
    defaultCollectionData
  );
  const [owned, setOwned] = useState<boolean>(false);
  const [listed, setListed] = useState<OrderParam | null>(null);
  const [buyable, setBuyable] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setMimeType(getMimeType(data?.image));

    const listOrder = data?.orders?.find(
      (item) => item.orderType === OrderType.SELL
    );
    const buyable = data?.orders?.find(
      (item) =>
        item.orderType === OrderType.SELL && item.status === OrderStatus.PENDING
    );
    setBuyable(!!buyable);
    if (listOrder) {
      setListed(listOrder);
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
            // alertError('Cannot get the collection data.');
          }
        });
    }
  }, [data]);

  const auctionEnded = useMemo(() => {
    return (
      data?.auction && time2ms(data.auction.endTime) < new Date().getTime()
    );
  }, [data?.auction]);

  const saleEnded = useMemo(() => {
    return (
      listed && listed.endTime && time2ms(listed.endTime) < new Date().getTime()
    );
  }, [listed]);

  useEffect(() => {
    if (data && user) {
      setOwned(data?.owner === user?.walletAddress);
    }
  }, [data, user]);

  // useEffect(() => {
  //   console.log(listed, data?.auction);
  // }, [listed, data?.auction]);

  return data ? (
    <div
      key={data._id}
      css={[
        landscape ? tw`w-max` : tw`flex-col`,
        tw`relative flex overflow-hidden bg-white dark:bg-white/5 rounded-lg dark:border-[1px] dark:border-light/10 shadow-sm`,
      ]}
      title={getTickerFromName(data.name)}
    >
      <Link to={`/item/${data._id}`}>
        <div
          css={{
            backgroundImage: mimeType.startsWith('video')
              ? 'none'
              : `linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0) 29.92%, rgba(0, 0, 0, 0) 73.96%, rgba(0, 0, 0, 0.05) 100%), url(${data.image})`,
            maxWidth: landscape ? 240 : 'unset',
            width: landscape ? 240 : 'unset',
          }}
          tw="pb-[100%] relative bg-white bg-no-repeat bg-center bg-cover overflow-hidden select-none z-[1] rounded-lg"
        >
          {mimeType.startsWith('video') ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm rounded-lg z-10"
            >
              <source src={data.image} type={mimeType} />
            </video>
          ) : (
            <picture
              // css={{ backgroundImage: `url(${data.image})` }}
              tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10 rounded-lg"
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
            <div tw="absolute left-2 bottom-2 flex items-center">
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
          {data && !data.isMinted && (
            <div tw="px-[14px] h-[35px] absolute left-[10px] top-[10px] flex items-center gap-2 bg-[rgba(0, 0, 0, 0.05)] border-2 border-white rounded-[100px] z-10">
              <span tw="font-medium text-[14px] leading-[90%] text-white">
                Not minted
              </span>
              <div tw="w-[6px] min-w-[6px] h-[6px] bg-white rounded-full" />
            </div>
          )}
        </div>
      </Link>
      <div tw="flex flex-col justify-between">
        <div>
          <div tw="flex flex-col p-3 space-y-1">
            <div tw="min-h-[15px] flex items-center gap-1.5 text-[10px] tracking-tight leading-[150%] capitalize text-gray-500 truncate break-all">
              {data.collection?.collection_name ??
                collection.collection_name ??
                'Unknown'}
              {(data.collection?.verified || collection.verified) && (
                <img alt="verified" src={iconVerified} width={11} />
              )}
            </div>
            <div tw="flex items-center justify-between">
              <div tw="flex space-x-1 items-center min-w-0">
                <Link
                  to={`/item/${data._id}`}
                  tw="font-semibold text-xs tracking-tight leading-[150%] text-dark dark:text-light/90 truncate break-all"
                >
                  {data.name}
                </Link>
              </div>
              <div tw="flex items-center space-x-1">
                <div tw="scale-75 origin-right">
                  {listed?.quoteToken || data.auction?.quoteToken
                    ? getIcon(
                        getTokenInfoByAddress(
                          listed?.quoteToken ?? data.auction?.quoteToken ?? ''
                        )?.icon,
                        darkMode ? '#fff' : '#000'
                      )
                    : getIcon('sliced', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-xs tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {listed
                    ? nFormatter(listed.price, 1)
                    : data.auction
                    ? nFormatter(
                        data.auction.price ?? data.auction.startPrice,
                        1
                      )
                    : '0'}
                </span>
              </div>
            </div>
          </div>
          <div tw="w-full h-[1px] bg-dark/10 dark:bg-light/10"></div>
        </div>
        <div tw="flex flex-col justify-between p-3 space-y-1">
          {owned ? (
            listed || data.auction ? (
              data.auction ? (
                <div tw="flex flex-col gap-3">
                  <div tw="flex flex-wrap justify-start items-center">
                    <span tw="text-xs text-gray-500 pr-1">Ends at</span>
                    <span tw="text-xs text-dark dark:text-light/90">
                      {format(
                        new Date(time2ms(data.auction.endTime)),
                        'MM/dd/yyyy, hh:mm a'
                      )}
                    </span>
                  </div>
                  <StyledButton
                    bold
                    tw="w-full items-center text-dark dark:text-light/90 bg-transparent dark:bg-transparent border-2 border-gray-500 opacity-50"
                  >
                    {getIcon('listing', darkMode ? '#fff' : '#000')}
                    <span tw="font-semibold text-sm tracking-tight">
                      Listed
                    </span>
                  </StyledButton>
                </div>
              ) : (
                <div>
                  <StyledButton
                    bold
                    tw="w-full items-center text-dark dark:text-light/90 bg-transparent dark:bg-transparent border-2 border-gray-500 opacity-50"
                  >
                    {getIcon('listing', darkMode ? '#fff' : '#000')}
                    <span tw="font-semibold text-sm tracking-tight">
                      Listed
                    </span>
                  </StyledButton>
                </div>
              )
            ) : data.noAction ? (
              <div />
            ) : (
              <div>
                <Link
                  to={`/nft/${data._id}/list`}
                  tw="h-10 px-3 flex items-center gap-[7px] font-semibold text-sm tracking-tight text-light  bg-dark dark:bg-light dark:text-dark rounded-lg"
                >
                  {getIcon('wallet', darkMode ? '#000' : '#fff')}
                  <span tw="font-semibold text-sm tracking-tight">
                    List Item
                  </span>
                </Link>
              </div>
            )
          ) : (
            <>
              {data.auction ? (
                <div tw="flex flex-col gap-3">
                  <div
                    css={auctionEnded ? { paddingBottom: 56 } : {}}
                    tw="flex flex-wrap justify-start items-center"
                  >
                    <span tw="text-xs text-gray-500 pr-1">
                      {auctionEnded ? 'Auction ended' : 'Ends at'}
                    </span>
                    <span tw="text-xs text-dark dark:text-light/90">
                      {auctionEnded
                        ? timeAgo(new Date(time2ms(data.auction.endTime)))
                        : format(
                            new Date(time2ms(data.auction.endTime)),
                            'MM/dd/yyyy, hh:mm a'
                          )}
                    </span>
                  </div>
                  {!auctionEnded && (
                    <StyledButton
                      bold
                      tw="w-full"
                      onClick={
                        auctionEnded
                          ? () => {
                              return;
                            }
                          : () => setNftToBid(data)
                      }
                    >
                      {getIcon('wallet', darkMode ? '#000' : '#fff')}
                      <span tw="font-semibold text-sm tracking-tight">
                        Place Bid
                      </span>
                    </StyledButton>
                  )}
                </div>
              ) : (
                <>
                  {listed &&
                    buyable &&
                    (saleEnded ? (
                      <div tw="flex flex-wrap justify-start items-center">
                        <span tw="text-xs text-gray-500 pr-1">Sale ended</span>{' '}
                        <span tw="text-xs text-dark dark:text-light/90">
                          {listed.endTime &&
                            timeAgo(new Date(time2ms(listed.endTime)))}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <StyledButton
                          bold
                          tw="w-full "
                          onClick={() => setNftToBuy(data)}
                        >
                          {getIcon('wallet', darkMode ? '#000' : '#fff')}
                          <span tw="font-semibold text-sm tracking-tight">
                            Buy now
                          </span>
                        </StyledButton>
                      </div>
                    ))}
                  {!inChannel && (
                    <div>
                      <button
                        tw="h-10 px-3 w-full  flex items-center gap-[7px]"
                        onClick={() =>
                          setMakeOfferData({
                            collection,
                            nft: data,
                          })
                        }
                      >
                        {getIcon('offer', darkMode ? '#fff' : '#000')}
                        <span tw="font-semibold text-sm tracking-tight text-dark dark:text-light/90">
                          Make offer
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default ItemCard;
