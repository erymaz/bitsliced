import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Channeloffer, Ticketoffer } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  ChannelData,
  ChannelofferParam,
  TicketData,
  TicketOfferData,
  TicketofferParam,
  TransactionStatus,
  User,
} from '../../type.d';
import { getMimeType, nFormatter, shortAddress } from '../../utils';
import { alertError, alertSuccess } from '../../utils/toast';

var locked = false;
const erc20ABI = require('../../utils/web3/abis/erc20.json');
const channelABI = require('../../utils/web3/abis/channelContract.json');

enum PurchaseStep {
  CONFIRM,
  ACCEPT,
}

const PurchasePopupTitle: { [key: number]: string } = {
  [PurchaseStep.CONFIRM]: 'Confirm Channel Ticket Offer',
  [PurchaseStep.ACCEPT]: 'Accept offer',
};

const AcceptTicketOfferPopup = (props: {
  channel?: Partial<ChannelData>;
  ticket?: Partial<TicketData>;
  buyer?: Partial<User>;
  offer: TicketOfferData | null;
  onClose: () => void;
}) => {
  let { account, library } = useWeb3React();
  const { darkMode } = useContext(UserContext);

  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.CONFIRM);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (props.ticket?.owner) {
      Auth.getByWallet(props.ticket.owner).then((res) => {
        setOwner(res);
      });
    }
  }, [props.ticket]);

  useEffect(() => {
    setStep(PurchaseStep.CONFIRM);
    if (props.channel) {
      setMimeType(getMimeType(props.channel.channel_profile_image_url));
    }
  }, [props.channel]);

  const accepting = async () => {
    setLoading(true);
    const contract = new ethers.Contract(
      props.channel?.channel_address || '',
      channelABI,
      library.getSigner()
    );
    const ticketoffer = {
      buyer: props.offer?.buyer,
      channel: props.channel?.channel_address || '',
      price: ethers.utils.parseEther((props.offer?.price || 0).toString()),
      tokenId: Number(props.offer?.ticketId),
    };

    console.log('ticketoffer: ', ticketoffer);
    let signature = props.offer?.signature || '';
    let sig = ethers.utils.splitSignature(signature);
    console.log(signature);
    console.log(sig.v);
    console.log(sig.r);
    console.log(sig.s);
    let timer: number | NodeJS.Timer | null;
    contract
      .sellTicket(ticketoffer, sig.v, sig.r, sig.s)
      .then(async (res: any) => {
        if (res.hash) {
          // call api put method : order {transactionHash: res.hash, transactionStatus: 0}
          if (props.offer?._id) {
            Ticketoffer.update(props.offer._id, {
              seller: account || '',
              transactionHash: res.hash,
              transactionStatus: TransactionStatus.PENDING,
            })
              .then((updateRes) => {
                if (updateRes) {
                  timer = setInterval(() => {
                    if (props.offer?._id) {
                      Ticketoffer.getById(props.offer._id).then(
                        (getRes: TicketofferParam) => {
                          if (
                            getRes &&
                            getRes.transactionStatus !==
                              TransactionStatus.PENDING
                          ) {
                            if (
                              getRes.transactionStatus ===
                              TransactionStatus.CONFIRMED
                            ) {
                              alertSuccess(
                                'You accepted the ticket offer successfully.'
                              );
                              setLoading(false);
                            } else {
                              setLoading(false);
                              throw new Error('Transaction failed!');
                            }
                            props.onClose();
                            if (timer) clearInterval(timer);
                            timer = null;
                            window.location.reload();
                          }
                        }
                      );
                    }
                  }, 5000);
                }
              })
              .catch((e) => console.error(e));
          }
        }
      })
      .catch((e: any) => {
        console.error(e);
        alertError(`${e.method}: ${e.reason}`);
        setLoading(false);
      })
      .finally(() => console.log('final...'));
  };

  return (
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
        tw="relative mx-auto px-10 py-8 w-full max-w-[820px] max-h-full text-center bg-white dark:bg-[#030017] rounded-[32px] overflow-auto z-20"
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
        <div tw="mx-auto pb-8 relative w-full flex justify-between items-center">
          <div tw="flex items-center gap-[10px]">
            <div
              css={{
                backgroundImage: mimeType.startsWith('video')
                  ? 'none'
                  : `url(${props.channel?.channel_profile_image_url})`,
              }}
              tw="relative w-[140px] min-w-[140px] h-[140px] bg-[#fff] bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
            >
              {mimeType.startsWith('video') && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  tw="absolute left-0 top-0 w-full h-full object-contain z-10"
                >
                  <source
                    src={props.channel?.channel_profile_image_url}
                    type={mimeType}
                  />
                </video>
              )}
            </div>
            <div>
              <div tw="font-semibold text-base text-dark dark:text-light/90 text-left">
                {props.channel?.channel_name}
              </div>
              {/* <div tw="font-semibold text-base text-dark dark:text-light/90 text-left">
                Ticket owner: {owner?.name} (
                {shortAddress(owner?.walletAddress)})
              </div> */}
              <div tw="pt-1 text-left">
                <span tw="text-[14px] text-gray-500 ">Listed Items:</span>{' '}
                <span tw="text-[14px] text-[#000] dark:text-[#fff]">
                  {
                    props.channel?.items?.filter(
                      (item) => item.auction || item.orders
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
          <div tw="flex items-center gap-[24px]">
            <div>
              <div tw="font-semibold text-[24px] text-dark dark:text-light/90">
                {nFormatter(props.channel?.activeUsersCount ?? 0)}
              </div>
              <div tw="text-base text-[#000b] dark:text-[#fffb]">
                Active Users
              </div>
            </div>
            <div>
              <div tw="font-semibold text-[24px] text-dark dark:text-light/90">
                {nFormatter(props.channel?.joinedUsersCount ?? 0)}
              </div>
              <div tw="text-base text-[#000b] dark:text-[#fffb]">
                User Joined
              </div>
            </div>
          </div>
        </div>
        <div tw="mx-auto py-6 w-full border-t border-[#0002] dark:border-[#fff2]">
          {step === PurchaseStep.CONFIRM ? (
            <>
              <div tw="flex items-center gap-3.5">
                <Link
                  title={props.buyer?.name}
                  to={`/profile/${props.buyer?._id}`}
                >
                  <div
                    css={{
                      backgroundImage: `url(${props.buyer?.profile_image_url})`,
                    }}
                    tw="w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-full"
                  />
                </Link>
                <div tw="text-base text-dark dark:text-light/90">
                  Offer received by{' '}
                  <Link
                    to={`/profile/${props.buyer?._id}`}
                    tw="border-b border-[#000] dark:border-[#fff]"
                  >
                    {props.buyer?.name}
                  </Link>
                </div>
              </div>
              <div tw="pt-[24px]">
                <div tw="text-dark dark:text-light/90 text-left">
                  {props.offer?.startTime &&
                    new Date(props.offer?.startTime).toLocaleDateString()}
                  -
                  {props.offer?.endTime &&
                    new Date(props.offer?.endTime).toLocaleDateString()}
                </div>
                <div tw="pt-1 text-[14px] text-gray-500  text-left">
                  Duration
                </div>
              </div>
              <div tw="pt-[24px]">
                <div tw="flex items-center text-dark dark:text-light/90 text-left">
                  <div tw="scale-75">
                    {getIcon('sliced', darkMode ? '#fff' : '#000')}
                  </div>
                  <span>{props.offer?.price}</span>
                </div>
                <div tw="pt-1 text-[14px] text-gray-500  text-left">
                  Offer Amount
                </div>
              </div>
            </>
          ) : null}
          {step === PurchaseStep.ACCEPT ? (
            <p tw="text-dark dark:text-light/90">You accepted this offer.</p>
          ) : null}
        </div>
        {step === PurchaseStep.CONFIRM ? (
          <>
            <div tw="pt-6 flex items-center gap-2">
              <StyledButton
                wide
                onClick={() => {
                  setStep(PurchaseStep.ACCEPT);
                  accepting();
                }}
              >
                Accept offer
              </StyledButton>
              <StyledButton
                tw="text-[#DD3939] bg-transparent border-0"
                onClick={() => props.onClose()}
              >
                Decline
              </StyledButton>
            </div>
          </>
        ) : null}
        {step === PurchaseStep.ACCEPT ? (
          <div tw="pt-8 flex justify-center">
            <Link
              to={`/channels/${props.channel?._id}?tab=offers`}
              tw="px-6 h-10 flex justify-center items-center text-light/90 bg-[#3169FA] rounded-[100px]"
              onClick={() => props.onClose()}
            >
              View offers
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AcceptTicketOfferPopup;
