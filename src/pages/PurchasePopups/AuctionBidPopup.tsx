import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auction, Collection } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton, TextLine } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { AssetType, AuctionParam, CollectionData, NftData } from '../../type.d';
import { getMimeType, shortAddress } from '../../utils';
import { time2ms, time2s } from '../../utils/datetime';
import { alertError, alertSuccess } from '../../utils/toast';
import { getTokenInfoByAddress } from '../../utils/tokens';

var locked = false;
const erc20ABI = require('../../utils/web3/abis/erc20.json');
// const marketABI = require('../../utils/web3/abis/market.json');

enum BidStep {
  REVIEW,
  BIDDING,
  APPROVE,
  COMPLETE,
}

const BidPopupTitle: { [key: number]: string } = {
  [BidStep.REVIEW]: 'Review Bid',
  [BidStep.BIDDING]: 'Bid',
  [BidStep.APPROVE]: 'Approve Token',
  [BidStep.COMPLETE]: 'Your bid is completed',
};

const AuctionBidPopup = (props: {
  item?: Partial<NftData>;
  onClose: () => void;
}) => {
  let { account, library } = useWeb3React();
  const { darkMode, setNftToBid } = useContext(UserContext);

  const [step, setStep] = useState<BidStep>(BidStep.REVIEW);
  const [understood, setUnderstood] = useState<boolean>(false);
  const [auction, setAuction] = useState<AuctionParam | null>(null);
  const [bidPrice, setBidPrice] = useState(0);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    // console.log(props.item);
    // setStep(BidStep.BIDDING);
    setMimeType(getMimeType(props.item?.image));

    if (props.item && props.item.auction) {
      setAuction(props.item.auction);
      setBidPrice(
        Math.max(
          props.item.auction?.startPrice || 0,
          props.item.auction?.price || 0
        )
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
    if (!auction || !collection) return;
    if (auction.quoteToken === '0x0000000000000000000000000000000000000000') {
      // need to show 'auction info is wrong'
      // should not come here.
    }
    const contract = new ethers.Contract(
      auction.quoteToken || '',
      erc20ABI,
      library.getSigner()
    );
    let allowance = await contract.allowance(
      account,
      process.env.REACT_APP_NFT_MARKET
    );
    if (
      BigNumber.from(allowance).gte(ethers.utils.parseEther(`${bidPrice ?? 0}`))
    ) {
      handleConfirmBid();
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
          setStep(BidStep.APPROVE);
        }
      })
      .catch((e: any) => {
        console.error(e);
        alertError(`${e.code}: ${e.message}`);
        setNftToBid(undefined);
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
            console.log('successfully done ....');
            handleConfirmBid();
            // setStep(BidStep.COMPLETE);
            setLoading(false);
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

  const handleConfirmBid = async () => {
    if (!collection || !auction || !auction._id) return;
    if (bidPrice && bidPrice > 0) {
      // increaseLoading(true);
      setLoading(true);
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
        assetId: props.item?.external_contract_address
          ? props.item.external_tokenId ?? ''
          : BigNumber.from(`0x${props.item?._id}`).toString(),
        assetType: props.item?.isErc721 ? AssetType.ERC721 : AssetType.ERC1155,
        baseToken: props.item?.external_contract_address
          ? props.item?.external_contract_address
          : process.env.REACT_APP_NFT_ADDRESS,
        buyer: account,
        fraction: 1,
        option: {
          badgesOrchannelOwner: process.env.REACT_APP_FEE_RECEIVER,
          collectionFee: Math.round(100 * (collection?.collection_fee ?? 0)), // please fill collection fee
          collectionOwner: collection.collection_owner, // please fill collection Owner
          endTime: time2s(auction?.endTime ?? 0), // please fill endTime
          nftCreator: props.item?.creator ?? '',
          nftFee: Math.round(100 * (props.item?.fee ?? 0)),
          startTime: time2s(auction?.startTime ?? 0), // please fill startTime
        },
        orderType: 1,
        price: ethers.utils.parseEther((bidPrice ?? 0).toString()),
        quoteToken:
          auction.quoteToken ?? process.env.REACT_APP_SLICED_ADDRESS ?? '',
        seller: auction.seller,
      };
      const signature = await library
        .getSigner()
        ._signTypedData(domain, types, value);
      console.log(signature);
      Auction.update(auction._id, {
        buyer: account || '',
        price: bidPrice,
        signature: signature,
        status: 0,
      })
        .then((res) => {
          if (res) {
            alertSuccess('Your bid has been submitted successfully.');
          } else {
            alertError('bidding failed!');
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => {
          console.log('final... PUT Auction.update');
          setNftToBid(undefined);
          setLoading(false);
        });
    }
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
          {BidPopupTitle[step]}
        </h3>
        <div tw="mx-auto pb-8 relative w-full max-w-[255px] overflow-hidden">
          <div
            css={{
              backgroundImage: mimeType.startsWith('video')
                ? 'none'
                : `url(${props.item?.image})`,
            }}
            tw="relative w-full pt-[100%] bg-[#0001] bg-no-repeat bg-center bg-cover rounded-lg overflow-hidden"
          >
            {mimeType.startsWith('video') && (
              <video
                autoPlay
                loop
                muted
                playsInline
                tw="absolute left-0 top-0 w-full h-full object-cover z-10"
              >
                <source src={props.item?.image} type={mimeType} />
              </video>
            )}
          </div>
        </div>
        <div tw="mx-auto p-6 w-full max-w-[455px] flex flex-col gap-6 shadow-[0px 4px 14px rgba(0, 0, 0, 0.1)] rounded-lg">
          {step === BidStep.REVIEW ? (
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
              <TextLine
                label="Start price"
                text={props.item?.auction?.startPrice}
              />
              <TextLine
                label="Estimated Gas fees"
                text={props.item.gasFees ?? 0}
              />
              <TextLine
                label="End time"
                text={
                  props.item.auction?.endTime
                    ? new Date(
                        time2ms(props.item.auction.endTime)
                      ).toLocaleString()
                    : '[date]'
                }
              />
              <TextLine
                label="Contract address"
                text={shortAddress(process.env.REACT_APP_NFT_ADDRESS ?? '')}
                title={process.env.REACT_APP_NFT_ADDRESS}
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
          {step === BidStep.BIDDING ? (
            <div tw="px-4">
              <div>
                <button
                  tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                  onClick={() => setStep(BidStep.REVIEW)}
                >
                  <div tw="rotate-90 scale-90">
                    {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                  </div>
                  <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                    Back
                  </span>
                </button>
              </div>
              {/* <h3 tw="pt-8 font-semibold text-[23px] tracking-tight leading-[150%] text-left text-dark dark:text-light/90">
                Place bid
              </h3> */}
              <div tw="pt-8 flex justify-between items-center">
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Bid amount
                </span>
                {/* <span tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                  Balance: 0.0000 ETH
                </span> */}
              </div>
              <div tw="pt-2.5 grid grid-cols-[auto 1fr] gap-2">
                <div tw="px-2.5 h-[46px] flex items-center gap-1.5 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px] cursor-pointer">
                  {getIcon(
                    getTokenInfoByAddress(auction?.quoteToken ?? '')?.icon ??
                      '',
                    darkMode ? '#fff' : '#000'
                  )}
                  <span tw="text-base tracking-tight capitalize text-dark dark:text-light/90">
                    {getTokenInfoByAddress(
                      auction?.quoteToken ?? ''
                    )?.name.toLowerCase()}
                  </span>
                </div>
                <input
                  min={Math.max(
                    props.item.auction?.startPrice || 0,
                    props.item.auction?.price || 0
                  )}
                  placeholder="[Amount]"
                  step={0.1}
                  tw="px-2.5 h-[46px] text-base tracking-tight leading-[150%] text-right text-dark dark:text-light/90 border border-[rgba(0, 0, 0, 0.15)] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff2] rounded-[7px]"
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(parseFloat(e.target.value))}
                />
              </div>
              <div tw="pt-8 flex justify-center">
                <StyledButton
                  wide
                  onClick={() => {
                    if (props && props.item) {
                      if (
                        bidPrice &&
                        bidPrice > 0 &&
                        bidPrice >
                          Math.max(
                            props.item.auction?.startPrice || 0,
                            props.item.auction?.price || 0
                          )
                      ) {
                        setStep(BidStep.APPROVE);
                        handleApprove();
                      } else {
                        alertError('Price amount is not valid.');
                      }
                    }
                  }}
                >
                  Next
                </StyledButton>
              </div>
            </div>
          ) : null}
          {step === BidStep.APPROVE ? (
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
              <TextLine
                label="Price"
                text={
                  <div tw="flex">
                    {getIcon(
                      getTokenInfoByAddress(auction?.quoteToken ?? '')?.icon ??
                        '',
                      darkMode ? '#fff' : '#000'
                    )}{' '}
                    <div tw="font-bold text-base tracking-tight leading-[150%] text-right text-dark dark:text-light/90">
                      {bidPrice}
                    </div>
                  </div>
                }
              />
            </>
          ) : null}
          {step === BidStep.COMPLETE ? (
            <>
              <TextLine label="NFT Name" text={props.item.name} />
              <TextLine
                label="Price"
                text={
                  <div tw="flex">
                    {getIcon(
                      getTokenInfoByAddress(auction?.quoteToken ?? '')?.icon ??
                        '',
                      darkMode ? '#fff' : '#000'
                    )}{' '}
                    <div tw="font-bold text-base tracking-tight leading-[150%] text-right text-dark dark:text-light/90">
                      {bidPrice}
                    </div>
                  </div>
                }
              />
            </>
          ) : null}
        </div>
        {step === BidStep.REVIEW ? (
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
                        setStep(BidStep.BIDDING);
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

        {step === BidStep.APPROVE ? (
          <div
            tw="mx-auto pt-8 w-full font-semibold text-base tracking-tight leading-[150%] text-center text-[rgba(0, 0, 0, 0.9)] dark:text-[rgba(255, 255, 255, 0.9)] cursor-pointer"
            onClick={() => setStep(BidStep.COMPLETE)}
          >
            Go to your wallet, where you will be asked to approve this purchase.
          </div>
        ) : null}
        {step === BidStep.COMPLETE ? (
          <div tw="pt-8 flex justify-center">
            <Link
              to={`/item/${props.item._id}`}
              tw="px-6 h-10 flex justify-center items-center text-light/90 bg-[#3169FA] rounded-[100px]"
              onClick={() => {
                setNftToBid(undefined);
              }}
            >
              View item
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
};

export default AuctionBidPopup;
