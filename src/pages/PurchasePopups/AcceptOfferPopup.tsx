import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Collection, Order } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { TextLine } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  CollectionData,
  NftData,
  OrderParam,
  TransactionStatus,
} from '../../type.d';
import { getMimeType, shortAddress } from '../../utils';
import { alertError, alertSuccess } from '../../utils/toast';

var locked = false;
const erc20ABI = require('../../utils/web3/abis/erc20.json');
const marketABI = require('../../utils/web3/abis/market.json');

enum PurchaseStep {
  REVIEW,
  APPROVE,
  COMPLETE,
}

const PurchasePopupTitle: { [key: number]: string } = {
  [PurchaseStep.REVIEW]: 'Review offer',
  [PurchaseStep.APPROVE]: 'Approve offer',
  [PurchaseStep.COMPLETE]: 'Accepting the offer',
};

const AcceptOfferPopup = (props: {
  item?: Partial<NftData>;
  offer: OrderParam | null;
  onClose: () => void;
}) => {
  let { library } = useWeb3React();

  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.REVIEW);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setStep(PurchaseStep.REVIEW);
    setMimeType(getMimeType(props.item?.image));
    if (props.item?.collection_id) {
      Collection.getById(props.item.collection_id)
        .then((res) => {
          setCollection(res);
        })
        .catch((e) => console.error(e));
    }
  }, [props.item]);

  const accepting = async () => {
    setLoading(true);
    const contract = new ethers.Contract(
      process.env.REACT_APP_NFT_MARKET || '',
      marketABI,
      library.getSigner()
    );
    const order = {
      assetAmount: 1,
      assetId: props.offer?.assetId,
      assetType: props.offer?.assetType,
      baseToken: props.offer?.baseToken,
      buyer: props.offer?.buyer,
      fraction: props.offer?.fraction,
      option: {
        badgesOrchannelOwner: props.offer?.badgesOrchannelOwner,
        collectionFee: Math.floor(100 * (collection?.collection_fee ?? 0)),
        collectionOwner: collection?.collection_owner,
        endTime: props.offer?.endTime,
        nftCreator: props.item?.creator,
        nftFee: Math.round(100 * (props.item?.fee ?? 0)),
        startTime: props.offer?.startTime,
      },
      orderType: props.offer?.orderType,
      price: ethers.utils.parseEther((props.offer?.price || 0).toString()),
      quoteToken: props.offer?.quoteToken,
      seller: props.offer?.seller,
    };
    console.log('order: ', order);
    let signature = props.offer?.signature || '';
    let sig = ethers.utils.splitSignature(signature);
    console.log(signature);
    console.log(sig.v);
    console.log(sig.r);
    console.log(sig.s);

    let timer: number | NodeJS.Timer | null;
    contract
      .fillOrder(order, sig.v, sig.r, sig.s, { value: 0 })
      .then(async (res: any) => {
        if (res.hash) {
          // call api put method : order {transactionHash: res.hash, transactionStatus: 0}
          if (props.offer?._id) {
            Order.update(props.offer._id, {
              transactionHash: res.hash,
              transactionStatus: TransactionStatus.PENDING,
            })
              .then((updateRes) => {
                if (updateRes) {
                  timer = setInterval(() => {
                    if (props.offer?._id) {
                      Order.getById(props.offer._id).then(
                        (getRes: OrderParam) => {
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
                                'You accepted the offer successfully.'
                              );
                              setLoading(false);
                            } else {
                              setLoading(false);
                              throw new Error('Transaction failed!');
                            }
                            props.onClose();
                            window.location.reload();
                            if (timer) clearInterval(timer);
                            timer = null;
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

  return props.item ? (
    <div tw="pt-[90px] pb-4 fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
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
        <div tw="mx-auto pb-8 relative w-full max-w-[255px] overflow-hidden">
          <div
            css={{
              backgroundImage: mimeType.startsWith('video')
                ? 'none'
                : `url(${props.item?.image})`,
            }}
            tw="relative w-full pt-[100%] bg-[#0001] bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
          >
            {mimeType.startsWith('video') && (
              <video
                autoPlay
                loop
                muted
                playsInline
                tw="absolute left-0 top-0 w-full h-full object-contain z-10"
              >
                <source src={props.item?.image} type={mimeType} />
              </video>
            )}
          </div>
        </div>
        <div tw="mx-auto p-6 w-full max-w-[455px] flex flex-col gap-6 shadow-[0px 4px 14px rgba(0, 0, 0, 0.1)] rounded-lg">
          {step === PurchaseStep.REVIEW ? (
            <>
              <TextLine label="NFT Name" text={props.item.name} />
              <TextLine
                label="Creator"
                text={
                  props.item.creator
                    ? shortAddress(props.item.creator)
                    : '[Creator name]'
                }
                title={props.item.creator}
              />
              <TextLine label="Offering price" text={props.offer?.price} />
              <TextLine
                label="Estimated Gas fees"
                text={props.item.gasFees ?? 0}
              />
              <TextLine label="Social links" text={<div>links...</div>} />
              <TextLine
                label="Contract address"
                text={shortAddress(props.offer?.baseToken ?? '')}
                title={props.offer?.baseToken}
              />
              <TextLine
                label="Created date"
                text={
                  props.item.createdAt
                    ? new Date(props.item.createdAt).toLocaleString()
                    : '[date]'
                }
              />
            </>
          ) : null}
          {step === PurchaseStep.APPROVE ? (
            <>
              <TextLine label="NFT Name" text={props.item.name} />
              <TextLine
                label="Creator"
                text={
                  props.item.creator
                    ? shortAddress(props.item.creator)
                    : '[Creator name]'
                }
                title={props.item.creator}
              />
              <TextLine label="Price" text={props.offer?.price} />
              <div tw="w-full h-[1px] bg-[rgba(0, 0, 0, 0.15)]" />
              <TextLine
                label="est. Total price (incl. Gas fees)"
                text={(props.offer?.price ?? 0) + (props.item.gasFees ?? 0)}
              />
            </>
          ) : null}
          {step === PurchaseStep.COMPLETE ? (
            <>
              <TextLine label="Subtotal" text={props.offer?.price} />
              <TextLine label="Gas fees" text={props.item.gasFees ?? 0} />
              <div tw="w-full h-[1px] bg-[rgba(0, 0, 0, 0.15)]" />
              <TextLine
                label="Total price"
                text={(props.offer?.price ?? 0) + (props.item.gasFees ?? 0)}
              />
            </>
          ) : null}
        </div>
        {step === PurchaseStep.REVIEW ? (
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
                  I understand that Bitsliced has not reviewed this Item
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
                        setStep(PurchaseStep.APPROVE);
                        accepting();
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
        {step === PurchaseStep.APPROVE ? (
          <div
            tw="mx-auto pt-8 w-full font-semibold text-base tracking-tight leading-[150%] text-center text-[rgba(0, 0, 0, 0.9)] cursor-pointer"
            onClick={() => setStep(PurchaseStep.COMPLETE)}
          >
            Go to your wallet, where you will be asked to approve this purchase.
          </div>
        ) : null}
        {step === PurchaseStep.COMPLETE ? (
          <div tw="pt-8 flex justify-center">
            <Link
              to={`/item/${props.item._id}`}
              tw="px-6 h-10 flex justify-center items-center text-light/90 bg-[#3169FA] rounded-[100px]"
            >
              View sale
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default AcceptOfferPopup;
