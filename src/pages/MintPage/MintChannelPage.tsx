import 'twin.macro';

import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate, useParams } from 'react-router-dom';

import { Channel } from '../../api/api';
import BackLink from '../../components/BackLink';
import ButtonSwtich from '../../components/ButtonSwtich';
import CategorySelector from '../../components/CategorySelector';
import { getIcon } from '../../components/ColoredIcon';
import FileDropZone from '../../components/FileDropZone';
import {
  StyledButton,
  StyledCard,
  StyledCardSubtitle,
  StyledCardTitle,
  StyledInput,
  StyledPageTitle,
  StyledTextArea,
} from '../../components/lib/StyledComponents';
import PropertyEditor from '../../components/PropertyEditor';
import { UserContext } from '../../contexts/UserContext';
import {
  ChannelData,
  ChannelPermission,
  ChannelPermissionTitle,
  defaultChannelData,
  defaultChannelPermission,
  Property,
  TransactionStatus,
} from '../../type.d';
import { validateUrl } from '../../utils';
import { alertError, alertInfo } from '../../utils/toast';
import { getTokenBalance } from '../../utils/web3/library';
import { data as categories } from '../Home/CategoriesSection';
import { menuItemsForMintingPages } from '../MintPage';

var locked = false;

const channelFactoryABI = require('../../utils/web3/abis/channelFactory.json');
const slicedABI = require('../../utils/web3/abis/sliced.json');

const insufficientFundsMessage = 'Insufficient funds';

const MintChannelPage = () => {
  const params = useParams();
  let { account, activate, active, library } = useWeb3React();
  const navigate = useNavigate();
  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setCreatedChannel,
    setCustomMenuItems,
    user,
  } = useContext(UserContext);

  const [channel, setChannel] = useState<ChannelData>(defaultChannelData);
  const [permissions, setPermissions] = useState<boolean[]>(
    defaultChannelPermission
  );
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [optionLimitAccess, setOptionLimitAccess] = useState<string | null>(
    'No Limit'
  );
  const [optionAcceptOffer, setOptionAcceptOffer] = useState<string | null>(
    'Yes'
  );
  const [optionTicketTradable, setOptionTicketTradable] = useState<
    string | null
  >('Yes');
  const [availableSubmit, setAvaiableSubmit] = useState<boolean>(false);
  const [duplicate, setDuplicate] = useState<boolean>(false);
  const [feeError, setFeeError] = useState<boolean>(false);
  const [waitingTransaction, setWaitingTransaction] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddFundsPopup, setShowAddFundsPopup] = useState<boolean>(false);
  const [oldName, setOldName] = useState<string>('');

  const setChannelField = (
    field: string,
    value: string | number | boolean | string[] | boolean[] | Property[]
  ) => {
    setChannel({ ...channel, [field]: value });
  };

  useEffect(() => {
    setCustomMenuItems([
      { icon: 'back', label: 'Back', link: '/create' },
      ...menuItemsForMintingPages,
    ]);

    const categoryList = categories.map((item) => item.title);
    setCategoryList(categoryList);
  }, []);

  useEffect(() => {
    if (params?.id) {
      Channel.getById(params.id)
        .then((res) => {
          if (res) {
            setChannel(res);
            setOptionLimitAccess(
              res.channel_access_limit === 0
                ? 'No Limit'
                : 'Yes limit to specific number'
            );
            setOptionAcceptOffer(res.is_accept_offers ? 'Yes' : 'No');
            setOptionTicketTradable(res.is_tradable_tickets ? 'Yes' : 'No');
            setPermissions(res.channel_permissions);
            setOldName(res.channel_name);
            setDuplicate(false);
            setAvaiableSubmit(true);
          }
        })
        .catch((e) => {
          console.error();
          alertError(e.toString());
        });
    }
  }, [params?.id]);

  useEffect(() => {
    setChannelField('attributes', properties);
  }, [properties]);

  useEffect(() => {
    setChannelField('channel_category', selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setChannelField('channel_permissions', permissions);
  }, [permissions]);

  useEffect(() => {
    if (optionLimitAccess?.toLowerCase() === 'no limit') {
      setChannelField('channel_access_limit', 0);
    }
  }, [optionLimitAccess]);

  useEffect(() => {
    setChannelField('is_accept_offers', optionAcceptOffer === 'Yes');
  }, [optionAcceptOffer]);

  useEffect(() => {
    setChannelField('is_tradable_tickets', optionTicketTradable === 'Yes');
  }, [optionTicketTradable]);

  useEffect(() => {
    if (insufficientFundsMessage === errorMessage) {
      return;
    } else if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  }, [errorMessage]);

  const toggleEvrythingPermission = () => {
    if (permissions[ChannelPermission.EVERYTHING]) {
      setPermissions([
        false,
        permissions[ChannelPermission.CREATE_POSTS],
        permissions[ChannelPermission.COMMENT_LINKS],
        permissions[ChannelPermission.COMMENT_MEDIA],
      ]);
    } else {
      setPermissions([true, true, true, true]);
    }
  };

  const validateCollection = (channel: ChannelData): string[] => {
    const res = [];
    if ((channel.channel_name ?? '').trim().length === 0) {
      res.push('Collection name cannot be empty.');
    }
    if ((channel.channel_category ?? []).length === 0) {
      res.push('Collection category cannot be empty.');
    }
    if ((channel.channel_profile_image_url ?? '').trim().length === 0) {
      res.push('Collection profile image cannot be null.');
    }
    if ((channel.channel_background_image_url ?? '').trim().length === 0) {
      res.push('Collection background image cannot be null.');
    }
    if ((channel.channel_royalties ?? 0) > 10) {
      res.push('Royalties cannot be higher than 10%');
    }
    return res;
  };

  const togglePermission = (index: ChannelPermission) => {
    const newValue = [...(permissions ?? defaultChannelPermission)];
    newValue[index] = !permissions[index];
    if (index > ChannelPermission.EVERYTHING && permissions[index]) {
      newValue[ChannelPermission.EVERYTHING] = false;
    }
    if (
      newValue[ChannelPermission.CREATE_POSTS] &&
      newValue[ChannelPermission.COMMENT_LINKS] &&
      newValue[ChannelPermission.COMMENT_MEDIA]
    ) {
      newValue[ChannelPermission.EVERYTHING] = true;
    }
    setPermissions(newValue);
  };

  const submitChannel = () => {
    let createdChannelId: string;
    let timer: number | NodeJS.Timer | null;

    increaseLoading(true);
    setWaitingTransaction(2);
    console.log('----->', channel);
    Channel.create({
      ...channel,
      channel_creator: user?.walletAddress ?? '',
      channel_owner: user?.walletAddress ?? '',
    })
      .then((res: ChannelData) => {
        if (res) {
          createdChannelId = res._id ?? '';
          if (active) {
            try {
              const contract = new ethers.Contract(
                process.env.REACT_APP_CHANNEL_FACTORY || '',
                channelFactoryABI,
                library.getSigner()
              );
              contract
                .createChannel(
                  `${process.env.REACT_APP_API_BASE_URL}channels/metadata/${res._id}`,
                  res.channel_access_limit,
                  res.is_accept_offers,
                  res.is_tradable_tickets,
                  Math.floor(res.channel_royalties * 100),
                  ethers.utils.parseEther(res.channel_ticket_price.toString())
                )
                .then(async (contractRes: any) => {
                  console.log(contractRes.hash);
                  if (contractRes.hash) {
                    // here, please call channel put api, with { transactionHash: res.has, transactionStatus: 0 }
                    // And you need to wait for changing the transactionStatus: 0 -> 1 or 2
                    // Polling method...
                    // if the transactionStatus changed on DB, then you can run the following...
                    //-------------------------------------------------------------------------
                    // setCreatedChannel(res);
                    // navigate('/create/mint-channel-success');
                    //-------------------------------------------------------------------------
                    Channel.update(createdChannelId, {
                      transactionHash: contractRes.hash,
                      transactionStatus: TransactionStatus.PENDING,
                    })
                      .then((uptRes) => {
                        if (uptRes) {
                          setWaitingTransaction(3);
                          timer = setInterval(() => {
                            Channel.getById(createdChannelId).then(
                              (getRes: ChannelData) => {
                                if (
                                  getRes &&
                                  getRes.transactionStatus !==
                                    TransactionStatus.PENDING
                                ) {
                                  if (
                                    getRes.transactionStatus ===
                                    TransactionStatus.CONFIRMED
                                  ) {
                                    setCreatedChannel(res);
                                    navigate('/create/mint-channel-success');
                                  } else {
                                    setErrorMessage('Transaction failed!');
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
                        setWaitingTransaction(0);
                        Channel.delete(createdChannelId);
                        console.error(e);
                        setErrorMessage(e.toString());
                      });
                  } else {
                    Channel.delete(createdChannelId);
                  }
                })
                .catch((e: any) => {
                  Channel.delete(createdChannelId);
                  console.error(e);
                  setErrorMessage(
                    e.code ? `${e.code}: ${e.message}` : e.toString()
                  );
                  setWaitingTransaction(0);
                });
            } catch (e: any) {
              // here, please call channel delete api
              // It means, smart contract create channel method is failed, we need to delete it on database as well.
              setWaitingTransaction(0);
              Channel.delete(createdChannelId);
              console.error(e);
              setErrorMessage(e.toString());
            }
          }
        }
      })
      .catch((e) => {
        console.error(e);
        if (e.response?.data) {
          setErrorMessage(
            `${e.response.data.statusCode}: ${e.response.data.message}`
          );
        } else {
          setErrorMessage('Channel creating failed!');
        }
        setWaitingTransaction(0);
      })
      .finally(() => {
        decreaseLoading(true);
      });
  };

  const handleCreateChannel = async () => {
    console.log('here');
    if (!account) return;
    const balance = await getTokenBalance(
      account,
      process.env.REACT_APP_SLICED_ADDRESS || ''
    );
    if (
      BigNumber.from(ethers.utils.parseEther(balance)).lt(
        ethers.utils.parseEther('20.14')
      )
    ) {
      setErrorMessage(insufficientFundsMessage);
      // please go to the not enough funds modal.....
      return;
    }
    const errors = validateCollection(channel);
    console.log(channel);

    if (errors.length > 0) {
      for (const error of errors) {
        alertError(error);
      }
      return;
    }

    const contract = new ethers.Contract(
      process.env.REACT_APP_SLICED_ADDRESS || '',
      slicedABI,
      library.getSigner()
    );
    let allowance = await contract.allowance(
      account,
      process.env.REACT_APP_CHANNEL_FACTORY
    );
    if (BigNumber.from(allowance).gte(ethers.utils.parseEther('20.14'))) {
      submitChannel();
      return;
    }
    increaseLoading(true);
    setWaitingTransaction(1);
    contract
      .approve(
        process.env.REACT_APP_CHANNEL_FACTORY,
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      )
      .then(async (res: any) => {
        if (res.hash) {
          console.log('txHash--------->', res.hash);
          localStorage.setItem('txHash', res.hash);
        }
      })
      .catch((e: any) => {
        console.error(e);
        setErrorMessage(e.code ? `${e.code}: ${e.message}` : e.toString());
        setWaitingTransaction(0);
      })
      .finally(() => decreaseLoading(true));
  };

  useEffect(() => {
    const timer1 = setInterval(() => {
      getTransaction(channel);
    }, 2000);
    return () => clearInterval(timer1);
  });

  const getTransaction = async (channel: ChannelData) => {
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
          submitChannel();
          console.log('successfully done ....');
        }
        locked = false;
      } catch (e) {
        console.log(e);
        locked = false;
      }
    }
  };

  const checkDuplicateOfName = (name: string) => {
    if (name.trim().length === 0) {
      return;
    }

    Channel.getByName(name)
      .then((res) => {
        if (res) {
          setDuplicate(true);
          setAvaiableSubmit(false);
        } else {
          setDuplicate(false);
          setAvaiableSubmit(true);
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      });
  };

  return (
    <>
      {(waitingTransaction > 0 || errorMessage) && (
        <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-30">
          <div tw="px-6 py-6 w-full max-w-[560px] bg-white dark:bg-dark rounded-lg shadow-lg">
            <div tw="flex items-center gap-[14px]">
              <div tw="relative w-[120px] min-w-[120px] h-[120px] flex justify-center items-center">
                <div tw="absolute w-full h-full border-4 border-dark/20 dark:border-light/20 border-t-hero-purpledark dark:border-t-hero-bluelight rounded-[50%] animate-spin" />
                {waitingTransaction > 0 ? (
                  <span tw="font-bold text-[20px] text-dark dark:text-light">
                    {waitingTransaction - 1}/2
                  </span>
                ) : (
                  <span tw="font-bold text-[32px] text-[#8008]">!</span>
                )}
              </div>
              <div>
                <p tw="font-normal text-base tracking-tight leading-[140%] text-center text-dark/70 dark:text-light/70">
                  We&rsquo;re minting your Channel, please accept the following
                  transactions to finalise the creation.
                </p>
                {errorMessage && (
                  <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                    This transaction is free of cost!
                  </p>
                )}
                {waitingTransaction === 1 && (
                  <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                    This transaction is free of cost!
                  </p>
                )}
                {waitingTransaction === 2 && (
                  <p tw="pt-[8px] font-bold text-[16px] tracking-tight leading-[140%] text-center text-dark dark:text-light/90">
                    This transaction is free of cost!
                  </p>
                )}
                {waitingTransaction === 3 && <></>}
              </div>
            </div>
            {errorMessage && (
              <div tw="pt-6 flex items-center gap-[20px]">
                <div tw="px-2 py-2.5 w-full text-[14px] tracking-tight leading-[140%] text-dark border-2 border-[#b85450] bg-[#f8cecc]">
                  {errorMessage} for this transaction!
                </div>
                <StyledButton
                  tw="whitespace-nowrap"
                  onClick={() => {
                    setShowAddFundsPopup(true);
                    setErrorMessage(null);
                  }}
                >
                  Add funds
                </StyledButton>
              </div>
            )}
          </div>
        </div>
      )}
      {showAddFundsPopup && (
        <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-30">
          <div
            className="popup-content no-scrollbar"
            tw="relative mx-auto px-4 py-8 w-full max-h-full max-w-[855px] text-center bg-white dark:bg-[#030017] rounded-[32px] overflow-auto z-20"
          >
            <div tw="px-4 relative">
              <button
                tw="pl-2.5 pr-3.5 h-10 flex items-center gap-0.5 border border-black dark:border-white rounded-[100px]"
                onClick={async () => {
                  setShowAddFundsPopup(false);
                  if (account) {
                    const balance = await getTokenBalance(
                      account,
                      process.env.REACT_APP_SLICED_ADDRESS || ''
                    );
                    if (
                      BigNumber.from(ethers.utils.parseEther(balance)).lt(
                        ethers.utils.parseEther('20.14')
                      )
                    ) {
                      setErrorMessage(insufficientFundsMessage);
                    } else {
                      setErrorMessage(null);
                    }
                  }
                }}
              >
                <div tw="rotate-90 scale-90">
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Back
                </span>
              </button>
              <button
                tw="absolute right-4 top-0 text-[32px] text-dark dark:text-light/90"
                onClick={() => setShowAddFundsPopup(false)}
              >
                &times;
              </button>
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
                  Transfer funds from an exchange or another wallet to your
                  wallet address below:
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
          </div>
        </div>
      )}
      <div
        css={waitingTransaction ? { filter: 'blur(8px)' } : {}}
        tw="mx-auto px-4 py-8 w-full max-w-[1392px]"
      >
        <div tw="inline-block">
          <BackLink handleBack={() => navigate(-1)} />
        </div>
        <div tw="mx-auto pt-8 w-full max-w-[755px]">
          <StyledPageTitle>
            {params?.id
              ? `Edit ${channel.channel_name}`
              : 'Create your Channel'}
          </StyledPageTitle>
          <div tw="py-8 flex flex-col gap-3.5">
            <StyledCard>
              <StyledCardTitle>
                Channel profile image (Upload Image, 3D Model, Video)
              </StyledCardTitle>
              <div tw="w-full max-w-[350px]">
                <FileDropZone
                  default={channel.channel_profile_image_url}
                  id="channel_profile_image_url"
                  setUploadedFileUrl={(url: string) => {
                    setChannelField('channel_profile_image_url', url);
                  }}
                />
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>
                Channel background image (Upload Image, 3D Model, Video)
              </StyledCardTitle>
              <FileDropZone
                default={channel.channel_background_image_url}
                id="channel_background_image_url"
                setUploadedFileUrl={(url: string) => {
                  setChannelField('channel_background_image_url', url);
                }}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Channel Name</StyledCardTitle>
              <StyledInput
                value={channel.channel_name}
                onBlur={(e) => checkDuplicateOfName(e.target.value)}
                onChange={(e) => {
                  setChannelField('channel_name', e.target.value);
                  setDuplicate(false);
                  setAvaiableSubmit(false);
                }}
              />
              {duplicate && (
                <div tw="pt-2 text-xs text-[#DD3939]">
                  * This name is occupied by the other channel.
                </div>
              )}
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>External Link</StyledCardTitle>
              <StyledInput
                type="url"
                value={channel.channel_external_link}
                onChange={(e) =>
                  setChannelField('channel_external_link', e.target.value)
                }
              />
              {!validateUrl(channel.channel_external_link) && (
                <div tw="pt-1 text-[12px] text-[#d40]">Invalid URL</div>
              )}
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Description</StyledCardTitle>
              <StyledTextArea
                value={channel.channel_description}
                onChange={(e) =>
                  setChannelField('channel_description', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard tw="relative">
              <StyledCardTitle>Category</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Add up to 3 categories to help your item to be discoverable.
              </StyledCardSubtitle>
              <CategorySelector
                default={channel.channel_category}
                limit={3}
                options={categoryList}
                onChange={setSelectedCategories}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Limit Channel access?</StyledCardTitle>
              <ButtonSwtich
                options={['No Limit', 'Yes limit to specific number']}
                value={optionLimitAccess}
                onChange={setOptionLimitAccess}
              />
            </StyledCard>
            {optionLimitAccess === 'Yes limit to specific number' && (
              <StyledCard className="dropdown-list">
                <StyledCardTitle>
                  Amount of users who can join this Channel
                </StyledCardTitle>
                <StyledInput
                  min={0}
                  placeholder="[Number of Users]"
                  type="number"
                  value={channel.channel_access_limit}
                  onChange={(e) =>
                    setChannelField(
                      'channel_access_limit',
                      parseInt(e.target.value)
                    )
                  }
                />
              </StyledCard>
            )}
            <StyledCard>
              <StyledCardTitle>Accept offers for Channel?</StyledCardTitle>
              <ButtonSwtich
                options={['Yes', 'No']}
                value={optionAcceptOffer}
                onChange={setOptionAcceptOffer}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Channel Tickets are tradable</StyledCardTitle>
              <ButtonSwtich
                options={['Yes', 'No']}
                value={optionTicketTradable}
                onChange={setOptionTicketTradable}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Channel Permissions</StyledCardTitle>
              <div tw="flex flex-col gap-2.5">
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.EVERYTHING]}
                    id="permission1"
                    type="checkbox"
                    onClick={() => toggleEvrythingPermission()}
                  />
                  <label
                    htmlFor="permission1"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.EVERYTHING]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.CREATE_POSTS]}
                    id="permission2"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.CREATE_POSTS)
                    }
                  />
                  <label
                    htmlFor="permission2"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.CREATE_POSTS]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.COMMENT_LINKS]}
                    id="permission3"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.COMMENT_LINKS)
                    }
                  />
                  <label
                    htmlFor="permission3"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.COMMENT_LINKS]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.COMMENT_MEDIA]}
                    id="permission4"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.COMMENT_MEDIA)
                    }
                  />
                  <label
                    htmlFor="permission4"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.COMMENT_MEDIA]}
                  </label>
                </div>
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Properties</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Properties show up underneath your item, are clickable, and can
                be filtered in your collection's sidebar.
              </StyledCardSubtitle>
              <PropertyEditor onChange={setProperties} />
            </StyledCard>
            {/* <StyledCard>
              <StyledCardTitle>Network</StyledCardTitle>
              <div tw="flex items-center gap-3.5">
                <StyledInput value="[Network]" />
                <span tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-dark dark:text-light  cursor-pointer">
                  Choose Network
                </span>
              </div>
            </StyledCard> */}
            <StyledCard>
              <StyledCardTitle>Royalties</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Royalty fee for items traded inside this Channel
              </StyledCardSubtitle>
              {feeError && (
                <StyledCardSubtitle tw="pt-0 text-[#DD3939]">
                  Royalties can't be higher than 10%
                </StyledCardSubtitle>
              )}
              <div tw="flex items-center gap-1">
                <StyledInput
                  max={10}
                  min={0}
                  step={0.1}
                  type="number"
                  value={channel.channel_royalties}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value > 10) {
                      setFeeError(true);
                      value = 10;
                    } else {
                      setFeeError(false);
                    }
                    setChannelField('channel_royalties', value);
                  }}
                />
                <span tw="font-semibold text-[22px] text-[#888]">%</span>
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>
                Set the Channel Ticket price to subscribe to your Channel
              </StyledCardTitle>
              <StyledInput
                min={0.01}
                step={0.1}
                type="number"
                value={channel.channel_ticket_price}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  setChannelField('channel_ticket_price', value);
                }}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Minting Price of this Channel</StyledCardTitle>
              <div tw="flex items-center gap-[5px]">
                {getIcon('sliced', darkMode ? '#fff' : '#000')}
                <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  20.14
                </span>
              </div>
            </StyledCard>
          </div>
          <div tw="pb-8 flex justify-center">
            <button
              // to="/create/mint-channel-success"
              title={
                availableSubmit
                  ? undefined
                  : 'Channel name is required and must be unique.'
              }
              tw="flex items-center gap-1 hover:opacity-75"
              onClick={() =>
                availableSubmit
                  ? handleCreateChannel()
                  : () => {
                      return;
                    }
              }
            >
              <span
                css={{
                  color: availableSubmit
                    ? darkMode
                      ? '#fff'
                      : '#000'
                    : darkMode
                    ? '#fff5'
                    : '#0005',
                }}
                tw="font-semibold text-base"
              >
                Create Channel
              </span>
              <div tw="-rotate-90 scale-75">
                {getIcon(
                  'dropdown',
                  availableSubmit
                    ? darkMode
                      ? '#fff'
                      : '#000'
                    : darkMode
                    ? '#fff5'
                    : '#0005'
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MintChannelPage;
