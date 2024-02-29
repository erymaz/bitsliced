import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { addDays } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';

import { Generic, Nft, Order, Posting } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import ItemCard from '../../components/ItemCard';
import { StyledButton } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  AssetType,
  ChannelData,
  CollectionData,
  defaultPostData,
  NftData,
  OrderParam,
  OrderStatus,
  OrderType,
  PostData,
  TransactionStatus,
} from '../../type.d';
import { alertError, alertSuccess, alertWarning } from '../../utils/toast';
import NftListingPopup from './NftListingPopup';

const maxLength = 300;

export enum ChannelNftPopupStep {
  LIST,
  LISTING,
  COMPLETE,
}

const PostingWidget = (props: {
  channel?: ChannelData;
  handleRefresh?: () => void;
}) => {
  let { account, library } = useWeb3React();
  const { darkMode, decreaseLoading, increaseLoading, user } =
    useContext(UserContext);

  const [posting, setPosting] = useState<PostData>({
    ...defaultPostData,
    channel_id: props.channel?._id ?? '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<NftData[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftData | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionData | null>(null);
  const [showNftList, setShowNftList] = useState<boolean>(false);
  const [step, setStep] = useState<ChannelNftPopupStep>(
    ChannelNftPopupStep.LIST
  );
  const [needListing, setNeedListing] = useState<boolean>(false);
  const [orderParam, setOrderParam] = useState<Partial<OrderParam>>({
    quoteToken: process.env.REACT_APP_SLICED_ADDRESS,
  });
  const [period, setPeriod] = useState<{
    startDate?: Date;
    endDate?: Date;
    key?: string;
  }>({
    endDate: addDays(new Date(), 3), // default: 3 days
    key: 'selection',
    startDate: new Date(),
  });

  const setPostingField = (field: string, value: string | null) => {
    setPosting({ ...posting, [field]: value });
  };

  useEffect(() => {
    if (props.channel?._id) {
      increaseLoading(true);
      // Nft.getByCollectionIds([props.channelId])
      Nft.getAll() // TODO: to be confirmed
        .then((res: NftData[]) => {
          setItems(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [props.channel]);

  useEffect(() => {
    if (user?._id) {
      setPostingField('user_id', user._id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedNft) {
      setPostingField('channelpost_nft_id', selectedNft._id ?? '');
    }
  }, [selectedNft]);

  useEffect(() => {
    if (file) {
      increaseLoading(true);
      const data = new FormData();
      data.append('assets', file, file.name);
      Generic.upload(data)
        .then((res) => {
          if (res && res.status === 200 && res.data?.files?.length > 0) {
            setPostingField('channelpost_image_url', res.data.files[0]);
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode}: ${e.response.data.message}`
            );
          } else {
            alertError('File uploading failed!');
          }
        })
        .finally(() => decreaseLoading(true));
    }
  }, [file]);

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
          assetId: BigNumber.from(`0x${selectedNft?._id}`).toString(),
          assetType: AssetType.ERC1155,
          baseToken: process.env.REACT_APP_NFT_ADDRESS,
          buyer: '0x0000000000000000000000000000000000000000',
          fraction: 1,
          option: {
            badgesOrchannelOwner: props.channel?.channel_owner, // process.env.REACT_APP_FEE_RECEIVER,
            collectionFee: Math.round(
              100 * (selectedCollection?.collection_fee ?? 0)
            ),
            collectionOwner: selectedCollection?.collection_owner,
            endTime: Math.floor((period.endDate?.getTime() || 0) / 1000),
            nftCreator: selectedNft?.creator,
            nftFee: Math.floor(100 * (selectedNft?.fee ?? 0)),
            startTime: Math.floor((period.startDate?.getTime() || 0) / 1000),
          },
          orderType: OrderType.SELL,
          // sell
          price: ethers.utils.parseEther((orderParam.price ?? 0).toString()),
          quoteToken: orderParam.quoteToken,
          seller: account,
        };
        // console.log('value: ', value);
        setShowNftList(true);
        setStep(ChannelNftPopupStep.COMPLETE);
        try {
          const signature = await library
            .getSigner()
            ._signTypedData(domain, types, value);

          // fixed price
          Order.create({
            ...orderParam,
            assetAmount: 1,
            assetId: BigNumber.from(`0x${selectedNft?._id}`).toString(),
            assetType: AssetType.ERC1155,
            badgesOrchannelOwner: props.channel?.channel_owner, // process.env.REACT_APP_FEE_RECEIVER,
            baseToken: process.env.REACT_APP_NFT_ADDRESS ?? '',
            buyer: '0x0000000000000000000000000000000000000000',
            channelId: posting.channel_id,
            endTime: Math.floor((period.endDate?.getTime() || 0) / 1000),
            fraction: 1,
            orderType: OrderType.SELL,
            price: orderParam.price,
            quoteToken:
              orderParam.quoteToken ??
              process.env.REACT_APP_SLICED_ADDRESS ??
              '',
            seller: user.walletAddress,
            signature: signature,
            startTime: Math.floor((period.startDate?.getTime() || 0) / 1000),
            status: OrderStatus.PENDING,
            transactionHash: '',
            transactionStatus: TransactionStatus.PENDING,
          })
            .then((res) => {
              if (res && selectedNft) {
                alertSuccess('Your NFT has been listed successfully.');
                setSelectedNft(selectedNft);
                // setStep(ChannelNftPopupStep.COMPLETE);
                setShowNftList(false);
                // props.handleClose();
                Posting.create(posting)
                  .then((res) => {
                    if (res) {
                      alertSuccess('Your post is live now!');
                      setSelectedNft(null);
                      if (props.handleRefresh) {
                        props.handleRefresh();
                      }
                      setPosting({
                        ...defaultPostData,
                        channel_id: props.channel?._id ?? '',
                      });
                    }
                  })
                  .catch((e) => {
                    console.error(e);
                    alertError(e.toString());
                  })
                  .finally(() => decreaseLoading(true));
              } else {
                alertError('Listing failed!');
                decreaseLoading(true);
              }
            })
            .catch((e) => {
              console.error(e);
              alertError(e.toString());
              decreaseLoading(true);
            })
            .finally(() => {});
        } catch (e: any) {
          console.error('[ERROR]', e);
          alertWarning(e.message ?? 'Listing failed.');
          setShowNftList(false);
          setSelectedNft(null);
        }
      } else {
        alertError('The price cannot be zero.');
      }
    }
  };

  const handleSubmit = () => {
    if (needListing) {
      handleCompleteOrder();
    } else {
      increaseLoading(true);
      Posting.create(posting)
        .then((res) => {
          if (res) {
            alertSuccess('Your post is live now!');
            if (props.handleRefresh) {
              props.handleRefresh();
            }
            setPosting({
              ...defaultPostData,
              channel_id: props.channel?._id ?? '',
            });
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }

    // increaseLoading(true);
    // Posting.create(posting)
    //   .then((res) => {
    //     if (res) {
    //       alertSuccess('Your post is live now!');
    //       if (needListing) {
    //         handleCompleteOrder();
    //       }
    //       if (props.handleRefresh) {
    //         props.handleRefresh();
    //       }
    //     }
    //   })
    //   .catch((e) => {
    //     console.error(e);
    //     alertError(e.toString());
    //   })
    //   .finally(() => decreaseLoading(true));
  };

  return (
    <div tw="bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 rounded-md overflow-hidden">
      <div tw="p-3">
        <div tw="relative pb-3 flex gap-3.5">
          <div
            css={{
              backgroundImage: `url(${
                user?.profile_image_url ?? '/svgs/default-user.svg'
              })`,
            }}
            tw="w-[60px] min-w-[60px] h-[60px] bg-no-repeat bg-center bg-cover border-2 border-white dark:border-[#fff2] rounded-full"
          />
          <textarea
            maxLength={maxLength}
            placeholder="What is your thought?"
            tw="pt-[17px] w-full min-h-[120px] text-base text-dark dark:text-light/90 bg-transparent outline-none"
            value={posting['channelpost_description']}
            onChange={(e) =>
              setPostingField('channelpost_description', e.target.value)
            }
          />
          <div tw="absolute right-0 -bottom-1.5 text-2xs text-dark/50 dark:text-light/50">
            {posting['channelpost_description'].length} / {maxLength}
          </div>
        </div>
        <div>
          {/** content part */}
          {posting.channelpost_image_url && (
            <div tw="pt-6">
              <button
                tw="rotate-45"
                onClick={() => setPostingField('channelpost_image_url', null)}
              >
                {getIcon('add', darkMode ? '#fff' : '#000')}
              </button>
              <img
                alt=""
                src={posting.channelpost_image_url}
                tw="max-w-[350px] rounded-lg"
              />
            </div>
          )}
          {posting.channelpost_nft_id && (
            <div tw="pt-6">
              <button
                tw="rotate-45"
                onClick={() => {
                  setSelectedNft(null);
                  setPostingField('channelpost_nft_id', null);
                }}
              >
                {getIcon('add', darkMode ? '#fff' : '#000')}
              </button>
              <div tw="shadow-lg rounded-lg overflow-hidden">
                <ItemCard data={selectedNft} landscape={true} />
                {/* <ItemCardLandscape
                  amount={orderParam.price}
                  data={selectedNft}
                  period={period}
                  token={getTokenInfoByAddress(
                    orderParam.quoteToken ?? ''
                  )?.name.toLowerCase()}
                /> */}
              </div>
            </div>
          )}
        </div>
      </div>
      <div tw="p-3 flex justify-between items-center bg-dark/5 dark:bg-light/5">
        <div tw="flex items-center gap-2.5">
          <input
            // accept="image/*"
            id="image-file"
            tw="hidden"
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor="image-file"
            tw="px-3.5 h-10 flex items-center gap-[7px] bg-white dark:bg-[#fff1] rounded-lg cursor-pointer"
          >
            {getIcon('upload', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light ">
              Upload
            </span>
          </label>
          {showNftList && (
            <NftListingPopup
              channelId={props.channel?._id}
              handleClose={() => setShowNftList(false)}
              items={items}
              orderParam={orderParam}
              selectedNft={selectedNft ?? undefined}
              setNeedListing={setNeedListing}
              setOrderParam={setOrderParam}
              setPeriod={setPeriod}
              setSelectedCollection={setSelectedCollection}
              setSelectedNft={setSelectedNft}
              setStep={setStep}
              step={step}
            />
          )}
          <button
            tw="px-3.5 h-10 flex items-center gap-[7px] bg-white dark:bg-[#fff1] rounded-lg"
            onClick={() => {
              if (items.length > 0) {
                setStep(ChannelNftPopupStep.LIST);
                setShowNftList(true);
              } else {
                alertError('You have no NFT to be added here!');
              }
            }}
          >
            {getIcon('add', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light ">
              List <span tw="hidden md:inline">NFT</span>
            </span>
          </button>
        </div>
        <StyledButton onClick={handleSubmit}>
          Submit{needListing ? ' & List Item' : ''}
        </StyledButton>
      </div>
    </div>
  );
};

export default PostingWidget;
