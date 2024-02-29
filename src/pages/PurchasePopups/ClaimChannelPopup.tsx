import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';

import { Ticket } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import {
  ChannelData,
  ChannelPermissionTitle,
  TicketData,
  TransactionStatus,
  User,
} from '../../type.d';
import { shortAddress } from '../../utils';
import { alertError, alertSuccess } from '../../utils/toast';
import { getTokenBalance } from '../../utils/web3/library';

var locked = false;

const channelContractABI = require('../../utils/web3/abis/channelContract.json');
const slicedABI = require('../../utils/web3/abis/sliced.json');

const options = [
  {
    options: [
      { key: 'yes', label: 'Yes' },
      { key: 'no', label: 'No' },
    ],
    title: 'Do you want this Channel Ticket to be traded?',
  },
  {
    options: [
      { key: '1', label: '1 Month' },
      { key: '3', label: '3 Months' },
      { key: '6', label: '6 Months' },
      { key: '12', label: '12 Months' },
    ],
    title: 'For how long do you want to subscribe this Channel?',
  },
  {
    options: [{ key: 'pay-at-once', label: 'Pay at once' }],
    title: 'How do you want to proceed?',
  },
];

const getExpiredDate = (months: number): number => {
  const now = new Date();
  now.setMonth(now.getMonth() + months);

  return now.getTime();
};

const ClaimChannelPopup = (props: {
  channel: ChannelData;
  creator: User;
  isOpen: boolean;
  onClose: () => void;
}) => {
  let { account, activate, active, library } = useWeb3React();
  const { darkMode, decreaseLoading, increaseLoading, user } =
    useContext(UserContext);
  const [waitingTransaction, setWaitingTransaction] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    'no',
    '3',
    'pay-at-once',
  ]);

  useEffect(() => {
    const getBalance = async (account: string) => {
      const balanceSliced = await getTokenBalance(
        account,
        process.env.REACT_APP_SLICED_ADDRESS || ''
      );
      console.log('balanceSliced', balanceSliced);
      setWalletBalance(Number(balanceSliced));
    };
    if (account) {
      getBalance(account);
    }
  }, [account]);

  const getSubsPeriodTitleFromKey = (key: string): string => {
    if (key) {
      const res = options[1].options.find((item) => item.key === key);
      return res?.label ?? 'Undefined';
    }
    return 'Undefined';
  };

  const handleJoinChannel = async () => {
    if (props.channel._id && props.channel.channel_address) {
      const contract = new ethers.Contract(
        process.env.REACT_APP_SLICED_ADDRESS || '',
        slicedABI,
        library.getSigner()
      );
      let allowance = await contract.allowance(
        account,
        props.channel.channel_address
      );
      if (
        BigNumber.from(allowance).gte(
          ethers.utils.parseEther(
            (
              props.channel.channel_ticket_price * parseInt(selectedOptions[1])
            ).toString()
          )
        )
      ) {
        submitJoinChannel();
        return;
      }
      // please make loading....
      increaseLoading(true);
      setWaitingTransaction(1);
      contract
        .approve(
          props.channel.channel_address,
          '115792089237316195423570985008687907853269984665640564039457584007913129639935'
        )
        .then(async (res: any) => {
          if (res.hash) {
            console.log('txHash--------->', res.hash);
            localStorage.setItem('txHash1', res.hash);
          }
        })
        .catch((e: any) => {
          console.error(e);
          setErrorMessage(e.code ? `${e.code}: ${e.message}` : e.toString());
          decreaseLoading(true);
          setWaitingTransaction(0);
        })
        .finally(() => {
          // please make loading..........
        });
    } else {
      alertError('A channel should be selected.');
    }
  };

  useEffect(() => {
    const timer1 = setInterval(() => {
      getTransaction();
    }, 2000);
    return () => clearInterval(timer1);
  });

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  }, [errorMessage]);

  const getTransaction = async () => {
    const txHash = localStorage.getItem('txHash1') || '';
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
          localStorage.removeItem('txHash1');
          locked = false;
          decreaseLoading(true);
          submitJoinChannel();
          console.log('successfully done ....');
        }
        locked = false;
      } catch (e) {
        console.log(e);
        setWaitingTransaction(0);
        locked = false;
      }
    }
  };

  const submitJoinChannel = async () => {
    let timer: number | NodeJS.Timer | null;

    if (props.channel._id && props.channel.channel_address) {
      setWaitingTransaction(2);
      Ticket.create({
        channel_id: props.channel._id,
        channel_name: props.channel.channel_name,
        expiredTimestamp: getExpiredDate(parseInt(selectedOptions[1])),
        is_tradable: !!props.channel.is_tradable_tickets, // selectedOptions[0] === 'yes',
        owner: user?.walletAddress ?? '',
        price:
          props.channel.channel_ticket_price * parseInt(selectedOptions[1]),
        status: TransactionStatus.PENDING,
        ticketId: '',
        transactionHash: '',
      })
        .then((res) => {
          if (res) {
            console.log(
              'step2-------->',
              res,
              active,
              parseInt(selectedOptions[1])
            );
            const createdTicketId = res._id ?? '';
            if (active) {
              try {
                const contract = new ethers.Contract(
                  props.channel.channel_address || '',
                  channelContractABI,
                  library.getSigner()
                );
                let isTradable = !!props.channel.is_tradable_tickets; // selectedOptions[0] === 'yes' ? true : false;
                let months = parseInt(selectedOptions[1]) || 1;
                contract
                  .joinChannel(isTradable, months)
                  .then(async (contractRes: any) => {
                    console.log('contractRes: ', contractRes);
                    console.log(contractRes.hash);
                    if (contractRes.hash) {
                      // here please call ticket put api, with {transactionHash: contractRes.hash, status: 0}
                      // And you need to wait for ticket status will be changed 1 or 2
                      // polling method...
                      // if the status is 1, success,
                      // if 2, failed.
                      Ticket.update(createdTicketId, {
                        status: TransactionStatus.PENDING,
                        transactionHash: contractRes.hash,
                      })
                        .then((uptRes) => {
                          if (uptRes) {
                            setWaitingTransaction(3);
                            timer = setInterval(() => {
                              Ticket.getById(createdTicketId).then(
                                (getRes: TicketData) => {
                                  if (
                                    getRes &&
                                    getRes.status !== TransactionStatus.PENDING
                                  ) {
                                    if (
                                      getRes.status ===
                                      TransactionStatus.CONFIRMED
                                    ) {
                                      props.onClose();
                                      alertSuccess(
                                        'A ticket has been created.'
                                      );
                                      setTimeout(() => {
                                        window.location.reload();
                                      }, 2000);
                                    } else {
                                      throw new Error('Transaction failed!');
                                    }
                                    setWaitingTransaction(0);
                                    if (timer) clearInterval(timer);
                                    timer = null;
                                  }
                                }
                              );
                            }, 5000);
                          }
                        })
                        .catch((e) => {
                          console.error(e);
                          setWaitingTransaction(0);
                          setErrorMessage(e.toString());
                        });
                    }
                  })
                  .catch((e: any) => {
                    console.log('-------->', e);
                    setErrorMessage(
                      `${e.method ?? ''}(${e.code ?? ''}): ${
                        e.error?.message ?? 'Cannot join channel.'
                      }`
                    );
                    setWaitingTransaction(0);
                  });
                // alertSuccess('A ticket has been created successfully.');
                // props.onClose();
              } catch (e) {
                console.log(e);
                setWaitingTransaction(0);
              }
            }
          }
        })
        .catch((e) => {
          console.error(e);
          setWaitingTransaction(0);
          setErrorMessage(e.toString());
        });
    } else {
      alertError('A channel should be selected.');
    }
  };

  return props.isOpen ? (
    <>
      {(waitingTransaction > 0 || errorMessage) && (
        <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
          <div tw="px-6 py-6 w-full max-w-[560px] flex flex-col md:flex-row justify-center items-center gap-3 bg-white dark:bg-dark rounded-md shadow-lg">
            <div tw="relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
              <div tw="absolute w-full h-full border-4 border-dark/20 dark:border-light/20 border-t-hero-purpledark dark:border-t-hero-bluelight rounded-[50%] animate-spin" />
              {waitingTransaction > 0 && (
                <span tw="font-bold text-[20px] text-dark dark:text-light">
                  {waitingTransaction - 1}/2
                </span>
              )}
            </div>
            <div>
              {waitingTransaction === 1 && (
                <>
                  <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                    Joining this Channel, please accept the following
                    transactions to finalise the creation.
                  </p>
                  <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                    This transaction is free of cost!
                  </p>
                </>
              )}
              {waitingTransaction === 2 && (
                <>
                  <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                    Joining this Channel, please accept the following
                    transactions to finalise the creation.
                  </p>
                  <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                    This transaction is free of cost!
                  </p>
                </>
              )}
              {waitingTransaction === 3 && (
                <>
                  <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                    Joining this Channel, please accept the following
                    transactions to finalise the creation.
                  </p>
                </>
              )}
            </div>
            {errorMessage && (
              <div tw="mt-6 px-2 py-2.5 text-[14px] tracking-tight leading-[140%] text-dark border-2 border-[#b85450] bg-[#f8cecc]">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}
      <div
        css={waitingTransaction ? { filter: 'blur(8px)' } : {}}
        tw="px-4 md:px-8 fixed left-0 top-0 right-0 bottom-0 block md:flex justify-center items-end bg-[#0006] z-40 overflow-auto md:overflow-hidden"
        onClick={
          waitingTransaction
            ? () => {
                return;
              }
            : props.onClose
        }
      >
        <div
          className="popup-content"
          tw="px-4 md:px-16 pt-8 pb-6 md:pb-16 w-full max-w-[1512px] flex gap-6 bg-light/50 dark:bg-dark/50 border-[1px] border-dark/10 dark:border-light/5 backdrop-blur-xl  rounded-tl-[32px] rounded-tr-[32px] flex-wrap md:flex-nowrap"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div tw="w-full md:w-[59%]">
            <h2 tw="pb-8 font-semibold text-[23px] tracking-tight">
              Claim access to this Channel
            </h2>
            <div tw="flex flex-col gap-3.5">
              {options.map((section, index) =>
                index > 0 ? (
                  <div
                    key={section.title}
                    tw="p-3.5 bg-light/50 dark:bg-light/5 rounded-lg"
                  >
                    <h3 tw="text-dark">{section.title}</h3>
                    <div tw="pt-3.5 flex flex-wrap gap-3.5">
                      {section.options.map((opt) => (
                        <span
                          key={opt.key}
                          css={
                            selectedOptions[index] === opt.key
                              ? {
                                  opacity: '1',
                                }
                              : {
                                  opacity: '0.5',
                                }
                          }
                          tw="h-10 flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5 cursor-pointer"
                          onClick={() => {
                            const opts = [...selectedOptions];
                            opts[index] = opt.key;
                            setSelectedOptions(opts);
                          }}
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
              <div tw="p-3.5 bg-light/50 dark:bg-light/5 rounded-lg">
                <h3 tw="text-dark">Channel permissions</h3>
                <div tw="pt-3.5 flex flex-col gap-1">
                  {props.channel.channel_permissions.filter((item) => item)
                    .length > 0 ? null : (
                    <p tw="py-0 text-[14px] italic text-dark/60 dark:text-light/60">
                      No permission
                    </p>
                  )}
                  {props.channel.channel_permissions.map(
                    (item: boolean, index: number) => (
                      <div
                        key={`perm-${index}`}
                        css={item ? {} : { opacity: 0.5 }}
                        tw="flex items-center gap-1"
                      >
                        {item ? (
                          <span tw="scale-50">
                            {getIcon(
                              'check',
                              darkMode ? 'rgb(240 240 242)' : 'rgb(20 20 23)'
                            )}
                          </span>
                        ) : (
                          <span tw="rotate-45 scale-50">
                            {getIcon(
                              'add',
                              darkMode ? 'rgb(240 240 242)' : 'rgb(20 20 23)'
                            )}
                          </span>
                        )}
                        <span tw="text-[17px] text-dark/75 dark:text-light/75">
                          {ChannelPermissionTitle[index]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div tw="w-full md:w-[41%] px-3.5 pt-[22px] pb-3.5 bg-light/50 dark:bg-light/5 rounded-lg">
            <div tw="flex justify-between items-center">
              <div tw="flex items-center gap-3.5">
                <div
                  css={{
                    backgroundImage: `url(${props.channel.channel_profile_image_url})`,
                  }}
                  tw="w-[60px] h-[60px] bg-no-repeat bg-center bg-cover rounded-[7px]"
                />
                <div tw="flex flex-col gap-1">
                  <div tw="font-semibold text-base tracking-tight text-dark dark:text-light">
                    {props.channel.channel_name}
                  </div>
                  <div tw="text-sm tracking-tight text-gray-500">
                    by {props.creator.name} (
                    {shortAddress(props.channel.channel_creator)})
                  </div>
                </div>
              </div>
              <div>
                <div tw="font-semibold text-base tracking-tight text-right text-dark dark:text-light">
                  {props.channel.channel_ticket_price}
                </div>
                <div tw="text-sm tracking-tight text-right text-gray-500">
                  Monthly price
                </div>
              </div>
            </div>
            <div tw="pt-8 w-full">
              <div tw="p-3.5 w-full bg-dark/5 dark:bg-light/5 rounded-lg">
                <p tw="text-sm tracking-tight text-dark dark:text-light">
                  Channel Ticket not tradable 3 Months
                </p>
                <p tw="pt-1 font-medium text-base tracking-tight text-dark dark:text-light">
                  [{props.channel.channel_ticket_price} x{' '}
                  {getSubsPeriodTitleFromKey(selectedOptions[1])}]
                </p>
                <div tw="pt-3.5 flex items-center gap-[26px]">
                  <div tw="flex items-center gap-1">
                    <span tw="text-base tracking-tight text-gray-500">
                      Selected Network
                    </span>
                    <div tw="flex items-center gap-1 cursor-pointer">
                      <span tw="font-medium text-base tracking-tight text-dark dark:text-light">
                        Ethereum
                      </span>
                      <div tw="w-[22px] h-[22px] flex justify-center items-center bg-dark dark:bg-light rounded-full">
                        <div tw="scale-[0.65] translate-y-[-1px] dark:invert">
                          {getIcon('dropdown', '#fff')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div tw="flex items-center gap-1">
                    <div tw="dark:invert">{getIcon('gas-tracker', '#000')}</div>
                    <span tw="text-base tracking-tight text-dark dark:text-light">
                      17
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p tw="pt-8 text-base leading-[150%] tracking-tight text-center text-gray-500">
              By pressing on “Proceed Payment” you accept the amount of{' '}
              <strong tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light">
                {parseInt(selectedOptions[1]) *
                  props.channel.channel_ticket_price}
              </strong>{' '}
              for a time period of{' '}
              <strong tw="font-semibold text-base leading-[150%] tracking-tight text-dark dark:text-light">
                [{getSubsPeriodTitleFromKey(selectedOptions[1])}]
              </strong>
              . The Network Fee depends on the selected Network.
            </p>
            <div tw="pt-6 w-full">
              <button
                tw="h-10 w-full px-3 flex justify-center items-center gap-[7px] font-semibold text-sm tracking-tight text-light  bg-dark dark:bg-light dark:text-dark rounded-lg"
                onClick={() => handleJoinChannel()}
              >
                Purchase Channel Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default ClaimChannelPopup;
