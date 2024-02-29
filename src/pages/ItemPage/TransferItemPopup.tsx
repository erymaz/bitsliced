import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';

import { Collection, Nft } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, NftData } from '../../type.d';
import { getMimeType } from '../../utils';
import { alertError, alertWarning } from '../../utils/toast';

const bitSlicedStoreABI = require('../../utils/web3/abis/bitslicedStore.json');
var locked = false;
const enum TransferStep {
  INITIAL,
  PROCESSING,
  DONE,
  CONFIRM,
  ERROR,
}

const TransferItemPopup = (props: { item: NftData; onClose: () => void }) => {
  let { account, library } = useWeb3React();
  const { darkMode } = useContext(UserContext);

  const [step, setStep] = useState<TransferStep>(TransferStep.INITIAL);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (props.item) {
      setMimeType(getMimeType(props.item.image));

      if (props.item.collection_id) {
        Collection.getById(props.item.collection_id).then((res) => {
          setCollection(res);
        });
      }
    }
  }, [props.item]);

  const handleClickTransfer = async () => {
    setStep(TransferStep.PROCESSING);
    const tokenId = BigNumber.from(`0x${props.item?._id}`).toString();
    // console.log('-------------', tokenId);
    const contract = new ethers.Contract(
      process.env.REACT_APP_NFT_ADDRESS || '',
      bitSlicedStoreABI,
      library.getSigner()
    );
    let mintable = await contract.mintable(tokenId);
    console.log('minted: ', mintable);
    if (mintable) {
      // transfer ownership only backend database
      Nft.transfer(props.item._id || '', address)
        .then((res) => {
          if (res) {
            setStep(TransferStep.DONE);
          } else {
            alertError('NFT Transfer failed!');
            setStep(TransferStep.INITIAL);
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode}: ${e.response.data.message}`
            );
          } else {
            alertError('NFT Transfer failed!');
          }
          setStep(TransferStep.INITIAL);
        });
    } else {
      // need to make transaction for the transfer
      contract
        .safeTransferFrom(account, address, tokenId, 1, 0)
        .then(async (res: any) => {
          if (res.hash) {
            console.log('Nft transfer TxHash: ', res.hash);
            localStorage.setItem('nftTransferTxHash', res.hash);
          } else {
            alertError('NFT Transfer failed!');
            setStep(TransferStep.INITIAL);
          }
        })
        .catch((e: any) => {
          console.error(e);
          alertError(`${e.code}: ${e.message}`);
          setError(`${e.code}: ${e.message}`);
          setStep(TransferStep.ERROR);
        });
    }
    console.log(props.item);
    console.log(collection);
  };

  useEffect(() => {
    const timer1 = setInterval(async () => {
      console.log('.');
      const txHash = localStorage.getItem('nftTransferTxHash') || '';
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
            localStorage.removeItem('nftTransferTxHash');
            locked = false;
            console.log('successfully done ....');
            setStep(TransferStep.DONE);
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

  return (
    <div
      tw="pt-[100px] pb-[20px] fixed left-0 top-0 w-full h-full flex justify-center items-center backdrop-blur-sm z-30"
      onClick={() => props.onClose()}
    >
      {showConfirmPopup && (
        <div tw="p-8 absolute w-full max-w-[680px] bg-white dark:bg-[#030017] z-40 rounded-[17px]">
          <h3 tw="pb-8 font-medium text-[17px] text-black dark:text-white">
            Are you sure you want to transfer this item?
          </h3>
          <div tw="pt-8 flex justify-end items-center gap-4 border-t border-[#0002] dark:border-[#fff2]">
            <StyledButton wide onClick={() => setShowConfirmPopup(false)}>
              No
            </StyledButton>
            <StyledButton
              wide
              onClick={() => {
                handleClickTransfer();
              }}
            >
              Yes
            </StyledButton>
          </div>
        </div>
      )}
      <div
        className="no-scrollbar"
        tw="relative p-[40px] w-full max-w-[855px] max-h-[calc(100vh - 100px)] bg-white dark:bg-[#030017] rounded-[32px] shadow-xl dark:shadow-[#fff] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          tw="absolute right-[30px] top-[48px] rotate-45"
          onClick={() => props.onClose()}
        >
          {getIcon('add', darkMode ? '#fff' : '#000')}
        </button>
        <h3 tw="font-bold text-[23px] tracking-tight leading-[150%] text-center text-[rgba(0, 0, 0, 0.9)] dark:text-[rgba(255, 255, 255, 0.9)]">
          {step === TransferStep.INITIAL && <>Transfer</>}
          {step === TransferStep.PROCESSING && <>Transferring...</>}
          {step === TransferStep.DONE && <>Transfer</>}
          {step === TransferStep.CONFIRM && <>Item successfully transfered</>}
          {step === TransferStep.ERROR && <>Transferring failed</>}
        </h3>
        {TransferStep.INITIAL === step && (
          <div>
            <div tw="pt-[40px] pb-[30px] flex items-center gap-[10px]">
              <div
                css={{
                  backgroundImage: mimeType.startsWith('video')
                    ? 'none'
                    : `url(${props.item.image})`,
                }}
                tw="relative w-[140px] h-[140px] bg-white bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
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
              <div tw="flex flex-col gap-[4px]">
                <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {props.item.name}
                </div>
                <div tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                  {collection?.collection_name}
                </div>
                <div tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                  [Network]
                </div>
              </div>
            </div>
            <input
              placeholder="Recipient address"
              tw="px-[32px] h-[58px] w-full text-base tracking-tight leading-[150%] text-dark dark:text-light/90 bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] border border-[rgba(0, 0, 0, 0.15)] dark:border-[#fff1] rounded-[14px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div tw="pt-[30px]">
              <div tw="p-[10px] font-semibold text-base text-[#FF8832] bg-[rgba(255, 136, 50, 0.05)] border border-[#FF8832] rounded-[9px]">
                Transferring this item is irreversible, proceed with caution.
              </div>
            </div>
          </div>
        )}
        {step === TransferStep.PROCESSING && (
          <>
            <div tw="flex justify-center items-center gap-[14px]">
              <div tw="pt-[60px] relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
                <div tw="absolute w-full h-full border-2 border-[rgb(229, 231, 235)] border-t-[#3169FA] border-r-[#3169FA] rounded-[50%] animate-spin" />
                <div>
                  <div tw="text-[14px] text-center text-gray-500 ">Step</div>
                  <div tw="text-[23px] text-center text-dark dark:text-light/90">
                    1/1
                  </div>
                </div>
              </div>
            </div>
            <p tw="pt-[60px] px-[40px] text-[23px] text-center text-[#000e] dark:text-[#fffe]">
              Transfer has started, please accept the following{' '}
              <span tw="font-bold text-[23px]">permission</span> and{' '}
              <span tw="font-bold text-[23px]">transaction</span> requests to
              proceed.
            </p>
          </>
        )}
        {step === TransferStep.DONE && (
          <>
            <div tw="flex justify-center items-center gap-[14px]">
              <div tw="pt-[60px] relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
                <div tw="absolute w-full h-full border-2 border-[rgb(229, 231, 235)] rounded-[50%] animate-pulse" />
                <div tw="scale-[200%] animate-pulse">
                  {getIcon('check', darkMode ? '#fff' : '#000')}
                </div>
              </div>
            </div>
            <p tw="pt-[60px] px-[40px] text-[23px] text-center text-[#000e] dark:text-[#fffe]">
              Transfer has started, please accept the following{' '}
              <span tw="font-bold text-[23px]">permission</span> and{' '}
              <span tw="font-bold text-[23px]">transaction</span> requests to
              proceed.
            </p>
          </>
        )}
        {step === TransferStep.CONFIRM && (
          <div tw="flex justify-between items-center gap-[14px]">
            <div tw="pt-[40px] pb-[30px] flex items-center gap-[10px]">
              <div
                css={{
                  backgroundImage: mimeType.startsWith('video')
                    ? 'none'
                    : `url(${props.item.image})`,
                }}
                tw="relative w-[140px] h-[140px] bg-white bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
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
              <div tw="flex flex-col gap-[4px]">
                <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  {props.item.name}
                </div>
                <div tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                  {collection?.collection_name}
                </div>
                <div tw="text-[14px] tracking-tight leading-[150%] text-gray-500 ">
                  [Network]
                </div>
              </div>
            </div>
            <div tw="relative w-[44px] min-w-[44px] h-[44px] flex justify-center items-center border border-[#0001] dark:border-[#fff1] rounded-full">
              {getIcon('transfer', darkMode ? '#fff' : '#000')}
            </div>
            <div tw="p-[10px] bg-[rgba(0, 0, 0, 0.05)] dark:bg-[rgba(255, 255, 255, 0.05)] border border-[rgba(0, 0, 0, 0.1)] dark:border-[rgba(255, 255, 255, 0.1)] rounded-[8px]">
              <div tw="text-[14px] text-[#808080]">Recipient</div>
              <div tw="pt-[10px] text-[14px] text-dark dark:text-light/90">
                {address}
              </div>
            </div>
          </div>
        )}
        {step === TransferStep.ERROR && (
          <p tw="pt-4 text-[17px] text-center text-[#d40]">
            Error: {error ?? 'Unknown error'}
          </p>
        )}
        <div tw="py-[30px] flex items-center gap-[14px]">
          {step === TransferStep.INITIAL && (
            <StyledButton
              wide
              onClick={() => {
                if (address.length > 0) {
                  if (!props.item.isMinted) {
                    setShowConfirmPopup(true);
                  } else {
                    handleClickTransfer();
                  }
                } else {
                  alertWarning('Please input the recipient address.');
                }
              }}
            >
              <span>Transfer</span>
              <div tw="-rotate-90">
                {getIcon('dropdown', darkMode ? '#000' : '#fff')}
              </div>
            </StyledButton>
          )}
          {step === TransferStep.DONE && (
            <StyledButton
              wide
              tw="mx-auto"
              onClick={() => setStep(TransferStep.CONFIRM)}
            >
              <span>Next</span>
              <div tw="-rotate-90">
                {getIcon('dropdown', darkMode ? '#000' : '#fff')}
              </div>
            </StyledButton>
          )}
          {step === TransferStep.CONFIRM && (
            <StyledButton wide tw="mx-auto" onClick={() => props.onClose()}>
              Close
            </StyledButton>
          )}
          {step === TransferStep.ERROR && (
            <>
              <StyledButton wide tw="mx-auto" onClick={() => props.onClose()}>
                Close
              </StyledButton>
              <StyledButton
                wide
                tw="mx-auto"
                onClick={() => setStep(TransferStep.INITIAL)}
              >
                Try again
              </StyledButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferItemPopup;
