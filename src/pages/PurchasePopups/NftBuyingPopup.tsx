import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Collection, Order } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton, TextLine } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  CollectionData,
  NftData,
  OrderParam,
  OrderType,
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
  [PurchaseStep.REVIEW]: 'Review purchase',
  [PurchaseStep.APPROVE]: 'Approve purchase',
  [PurchaseStep.COMPLETE]: 'Your purchase is complete',
};

const NftBuyingPopup = (props: {
  item?: Partial<NftData>;
  onClose: () => void;
}) => {
  let { account, library } = useWeb3React();
  const { setNftToBuy } = useContext(UserContext);

  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.REVIEW);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [sellOrder, setSellOrder] = useState<OrderParam | null>(null);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // console.log(props.item);
    setStep(PurchaseStep.REVIEW);
    setMimeType(getMimeType(props.item?.image));

    if (props.item && props.item.orders && props.item.orders.length > 0) {
      setSellOrder(
        props.item.orders.find((item) => item.orderType === OrderType.SELL) ||
          null
      );
    }
    if (props.item?.collection_id) {
      Collection.getById(props.item.collection_id)
        .then((res) => {
          setCollection(res);
        })
        .catch((e) => console.error(e));
    }
  }, [props.item]);

  const handleApprove = async () => {
    if (!sellOrder || !collection) return;

    setLoading(true);
    if (
      sellOrder?.quoteToken === '0x0000000000000000000000000000000000000000'
    ) {
      await buying(sellOrder.price);
      return;
    }
    const contract = new ethers.Contract(
      sellOrder?.quoteToken || '',
      erc20ABI,
      library.getSigner()
    );
    let allowance = await contract.allowance(
      account,
      process.env.REACT_APP_NFT_MARKET
    );
    if (
      BigNumber.from(allowance).gte(
        ethers.utils.parseEther((sellOrder?.price || 0).toString())
      )
    ) {
      await buying(0);
      setStep(PurchaseStep.COMPLETE);
      return;
    }
    contract
      .approve(
        process.env.REACT_APP_NFT_MARKET,
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      )
      .then(async (res: any) => {
        if (res.hash) {
          console.log('txHash--------->', res.hash);
          localStorage.setItem('txHash', res.hash);
          setStep(PurchaseStep.APPROVE);
        }
      })
      .catch((e: any) => {
        console.error('contract.approve', e);
        alertError(`${e.code}: ${e.message}`);
        setNftToBuy(undefined);
      })
      .finally(() => console.log('final..'));
  };

  useEffect(() => {
    const timer1 = setInterval(async () => {
      console.log('.');
      const txHash = localStorage.getItem('txHash') || '';
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
            localStorage.removeItem('txHash');
            locked = false;
            await buying(0);
            console.log('successfully done ....');
            setStep(PurchaseStep.COMPLETE);
          }
          locked = false;
        } catch (e) {
          console.error('ethers RPC', e);
          locked = false;
        }
      }
    }, 2000);
    return () => clearInterval(timer1);
  });

  const buying = async (ethValue: number) => {
    const contract = new ethers.Contract(
      process.env.REACT_APP_NFT_MARKET || '',
      marketABI,
      library.getSigner()
    );
    const order = {
      assetAmount: 1,
      assetId: sellOrder?.assetId,
      assetType: sellOrder?.assetType,
      baseToken: sellOrder?.baseToken,
      buyer: sellOrder?.buyer,
      fraction: sellOrder?.fraction,
      option: {
        badgesOrchannelOwner: sellOrder?.badgesOrchannelOwner,
        collectionFee: Math.floor(100 * (collection?.collection_fee ?? 0)),
        collectionOwner: collection?.collection_owner,
        endTime: sellOrder?.endTime,
        nftCreator: props.item?.creator,
        nftFee: Math.floor(100 * (props.item?.fee ?? 0)),
        startTime: sellOrder?.startTime,
      },
      orderType: sellOrder?.orderType,
      price: ethers.utils
        .parseEther((sellOrder?.price || 0).toString())
        .toString(),
      quoteToken: sellOrder?.quoteToken,
      seller: sellOrder?.seller,
    };
    console.log('---------------');
    console.log(order);
    console.log('---------------');
    let signature = sellOrder?.signature || '';
    let sig = ethers.utils.splitSignature(signature);
    console.log(signature);
    console.log(sig.v);
    console.log(sig.r);
    console.log(sig.s);

    let timer: number | NodeJS.Timer | null;
    contract
      .fillOrder(order, sig.v, sig.r, sig.s, {
        value: ethers.utils.parseEther((ethValue || 0).toString()),
      })
      .then(async (res: any) => {
        if (res.hash) {
          // call api put method : order {transactionHash: res.hash, transactionStatus: 0}
          if (sellOrder?._id) {
            Order.update(sellOrder._id, {
              buyer: account || '',
              transactionHash: res.hash,
              transactionStatus: TransactionStatus.PENDING,
            })
              .then((updateRes) => {
                if (updateRes) {
                  timer = setInterval(() => {
                    if (sellOrder._id) {
                      Order.getById(sellOrder._id).then(
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
                                'You purchased the NFT successfully.'
                              );
                            } else {
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
        console.error('contract.fillOrder', e);
        setError(e.code ?? null);
        alertError(`${e.method}: ${e.reason} (${e.code})`);
      })
      .finally(() => {
        console.log('final...');
        setLoading(false);
      });
  };

  return props.item ? (
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
        tw="relative mx-auto px-4 py-8 w-full max-h-full max-w-[855px] text-center bg-white dark:bg-[#151419] rounded-[32px] overflow-auto z-20"
      >
        {loading && (
          <div tw="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] z-50">
            <div className="spinning">
              <div tw="scale-[500%]">{getIcon('loading', '#3169FA')}</div>
            </div>
          </div>
        )}
        <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
          {step === PurchaseStep.COMPLETE && error
            ? 'Your purchase failed'
            : PurchasePopupTitle[step]}
        </h3>
        {step === PurchaseStep.COMPLETE && error && (
          <p tw="pt-4 text-[#d80]">Error code: {error}</p>
        )}
        <div tw="mx-auto py-8 relative w-full max-w-[255px] overflow-hidden">
          <div
            css={{
              backgroundImage: mimeType.startsWith('video')
                ? 'none'
                : `url(${props.item?.image})`,
            }}
            tw="relative w-full pt-[100%] bg-[#0001] bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden select-none"
          >
            {mimeType.startsWith('video') ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                tw="absolute left-0 top-0 w-full h-full object-contain z-10"
              >
                <source src={props.item?.image} type={mimeType} />
              </video>
            ) : (
              <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10 rounded-lg">
                <source
                  srcSet={props.item?.image}
                  tw="w-full h-full object-contain object-center"
                  type="image/avif"
                />
                <source
                  srcSet={props.item?.image}
                  tw="w-full h-full object-contain object-center"
                  type="image/webp"
                />
                <img
                  alt=""
                  src={props.item?.image}
                  tw="w-full h-full object-contain object-center"
                />
              </picture>
            )}
          </div>
        </div>
        <div tw="mx-auto p-6 w-full max-w-[455px] flex flex-col gap-6 shadow-[0px 4px 14px rgba(0, 0, 0, 0.1)] dark:shadow-[0px 1px 6px rgba(255, 255, 255, 0.1)] rounded-lg">
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
              <TextLine label="Price" text={sellOrder?.price} />
              <TextLine
                label="Estimated Gas fees"
                text={props.item.gasFees ?? 0}
              />
              <TextLine label="Social links" text={<div>links...</div>} />
              <TextLine
                label="Contract address"
                text={shortAddress(sellOrder?.baseToken ?? '')}
                title={sellOrder?.baseToken ?? ''}
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
              <TextLine label="Price" text={sellOrder?.price} />
              <div tw="w-full h-[1px] bg-[rgba(0, 0, 0, 0.15)] dark:bg-[rgba(255, 255, 255, 0.15)]" />
              <TextLine
                label="est. Total price (incl. Gas fees)"
                text={(sellOrder?.price ?? 0) + (props.item.gasFees ?? 0)}
              />
            </>
          ) : null}
          {step === PurchaseStep.COMPLETE ? (
            <>
              <TextLine label="Subtotal" text={sellOrder?.price} />
              <TextLine label="Gas fees" text={props.item.gasFees ?? 0} />
              <div tw="w-full h-[1px] bg-[rgba(0, 0, 0, 0.15)] dark:bg-[rgba(255, 255, 255, 0.15)]" />
              <TextLine
                label="Total price"
                text={(sellOrder?.price ?? 0) + (props.item.gasFees ?? 0)}
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
              <StyledButton
                disabled={!understood}
                onClick={
                  understood
                    ? () => {
                        handleApprove();
                      }
                    : () => {
                        return;
                      }
                }
              >
                Next
              </StyledButton>
            </div>
          </>
        ) : null}
        {step === PurchaseStep.APPROVE ? (
          <div tw="mx-auto pt-8 w-full font-semibold text-base tracking-tight leading-[150%] text-center text-[rgba(0, 0, 0, 0.9)] dark:text-[rgba(255, 255, 255, 0.9)] cursor-pointer">
            Go to your wallet, where you will be asked to approve this purchase.
          </div>
        ) : null}
        {step === PurchaseStep.COMPLETE ? (
          <div tw="pt-8 flex justify-center">
            <Link
              to={`/item/${props.item._id}`}
              tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light duration-300 font-medium text-light dark:text-dark"
              onClick={() => {
                setNftToBuy(undefined);
              }}
            >
              View purchase
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default NftBuyingPopup;
