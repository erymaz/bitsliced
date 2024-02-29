import 'twin.macro';
import 'react-tooltip/dist/react-tooltip.css';

import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import {
  Activity,
  Auction,
  Auth,
  Collection,
  Favorite,
  Nft,
  Order,
} from '../api/api';
import iconExternalLink from '../assets/svgs/external-link.svg';
import iconVerified from '../assets/svgs/icon-verified.svg';
import { getIcon } from '../components/ColoredIcon';
import { StyledButton } from '../components/lib/StyledComponents';
import { UserContext } from '../contexts/UserContext';
import {
  ActivityData,
  ActivityIcon,
  CollectionData,
  NftData,
  OrderParam,
  OrderStatus,
  OrderType,
  User,
} from '../type.d';
import { getMimeType, nFormatter, shortAddress } from '../utils';
import { time2ms, timeAgo } from '../utils/datetime';
import { alertError, alertSuccess, alertWarning } from '../utils/toast';
import { getTokenInfoByAddress, getTokenPriceByAddress } from '../utils/tokens';
import ShareItemPopup from './ItemPage/ShareItemPopup';
import TransferItemPopup from './ItemPage/TransferItemPopup';
import AcceptOfferPopup from './PurchasePopups/AcceptOfferPopup';

const ItemPage = () => {
  const params = useParams();
  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setMakeOfferData,
    setNftToBid,
    setNftToBuy,
    user,
  } = useContext(UserContext);
  const navigate = useNavigate();

  const [nftData, setNftData] = useState<NftData | undefined>(undefined);
  const [collection, setCollection] = useState<CollectionData | undefined>(
    undefined
  );
  const [owner, setOwner] = useState<User | null>(null);
  const [expandProperties, setExpandProperties] = useState<boolean>(true);
  const [expandDetails, setExpandDetails] = useState<boolean>(false);
  const [expandAboutCollection, setExpandAboutCollection] =
    useState<boolean>(false);
  const [expandOffers, setExpandOffers] = useState<boolean>(false);
  const [expandActivity, setExpandActivity] = useState<boolean>(false);
  const [sellOrder, setSellOrder] = useState<OrderParam | null>(null);
  const [offers, setOffers] = useState<OrderParam[]>([]);
  const [maxOfferPrice, setMaxOfferPrice] = useState<number>(0);
  const [selectedOffer, setSelectedOffer] = useState<OrderParam | null>(null);
  const [maxOffer, setMaxOffer] = useState<OrderParam | null>(null);
  const [showAcceptPopup, setShowAcceptPopup] = useState<boolean>(false);
  const [buyable, setBuyable] = useState<boolean>(false);
  const [favoriteStatus, setFavoriteStatus] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [activityFilters, setActivityFilters] = useState<string[]>([]);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [activityUser, setActivityUser] = useState<User | null>(null);
  const [showSharePopup, setShowSharePopup] = useState<boolean>(false);
  const [showTransferPopup, setShowTransferPopup] = useState<boolean>(false);
  const [lockTransfer, setLockTransfer] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] =
    useState<boolean>(false);
  const [canceling, setCanceling] = useState<boolean>(false);
  const [expanded3dots, setExpanded3dots] = useState<boolean>(false);

  const loadNftItem = (id: string) => {
    increaseLoading(true);
    Nft.getById(id)
      .then((res: NftData) => {
        if (res) {
          setNftData(res);
          setMimeType(getMimeType(res.image));

          // get activities
          if (res._id) {
            Activity.getByNft(res._id).then((actRes: ActivityData[]) => {
              setActivities(actRes);
            });
          }

          const found = res.orders?.find(
            (item) => item.orderType === OrderType.SELL
          );
          setSellOrder(found ?? null);

          const buyable = res.orders?.find(
            (item) =>
              item.orderType === OrderType.SELL &&
              item.status === OrderStatus.PENDING
          );
          setBuyable(!!buyable);
          const offerOrders =
            res.orders?.filter((item) => item.orderType !== OrderType.SELL) ??
            [];
          setOffers(offerOrders);
          const maxPrice = Math.max(
            ...offerOrders
              .filter(
                (item) => (item.endTime ?? 0) > new Date().getTime() / 1000
              )
              .map((item) => {
                return item.price;
              })
          );
          if (maxPrice > 0) {
            setMaxOfferPrice(maxPrice);
            const maxOffer = offerOrders
              .filter(
                (item) => (item.endTime ?? 0) > new Date().getTime() / 1000
              )
              // we should pick the earlier offer first if the prices are same.
              .sort((a, b) => {
                if (!a.createdAt) {
                  return -1;
                } else if (!b.createdAt) {
                  return 1;
                } else if (a.createdAt < b.createdAt) {
                  return -1;
                } else if (a.createdAt > b.createdAt) {
                  return 1;
                }
                return 0;
              })
              .find((item) => item.price === maxPrice);
            setMaxOffer(maxOffer ?? null);
          } else {
            setMaxOfferPrice(0);
            setMaxOffer(null);
          }

          if (res.collection_id) {
            Collection.getById(res.collection_id).then(
              (res: CollectionData) => {
                setCollection(res);
              }
            );
          }
          Auth.getByWallet(res.owner).then((res: User) => {
            setOwner(res);
          });
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      })
      .finally(() => decreaseLoading(true));
  };

  useEffect(() => {
    if (params?.id) {
      loadNftItem(params?.id);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id && nftData && user && user._id) {
      increaseLoading(true);
      Favorite.check('nft', params.id, user._id)
        .then((res: boolean) => {
          setFavoriteStatus(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [params.id, increaseLoading, decreaseLoading, nftData, user]);

  const auctioning = useMemo(() => {
    return (
      nftData?.auction &&
      nftData.auction.status === OrderStatus.PENDING &&
      time2ms(nftData.auction.endTime) > new Date().getTime()
    );
  }, [nftData?.auction]);

  const auctionEnded = useMemo(() => {
    return (
      nftData?.auction &&
      time2ms(nftData.auction.endTime) < new Date().getTime()
    );
  }, [nftData?.auction]);

  const saleEnded = useMemo(() => {
    return (
      sellOrder &&
      sellOrder.endTime &&
      time2ms(sellOrder.endTime) < new Date().getTime()
    );
  }, [sellOrder]);

  useEffect(() => {
    if (params.id && nftData) {
      increaseLoading(true);
      Favorite.count('nft', params.id)
        .then((res: number) => {
          setLikes(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [params.id, increaseLoading, decreaseLoading, nftData]);

  useEffect(() => {
    if (nftData) {
      getTokenPriceByAddress(
        nftData?.quoteToken ?? nftData.auction?.quoteToken
      ).then((res) => {
        setTokenPrice(res);
      });
    }
  }, [nftData]);

  const handleFavorite = () => {
    if (params.id && nftData && user && user._id) {
      increaseLoading(true);
      Favorite.create({
        itemId: params.id,
        typeName: 'nft',
        userId: user._id,
      })
        .then((res: boolean) => {
          if (res) {
            setFavoriteStatus((prev) => {
              if (prev) {
                setLikes(Math.max(likes - 1, 0));
              } else {
                setLikes(likes + 1);
              }
              return !prev;
            });
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  };

  const toggleActivityFilter = (filter: string) => {
    if (activityFilters.includes(filter)) {
      setActivityFilters(activityFilters.filter((item) => item !== filter));
    } else {
      setActivityFilters([...activityFilters, filter]);
    }
  };

  return (
    <div tw="mx-auto px-3 lg:px-6 py-6 flex flex-col-reverse lg:flex-row-reverse gap-8 w-full">
      <Helmet>
        <meta content="photo" name="twitter:card" />
        {/* <meta content="@username" name="twitter:site" /> */}
        <meta
          content={`NFT "${nftData?.name}" | Bitsliced`}
          name="twitter:title"
        />
        <meta content={nftData?.description} name="twitter:description" />
        <meta content={nftData?.image} name="twitter:image" />
        <meta
          content={
            window.location
              ? `${window.location.protocol}//${window.location.host}/item/${nftData?._id}`
              : `http://18.205.237.239/item/${nftData?._id}`
          }
          name="twitter:url"
        />
      </Helmet>
      <div tw="block lg:hidden w-full px-0 lg:px-6 pb-2 order-1">
        <Link
          to={`/collection/${collection?._id}`}
          tw="flex items-center gap-1.5"
        >
          <div
            css={{
              backgroundImage: `url(${collection?.collection_profile_image_url})`,
            }}
            tw="w-8 lg:w-10 h-8 lg:h-10 bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
          />
          <span tw="pl-1 text-base tracking-tight text-[#2F2F2F] dark:text-[#e1e1e1]">
            {collection?.collection_name ?? '[Collection Name]'}
          </span>
          <img alt="verified" src={iconVerified} width={20} />
        </Link>
        <h2 tw="pt-2.5 font-semibold text-lg lg:text-2xl leading-[150%] tracking-tight capitalize text-dark dark:text-light/90">
          {nftData?.name}
        </h2>
        <div tw="pt-1 flex items-center">
          <span tw="text-sm md:text-base tracking-tight text-gray-500">
            Owned by
          </span>
          <span tw="pl-1.5 pr-[10px]">
            <Link
              to={`/profile/${owner?._id}`}
              tw="relative text-sm md:text-base font-semibold tracking-tight text-dark dark:text-light/90"
            >
              {owner?.name}
            </Link>
            &nbsp;
            <Link
              to={`/profile/wallet-address/${owner?.walletAddress}`}
              tw="text-sm md:text-base tracking-tight text-gray-500"
            >
              ({shortAddress(nftData?.owner)})
            </Link>
          </span>
          {/* <Link to="/message">
            {getIcon('chat', darkMode ? '#fff' : '#000')}
          </Link> */}
        </div>
        {nftData && !nftData.isMinted && (
          <div tw="pt-8 pb-6 flex items-center gap-[14px] flex-wrap">
            <div tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#0008] dark:text-[#fff8]">
              Created but not minted yet
            </div>
            {nftData.owner === user?.walletAddress && (
              <>
                <Link
                  to={`/nft/${nftData._id}/edit`}
                  tw="px-[14px] h-[40px] flex items-center gap-[7px] bg-[rgba(57,221, 57, 0.2)] rounded-[100px]"
                >
                  {getIcon('edit', '#39DD39')}
                  <span tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#39DD39]">
                    Edit NFT
                  </span>
                </Link>
                <button
                  tw="px-3.5 h-[40px] flex items-center gap-[7px] bg-[rgba(221, 57, 57, 0.2)] rounded-[100px]"
                  onClick={() => setShowDeleteConfirmPopup(true)}
                >
                  <div tw="rotate-45">{getIcon('add', '#DD3939')}</div>
                  <span tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#DD3939]">
                    Delete NFT
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div tw="w-full lg:w-3/5">
        <div tw="hidden lg:block px-0 lg:px-6 pb-4">
          <Link
            to={`/collection/${collection?._id}`}
            tw="flex items-center gap-1.5"
          >
            <div
              css={{
                backgroundImage: `url(${collection?.collection_profile_image_url})`,
              }}
              tw="w-8 lg:w-10 h-8 lg:h-10 bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-full"
            />
            <span tw="pl-1 text-base tracking-tight text-[#2F2F2F] dark:text-[#e1e1e1]">
              {collection?.collection_name ?? '[Collection Name]'}
            </span>
            <img alt="verified" src={iconVerified} width={20} />
          </Link>
          <h2 tw="pt-2.5 font-semibold text-lg lg:text-2xl leading-[150%] tracking-tight capitalize text-dark dark:text-light/90">
            {nftData?.name}
          </h2>
          <div tw="pt-1 flex items-center">
            <span tw="text-sm md:text-base tracking-tight text-gray-500">
              Owned by
            </span>
            <span tw="pl-1.5 pr-[10px]">
              <Link
                to={`/profile/${owner?._id}`}
                tw="relative text-sm md:text-base font-semibold tracking-tight text-dark dark:text-light/90"
              >
                {owner?.name}
              </Link>
              &nbsp;
              <Link
                to={`/profile/wallet-address/${owner?.walletAddress}`}
                tw="text-sm md:text-base tracking-tight text-gray-500"
              >
                ({shortAddress(nftData?.owner)})
              </Link>
            </span>
            {/* <Link to="/message">
              {getIcon('chat', darkMode ? '#fff' : '#000')}
            </Link> */}
          </div>
          {nftData && !nftData.isMinted && (
            <div tw="pt-8 pb-6 flex items-center gap-[14px] flex-wrap">
              <div tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#0008] dark:text-[#fff8]">
                Created but not minted yet
              </div>
              {nftData.owner === user?.walletAddress && (
                <>
                  <Link
                    to={`/nft/${nftData._id}/edit`}
                    tw="px-[14px] h-[40px] flex items-center gap-[7px] bg-[rgba(57,221, 57, 0.2)] rounded-[100px]"
                  >
                    {getIcon('edit', '#39DD39')}
                    <span tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#39DD39]">
                      Edit NFT
                    </span>
                  </Link>
                  <button
                    tw="px-3.5 h-[40px] flex items-center gap-[7px] bg-[rgba(221, 57, 57, 0.2)] rounded-[100px]"
                    onClick={() => setShowDeleteConfirmPopup(true)}
                  >
                    <div tw="rotate-45">{getIcon('add', '#DD3939')}</div>
                    <span tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#DD3939]">
                      Delete NFT
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div tw="p-3 lg:p-6 bg-white dark:bg-white/5 rounded-lg">
          {((sellOrder && sellOrder.endTime) || auctioning) && (
            <div tw="flex justify-between items-center gap-2 flex-wrap">
              {sellOrder && sellOrder.endTime ? (
                <div>
                  <span tw="text-sm md:text-base leading-[150%] tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                    Sale {saleEnded ? 'ended' : 'ends at'}
                  </span>{' '}
                  <span tw="font-semibold text-sm md:text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                    {saleEnded
                      ? timeAgo(new Date(time2ms(sellOrder.endTime)))
                      : new Date(time2ms(sellOrder.endTime)).toLocaleString()}
                  </span>
                </div>
              ) : (
                auctioning && (
                  <div>
                    <span tw="text-sm md:text-base leading-[150%] tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                      Auction {auctionEnded ? 'ended' : 'ends at'}
                    </span>{' '}
                    <span tw="font-semibold text-sm md:text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                      {auctionEnded
                        ? timeAgo(new Date(time2ms(nftData?.auction?.endTime)))
                        : new Date(
                            time2ms(nftData?.auction?.endTime)
                          ).toLocaleString()}
                    </span>
                  </div>
                )
              )}
              {nftData && nftData.owner === user?.walletAddress && (
                <button
                  disabled={canceling}
                  tw="px-3.5 h-[40px] flex items-center gap-[7px] bg-[rgba(221, 57, 57, 0.2)] rounded-[100px]"
                  onClick={() => {
                    let assetId = null;
                    if (sellOrder) {
                      assetId = sellOrder.assetId;
                      if (assetId && nftData?.collection_id && nftData?._id) {
                        setCanceling(true);
                        Order.cancel({
                          assetId,
                          collectionId: nftData?.collection_id,
                          nftId: nftData?._id,
                        })
                          .then((res: boolean) => {
                            // console.log('canceled:', res);
                            if (res) {
                              if (params?.id) {
                                loadNftItem(params?.id);
                              }

                              alertSuccess(
                                `Listing of ${nftData?.name} has been canceled.`
                              );
                            } else {
                              alertError('Canceling failed.');
                            }
                          })
                          .catch((e) => {
                            console.error(e);
                            alertError('Cannot be canceled.');
                          })
                          .finally(() => {
                            setTimeout(() => {
                              setCanceling(false);
                            }, 3000);
                          });
                      }
                    } else if (nftData?.auction?._id) {
                      assetId = nftData.auction.assetId;

                      setCanceling(true);
                      Auction.cancel(nftData.auction._id)
                        .then((res) => {
                          // console.log('res', res);
                          if (res) {
                            if (params?.id) {
                              loadNftItem(params?.id);
                            }

                            alertSuccess(
                              `Listing of ${nftData?.name} has been canceled.`
                            );
                          } else {
                            alertError('Canceling failed.');
                          }
                        })
                        .catch((e) => {
                          console.error(e);
                          alertError('Cannot be canceled.');
                        })
                        .finally(() => {
                          setTimeout(() => {
                            setCanceling(false);
                          }, 3000);
                        });
                    }
                  }}
                >
                  <div tw="rotate-45">{getIcon('add', '#DD3939')}</div>
                  <span tw="font-semibold text-[17px] tracking-tight leading-[150%] text-[#DD3939]">
                    {canceling ? 'Processing...' : 'Cancel listing'}
                  </span>
                </button>
              )}
            </div>
          )}
          {sellOrder ? (
            <>
              <div tw="pt-3 md:pt-6 text-sm md:text-base leading-[150%] tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                Fixed price
              </div>
              <div tw="pt-1 pb-3 lg:pb-6 flex items-center">
                {getIcon(
                  getTokenInfoByAddress(sellOrder.quoteToken)?.icon,
                  darkMode ? '#fff' : '#000'
                )}
                <span tw="pl-[7px] font-semibold text-[20px] md:text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                  {nFormatter(sellOrder.price, 8)}
                </span>
                <span tw="pl-2.5 text-sm tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                  (${nFormatter(tokenPrice * (sellOrder.price ?? 0), 2)})
                </span>
              </div>
            </>
          ) : (
            nftData?.auction &&
            auctioning && (
              <>
                <div tw="pt-3 md:pt-6 text-sm md:text-base leading-[150%] tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                  {nftData.auction.price > nftData.auction.startPrice
                    ? 'Current'
                    : 'Start'}{' '}
                  price
                </div>
                <div tw="pt-1 pb-3 lg:pb-6 flex items-center">
                  {getIcon(
                    getTokenInfoByAddress(nftData?.auction.quoteToken)?.icon,
                    darkMode ? '#fff' : '#000'
                  )}
                  <span tw="pl-[7px] font-semibold text-[20px] md:text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                    {nFormatter(
                      nftData.auction.price > nftData.auction.startPrice
                        ? nftData.auction.price
                        : nftData.auction.startPrice,
                      8
                    )}
                  </span>
                  <span tw="pl-2.5 text-sm tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                    ($
                    {nFormatter(
                      tokenPrice *
                        ((nftData.auction.price > nftData.auction.startPrice
                          ? nftData.auction.price
                          : nftData.auction.startPrice) ?? 0),
                      2
                    )}
                    )
                  </span>
                </div>
              </>
            )
          )}
          {user?.walletAddress !== nftData?.owner ? (
            <div tw="flex items-center gap-3.5 flex-wrap">
              {nftData?.auction && auctioning ? (
                <button
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                  onClick={
                    user
                      ? () => setNftToBid(nftData as Partial<NftData>)
                      : () => {
                          alertError('To bid, join please.');
                          navigate(`/join?redirect=/item/${nftData?._id}`);
                        }
                  }
                >
                  {getIcon('wallet', darkMode ? '#000' : '#fff')}
                  <span tw="font-semibold text-sm md:text-base text-light/90 dark:text-dark">
                    Place Bid
                  </span>
                </button>
              ) : (
                <>
                  {sellOrder && buyable && !saleEnded && (
                    <button
                      tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                      onClick={
                        user
                          ? () => setNftToBuy(nftData as Partial<NftData>)
                          : () => {
                              alertError('To buy this item, join please.');
                              navigate(`/join?redirect=/item/${nftData?._id}`);
                            }
                      }
                    >
                      {getIcon('wallet', darkMode ? '#000' : '#fff')}
                      <span tw="font-semibold text-sm md:text-base text-light/90 dark:text-dark">
                        Buy now
                      </span>
                    </button>
                  )}
                  <button
                    tw="pl-4 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent px-3.5"
                    onClick={
                      user
                        ? () =>
                            setMakeOfferData({
                              collection: collection,
                              nft: nftData,
                            })
                        : () => {
                            alertError('To make an offer, join please.');
                            navigate(`/join?redirect=/item/${nftData?._id}`);
                          }
                    }
                  >
                    {getIcon('listing', darkMode ? '#fff' : '#000')}
                    <span tw="font-semibold text-sm md:text-base text-dark dark:text-light">
                      Make offer
                    </span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div tw="flex items-center gap-3.5 flex-wrap">
              {sellOrder &&
                !saleEnded &&
                offers.length > 0 &&
                maxOfferPrice > 0 && (
                  <>
                    {showAcceptPopup && (
                      <AcceptOfferPopup
                        item={nftData}
                        offer={selectedOffer ?? maxOffer}
                        onClose={() => setShowAcceptPopup(false)}
                      />
                    )}
                    <div tw="flex items-center gap-[7px] text-base text-dark dark:text-light/90">
                      {getIcon('sliced', darkMode ? '#fff' : '#000')}{' '}
                      {maxOfferPrice}
                    </div>
                    <button
                      tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                      onClick={() => {
                        setSelectedOffer(null);
                        setShowAcceptPopup(true);
                      }}
                    >
                      {getIcon('channel', darkMode ? '#000' : '#fff')}
                      <span tw="font-semibold text-base text-light/90 dark:text-dark">
                        Accept Offer
                      </span>
                    </button>
                  </>
                )}
              {!sellOrder && !nftData?.auction && (
                <Link
                  to={`/nft/${nftData?._id}/list`}
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                >
                  {getIcon('wallet', darkMode ? '#000' : '#fff')}
                  <span tw="font-semibold text-base tracking-tight text-light/90 dark:text-dark">
                    List Item
                  </span>
                </Link>
              )}
              {!sellOrder && !nftData?.auction && (
                <button
                  css={
                    lockTransfer ? { cursor: 'not-allowed', opacity: 0.6 } : {}
                  }
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                  onClick={
                    lockTransfer
                      ? () => {
                          return;
                        }
                      : () => {
                          setLockTransfer(true);
                          setShowTransferPopup(true);
                        }
                  }
                >
                  {getIcon('transfer', darkMode ? '#000' : '#fff')}
                  <span tw="font-semibold text-sm md:text-base text-light/90 dark:text-dark">
                    {lockTransfer ? 'Transfer' : 'Transfer'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
        <p tw="p-4 max-w-lg text-sm tracking-tight whitespace-pre-wrap text-dark dark:text-light">
          {nftData?.description}
        </p>
        <div tw="bg-white dark:bg-white/5 rounded-lg">
          <div
            tw="px-3 lg:px-6 py-3 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandProperties(!expandProperties)}
          >
            <div tw="flex items-center gap-4">
              {getIcon('details', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                Properties
              </span>
            </div>
            <div
              css={expandProperties ? {} : { transform: 'rotate(180deg)' }}
              tw="duration-300"
            >
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </div>
          {expandProperties &&
            (nftData?.attributes?.length ? (
              <div tw="p-3 lg:p-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {nftData?.attributes.map((item, index) => (
                  <div
                    key={`property-${index}`}
                    tw="relative p-3.5 bg-dark/5 dark:bg-light/5 rounded-[7px]"
                  >
                    <div tw="font-medium text-sm tracking-tight leading-[150%] text-gray-500">
                      {item.trait_type}
                    </div>
                    <div tw="pt-1 font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                      {item.value}
                    </div>
                    {/* {item.tagIcon && (
                    <div tw="absolute right-3.5 top-3.5">
                      {getIcon(item.tagIcon, item.tagColor)}
                    </div>
                  )} */}
                    <div tw="pt-3.5 pb-2.5 text-sm leading-[150%] tracking-tight whitespace-pre-wrap text-[#4d4d4d] dark:text-[#c3c3c3]">
                      2% have this trait
                    </div>
                    <div tw="border-t border-dark/10 dark:border-light/10">
                      <div tw="pt-2 flex items-center gap-0.5">
                        {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
                        <span tw="font-semibold text-sm leading-[150%] tracking-tight text-[#4D4D4D] dark:text-[#c3c3c3]">
                          {nFormatter(12345)}
                        </span>
                      </div>
                      <div tw="pt-0.5 text-[10px] leading-[150%] tracking-tight text-gray-500 ">
                        Value of attribute
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div tw="h-[80px] flex justify-center items-center text-base tracking-tight text-[#888]">
                No attribute
              </div>
            ))}
        </div>
        <div tw="mt-8 bg-white dark:bg-white/5 rounded-lg">
          <div
            tw="px-3 lg:px-6 py-3 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandDetails(!expandDetails)}
          >
            <div tw="flex items-center gap-4">
              {getIcon('info', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                Token details
              </span>
            </div>
            <div
              css={expandDetails ? {} : { transform: 'rotate(180deg)' }}
              tw="duration-300"
            >
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </div>
          {expandDetails && (
            <div tw="p-3 lg:p-6 flex flex-col gap-2.5 md:gap-6">
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Token ID
                </span>
                <span tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {BigNumber.from(`0x${nftData?._id}`).toString()}
                </span>
              </div>
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Blockchain
                </span>
                <span tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Ethereum
                </span>
              </div>
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Token Standard
                </span>
                <span tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  ERC1155
                </span>
              </div>
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Token Info
                </span>
                <span tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  -
                </span>
              </div>
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Contract Address
                </span>
                <span
                  title={process.env.REACT_APP_NFT_ADDRESS ?? ''}
                  tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                >
                  {shortAddress(process.env.REACT_APP_NFT_ADDRESS ?? '')}
                </span>
              </div>
              <div tw="flex justify-between items-center">
                <span tw="text-sm md:text-base tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Creator Royalties
                </span>
                <span tw="font-bold text-sm md:text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {nftData?.fee}%
                </span>
              </div>
            </div>
          )}
        </div>
        <div tw="mt-8 bg-white dark:bg-white/5 rounded-lg">
          <div
            tw="px-3 lg:px-6 py-3 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandAboutCollection(!expandAboutCollection)}
          >
            <div tw="flex items-center gap-4">
              {getIcon('collection', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                About{' '}
                <span tw="font-bold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                  {collection?.collection_name}
                </span>{' '}
                Collection
              </span>
            </div>
            <div
              css={expandAboutCollection ? {} : { transform: 'rotate(180deg)' }}
              tw="duration-300"
            >
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </div>
          {expandAboutCollection && (
            <div tw="p-3 lg:p-6">
              <div tw="flex gap-3.5">
                <div
                  css={{
                    backgroundImage: `url(${collection?.collection_profile_image_url})`,
                  }}
                  tw="w-16 min-w-[64px] h-16 bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover rounded-[7px]"
                />
                <div tw="text-sm md:text-base tracking-tight leading-[150%] whitespace-pre-wrap text-dark dark:text-light/90">
                  {collection?.collection_description &&
                  collection.collection_description.length > 0
                    ? collection.collection_description
                    : 'No description'}
                </div>
              </div>
              <div tw="pt-6 md:pt-10 flex justify-between items-center">
                <div tw="flex items-center gap-[30px]">
                  <div
                    title="Website"
                    tw="flex items-center gap-[7px] cursor-pointer"
                  >
                    {getIcon('website', darkMode ? '#fff' : '#000')}
                    <a
                      href={collection?.collection_website_link}
                      rel="noreferrer"
                      target="_blank"
                      tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90"
                    >
                      Website
                    </a>
                  </div>
                  <div
                    title="Twitter"
                    tw="flex items-center gap-[7px] cursor-pointer"
                  >
                    {getIcon('telegram', darkMode ? '#fff' : '#000')}
                    <a
                      href={collection?.collection_telegram_link}
                      rel="noreferrer"
                      target="_blank"
                      tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90"
                    >
                      Telegram
                    </a>
                  </div>
                  <div
                    title="Twitter"
                    tw="flex items-center gap-[7px] cursor-pointer"
                  >
                    {getIcon('discord', darkMode ? '#fff' : '#000')}
                    <a
                      href={collection?.collection_discord_link}
                      rel="noreferrer"
                      target="_blank"
                      tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90"
                    >
                      Discord
                    </a>
                  </div>
                  <div
                    title="Instagram"
                    tw="flex items-center gap-[7px] cursor-pointer"
                  >
                    {getIcon('twitter', darkMode ? '#fff' : '#000')}
                    <a
                      href={collection?.collection_twitter_link}
                      rel="noreferrer"
                      target="_blank"
                      tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90"
                    >
                      Twitter
                    </a>
                  </div>
                </div>
                <div tw="cursor-pointer">
                  {getIcon('more', darkMode ? '#fff' : '#000')}
                </div>
              </div>
            </div>
          )}
        </div>
        <div tw="mt-8 bg-white dark:bg-white/5 rounded-lg">
          <div
            tw="px-3 lg:px-6 py-3 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandOffers(!expandOffers)}
          >
            <div tw="flex items-center gap-4">
              {getIcon('offer', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                Offers{nftData?.auction ? ' for bidding' : ''}
              </span>
            </div>
            <div
              css={expandOffers ? {} : { transform: 'rotate(180deg)' }}
              tw="duration-300"
            >
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </div>
          {expandOffers && (
            <div tw="py-4 md:py-6">
              {nftData?.auction ? (
                <>
                  <div
                    css={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}
                    tw="px-3 lg:px-6 pb-3.5 grid items-center gap-1"
                  >
                    <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 items-center gap-1">
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        Price
                      </div>
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        USD Price
                      </div>
                    </div>
                    <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 items-center gap-1">
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        Bid date
                      </div>
                    </div>
                    <span tw="font-bold text-xs md:text-[14px] tracking-tight text-right text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                      From
                    </span>
                  </div>
                  {nftData?.auction?.bidList &&
                    nftData.auction.bidList
                      .sort((a, b) => {
                        if (a.createdAt > b.createdAt) {
                          return -1;
                        } else if (a.createdAt < b.createdAt) {
                          return 1;
                        }
                        return 0;
                      })
                      .map(
                        (item: {
                          buyer: string;
                          createdAt: Date;
                          price: number;
                          signature: string;
                        }) => {
                          return (
                            <div
                              key={item.buyer}
                              css={{
                                gridTemplateColumns: '1.5fr 1fr 1fr',
                              }}
                              tw="px-3 lg:px-6 py-3.5 grid items-center gap-1 border-t border-[rgba(49, 105, 250, 0.1)]"
                            >
                              <div tw="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                                <div tw="text-xs md:text-base tracking-tight flex items-center gap-1 text-dark dark:text-light/90">
                                  {getIcon(
                                    'sliced-small',
                                    darkMode ? '#fff' : '#000'
                                  )}{' '}
                                  {nFormatter(item.price)}
                                </div>
                                <div tw="text-xs md:text-base tracking-tight text-dark dark:text-light/90">
                                  0
                                </div>
                              </div>
                              <div tw="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                                <div tw="text-xs md:text-[14px] tracking-tight text-dark dark:text-light/90">
                                  {item.createdAt ? (
                                    <>
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleDateString()}
                                      <br />
                                      {new Date(
                                        item.createdAt
                                      ).toLocaleTimeString()}
                                    </>
                                  ) : (
                                    '-'
                                  )}
                                </div>
                              </div>
                              <Link
                                to={`/profile/wallet-address/${item.buyer}`}
                                tw="text-xs md:text-[14px] tracking-tight text-right text-dark dark:text-light"
                              >
                                {shortAddress(item.buyer, 1, 3)}
                              </Link>
                            </div>
                          );
                        }
                      )}
                </>
              ) : (
                <>
                  <div
                    css={{ gridTemplateColumns: '1.5fr 1.5fr 0.5fr 0.75fr' }}
                    tw="px-3 lg:px-6 pb-3.5 grid items-center gap-1"
                  >
                    <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 items-center gap-1">
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        Price
                      </div>
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        USD Price
                      </div>
                    </div>
                    <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 items-center gap-1">
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        Floor Difference
                      </div>
                      <div tw="font-bold text-xs md:text-[14px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                        Expiration
                      </div>
                    </div>
                    <span tw="font-bold text-xs md:text-[14px] tracking-tight text-right text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                      From
                    </span>
                    <span tw="font-bold text-xs md:text-[14px] tracking-tight text-right text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                      Action
                    </span>
                  </div>
                  {nftData?.orders &&
                    nftData.orders
                      .filter((item) => item.orderType !== OrderType.SELL)
                      .map((item: OrderParam) => {
                        const expired =
                          (item.endTime ?? 0) <= new Date().getTime() / 1000;
                        return (
                          <div
                            key={item._id}
                            css={{
                              gridTemplateColumns: '1.5fr 1.5fr 0.5fr 0.75fr',
                            }}
                            tw="px-3 lg:px-6 py-3.5 grid items-center gap-1 border-t border-[rgba(49, 105, 250, 0.1)]"
                          >
                            <div tw="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                              <div tw="text-xs md:text-base tracking-tight flex items-center gap-1 text-dark dark:text-light/90">
                                {getIcon(
                                  'sliced-small',
                                  darkMode ? '#fff' : '#000'
                                )}{' '}
                                {nFormatter(item.price)}
                              </div>
                              <div tw="text-xs md:text-base tracking-tight text-dark dark:text-light/90">
                                0
                              </div>
                            </div>
                            <div tw="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                              <div tw="text-xs md:text-base tracking-tight text-dark dark:text-light/90">
                                {(item.price ?? 0) - (sellOrder?.price ?? 0)}
                              </div>
                              <div tw="text-xs md:text-[14px] tracking-tight text-dark dark:text-light/90">
                                {item.endTime ? (
                                  <>
                                    {new Date(
                                      time2ms(item.endTime)
                                    ).toLocaleDateString()}
                                    <br />
                                    {new Date(
                                      time2ms(item.endTime)
                                    ).toLocaleTimeString()}
                                  </>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </div>
                            <Link
                              to={`/profile/wallet-address/${item.buyer}`}
                              tw="text-xs md:text-[14px] tracking-tight text-right text-dark dark:text-light"
                            >
                              {shortAddress(item.buyer, 1, 3)}
                            </Link>
                            {expired ? (
                              <span tw="ml-auto px-4 w-max h-[22px] flex justify-center items-center font-semibold text-[16px] text-[rgba(23, 23, 23, 0.4)] dark:text-[rgba(233, 233, 233, 0.4)] bg-[rgba(23, 23, 23, 0.2)] dark:bg-[rgba(233, 233, 233, 0.2)] rounded-[4px] cursor-default">
                                Expired
                              </span>
                            ) : (
                              <button
                                css={{
                                  cursor:
                                    user?.walletAddress === nftData?.owner
                                      ? 'pointer'
                                      : 'default',
                                }}
                                tw="ml-auto px-4 w-max h-[22px] flex justify-center items-center font-semibold text-[16px] text-green-500 bg-[rgba(53, 206, 50, 0.2)] rounded-[4px]"
                                onClick={() => {
                                  if (user?.walletAddress === nftData?.owner) {
                                    setSelectedOffer(item);
                                    setShowAcceptPopup(true);
                                  }
                                }}
                              >
                                {user?.walletAddress !== nftData?.owner
                                  ? 'Pending'
                                  : 'Accept'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                </>
              )}
            </div>
          )}
        </div>
        <div tw="mt-8 bg-white dark:bg-white/5 rounded-lg">
          <div
            tw="px-3 lg:px-6 py-3 flex justify-between items-center cursor-pointer"
            onClick={() => setExpandActivity(!expandActivity)}
          >
            <div tw="flex items-center gap-4">
              {getIcon('activity', darkMode ? '#fff' : '#000')}
              <span tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light/90">
                Activity
              </span>
            </div>
            <div
              css={expandActivity ? {} : { transform: 'rotate(180deg)' }}
              tw="duration-300"
            >
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </div>
          {expandActivity && (
            <div tw="py-6">
              <div tw="px-3 lg:px-6 pb-6 flex items-center gap-3.5 flex-wrap">
                {Object.keys(ActivityIcon).map((item) => (
                  <div
                    key={item}
                    css={{
                      borderColor: activityFilters.includes(item)
                        ? '#3169FA'
                        : '#8a8a8a',
                      color: activityFilters.includes(item)
                        ? '#3169FA'
                        : '#8a8a8a',
                    }}
                    tw="px-3.5 py-[7px] font-medium text-sm tracking-tight border-2 rounded-[100px] cursor-pointer"
                    onClick={() => toggleActivityFilter(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div
                css={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2fr' }}
                tw="px-3 lg:px-6 py-3.5 grid items-center gap-1 border-t border-[rgba(49, 105, 250, 0.1)]"
              >
                <span tw="font-bold text-xs md:text-base tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Event
                </span>
                <span tw="font-bold text-xs md:text-base tracking-tight text-right text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Price
                </span>
                <span tw="font-bold text-xs md:text-base tracking-tight text-center text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  From
                </span>
                <span tw="font-bold text-xs md:text-base tracking-tight text-center text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  To
                </span>
                <span tw="font-bold text-xs md:text-base tracking-tight text-right text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                  Date
                </span>
              </div>
              {activities
                .filter(
                  (item) =>
                    activityFilters.length === 0 ||
                    activityFilters.includes(item.activity_type)
                )
                .sort((a, b) => {
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
                .map((item) => (
                  <div
                    key={`offer-${item._id}`}
                    css={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 2fr' }}
                    tw="px-3 lg:px-6 py-3.5 grid items-center gap-1 border-t border-[rgba(49, 105, 250, 0.1)]"
                  >
                    <div tw="flex items-center gap-[7px]">
                      {getIcon(
                        ActivityIcon[item.activity_type],
                        darkMode ? '#fff' : '#000'
                      )}
                      <span tw="text-xs md:text-base tracking-tight text-dark dark:text-light/90">
                        {item.activity_type}
                      </span>
                      {/* {item.expired && (
                      <span tw="text-[10px] tracking-tight text-[#DD3939]">
                        Expired
                      </span>
                    )} */}
                    </div>
                    <span tw="text-xs md:text-base tracking-tight text-right text-dark dark:text-light/90">
                      {item.price}
                    </span>
                    <Link
                      data-tooltip-place="bottom"
                      id={`from-${item._id}-${item.fromAddress}`}
                      to={`/profile/wallet-address/${item.fromAddress}`}
                      tw="text-xs md:text-base tracking-tight text-center text-dark dark:text-light"
                      onMouseEnter={() => {
                        item.fromAddress &&
                          Auth.getByWallet(item.fromAddress).then((res) => {
                            setActivityUser(res);
                          });
                      }}
                      onMouseLeave={() => setActivityUser(null)}
                    >
                      {shortAddress(item.fromAddress, 1, 2)}
                    </Link>
                    <Tooltip anchorId={`from-${item._id}-${item.fromAddress}`}>
                      {activityUser && (
                        <>
                          {activityUser?.profile_image_url &&
                            activityUser?.profile_image_url.length > 0 && (
                              <div
                                css={{
                                  backgroundImage: `url(${activityUser?.profile_image_url})`,
                                }}
                                tw="w-[80px] h-[80px] bg-[#fff2] bg-no-repeat bg-center bg-cover"
                              />
                            )}
                          <p tw="py-1 text-[14px] text-center">
                            {activityUser?.name}
                          </p>
                        </>
                      )}
                    </Tooltip>
                    {item.toAddress ? (
                      <>
                        <Link
                          data-tooltip-place="bottom"
                          id={`to-${item._id}-${item.toAddress}`}
                          to={`/profile/wallet-address/${item.toAddress}`}
                          tw="text-xs md:text-base tracking-tight text-center text-dark dark:text-light"
                          onMouseEnter={() => {
                            item.toAddress &&
                              Auth.getByWallet(item.toAddress).then((res) => {
                                setActivityUser(res);
                              });
                          }}
                          onMouseLeave={() => setActivityUser(null)}
                        >
                          {shortAddress(item.toAddress, 1, 2)}
                        </Link>
                        <Tooltip anchorId={`to-${item._id}-${item.toAddress}`}>
                          {activityUser && (
                            <>
                              {activityUser?.profile_image_url &&
                                activityUser?.profile_image_url.length > 0 && (
                                  <div
                                    css={{
                                      backgroundImage: `url(${activityUser?.profile_image_url})`,
                                    }}
                                    tw="w-[80px] h-[80px] bg-[#fff2] bg-no-repeat bg-center bg-cover"
                                  />
                                )}
                              <p tw="py-1 text-[14px] text-center">
                                {activityUser?.name}
                              </p>
                            </>
                          )}
                        </Tooltip>
                      </>
                    ) : (
                      <div />
                    )}
                    <a
                      data-tooltip-place="top"
                      href={`https://etherscan.io/tx/${item.transactionHash}`}
                      id={`etherscan-${item._id}-${item.transactionHash}`}
                      rel="nofollow noopener noreferrer"
                      target="_blank"
                      tw="flex justify-end items-center gap-[4px] text-xs md:text-[14px] tracking-tight text-dark dark:text-light"
                    >
                      {format(
                        new Date(item.timeStamp ?? item.createdAt),
                        'MM/dd, hh:mm a'
                      )}
                      <img alt="link" src={iconExternalLink} width={18} />
                      <Tooltip
                        anchorId={`etherscan-${item._id}-${item.transactionHash}`}
                      >
                        {format(
                          new Date(item.timeStamp ?? item.createdAt),
                          'MMM dd, yyyy, hh:mm a'
                        )}
                      </Tooltip>
                    </a>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <div tw="w-full lg:w-2/5 relative">
        <div tw="sticky top-24 h-auto">
          <div tw="p-3 lg:p-4 h-auto bg-white dark:bg-white/5 rounded-lg">
            <div tw="pb-3 lg:pb-4 flex justify-between items-center">
              <div
                css={{
                  backgroundImage: darkMode
                    ? 'linear-gradient(180deg, #D271FA06 0%, rgba(210, 113, 250, 0.4) 100%)'
                    : 'linear-gradient(180deg, #D271FA 0%, rgba(210, 113, 250, 0.7) 100%)',
                }}
                tw="p-3.5 h-10 flex items-center gap-2.5 rounded-lg"
              >
                {getIcon('traitsniper', '#fff')}
                <span tw="font-semibold text-sm md:text-base tracking-tight text-light/90">
                  #{shortAddress(nftData?._id, 2, 4)}
                </span>
              </div>
              <div tw="flex items-center gap-6 md:gap-[34px]">
                <div tw="flex items-center gap-[7px]">
                  <span tw="cursor-pointer" onClick={() => handleFavorite()}>
                    {getIcon(
                      favoriteStatus ? 'heart-red' : 'heart',
                      darkMode ? '#fff' : '#000'
                    )}
                  </span>
                  <span tw="font-semibold text-sm md:text-base tracking-tight text-[#2F2F2F] dark:text-[#c3c3c3]">
                    {nFormatter(likes)}
                  </span>
                </div>
                <div tw="flex items-center gap-[7px]">
                  {getIcon('views', darkMode ? '#fff' : '#000')}
                  <span tw="font-semibold text-sm md:text-base tracking-tight text-[#2F2F2F] dark:text-[#c3c3c3]">
                    {nftData?.viewed ? nFormatter(nftData.viewed) : 0}
                  </span>
                </div>
              </div>
            </div>
            <div
              css={{
                backgroundImage: mimeType.startsWith('video')
                  ? 'none'
                  : `url(${nftData?.image})`,
              }}
              tw="relative pt-[100%] bg-no-repeat bg-[#fff] bg-center bg-cover rounded-md overflow-hidden"
            >
              {mimeType.startsWith('video') ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  tw="absolute left-0 top-0 w-full h-full object-contain z-10"
                >
                  <source src={nftData?.image} type={mimeType} />
                </video>
              ) : (
                <div
                  css={{ backgroundImage: `url(${nftData?.image})` }}
                  tw="absolute left-0 top-0 w-full h-full bg-no-repeat bg-center bg-contain backdrop-blur-2xl rounded-md z-10"
                />
              )}
            </div>
            <div tw="relative pt-3 lg:pt-4 flex justify-between items-center">
              <div tw="flex items-center gap-[30px]">
                <button
                  tw="flex items-center gap-[7px]"
                  onClick={() => setShowSharePopup(true)}
                >
                  {getIcon('share', darkMode ? '#fff' : '#000')}
                  <span tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90">
                    Share
                  </span>
                </button>
                <button tw="flex items-center gap-[7px]">
                  {getIcon('reload', darkMode ? '#fff' : '#000')}
                  <span tw="hidden md:block text-base tracking-tight text-dark dark:text-light/90">
                    Refresh metadata
                  </span>
                </button>
              </div>
              <button
                tw="cursor-pointer"
                onClick={() => setExpanded3dots(true)}
              >
                {getIcon('more', darkMode ? '#fff' : '#000')}
              </button>
              {expanded3dots && (
                <>
                  <div
                    tw="fixed left-0 top-0 w-full h-full z-20"
                    onClick={() => setExpanded3dots(false)}
                  />
                  <ul
                    css={{
                      boxShadow: darkMode
                        ? '0px 4px 14px rgba(255, 255, 255, 0.1)'
                        : '0px 4px 14px rgba(0, 0, 0, 0.1)',
                    }}
                    tw="absolute right-0 top-[48px] bg-white dark:bg-white/5 rounded-[7px] z-30"
                  >
                    <li tw="px-4 h-[40px] flex items-center gap-[7px] cursor-pointer">
                      <div tw="scale-75">
                        {getIcon('flag', darkMode ? '#fff' : '#000')}
                      </div>
                      <span tw="text-[17px] text-dark dark:text-light">
                        Report
                      </span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSharePopup && nftData && (
        <ShareItemPopup
          item={nftData}
          onClose={() => setShowSharePopup(false)}
        />
      )}
      {showTransferPopup && nftData && (
        <TransferItemPopup
          item={nftData}
          onClose={() => {
            setTimeout(() => {
              if (params?.id) {
                loadNftItem(params?.id);
              }
              setLockTransfer(false);
            }, 1000);
            setShowTransferPopup(false);
          }}
        />
      )}
      {showDeleteConfirmPopup && (
        <div
          tw="fixed left-0 top-0 w-full h-full flex justify-center items-center backdrop-blur z-20"
          onClick={() => setShowDeleteConfirmPopup(false)}
        >
          <div
            className="popup-content"
            tw="p-8 w-full max-w-[480px] bg-[#fff] dark:bg-[#141417] rounded-[17px]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 tw="pb-6 font-semibold text-[17px]">
              Are you sure to delete this NFT?
            </h3>
            <div tw="pt-6 flex justify-end items-center gap-4 flex-wrap border-t border-[#0002] dark:border-[#fff2]">
              <StyledButton
                wide
                onClick={() => setShowDeleteConfirmPopup(false)}
              >
                No
              </StyledButton>
              <StyledButton
                wide
                onClick={() => {
                  if (
                    nftData?._id &&
                    !nftData?.isMinted &&
                    nftData.owner === user?.walletAddress
                  ) {
                    Nft.delete(nftData?._id)
                      .then((res) => {
                        // console.log(res);
                        alertWarning(`The NFT "${res.name}" has been deleted.`);
                        navigate(-1);
                      })
                      .catch((e) => {
                        alertError(e.message ?? JSON.stringify(e));
                      });
                  }
                }}
              >
                Yes
              </StyledButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;
