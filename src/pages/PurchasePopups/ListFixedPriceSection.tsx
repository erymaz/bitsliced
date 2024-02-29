import 'twin.macro';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import '../../components/DateRange.scss';

import { useWeb3React } from '@web3-react/core';
import { addDays } from 'date-fns';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { useNavigate, useParams } from 'react-router-dom';

import { Collection, Nft, Order } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledInput } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  AssetType,
  CollectionData,
  NftData,
  OrderParam,
  OrderStatus,
  OrderType,
  Token,
  TransactionStatus,
} from '../../type.d';
import { alertError, alertSuccess } from '../../utils/toast';
import { getTokenInfoByAddress, mandatoryTokens } from '../../utils/tokens';
import { availableRanges } from './ListNftPage';

const ListFixedPriceSection = () => {
  let { account, library } = useWeb3React();

  const navigate = useNavigate();
  const params = useParams();
  const { darkMode, decreaseLoading, increaseLoading, user } =
    useContext(UserContext);

  const [nftData, setNftData] = useState<NftData | null>(null);
  const [orderParam, setOrderParam] = useState<Partial<OrderParam>>({
    quoteToken: process.env.REACT_APP_SLICED_ADDRESS,
  });
  const [collection, setCollection] = useState<CollectionData | null>(null);
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
    if (params.nft) {
      increaseLoading(true);
      Nft.getById(params.nft)
        .then((res: NftData) => {
          if (res) {
            setNftData(res);
            if (res.collection_id) {
              Collection.getById(res.collection_id).then(
                (collection: CollectionData) => {
                  if (collection) {
                    setCollection(collection);
                    const tokens = _.union(
                      collection.collection_payment_tokens,
                      mandatoryTokens
                    )
                      .map((item) =>
                        item ? getTokenInfoByAddress(item) : null
                      )
                      .filter((item) => !!item);
                    setTokens(tokens as Token[]);
                  }
                }
              );
            }
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => {
          decreaseLoading(true);
        });
    }
  }, [params.nft, increaseLoading, decreaseLoading]);

  const setParamField = (field: string, value: string | number) => {
    setOrderParam({ ...orderParam, [field]: value });
  };

  const handleCompleteOrder = async () => {
    if (user) {
      if (orderParam?.price && orderParam.price > 0) {
        increaseLoading(true);
        const domain = {
          chainId: 5,
          name: 'Bitsliced Order',
          verifyingContract: process.env.REACT_APP_ORDER_VERIFIER,
          version: '1.1',
        };

        // The named list of all type definitions
        const types = {
          Order: [
            { name: 'seller', type: 'address' },
            { name: 'buyer', type: 'address' },
            { name: 'assetType', type: 'uint256' },
            { name: 'orderType', type: 'uint256' },
            { name: 'baseToken', type: 'address' },
            { name: 'assetId', type: 'uint256' },
            { name: 'fraction', type: 'uint256' },
            { name: 'assetAmount', type: 'uint256' },
            { name: 'quoteToken', type: 'address' },
            { name: 'price', type: 'uint256' },
            { name: 'option', type: 'OrderOption' },
          ],
          OrderOption: [
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'badgesOrchannelOwner', type: 'address' },
            { name: 'collectionOwner', type: 'address' },
            { name: 'collectionFee', type: 'uint256' },
            { name: 'nftCreator', type: 'address' },
            { name: 'nftFee', type: 'uint256' },
          ],
        };

        // The data to sign
        const value = {
          assetAmount: 1,
          assetId: nftData?.external_contract_address
            ? nftData.external_tokenId
            : BigNumber.from(`0x${nftData?._id}`).toString(),
          assetType: nftData?.isErc721 ? AssetType.ERC721 : AssetType.ERC1155,
          baseToken: nftData?.external_contract_address
            ? nftData?.external_contract_address
            : process.env.REACT_APP_NFT_ADDRESS,
          buyer: '0x0000000000000000000000000000000000000000',
          fraction: 1,
          option: {
            badgesOrchannelOwner: process.env.REACT_APP_FEE_RECEIVER,
            collectionFee: Math.round(100 * (collection?.collection_fee ?? 0)),
            collectionOwner: collection?.collection_owner,
            endTime: Math.floor((period.endDate?.getTime() || 0) / 1000),
            nftCreator: nftData?.creator,
            nftFee: Math.floor(100 * (nftData?.fee ?? 0)),
            startTime: Math.floor((period.startDate?.getTime() || 0) / 1000),
          },
          orderType: OrderType.SELL,
          // sell
          price: ethers.utils.parseEther((orderParam.price ?? 0).toString()),
          quoteToken: orderParam.quoteToken,
          seller: account,
        };
        // console.log('value: ', value);
        const signature = await library
          .getSigner()
          ._signTypedData(domain, types, value);
        // fixed price
        Order.create({
          ...orderParam,
          assetAmount: 1,
          assetId: nftData?.external_contract_address
            ? nftData.external_tokenId || ''
            : BigNumber.from(`0x${nftData?._id}`).toString(),
          assetType: nftData?.isErc721 ? AssetType.ERC721 : AssetType.ERC1155,
          badgesOrchannelOwner: process.env.REACT_APP_FEE_RECEIVER,
          baseToken: nftData?.external_contract_address
            ? nftData?.external_contract_address
            : process.env.REACT_APP_NFT_ADDRESS ?? '',
          buyer: '0x0000000000000000000000000000000000000000',
          channelId: '',
          endTime: Math.floor((period.endDate?.getTime() || 0) / 1000),
          fraction: 1,
          orderType: OrderType.SELL,
          price: orderParam.price,
          quoteToken:
            orderParam.quoteToken ?? process.env.REACT_APP_SLICED_ADDRESS ?? '',
          seller: user.walletAddress,
          signature: signature,
          startTime: Math.floor((period.startDate?.getTime() || 0) / 1000),
          status: OrderStatus.PENDING,
          transactionHash: '',
          transactionStatus: TransactionStatus.PENDING,
        })
          .then((res) => {
            if (res) {
              alertSuccess('Your NFT has been listed successfully.');
              navigate(-1);
            } else {
              alertError('Listing failed!');
            }
          })
          .catch((e) => {
            console.error(e);
            alertError(e.toString());
          })
          .finally(() => decreaseLoading(true));
      } else {
        alertError('The price cannot be zero.');
      }
    }
  };

  return (
    <>
      <div tw="p-3.5 bg-white dark:bg-[#fff1] rounded-lg">
        <h3 tw="pb-1 flex items-center gap-2.5">
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            Starting Price
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
                getTokenInfoByAddress(orderParam.quoteToken ?? '')?.icon ?? '',
                darkMode ? '#fff' : '#000'
              )}
              <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90">
                {getTokenInfoByAddress(
                  orderParam.quoteToken ?? ''
                )?.name.toLowerCase()}
              </span>
            </div>
            {showTokens && (
              <>
                <div
                  tw="fixed left-0 top-0 w-full h-full z-20"
                  onClick={() => setShowTokens(false)}
                />
                <ul tw="absolute left-0 top-[48px] w-full max-h-[320px] bg-white shadow-lg rounded-[7px] overflow-auto z-30">
                  {tokens.length === 0 && (
                    <li
                      tw="px-2.5 py-[7px] flex items-center text-center text-[#0004] cursor-pointer"
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
                      {getIcon(item.icon, '#000')}
                      <span
                        css={
                          orderParam.quoteToken === item.address
                            ? { fontWeight: 600 }
                            : {}
                        }
                        tw="text-base tracking-tight capitalize text-dark"
                      >
                        {item.name.toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <StyledInput
            min={0}
            placeholder="[Amount]"
            type="number"
            value={orderParam.price}
            onChange={(e) => setParamField('price', parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div tw="p-3.5 bg-white dark:bg-[#fff1] rounded-lg">
        <h3 tw="pb-1 flex items-center gap-2.5">
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            Duration
          </span>
        </h3>
        <div tw="relative flex items-center gap-3.5">
          <div tw="absolute left-2.5">
            {getIcon('calendar', darkMode ? '#fff' : '#000')}
          </div>
          <StyledInput
            readOnly
            tw="pl-10"
            value={`${period.startDate?.toLocaleDateString()} - ${period.endDate?.toLocaleDateString()}`}
            onFocus={() => setShowCalendar(true)}
          />
          {showCalendar && (
            <div tw="absolute top-[48px]">
              <div
                tw="fixed left-0 top-0 w-full h-full z-20"
                onClick={() => setShowCalendar(false)}
              />
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
                  }}
                />
              </div>
            </div>
          )}
          <span
            tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-dark dark:text-light  cursor-pointer"
            onClick={() => setShowCalendar(true)}
          >
            Select date range
          </span>
        </div>
      </div>
      <div tw="p-3.5 rounded-lg">
        <h3 tw="pb-1 flex items-center gap-2.5">
          <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            Fees
          </span>
          {getIcon('info', darkMode ? '#fff' : '#000')}
        </h3>
        <div>
          <div tw="pt-5 flex items-center">
            <span tw="w-[188px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              Service Fee
            </span>
            <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              2.5%
            </span>
          </div>
          <div tw="pt-5 flex items-center">
            <span tw="w-[188px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              Creator Fee
            </span>
            <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {nftData?.fee ?? 0}%
            </span>
          </div>
        </div>
      </div>
      <div tw="pt-5 flex">
        <button
          tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
          onClick={handleCompleteOrder}
        >
          Complete Listing
          <span tw="-rotate-90 scale-75">
            {getIcon('dropdown', darkMode ? '#000' : '#fff')}
          </span>
        </button>
      </div>
    </>
  );
};

export default ListFixedPriceSection;
