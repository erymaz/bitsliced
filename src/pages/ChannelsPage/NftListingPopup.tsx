import 'twin.macro';

import { addDays } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { Link } from 'react-router-dom';

import { Collection } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import {
  ImageSection,
  StyledButton,
} from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  CollectionData,
  NftData,
  OrderParam,
  OrderType,
  Token,
} from '../../type.d';
import { getMimeType, shortAddress } from '../../utils';
import { alertError } from '../../utils/toast';
import { getTokenInfoByAddress } from '../../utils/tokens';
import { availableRanges } from '../PurchasePopups/ListNftPage';
import { ChannelNftPopupStep } from './PostingWidget';

const NftItemCard = (props: {
  item: NftData;
  selected: boolean;
  handleClose: () => void;
  setSelectedNft: (item?: NftData) => void;
  setSelectedCollection: (collection?: CollectionData) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  const [mimeType, setMimeType] = useState<string>('');
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [collectionMimeType, setCollectionMimeType] = useState<string>('');

  useEffect(() => {
    if (props.item) {
      setMimeType(getMimeType(props.item.image));

      if (props.item.collection_id) {
        Collection.getById(props.item.collection_id).then((res) => {
          if (res) {
            setCollection(res);
            setCollectionMimeType(
              getMimeType(res.collection_profile_image_url)
            );
          }
        });
      }
    }
  }, [props.item]);

  return (
    <div
      key={props.item._id}
      css={{ boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}
      tw="w-full max-w-[220px] flex flex-col bg-white dark:bg-[#1e1a1c] rounded-[14px] overflow-hidden"
    >
      <div
        css={{
          backgroundImage: mimeType.startsWith('video')
            ? 'none'
            : `url(${props.item.image})`,
        }}
        tw="relative w-full md:w-[220px] min-w-[220px] h-[220px] bg-white bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden"
      >
        <ImageSection imagePath={props.item?.image} mimeType={mimeType} />
      </div>
      <div tw="w-full">
        <div tw="px-3.5 pt-[10px] flex items-center gap-[4px] text-[12px] tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
          <Link
            css={{
              backgroundImage: mimeType.startsWith('video')
                ? 'none'
                : `url(${props.item.image})`,
            }}
            to={`/collection/${collection?._id}`}
            tw="relative w-[14px] min-w-[14px] h-[14px] bg-white bg-no-repeat bg-center bg-cover rounded-full overflow-hidden"
            onClick={
              collection
                ? () => props.handleClose()
                : () => {
                    return;
                  }
            }
          >
            <ImageSection
              imagePath={collection?.collection_profile_image_url}
              mimeType={collectionMimeType}
            />
          </Link>
          {collection?.collection_name ??
            shortAddress(props.item.collection_id)}
        </div>
        <div tw="px-3.5 pt-1 pb-[10px] flex justify-between items-center border-b border-[rgba(0, 0, 0, 0.1)]">
          <div
            css={{ textOverflow: 'ellipsis' }}
            title={props.item.name}
            tw="font-medium text-[12px] capitalize tracking-tight leading-[150%] text-dark dark:text-light whitespace-nowrap overflow-hidden"
          >
            {props.item.name}
          </div>
          <div tw="flex items-center gap-1">
            {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-[12px] tracking-tight text-dark dark:text-light">
              {props.item.price ?? 0}
            </span>
          </div>
        </div>
        <div tw="px-3.5 py-[10px]">
          {props.selected && (
            <button
              tw="px-3.5 w-full h-[32px] font-semibold text-[12px] text-left bg-black text-light/90 rounded-[100px]"
              onClick={() => {
                props.setSelectedNft(undefined);
                props.setSelectedCollection(undefined);
              }}
            >
              Selected
            </button>
          )}
          {!props.selected && (
            <button
              tw="px-3.5 w-full h-[32px] font-semibold text-[12px] text-left border text-dark dark:text-light border-[#BB9BFF] rounded-[100px]"
              onClick={() => {
                props.setSelectedNft(props.item);
                collection && props.setSelectedCollection(collection);
              }}
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NftListingPopup = (props: {
  channelId?: string;
  items: NftData[];
  step: ChannelNftPopupStep;
  selectedNft?: NftData;
  orderParam: Partial<OrderParam>;
  setOrderParam: (value: Partial<OrderParam>) => void;
  setNeedListing: (need: boolean) => void;
  handleClose: () => void;
  setStep: (step: ChannelNftPopupStep) => void;
  setSelectedNft: (item: NftData) => void;
  setSelectedCollection: (collection: CollectionData) => void;
  setPeriod: (period: {
    startDate?: Date;
    endDate?: Date;
    key?: string;
  }) => void;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [filteredItems, setFilteredItems] = useState<NftData[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftData | undefined>(
    undefined
  );
  const [selectedCollection, setSelectedCollection] = useState<
    CollectionData | undefined
  >(undefined);
  const [mimeType, setMimeType] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [period, setPeriod] = useState<{
    startDate?: Date;
    endDate?: Date;
    key?: string;
  }>({
    endDate: addDays(new Date(), 3), // default: 3 days
    key: 'selection',
    startDate: new Date(),
  });

  useEffect(() => {
    if (props.items && props.channelId && user?.walletAddress) {
      setFilteredItems(
        props.items.filter((item) => {
          const posted = item?.orders?.find(
            (o) =>
              o.orderType === OrderType.SELL &&
              o.channelId &&
              o.channelId === props.channelId
          );

          // return !!listOrder || item.owner === user?.walletAddress;
          return item.owner === user?.walletAddress && !posted;
        })
      );
    }
  }, [props.items, props.channelId, user]);

  useEffect(() => {
    if (props.selectedNft) {
      setSelectedNft(props.selectedNft);
    }
  }, [props.selectedNft]);

  useEffect(() => {
    if (selectedNft) {
      setMimeType(getMimeType(selectedNft.image));
      if (selectedNft.collection_id) {
        Collection.getById(selectedNft.collection_id).then((res) => {
          if (res) {
            setSelectedCollection(res);
            props.setSelectedCollection(res);
          }
        });
      }
    }
  }, [selectedNft]);

  useEffect(() => {
    if (selectedCollection) {
      const tokens = selectedCollection.collection_payment_tokens
        .map((item) => getTokenInfoByAddress(item))
        .filter((item) => !!item);
      setTokens(tokens as Token[]);
    }
  }, [selectedCollection]);

  const setParamField = (field: string, value: string | number) => {
    props.setOrderParam({ ...props.orderParam, [field]: value });
  };

  return (
    <div
      tw="px-8 pt-[100px] pb-[20px] fixed left-0 top-0 w-full h-full flex justify-center items-center z-30 backdrop-blur-lg"
      onClick={props.handleClose}
    >
      <div
        className="no-scrollbar"
        tw="relative pt-[40px] w-full max-w-[1024px] max-h-[100%] bg-white dark:bg-[#1e1a1c] overflow-y-auto rounded-[32px]"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <button
          tw="absolute right-[40px] top-[40px] rotate-45"
          onClick={props.handleClose}
        >
          {getIcon('add', darkMode ? '#fff' : '#000')}
        </button>
        <h3 tw="font-bold text-[23px] text-center text-[#000e]">
          {props.step === ChannelNftPopupStep.LIST
            ? 'Select your NFT item, which you like to list'
            : 'Complete your Listing'}
        </h3>
        <div tw="py-[40px] flex justify-center gap-3.5 flex-wrap bg-white dark:bg-[#1e1a1c]">
          {ChannelNftPopupStep.LIST === props.step &&
            filteredItems.map((item: NftData) => (
              <NftItemCard
                key={item._id}
                handleClose={props.handleClose}
                item={item}
                selected={selectedNft?._id === item._id}
                setSelectedCollection={setSelectedCollection}
                setSelectedNft={setSelectedNft}
              />
            ))}
          {ChannelNftPopupStep.LISTING === props.step && (
            <div tw="px-[40px] w-full">
              <div tw="pb-[40px] relative w-full flex justify-start items-center gap-[10px] overflow-hidden border-b border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)]">
                <div
                  css={{
                    backgroundImage: mimeType.startsWith('video')
                      ? 'none'
                      : `url(${selectedNft?.image})`,
                  }}
                  tw="relative w-[140px] min-w-[140px] h-[140px] bg-[#0001] bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
                >
                  <ImageSection
                    imagePath={selectedNft?.image}
                    mimeType={mimeType}
                  />
                </div>
                <div>
                  <div tw="font-semibold text-base leading-[150%] text-dark dark:text-light">
                    {selectedNft?.name}
                  </div>
                  <div tw="pt-1 text-[14px] leading-[150%] text-gray-500">
                    {selectedCollection?.collection_name}
                  </div>
                  <div tw="pt-1 text-[14px] leading-[150%] text-gray-500">
                    [Network]
                  </div>
                </div>
              </div>
              <h3 tw="pt-[40px] pb-1 flex items-center gap-2.5">
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light">
                  Type
                </span>
                {getIcon('info', darkMode ? '#fff' : '#000')}
              </h3>
              <div tw="grid grid-cols-1 gap-2.5">
                <div
                  css={{
                    backgroundColor: 'rgba(49, 105, 250, 0.15)',
                    borderColor: 'rgba(49, 105, 250, 0.15)',
                  }}
                  tw="px-2 h-[46px] flex justify-center items-center text-base tracking-tight leading-[150%] text-dark dark:text-light border rounded-[7px] cursor-pointer"
                >
                  Fixed Price
                </div>
              </div>
              <div tw="py-3.5 bg-white dark:bg-transparent rounded-lg">
                <h3 tw="pb-1 flex items-center gap-2.5">
                  <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light">
                    Price
                  </span>
                  {getIcon('info', darkMode ? '#fff' : '#000')}
                </h3>
                <div tw="grid grid-cols-[200px 1fr] gap-3.5">
                  <div tw="relative">
                    <div
                      tw="px-2.5 h-[46px] flex items-center gap-1.5 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] rounded-[7px] cursor-pointer"
                      onClick={() => setShowTokens(true)}
                    >
                      {getIcon(
                        getTokenInfoByAddress(props.orderParam.quoteToken ?? '')
                          ?.icon ?? '',
                        darkMode ? '#fff' : '#000'
                      )}
                      <span tw="text-base tracking-tight capitalize text-dark dark:text-light">
                        {getTokenInfoByAddress(
                          props.orderParam.quoteToken ?? ''
                        )?.name.toLowerCase()}
                      </span>
                    </div>
                    {showTokens && (
                      <>
                        <div
                          tw="fixed left-0 top-0 w-full h-full z-20"
                          onClick={() => setShowTokens(false)}
                        />
                        <ul tw="absolute left-0 top-[48px] w-full max-h-[320px] bg-white dark:bg-dark/60 shadow-lg rounded-[7px] overflow-auto z-30">
                          {tokens.length === 0 && (
                            <li
                              tw="px-2.5 py-[7px] flex items-center text-center text-[#0004] dark:text-[#fff4] cursor-pointer"
                              onClick={() => {
                                setShowTokens(false);
                              }}
                            >
                              No token in the collection
                            </li>
                          )}
                          {tokens.map((item: Token) => (
                            <li
                              key={item.name}
                              tw="px-2.5 h-10 flex items-center hover:bg-[#0001] gap-2 border-t border-[rgba(0, 0, 0, 0.15)] cursor-pointer"
                              onClick={() => {
                                setParamField('quoteToken', item.address);
                                setShowTokens(false);
                              }}
                            >
                              {getIcon(item.icon, darkMode ? '#fff' : '#000')}
                              <span
                                css={
                                  props.orderParam.quoteToken === item.address
                                    ? { fontWeight: 600 }
                                    : {}
                                }
                                tw="text-base tracking-tight capitalize text-dark dark:text-light"
                              >
                                {item.name.toLowerCase()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <input
                    min={0}
                    placeholder="[Amount]"
                    tw="px-2.5 h-[46px] flex items-center w-full text-base tracking-tight leading-[150%] text-dark dark:text-light bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] border border-[rgba(0, 0, 0, 0.15)] rounded-[7px]"
                    type="number"
                    value={props.orderParam.price}
                    onChange={(e) =>
                      setParamField('price', parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
              <div tw="py-3.5 bg-white dark:bg-transparent rounded-lg">
                <h3 tw="pb-1 flex items-center gap-2.5">
                  <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light">
                    Duration
                  </span>
                </h3>
                <div tw="relative flex items-center gap-3.5">
                  <div tw="absolute left-2.5">
                    {getIcon('calendar', darkMode ? '#fff' : '#000')}
                  </div>
                  <input
                    readOnly
                    tw="pl-10 pr-2.5 h-[46px] flex items-center w-full text-base tracking-tight leading-[150%] text-dark dark:text-light bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] border border-[rgba(0, 0, 0, 0.15)] rounded-[7px]"
                    value={`${period.startDate?.toLocaleDateString()} - ${period.endDate?.toLocaleDateString()}`}
                    onFocus={() => setShowCalendar(true)}
                  />
                  {showCalendar && (
                    <>
                      <div
                        tw="fixed left-0 top-0 w-full h-full z-40"
                        onClick={() => setShowCalendar(false)}
                      />
                      <div tw="fixed left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-50">
                        <div tw="relative z-30 rounded-[7px] overflow-hidden opacity-95 shadow-lg">
                          <DateRangePicker
                            direction="horizontal"
                            disabledDay={(date) => {
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              if (date < now) {
                                return true;
                              }
                              return false;
                            }}
                            months={2}
                            moveRangeOnFirstSelection={false}
                            ranges={[period]}
                            staticRanges={availableRanges}
                            tw="z-30"
                            onChange={(item: RangeKeyDict) => {
                              setPeriod(item.selection);
                              props.setPeriod(item.selection);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <span
                    tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-dark dark:text-light  cursor-pointer"
                    onClick={() => setShowCalendar(true)}
                  >
                    Select date range
                  </span>
                </div>
              </div>
              <div tw="py-3.5 rounded-lg">
                <h3 tw="pb-1 flex items-center gap-2.5">
                  <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light">
                    Fees
                  </span>
                  {getIcon('info', darkMode ? '#fff' : '#000')}
                </h3>
                <div>
                  <div tw="pt-5 flex items-center">
                    <span tw="w-[188px] text-base tracking-tight leading-[150%] text-dark dark:text-light">
                      Service Fee
                    </span>
                    <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light">
                      2.5%
                    </span>
                  </div>
                  <div tw="pt-5 flex items-center">
                    <span tw="w-[188px] text-base tracking-tight leading-[150%] text-dark dark:text-light">
                      Creator Fee
                    </span>
                    <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light">
                      {selectedNft?.fee ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {ChannelNftPopupStep.COMPLETE === props.step && (
            <div tw="px-[40px] w-full">
              <div tw="pb-[40px] relative w-full flex justify-between items-center gap-[10px] overflow-hidden border-b border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)]">
                <div tw="flex items-center gap-[10px]">
                  <div
                    css={{
                      backgroundImage: mimeType.startsWith('video')
                        ? 'none'
                        : `url(${selectedNft?.image})`,
                    }}
                    tw="relative w-[140px] min-w-[140px] h-[140px] bg-[#0001] bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
                  >
                    <ImageSection
                      imagePath={selectedNft?.image}
                      mimeType={mimeType}
                    />
                  </div>
                  <div>
                    <div tw="font-semibold text-base leading-[150%] text-dark dark:text-light">
                      {selectedNft?.name}
                    </div>
                    <div tw="pt-1 text-[14px] leading-[150%] text-gray-500">
                      {selectedCollection?.collection_name}
                    </div>
                    <div tw="pt-1 text-[14px] leading-[150%] text-gray-500">
                      [List type]
                    </div>
                    <div tw="pt-1 text-[14px] leading-[150%] text-gray-500">
                      {period?.startDate &&
                        period?.endDate &&
                        `${new Date(
                          period.startDate
                        ).toLocaleDateString()}-${new Date(
                          period.endDate
                        ).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <div>
                  <div tw="font-semibold text-base uppercase text-dark dark:text-light">
                    {props.orderParam.price ?? 0}{' '}
                    {getTokenInfoByAddress(
                      props.orderParam.quoteToken ?? ''
                    )?.name.toLowerCase()}
                  </div>
                </div>
              </div>
              <div tw="pt-[40px]">
                <div tw="font-bold text-[23px] text-dark dark:text-light">
                  Check your wallet
                </div>
                <div tw="pt-[10px] text-[23px] text-dark/70 dark:text-light/70">
                  Review and confirm this listing from your connected wallet.
                </div>
              </div>
            </div>
          )}
        </div>
        {props.step !== ChannelNftPopupStep.COMPLETE && (
          <div tw="pb-[40px] flex justify-center">
            <StyledButton
              wide
              onClick={() => {
                if (selectedNft && props.step === ChannelNftPopupStep.LIST) {
                  const listOrder = selectedNft?.orders?.find(
                    (item) => item.orderType === OrderType.SELL
                  );
                  if (listOrder) {
                    props.setNeedListing(false);
                    props.setSelectedNft(selectedNft);
                    props.handleClose();
                  } else {
                    if (user?.walletAddress === selectedNft.owner) {
                      props.setNeedListing(true);
                      props.setStep(ChannelNftPopupStep.LISTING);
                      props.setSelectedNft(selectedNft);
                      // props.handleClose();
                    } else {
                      alertError(
                        'The selected NFT item can be only listed by its owner.'
                      );
                    }
                  }
                } else if (
                  selectedNft &&
                  props.step === ChannelNftPopupStep.LISTING
                ) {
                  // handleCompleteOrder();
                  if (props.orderParam.price && props.orderParam.price > 0) {
                    props.handleClose();
                  } else {
                    alertError('Price amount should be greater than zero.');
                  }
                }
              }}
            >
              <span tw="font-semibold text-base text-[rgb(113,217,250)]">
                Next
              </span>
              <div tw="-rotate-90 scale-90">
                {getIcon('dropdown', 'rgb(113,217,250)')}
              </div>
            </StyledButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftListingPopup;
