import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Auth, Order } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { TextLine } from '../../components/lib/StyledComponents';
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
  User,
} from '../../type.d';
import { shortAddress } from '../../utils';
import { getDateISOFormat, time2ms, time2s } from '../../utils/datetime';
import { alertError, alertInfo, alertSuccess } from '../../utils/toast';
import {
  getBalanceByToken,
  getTokenInfoByAddress,
  tokens,
} from '../../utils/tokens';

var locked = false;
const erc20ABI = require('../../utils/web3/abis/erc20.json');

enum MakeOfferStep {
  REVIEW,
  OFFERING,
  APPROVE,
  COMPLETE,
  ADDFUNDS,
  FAILED,
}

const MakeOfferPopup = (props: {
  nft?: Partial<NftData>;
  collection?: CollectionData;
  onClose: () => void;
}) => {
  let { account, library } = useWeb3React();
  const { darkMode, setMakeOfferData, user } = useContext(UserContext);

  const [step, setStep] = useState<MakeOfferStep>(MakeOfferStep.REVIEW);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [creator, setCreator] = useState<User | null>(null);
  const _now = new Date();
  const [orderParam, setOrderParam] = useState<Partial<OrderParam>>({
    endTime: _now.getTime() + 43200000, // 12 hours
    // price: 1, // @DEBUG: remove for production
    quoteToken: process.env.REACT_APP_SLICED_ADDRESS,
    startTime: _now.getTime(),
  });
  const [custom, setCustom] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  const setParamField = (field: string, value: string | number) => {
    setOrderParam({ ...orderParam, [field]: value });
  };

  useEffect(() => {
    if (props.collection) {
      setStep(MakeOfferStep.REVIEW); // @DEBUG: REVIEW for production
      Auth.getByWallet(props.collection.collection_creator).then((res) => {
        setCreator(res);
      });
    }
  }, [props.collection]);

  useEffect(() => {
    if (account && orderParam.quoteToken) {
      setLoadingBalance(true);
      setBalance(0);
      setPrice(0);
      setBalanceUsd(0);
      getBalanceByToken(account, orderParam.quoteToken)
        .then((res) => {
          setBalance(res.balance);
          setPrice(res.price);
          setBalanceUsd(res.valueInUsd);
        })
        .finally(() => setLoadingBalance(false));
    }
  }, [account, orderParam.quoteToken]);

  const handleConfirmOffer = async () => {
    if (!props.collection) return;
    if (orderParam?.price && orderParam.price > 0) {
      // increaseLoading(true);
      setLoading(true);
      try {
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
          assetId: props.nft?.external_contract_address
            ? props.nft.external_tokenId || ''
            : BigNumber.from(`0x${props.nft?._id}`).toString(),
          assetType: props.nft?.isErc721 ? AssetType.ERC721 : AssetType.ERC1155,
          baseToken: props.nft?.external_contract_address
            ? props.nft?.external_contract_address
            : process.env.REACT_APP_NFT_ADDRESS,
          buyer: account,
          fraction: 1,
          option: {
            badgesOrchannelOwner: process.env.REACT_APP_FEE_RECEIVER,
            collectionFee: Math.round(
              100 * (props.collection?.collection_fee ?? 0)
            ), // please fill collection fee
            collectionOwner: props.collection.collection_owner, // please fill collection Owner
            endTime: time2s(orderParam.endTime ?? 0), // please fill endTime
            nftCreator: props.nft?.creator ?? '',
            nftFee: Math.round(100 * (props.nft?.fee ?? 0)),
            startTime: time2s(orderParam.startTime ?? 0), // please fill startTime
          },
          orderType: 1,
          price: ethers.utils.parseEther((orderParam.price ?? 0).toString()),
          quoteToken:
            orderParam.quoteToken ?? process.env.REACT_APP_SLICED_ADDRESS ?? '',
          seller: '0x0000000000000000000000000000000000000000',
        };
        // console.log('value: ', value);
        const signature = await library
          .getSigner()
          ._signTypedData(domain, types, value);
        Order.create({
          ...orderParam,
          assetAmount: 1,
          assetId: props.nft?.external_contract_address
            ? props.nft.external_tokenId || ''
            : BigNumber.from(`0x${props.nft?._id}`).toString(),
          assetType: props.nft?.isErc721 ? AssetType.ERC721 : AssetType.ERC1155,
          badgesOrchannelOwner: process.env.REACT_APP_FEE_RECEIVER,
          baseToken: props.nft?.external_contract_address
            ? props.nft?.external_contract_address
            : process.env.REACT_APP_NFT_ADDRESS ?? '',
          buyer: user?.walletAddress ?? '',
          channelId: '',
          endTime: time2ms(orderParam.endTime ?? 0),
          fraction: 1,
          orderType: OrderType.BUY,
          price: orderParam.price ?? 0,
          quoteToken:
            orderParam.quoteToken ?? process.env.REACT_APP_SLICED_ADDRESS ?? '',
          seller: '0x0000000000000000000000000000000000000000',
          signature: signature,
          startTime: time2ms(orderParam.startTime ?? 0),
          status: OrderStatus.PENDING,
          transactionHash: '',
          transactionStatus: TransactionStatus.PENDING,
        })
          .then((res) => {
            if (res) {
              alertSuccess('Your order has been submitted successfully.');
              setMakeOfferData(undefined);
              // navigate(-1);
            } else {
              alertError('Offering failed!');
              setMakeOfferData(undefined);
              setLoading(false);
            }
          })
          .catch((e) => {
            console.error(e);
            alertError(e.toString());
          })
          .finally(() => {
            console.log('final... POST Order.create');
            setMakeOfferData(undefined);
            setLoading(false);
          });
      } catch (e: any) {
        console.error('making offer failed:', e);
        alertError(e.message ?? 'Error while making offer.');
        setMakeOfferData(undefined);
        setLoading(false);
      }
    } else {
      alertError('The price cannot be zero.');
    }
  };

  /// when user click the approve button, you need to call this function.
  const handleApprove = async () => {
    const contract = new ethers.Contract(
      orderParam.quoteToken ?? '', /// please fill the selected pay token address.
      erc20ABI,
      library.getSigner()
    );
    // increaseLoading(true);
    let allowance = await contract.allowance(
      account,
      process.env.REACT_APP_NFT_MARKET
    );
    if (
      BigNumber.from(allowance).gte(
        ethers.utils.parseEther(`${orderParam.price}`)
      )
    ) {
      setStep(MakeOfferStep.COMPLETE);
      return;
    }
    setLoading(true);
    contract
      .approve(
        process.env.REACT_APP_NFT_MARKET,
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      )
      .then(async (res: any) => {
        if (res.hash) {
          console.log('txHash--------->', res.hash);
          localStorage.setItem('txHash', res.hash);
          setStep(MakeOfferStep.APPROVE);
        }
      })
      .catch((e: any) => {
        console.error(e);
        alertError(`${e.code}: ${e.message}`);
        setMakeOfferData(undefined);
      })
      .finally(() => console.log('final... contract.approve'));
  };

  useEffect(() => {
    const timer1 = setInterval(() => {
      getTransaction();
    }, 2000);
    return () => clearInterval(timer1);
  });

  const getTransaction = async () => {
    const txHash = localStorage.getItem('txHash') || '';
    console.log('!', txHash, locked);
    if (locked) return;
    if (txHash) {
      locked = true;
      try {
        const provider = new ethers.providers.StaticJsonRpcProvider(
          'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
        );
        const res = await provider.getTransactionReceipt(txHash);
        console.log(res);
        if (res && res.confirmations > 1) {
          localStorage.removeItem('txHash');
          locked = false;
          ///
          /// here you can go to the confirm step...
          ///
          setStep(MakeOfferStep.COMPLETE);
          console.log('successfully done ....');
          setLoading(false);
        }
        locked = false;
      } catch (e) {
        console.error(e);
        locked = false;
      }
    }
  };

  /// while locked is true, you need to keep the approve popup dialog.

  return props.collection ? (
    <div tw="px-4 pt-[90px] pb-4 fixed left-0 top-0 w-full h-full flex justify-center items-center z-50">
      <div
        tw="absolute left-0 top-0 w-full h-full backdrop-blur bg-[#0004] z-10"
        onClick={
          loading
            ? () => {
                return;
              }
            : () => props.onClose()
        }
      />
      <div
        className="popup-content no-scrollbar"
        tw="relative mx-auto px-4 py-8 w-full max-h-full max-w-[855px] text-center bg-white dark:bg-[#030017] rounded-[32px] overflow-auto z-20"
      >
        {loading && (
          <div tw="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-50">
            <div className="spinning">
              <div tw="scale-[500%]">{getIcon('loading', '#3169FA')}</div>
            </div>
          </div>
        )}
        {step === MakeOfferStep.REVIEW ? (
          <>
            <h3 tw="pb-8 font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
              This is an unreviewed collection
            </h3>
            <div tw="mx-auto p-6 w-full max-w-[455px] flex flex-col gap-6 shadow-[0px 4px 14px rgba(0, 0, 0, 0.1)] rounded-lg">
              <TextLine
                label="Collection name"
                text={props.collection.collection_name}
              />
              <TextLine
                label="Creator"
                text={`${creator?.name} (${shortAddress(
                  props.collection.collection_creator,
                  2,
                  2
                )})`}
              />
              {/* <TextLine label="Total sales" text="[Number] sale(s)" /> */}
              {/* <TextLine label="Total volume" text="[Token price]" /> */}
              {/* <TextLine label="Social links" text={<div>links...</div>} /> */}
              <TextLine
                label="Contract address"
                text={shortAddress(
                  props.nft?.external_contract_address
                    ? props.nft?.external_contract_address
                    : process.env.REACT_APP_NFT_ADDRESS ?? ''
                )}
              />
              <TextLine label="Total items" text="1" />
              <TextLine
                label="Created date"
                text={
                  props.collection.createdAt
                    ? new Date(props.collection.createdAt).toLocaleString()
                    : ''
                }
              />
            </div>
            <div tw="mx-auto pt-8 w-full flex justify-center">
              <label tw="flex items-center gap-2.5">
                <input
                  checked={understood}
                  tw="w-6 h-6"
                  type="checkbox"
                  onClick={() => setUnderstood(!understood)}
                />
                <span tw="text-base tracking-tight leading-[150%] text-left text-[rgba(0, 0, 0, 0.9)] dark:text-[rgba(255, 255, 255, 0.9)]">
                  I understand that Bitsliced has not reviewed this collection.
                </span>
              </label>
            </div>
            <div tw="pt-8 flex justify-center">
              <button
                css={
                  understood
                    ? {}
                    : { cursor: 'not-allowed', filter: 'grayscale(1)' }
                }
                tw="px-6 h-10 flex justify-center items-center text-dark dark:text-light  border-2 border-[#3169FA] rounded-[100px]"
                onClick={
                  understood
                    ? () => setStep(MakeOfferStep.OFFERING)
                    : () => {
                        return;
                      }
                }
              >
                Next
              </button>
            </div>
          </>
        ) : null}
        {step === MakeOfferStep.OFFERING ? (
          <div tw="px-4">
            <div>
              <button
                tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                onClick={() => setStep(MakeOfferStep.REVIEW)}
              >
                <div tw="rotate-90 scale-90">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Back
                </span>
              </button>
            </div>
            <h3 tw="pt-8 font-semibold text-[23px] tracking-tight leading-[150%] text-left text-dark dark:text-light/90">
              Make an offer
            </h3>
            <div tw="pt-8 flex justify-between items-center">
              <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                Offer amount
              </span>
              <span tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                Balance: {loadingBalance ? '?' : balance}{' '}
                <span tw="text-[14px] tracking-tight uppercase">
                  {getTokenInfoByAddress(
                    orderParam.quoteToken ?? ''
                  )?.name.toLowerCase()}
                </span>{' '}
                (${loadingBalance ? '?' : balanceUsd})
              </span>
            </div>
            <div
              css={{ gridTemplateColumns: '200px 1fr' }}
              tw="pt-2.5 grid gap-3.5"
            >
              <div tw="relative">
                <div
                  tw="px-2.5 h-[46px] flex items-center gap-1.5 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px] cursor-pointer"
                  onClick={() => setShowTokens(true)}
                >
                  {getIcon(
                    getTokenInfoByAddress(orderParam.quoteToken ?? '')?.icon ??
                      '',
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
                    <ul tw="absolute left-0 top-[45px] w-full max-h-[320px] bg-white dark:bg-[#252236] shadow-lg rounded-[7px] overflow-auto z-30">
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
                      {tokens
                        .filter((item) => item.name.toLowerCase() !== 'eth')
                        .map((item: Token) => (
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
                                orderParam.quoteToken === item.address
                                  ? { fontWeight: 600 }
                                  : {}
                              }
                              tw="text-base tracking-tight capitalize text-dark dark:text-light/90"
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
                disabled={loadingBalance}
                min={0}
                placeholder="[Amount]"
                step={0.1}
                tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                type="number"
                value={orderParam.price}
                onChange={(e) =>
                  setParamField('price', parseFloat(e.target.value))
                }
              />
            </div>
            <div tw="pt-3 text-[14px] tracking-tight leading-[150%] text-right text-gray-500 ">
              Total offer amount: {orderParam.price ?? 0}{' '}
              <span tw="text-[14px] tracking-tight uppercase">
                {getTokenInfoByAddress(
                  orderParam.quoteToken ?? ''
                )?.name.toLowerCase()}
              </span>{' '}
              (${(orderParam.price ?? 0) * (price ?? 0)})
            </div>
            <div tw="pt-8 flex justify-between items-center">
              <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                Offer expiration
              </span>
            </div>
            <div
              css={{ gridTemplateColumns: '200px 1fr' }}
              tw="pt-2.5 grid gap-3.5"
            >
              <select
                defaultValue={0}
                tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                onChange={(e) => {
                  const startDate = new Date();
                  setParamField('startTime', startDate.getTime());

                  let endDate = new Date(startDate.getTime());
                  const selected = parseInt(e.target.value);
                  switch (selected) {
                    case 12:
                    case 24:
                    case 72:
                    case 168:
                      endDate = new Date(
                        startDate.getTime() + selected * 3600000
                      );
                      break;
                    case 1:
                      endDate.setMonth(endDate.getMonth() + 1);
                      break;
                    case 0:
                    default:
                      break;
                  }
                  if (selected > 0) {
                    setParamField('endTime', endDate.getTime());
                    setCustom(false);
                  } else {
                    setCustom(true);
                  }
                }}
              >
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={12}
                >
                  12 hours
                </option>
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={24}
                >
                  1 day
                </option>
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={72}
                >
                  3 days
                </option>
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={168}
                >
                  7 days
                </option>
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={1}
                >
                  1 month
                </option>
                <option
                  tw="text-dark dark:text-light/90 dark:bg-[#252236]"
                  value={0}
                >
                  Custom date
                </option>
              </select>
              <input
                disabled={!custom}
                min={getDateISOFormat(_now)}
                title="Expiration date"
                tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                type="date"
                value={new Date(Number(orderParam.endTime) ?? 0)
                  .toISOString()
                  .substring(0, 10)}
                onChange={(e) => {
                  if (custom && e.target.value) {
                    setParamField(
                      'endTime',
                      new Date(e.target.value).getTime()
                    );
                  }
                }}
              />
            </div>
            <div tw="pt-16 grid grid-cols-2 gap-3.5">
              <button
                disabled={loadingBalance}
                tw="h-10 font-semibold text-base tracking-tight leading-[150%] bg-[#3169FA] rounded-[100px]"
                onClick={() => {
                  if (orderParam.price && orderParam.price > 0) {
                    handleApprove();
                  } else {
                    alertError('Price amount is not valid.');
                  }
                }}
              >
                Make offer
              </button>
              <button
                tw="h-10 font-semibold text-base tracking-tight leading-[150%] border-2 border-[#3169FA] text-dark dark:text-light  rounded-[100px]"
                onClick={() => setStep(MakeOfferStep.ADDFUNDS)}
              >
                Add funds
              </button>
            </div>
          </div>
        ) : null}
        {step === MakeOfferStep.APPROVE ? (
          <div tw="px-4">
            <div>
              <button
                tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                onClick={() => setStep(MakeOfferStep.OFFERING)}
              >
                <div tw="rotate-90 scale-90">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Back
                </span>
              </button>
            </div>
            <h3 tw="pt-8 font-semibold text-[23px] tracking-tight leading-[150%] text-left text-dark dark:text-light/90">
              Approve currency
            </h3>
            <div
              tw="pt-4 flex items-center gap-1.5"
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
            <div tw="pt-4 tracking-tight leading-[150%] text-dark dark:text-light/90 text-left">
              <div tw="font-semibold text-base text-dark dark:text-light/90">
                Go to your wallet
              </div>
              You'ill be asked to approve the use of{' '}
              {getTokenInfoByAddress(
                orderParam.quoteToken ?? ''
              )?.name.toLowerCase()}{' '}
              from your wallet. You only need to do this once.
            </div>
          </div>
        ) : null}
        {step === MakeOfferStep.COMPLETE ? (
          <div tw="px-4">
            <div>
              <button
                tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                onClick={() => setStep(MakeOfferStep.APPROVE)}
              >
                <div tw="rotate-90 scale-90">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Back
                </span>
              </button>
            </div>
            <h3 tw="pt-8 font-semibold text-[23px] tracking-tight leading-[150%] text-left text-dark dark:text-light/90">
              Make an offer
            </h3>
            <div tw="py-8 flex justify-between items-center">
              <div tw="flex items-center gap-3.5">
                <div
                  css={{
                    backgroundImage: `url(${props.collection.collection_profile_image_url})`,
                  }}
                  tw="w-11 h-11 bg-no-repeat bg-center bg-cover rounded-full"
                />
                <div tw="flex flex-col items-start gap-0.5">
                  <div tw="font-medium text-sm text-gray-500 ">
                    {creator?.name} (
                    {shortAddress(props.collection.collection_creator, 2, 2)})
                  </div>
                  <div tw="font-semibold text-sm text-dark dark:text-light/90">
                    {props.collection.collection_name}
                  </div>
                  <div tw="font-medium text-sm text-gray-500 ">Quantity: 1</div>
                </div>
              </div>
              <div tw="flex justify-end items-center gap-[7px]">
                <div tw="flex flex-col items-end gap-0.5">
                  <div
                    title="NFT price to offer"
                    tw="font-medium text-sm text-gray-500"
                  >
                    Price
                  </div>
                  <div tw="flex items-center gap-0.5">
                    {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
                    <span tw="font-semibold text-sm text-dark dark:text-light/90">
                      {orderParam.price}
                    </span>
                  </div>
                  <div
                    title="Token price in USD"
                    tw="font-medium text-sm text-gray-500"
                  >
                    {price
                      ? `$${(orderParam.price ?? 0) * (price ?? 0)} USD`
                      : '...'}
                  </div>
                </div>
                <div tw="scale-75">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
              </div>
            </div>
            <div tw="-mx-8 w-[calc(100% + 68px)] h-[1px] bg-[rgba(0, 0, 0, 0.15)] dark:bg-[rgba(255, 255, 255, 0.15)]" />
            <div>
              <div
                css={{ gridTemplateColumns: 'auto 1fr' }}
                tw="pt-8 grid gap-4"
              >
                <div tw="w-9 h-9 flex justify-center items-center font-semibold text-base text-dark dark:text-light/90 border-2 border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)] rounded-full">
                  1
                </div>
                <div tw="text-left">
                  <h4 tw="pt-2 font-semibold text-sm text-dark dark:text-light/90">
                    Approve currency
                  </h4>
                </div>
                <div tw="w-9 h-9 flex justify-center items-center font-semibold text-base text-dark dark:text-light/90 border-2 border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)] rounded-full">
                  2
                </div>
                <div tw="text-left">
                  <h4 tw="pt-2 font-semibold text-sm text-dark dark:text-light/90">
                    Confirm offer
                  </h4>
                  <div tw="pt-3.5">
                    <button
                      tw="px-3.5 h-10 font-semibold text-base tracking-tight leading-[150%] bg-[#3169FA] rounded-[100px]"
                      onClick={() => {
                        setStep(MakeOfferStep.APPROVE);
                        handleConfirmOffer();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {step === MakeOfferStep.ADDFUNDS ? (
          <div tw="px-4">
            <div>
              <button
                tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                onClick={() => setStep(MakeOfferStep.OFFERING)}
              >
                <div tw="rotate-90 scale-90">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Back
                </span>
              </button>
            </div>
            <h3 tw="pt-8 font-semibold text-[23px] tracking-tight leading-[150%] text-left text-dark dark:text-light/90">
              Add funds
            </h3>
            <div tw="-mx-8 pt-8 border-b border-[rgba(0, 0, 0, 0.15)]">
              <div tw="px-[64px] pb-4 w-[fit-content] flex items-center gap-5 border-b-2 border-black dark:border-white">
                <div tw="-rotate-90">
                  {getIcon('back', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base text-dark dark:text-light/90">
                  Deposit crypto
                </span>
              </div>
            </div>
            <div tw="pt-8">
              <div tw="mx-auto inline-block w-16">
                {getIcon('wallet', '#d4d4d4')}
              </div>
              <p tw="pt-4 text-sm tracking-tight leading-[150%] text-center text-dark dark:text-light/90">
                Transfer funds from an exchange or another wallet to your wallet
                address below:
              </p>
            </div>
            <div
              css={{ gridTemplateColumns: '1fr auto' }}
              tw="pt-4 grid items-center gap-3.5"
            >
              <input
                readOnly
                tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-center text-dark border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] rounded-[7px]"
                value={user?.walletAddress}
              />
              <CopyToClipboard
                text={user?.walletAddress ?? ''}
                onCopy={() => alertInfo('Copied.')}
              >
                <button tw="px-3.5 h-10 font-semibold text-[14px] tracking-tight leading-[150%] bg-[#3169FA] rounded-[100px]">
                  Copy
                </button>
              </CopyToClipboard>
            </div>
            <div tw="pt-12">
              <p tw="text-sm text-center text-gray-500 ">
                Only send ETH or any other ERC-20 token to this address.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default MakeOfferPopup;
