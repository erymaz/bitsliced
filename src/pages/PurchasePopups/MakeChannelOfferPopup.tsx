import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { addDays } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { Link } from 'react-router-dom';

import { Auth, Channeloffer } from '../../api/api';
import BackLink from '../../components/BackLink';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton, TextLine } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, Token, TransactionStatus, User } from '../../type.d';
import { shortAddress } from '../../utils';
import { alertError, alertSuccess } from '../../utils/toast';
import {
  getBalanceByToken,
  getTokenInfoByAddress,
  tokens,
} from '../../utils/tokens';
import { availableRanges } from './ListNftPage';

var locked = false;
const erc20ABI = require('../../utils/web3/abis/erc20.json');
const marketABI = require('../../utils/web3/abis/market.json');

enum MakeOfferStep {
  REVIEW,
  INPUT,
  APPROVE,
  SIGN,
  COMPLETE,
}

const PurchasePopupTitle: { [key: number]: string } = {
  [MakeOfferStep.REVIEW]: 'This is an unreviewed Channel',
  [MakeOfferStep.INPUT]: 'Make a Channel offer',
  [MakeOfferStep.COMPLETE]: 'Channel offer is complete',
};

const MakeChannelOfferPopup = (props: {
  item?: Partial<ChannelData>;
  onClose: () => void;
}) => {
  let { account, activate, active, library } = useWeb3React();
  const { darkMode, setChannelToOffer } = useContext(UserContext);

  const [step, setStep] = useState<MakeOfferStep>(MakeOfferStep.REVIEW);
  const [creator, setCreator] = useState<User | null>(null);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [showTokens, setShowTokens] = useState<boolean>(false);
  const [quoteToken, setQuoteToken] = useState<string | null>(
    process.env.REACT_APP_SLICED_ADDRESS || null
  );
  const [offerAmount, setOfferAmount] = useState<number>(0);
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
  const [bestOffer, setBestOffer] = useState<number>(0);

  useEffect(() => {
    if (props.item?.channel_creator) {
      Auth.getByWallet(props.item.channel_creator).then((res) =>
        setCreator(res)
      );
    }

    if (props.item?._id) {
      Channeloffer.getByChannelId(props.item._id).then((res) => {
        if (res) {
          const offer = res
            .map((o) => o.price)
            .reduce((a, b) => Math.max(a, b), -Infinity);
          setBestOffer(offer);
        }
      });
    }
  }, [props.item]);

  useEffect(() => {
    if (account) {
      setLoadingBalance(true);
      setBalance(0);
      setPrice(0);
      setBalanceUsd(0);
      getBalanceByToken(account, process.env.REACT_APP_SLICED_ADDRESS)
        .then((res) => {
          setBalance(res.balance);
          setPrice(res.price);
          setBalanceUsd(res.valueInUsd);
        })
        .finally(() => setLoadingBalance(false));
    }
  }, [account]);

  const handleApprove = async () => {
    const contract = new ethers.Contract(
      process.env.REACT_APP_SLICED_ADDRESS || '', // select Sliced token, but in the future, we need to change it so that includes more tokens.
      erc20ABI,
      library.getSigner()
    );

    let allowance = await contract.allowance(
      account,
      props.item?.channel_address || ''
    );
    if (
      BigNumber.from(allowance).gte(
        ethers.utils.parseEther((offerAmount || 0).toString())
      )
    ) {
      setStep(MakeOfferStep.SIGN);
      return;
    }

    contract
      .approve(
        props.item?.channel_address,
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      )
      .then(async (res: any) => {
        if (res.hash) {
          console.log('txHash--------->', res.hash);
          localStorage.setItem('txHashForMakeOfferChannel', res.hash);
        }
      })
      .catch((e: any) => {
        console.error(e);
        alertError(`${e.code}: ${e.message}`);
        setStep(MakeOfferStep.INPUT);
      })
      .finally(() => console.log('final..'));
  };

  useEffect(() => {
    const timer1 = setInterval(async () => {
      const txHash = localStorage.getItem('txHashForMakeOfferChannel') || '';
      // console.log('!', txHash, locked);
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
            localStorage.removeItem('txHashForMakeOfferChannel');
            locked = false;
            setStep(MakeOfferStep.SIGN);
          }
          locked = false;
        } catch (e) {
          console.error(e);
          locked = false;
        }
      }
    }, 2000);
    return () => clearInterval(timer1);
  });

  const handleConfirmOffer = async () => {
    if (!props) return;
    if (offerAmount && offerAmount > 0) {
      try {
        const domain = {
          chainId: 5,
          name: 'Bitsliced Channel',
          verifyingContract: process.env.REACT_APP_CHANNEL_VERIFIER,
          version: '1',
        };

        // The named list of all type definitions
        const types = {
          ChannelOffer: [
            { name: 'channel', type: 'address' },
            { name: 'buyer', type: 'address' },
            { name: 'price', type: 'uint256' },
          ],
        };

        // The data to sign
        const value = {
          buyer: account,
          channel: props.item?.channel_address,
          price: ethers.utils.parseEther((offerAmount ?? 0).toString()),
        };
        console.log('value: ', value);
        const signature = await library
          .getSigner()
          ._signTypedData(domain, types, value);
        Channeloffer.create({
          buyer: account || '',
          channelId: props.item?._id || '',
          channel_address: props.item?.channel_address || '',
          channel_name: props.item?.channel_name || '',
          endTime: period.endDate?.getTime() || 0,
          price: offerAmount,
          signature: signature,
          startTime: period.startDate?.getTime() || 0,
          status: 0,
          transactionHash: '',
          transactionStatus: TransactionStatus.PENDING,
        })
          .then((res) => {
            if (res) {
              alertSuccess('Your offer has been submitted successfully.');
              setStep(MakeOfferStep.COMPLETE);
            } else {
              alertError('Offering failed!');
            }
          })
          .catch((e) => {
            console.error(e);
            alertError(e.toString());
          })
          .finally(() => {
            console.log('final... POST Channeloffer.create');
          });
      } catch (e: any) {
        console.error(e);
        alertError(e.toString());
        setStep(MakeOfferStep.SIGN);
      }
    } else {
      alertError('The price cannot be zero.');
    }
  };

  useEffect(() => {
    if (step === MakeOfferStep.APPROVE) {
      handleApprove();
    }
    if (step === MakeOfferStep.SIGN) {
      handleConfirmOffer();
    }
  }, [step]);

  return props.item ? (
    <div tw="px-4 pt-[90px] pb-4 fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
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
        <h3 tw="pb-8 font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
          {PurchasePopupTitle[step]}
        </h3>
        {[MakeOfferStep.REVIEW].includes(step) ? (
          <div tw="mx-auto p-6 w-full max-w-[489px] flex justify-center shadow-[0px 4px 14px rgba(0, 0, 0, 0.1)] rounded-lg">
            <div tw="w-full max-w-[520px] flex flex-col gap-6">
              <TextLine label="Channel name" text={props.item.channel_name} />
              <TextLine
                label="Creator"
                text={`${creator?.name} (${shortAddress(
                  props.item.channel_creator,
                  2,
                  4
                )})`}
                title={props.item.channel_creator}
              />
              <TextLine
                label="Channel ticket price"
                text={props.item.channel_ticket_price}
              />
              <TextLine label="Total sales (tickets)" text="-" />
              <TextLine label="Total volume (tickets)" text="-" />
              <TextLine label="Total volume (trading)" text="-" />
              <TextLine label="Total items" text={props.item.items?.length} />
              {/* <TextLine label="Social links" text={<div>links...</div>} /> */}
              <TextLine
                label="Contract address"
                text={shortAddress(props.item.channel_address ?? '')}
                title={props.item.channel_address ?? ''}
              />
              <TextLine
                label="Created date"
                text={
                  props.item.createdAt
                    ? new Date(props.item.createdAt).toLocaleString()
                    : '[date]'
                }
              />
            </div>
          </div>
        ) : null}
        {[
          MakeOfferStep.INPUT,
          MakeOfferStep.APPROVE,
          MakeOfferStep.SIGN,
        ].includes(step) ? (
          <div tw="p-[20px] relative w-full">
            <div tw="absolute left-[20px] top-[-66px]">
              <BackLink handleBack={() => setStep(MakeOfferStep.REVIEW)} />
            </div>
            <div tw="pb-[30px] flex justify-between items-center">
              <div tw="flex items-center gap-[10px]">
                <div
                  css={{
                    backgroundImage: `url(${props.item.channel_profile_image_url})`,
                  }}
                  tw="relative w-[100px] min-w-[100px] h-[100px] bg-white bg-no-repeat bg-center bg-cover shadow-lg rounded-full"
                >
                  <picture
                    // css={{ backgroundImage: `url(${data.image})` }}
                    tw="absolute left-0 top-0 w-full h-full backdrop-blur rounded-full overflow-hidden z-10"
                  >
                    <source
                      srcSet={props.item.channel_profile_image_url}
                      tw="w-full h-full object-contain object-center"
                      type="image/avif"
                    />
                    <source
                      srcSet={props.item.channel_profile_image_url}
                      tw="w-full h-full object-contain object-center"
                      type="image/webp"
                    />
                    <img
                      alt=""
                      src={props.item.channel_profile_image_url}
                      tw="w-full h-full object-contain object-center"
                    />
                  </picture>
                </div>
                <div tw="font-bold text-[23px] text-[#000e] dark:text-[#fffe]">
                  {props.item.channel_name}
                </div>
              </div>
              <div tw="flex flex-col items-end">
                <div tw="font-semibold text-base text-dark dark:text-light/90">
                  {props.item.channel_ticket_price} SLICED
                </div>
                <div tw="text-[14px] text-gray-500 ">Ticket price</div>
              </div>
            </div>
            <div tw="px-[20px] py-[10px] border border-[#0008] dark:border-[#fff8] rounded-lg">
              <div tw="h-[46px] flex items-center border-b border-[#0001] dark:border-[#fff1]">
                <TextLine
                  label={
                    <span tw="flex items-center gap-[10px] text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                      {getIcon('wallet', darkMode ? '#fff' : '#000')}Balance
                    </span>
                  }
                  text={
                    loadingBalance
                      ? 'Loding...'
                      : `${balance} SLICED ($${(price ?? 0) * (balance ?? 0)})`
                  }
                />
              </div>
              <div tw="h-[46px] flex items-center border-b border-[#0001] dark:border-[#fff1]">
                <TextLine label="Channel value" text="20.42 SLICED" />
              </div>
              <div tw="h-[46px] flex items-center">
                <TextLine
                  label="Best offer"
                  text={bestOffer === -Infinity ? '-' : `${bestOffer} SLICED`}
                />
              </div>
            </div>
            <div tw="pt-[30px]">
              <h3 tw="font-semibold text-base tracking-tight text-left">
                Price
              </h3>
              <div
                css={{ gridTemplateColumns: '200px 1fr' }}
                tw="pt-2.5 grid gap-3.5"
              >
                <div tw="relative">
                  <div
                    tw="px-2.5 h-[46px] flex items-center gap-1.5 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px] cursor-pointer"
                    // onClick={() => setShowTokens(true)}
                  >
                    {getIcon(
                      getTokenInfoByAddress(quoteToken ?? '')?.icon ?? '',
                      darkMode ? '#fff' : '#000'
                    )}
                    <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90">
                      {getTokenInfoByAddress(
                        quoteToken ?? ''
                      )?.name.toLowerCase() ?? '[Token]'}
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
                          // .filter((item) => item.name.toLowerCase() !== 'eth')
                          .map((item: Token) => (
                            <li
                              key={item.name}
                              tw="px-2.5 h-10 flex items-center hover:bg-[#0001] gap-2 border-t border-[rgba(0, 0, 0, 0.15)] cursor-pointer"
                              onClick={() => {
                                setQuoteToken(item.address);
                                setShowTokens(false);
                              }}
                            >
                              {getIcon(item.icon, darkMode ? '#fff' : '#000')}
                              <span
                                css={
                                  quoteToken === item.address
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
                  disabled={step !== MakeOfferStep.INPUT}
                  min={0}
                  placeholder="[Amount]"
                  step={0.1}
                  tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
                />
              </div>
              <div tw="pt-3 text-[14px] tracking-tight leading-[150%] text-right text-gray-500 ">
                Offer amount: {offerAmount} SLICED ($
                {(price ?? 0) * (offerAmount ?? 0)})
              </div>
            </div>
            <div tw="pt-[20px] pb-[20px]">
              <h3 tw="font-semibold text-base tracking-tight text-left">
                Duration
              </h3>
              <div tw="pt-[10px] relative w-full flex items-center gap-3.5">
                <div tw="absolute left-2.5">
                  {getIcon('calendar', darkMode ? '#fff' : '#000')}
                </div>
                <input
                  readOnly
                  tw="pl-[40px] pr-2.5 w-full h-[46px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                  value={`${period.startDate?.toLocaleDateString()} - ${period.endDate?.toLocaleDateString()}`}
                  onFocus={
                    step !== MakeOfferStep.INPUT
                      ? () => {
                          return;
                        }
                      : () => setShowCalendar(true)
                  }
                />
                {showCalendar && (
                  <>
                    <div
                      tw="fixed left-0 top-0 w-full h-full z-40"
                      onClick={() => setShowCalendar(false)}
                    />
                    <div tw="fixed left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-50">
                      <div tw="relative rounded-[7px] overflow-hidden shadow-lg z-[51]">
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
                          tw="z-[52]"
                          onChange={(item: RangeKeyDict) => {
                            setPeriod(item.selection);
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
              </div>{' '}
            </div>
          </div>
        ) : null}

        {step === MakeOfferStep.APPROVE ? (
          <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
            <div tw="px-6 py-6 w-full max-w-[560px] flex flex-col md:flex-row justify-center items-center gap-3 bg-white dark:bg-dark rounded-md shadow-lg">
              <div tw="relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
                <div tw="absolute w-full h-full border-4 border-dark/20 dark:border-light/20 border-t-hero-purpledark dark:border-t-hero-bluelight rounded-[50%] animate-spin" />
                <span tw="font-bold text-[20px] text-dark dark:text-light">
                  1/2
                </span>
              </div>
              <div>
                <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                  Approving SLICED token for making channel offer, please accept
                  the following transaction.
                </p>
                <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                  This transaction needs only transaction fee!
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === MakeOfferStep.SIGN ? (
          <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
            <div tw="px-6 py-6 w-full max-w-[560px] flex flex-col md:flex-row justify-center items-center gap-3 bg-white dark:bg-dark rounded-md shadow-lg">
              <div tw="relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
                <div tw="absolute w-full h-full border-4 border-dark/20 dark:border-light/20 border-t-hero-purpledark dark:border-t-hero-bluelight rounded-[50%] animate-spin" />
                <span tw="font-bold text-[20px] text-dark dark:text-light">
                  2/2
                </span>
              </div>
              <div>
                <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                  Confirming the channel offer, please accept the following
                  transaction for signing of offer data.
                </p>
                <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                  This will not make transaction!
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === MakeOfferStep.REVIEW ? (
          <>
            <div tw="mx-auto pt-8 w-full max-w-[455px]">
              <label tw="flex items-center gap-2.5">
                <input
                  checked={understood}
                  tw="w-6 h-6"
                  type="checkbox"
                  onClick={() => setUnderstood(!understood)}
                />
                <span tw="text-base tracking-tight leading-[150%] text-left text-[rgba(0, 0, 0, 0.9)] dark:text-[rgba(255, 255, 255, 0.9)]">
                  I understand that Bitsliced has not reviewed this channel.
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
                    ? () => {
                        if (props.item?.channel_address) {
                          setStep(MakeOfferStep.INPUT);
                        } else {
                          // SHOULD SHOW ALERT (INVALID CHANNEL ADDRESS!!!)
                          alertError('Invalid channel address.');
                          return;
                        }
                      }
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
        {step === MakeOfferStep.INPUT ? (
          <div tw="p-[20px] flex flex-col gap-[20px]">
            <StyledButton tw="w-full justify-center text-[#DD3939] dark:text-light/90 bg-[rgba(221, 57, 57, 0.2)] dark:bg-[rgba(221, 57, 57, 0.2)] border-[#DD3939] rounded-[10px]">
              This channel is not reviewed by Bitsliced
            </StyledButton>
            <StyledButton
              tw="w-full justify-center rounded-[10px]"
              onClick={() => {
                if (offerAmount && offerAmount > 0) {
                  setStep(MakeOfferStep.APPROVE);
                } else {
                  alertError('Price amount is not valid.');
                }
              }}
            >
              Make offer
            </StyledButton>
          </div>
        ) : null}
        {step === MakeOfferStep.COMPLETE ? (
          <div tw="pt-8 flex justify-center">
            <Link
              to={`/channels/${props.item._id}`}
              tw="px-6 h-10 flex justify-center items-center text-light/90 bg-[#3169FA] rounded-[100px]"
              onClick={() => props.onClose()}
            >
              View channel
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default MakeChannelOfferPopup;
