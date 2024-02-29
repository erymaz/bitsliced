import 'twin.macro';

import { useContext, useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';

import { Channel, Collection, Posting } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { StyledButton } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import {
  ChannelData,
  ChannelPermission,
  CollectionData,
  NftData,
} from '../../type.d';
import { getMimeType } from '../../utils';
import {
  alertError,
  alertInfo,
  alertSuccess,
  alertWarning,
} from '../../utils/toast';

const maxLength = 300;

const enum SharingStep {
  INITIAL,
  PENDING,
  SHARED,
}

const ShareItemPopup = (props: { item: NftData; onClose: () => void }) => {
  const { darkMode, user } = useContext(UserContext);

  const [step, setStep] = useState<SharingStep>(SharingStep.INITIAL);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [ownedChannels, setOwnedChannels] = useState<ChannelData[]>([]);
  const [joinedChannels, setJoinedChannels] = useState<ChannelData[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [showChannelsDropdown, setShowChannelsDropdown] =
    useState<boolean>(false);
  const [mimeType, setMimeType] = useState<string>('');
  const [thought, setThought] = useState<string>('');

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

  useEffect(() => {
    if (user) {
      Channel.getByOwner(user.walletAddress)
        .then((res: ChannelData[]) => {
          setOwnedChannels(res);
        })
        .catch((e: any) => {
          console.error(e);
        });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      Channel.search({
        categories: [],
        channel_creator: '',
        channel_joined: user.walletAddress,
        channel_name: '',
        channel_owner: '',
        limit: 50,
        page: 1,
        sortStr: 'Recently created',
      })
        .then((res) => {
          setJoinedChannels(res.channels);
        })
        .catch((e: any) => {
          console.error(e);
        });
    }
  }, [user]);

  useEffect(() => {
    setChannels([...ownedChannels, ...joinedChannels]);
  }, [joinedChannels, ownedChannels]);

  // TODO: replace this part with the sharing endpoint call.
  useEffect(() => {
    if (step === SharingStep.PENDING && user) {
      Posting.create({
        channel_id: channel?._id ?? '',
        channelpost_description: thought,
        channelpost_image_url: null,
        channelpost_nft_id: props.item._id ?? null,
        user_id: user._id ?? '',
      })
        .then((res) => {
          if (res) {
            alertSuccess(
              `This NFT and your thought have been published on the channel "${channel?.channel_name}".`
            );
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => {
          setStep((prev) => {
            if (prev === SharingStep.PENDING) {
              return SharingStep.SHARED;
            }
            return SharingStep.INITIAL;
          });
        });
    }
  }, [step, user, props.item, channel, thought]);

  const sharable = useMemo(
    () =>
      (channel?.channel_permissions?.[ChannelPermission.EVERYTHING] ||
        channel?.channel_permissions?.[ChannelPermission.CREATE_POSTS]) ??
      false,
    [channel]
  );

  const sharedUrl = useMemo(
    () =>
      window.location
        ? `${window.location.protocol}//${window.location.host}/item/${props.item._id}`
        : `http://18.205.237.239/item/${props.item._id}`,
    [props.item]
  );

  return (
    <div
      tw="pt-[100px] pb-[20px] fixed left-0 top-0 w-full h-full flex justify-center items-center z-30"
      onClick={() => props.onClose()}
    >
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
          {step === SharingStep.INITIAL && <>Share {props.item.name}</>}
          {step === SharingStep.PENDING && <>Sharing {props.item.name}...</>}
          {step === SharingStep.SHARED && <>Congratulations</>}
        </h3>
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
        {[SharingStep.INITIAL, SharingStep.PENDING].includes(step) && (
          <div tw="relative p-[30px] flex items-center gap-[14px] bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] border border-[rgba(0, 0, 0, 0.15)] dark:border-[#fff1] rounded-[14px]">
            <div
              css={{ backgroundImage: `url(${user?.profile_image_url})` }}
              tw="w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-full"
            />
            <textarea
              disabled={step === SharingStep.PENDING}
              maxLength={maxLength}
              placeholder="What is your thought?"
              tw="w-full min-h-[60px] text-base tracking-tight leading-[150%] text-dark dark:text-light/90 bg-transparent outline-none appearance-none"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            />
            <div tw="absolute right-[30px] bottom-2 text-2xs text-dark/50 dark:text-light/50">
              {thought.length} / {maxLength}
            </div>
          </div>
        )}
        {step === SharingStep.SHARED && thought.trim().length > 0 && (
          <p tw="pb-[30px] text-base tracking-tight leading-[150%] whitespace-pre-wrap text-dark dark:text-light/90">
            {thought}
          </p>
        )}
        {[SharingStep.INITIAL, SharingStep.PENDING].includes(step) && (
          <div tw="pt-[30px]">
            <h4 tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              Select Channel
            </h4>
            <p tw="pb-[4px] text-[14px] tracking-tight leading-[150%] text-gray-500 ">
              Select the channel where you would like to share your item.
            </p>
            <div tw="relative flex gap-[40px] z-30">
              <div
                tw="px-3.5 w-full h-[46px] flex items-center gap-[4px] text-dark dark:text-light/90 bg-[rgba(245, 245, 247, 0.5)] dark:bg-[#fff1] border border-[rgba(0, 0, 0, 0.15)] dark:border-[#fff1] rounded-[7px] cursor-pointer"
                onClick={() => setShowChannelsDropdown(true)}
              >
                {channel ? (
                  <>
                    <div
                      css={{
                        backgroundImage: `url(${channel?.channel_profile_image_url})`,
                      }}
                      tw="w-[80px] min-w-[80px] h-[40px] bg-white bg-no-repeat bg-center rounded-[4px] bg-cover"
                    />
                    <span tw="font-medium text-[14px] text-dark dark:text-light/90">
                      {channel?.channel_name}
                    </span>
                  </>
                ) : (
                  '[Channel name]'
                )}
              </div>
              {showChannelsDropdown && (
                <>
                  <div
                    tw="fixed left-0 top-0 w-full h-full"
                    onClick={() => setShowChannelsDropdown(false)}
                  />
                  <ul tw="absolute left-0 bottom-[48px] w-full md:w-[calc(100% - 170px)] max-h-[200px] bg-white overflow-y-auto rounded-[7px] opacity-90 z-40">
                    {(!channels || channels.length === 0) && (
                      <li
                        tw="px-3.5 h-[40px] flex items-center gap-[4px] cursor-pointer"
                        onClick={() => setShowChannelsDropdown(false)}
                      >
                        No channel
                      </li>
                    )}
                    {channels.map((item) => (
                      <li
                        key={item._id}
                        tw="px-3.5 flex items-center gap-[4px] cursor-pointer"
                        onClick={() => {
                          setChannel(item);
                          setShowChannelsDropdown(false);
                        }}
                      >
                        <div
                          css={{
                            backgroundImage: `url(${item.channel_profile_image_url})`,
                          }}
                          tw="w-[80px] min-w-[80px] h-[40px] bg-white bg-no-repeat bg-center rounded-[4px] bg-cover"
                        />
                        <span tw="font-medium text-[14px] text-dark">
                          {item.channel_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button
                tw="font-medium text-base tracking-tight leading-[150%] text-dark dark:text-light  whitespace-nowrap"
                onClick={
                  step === SharingStep.PENDING
                    ? () => {
                        return;
                      }
                    : () => setShowChannelsDropdown(true)
                }
              >
                Choose Channel
              </button>
            </div>
          </div>
        )}
        {step === SharingStep.SHARED && channel && (
          <div tw="flex items-center gap-[14px]">
            <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              Your creation has been shared in {channel.channel_name}
            </span>
            <div
              css={{
                backgroundImage: `url(${channel.channel_profile_image_url})`,
              }}
              tw="w-[80px] min-w-[80px] h-[40px] bg-white bg-no-repeat bg-center bg-cover rounded-[8px]"
            />
          </div>
        )}
        <div tw="py-[30px] flex items-center gap-[14px] flex-wrap">
          {step === SharingStep.INITIAL && (
            <>
              <StyledButton
                wide
                onClick={() => {
                  if (channel) {
                    if (sharable) {
                      setStep(SharingStep.PENDING);
                    } else {
                      alertWarning(
                        'This channel is not allowed to share the items in it.'
                      );
                    }
                  } else {
                    alertWarning('Please choose the channel.');
                  }
                }}
              >
                <span>Share</span>
                <div tw="-rotate-90">
                  {getIcon('dropdown', darkMode ? '#000' : '#fff')}
                </div>
              </StyledButton>
              {channel && !sharable && (
                <p tw="text-[14px] text-red-800 dark:text-red-800">
                  * This channel is not allowed to share the items in it.
                </p>
              )}
            </>
          )}
          {step === SharingStep.PENDING && (
            <StyledButton disabled wide>
              <span>Sharing...</span>
            </StyledButton>
          )}
          {step === SharingStep.SHARED && (
            <>
              <Link
                to={`/channels/${channel?._id}?tab=channel-posts`}
                tw="px-6 h-10 flex items-center gap-[7px] font-medium text-base tracking-tight border-2 border-[#3169FA] text-light/90 bg-[#3169FA] rounded-[100px] duration-300"
              >
                <span>View {channel?.channel_name}</span>
                <div tw="-rotate-90">{getIcon('dropdown', '#fff')}</div>
              </Link>
              <button
                tw="px-6 h-10 flex items-center gap-[7px] bg-transparent duration-300"
                onClick={() => setStep(SharingStep.PENDING)}
              >
                <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
                  List {props.item.name}
                </span>
                <div tw="-rotate-90">{getIcon('dropdown', '#3169FA')}</div>
              </button>
            </>
          )}
        </div>
        <div tw="pt-[30px] border-t-2 border-[rgba(0, 0, 0, 0.15)] dark:border-[rgba(255, 255, 255, 0.15)]">
          <h4 tw="pb-[30px] font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
            Share on an external platform
          </h4>
          <div tw="flex items-center gap-[20px]">
            <CopyToClipboard
              text={sharedUrl}
              onCopy={() => alertInfo('Copied.')}
            >
              <button tw="flex items-center gap-[4px]">
                {getIcon('link', darkMode ? '#fff' : '#000')}
                <span tw="text-[14px] tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
                  Copy link
                </span>
              </button>
            </CopyToClipboard>
            <a
              href={`https://twitter.com/intent/tweet?text=Hi, welcome to Bitsliced!%0aPlease check this NFT, ${props.item.name} on Bitsliced. ${sharedUrl}`}
              rel="noreferrer"
              target="_blank"
              tw="flex items-center gap-[4px]"
            >
              {getIcon('twitter', darkMode ? '#fff' : '#000')}
              <span tw="text-[14px] tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
                Twitter
              </span>
            </a>
            <a
              href={`https://telegram.me/share/url?url=${sharedUrl}&text=${props.item.name} on Bitsliced`}
              rel="noreferrer"
              target="_blank"
              tw="flex items-center gap-[4px]"
            >
              {getIcon('telegram', darkMode ? '#fff' : '#000')}
              <span tw="text-[14px] tracking-tight leading-[150%] text-[rgba(0, 0, 0, 0.8)] dark:text-[rgba(255, 255, 255, 0.8)]">
                Telegram
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareItemPopup;
