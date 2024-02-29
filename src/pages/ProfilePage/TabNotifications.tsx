import 'twin.macro';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Channel, Nft } from '../../api/api';
import { ChannelData, NftData, NotificationData } from '../../type.d';
import { getMimeType } from '../../utils';
import { timeAgo } from '../../utils/datetime';

const Avatar = ({ pic }: { pic?: string }) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setMimeType(getMimeType(pic));
  }, [pic]);

  return (
    <div
      css={{
        backgroundImage: mimeType.startsWith('video') ? 'none' : `url(${pic})`,
      }}
      tw="relative w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-full overflow-hidden"
    >
      {mimeType.startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm z-10"
        >
          <source src={pic} type={mimeType} />
        </video>
      ) : (
        <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10">
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={pic}
            tw="w-full h-full object-contain object-center"
          />
        </picture>
      )}
    </div>
  );
};

const ChannelImage = ({ pic }: { pic?: string }) => {
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    setMimeType(getMimeType(pic));
  }, [pic]);

  return (
    <div
      css={{
        backgroundImage: mimeType.startsWith('video') ? 'none' : `url(${pic})`,
      }}
      tw="relative w-[80px] min-w-[80px] h-[40px] bg-white bg-no-repeat bg-center bg-cover rounded-[8px] overflow-hidden"
    >
      {mimeType.startsWith('video') ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          tw="absolute left-0 top-0 w-full h-full object-contain backdrop-blur-sm z-10"
        >
          <source src={pic} type={mimeType} />
        </video>
      ) : (
        <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-2xl z-10">
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/avif"
          />
          <source
            srcSet={pic}
            tw="w-full h-full object-contain object-center"
            type="image/webp"
          />
          <img
            alt=""
            src={pic}
            tw="w-full h-full object-contain object-center"
          />
        </picture>
      )}
    </div>
  );
};

const JoinNotification = ({ data }: { data: NotificationData }) => {
  const [channel, setChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    Channel.getById(data.channel_id).then((res) => {
      setChannel(res);
    });
  }, [data.channel_id]);

  return (
    <div tw="py-[24px] flex justify-between items-center gap-2 border-b-2 border-[#E8E8E8] dark:border-[#282828]">
      <div tw="flex items-center gap-[14px]">
        <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
          <Avatar pic={channel?.channel_profile_image_url} />
        </Link>
        <span tw="text-[17px] text-dark dark:text-light/90">
          {data.title} to{' '}
          <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
            {data.channel_name}
          </Link>
        </span>
      </div>
      <div tw="text-[17px] text-dark dark:text-light/90">
        {timeAgo(new Date(data.createdAt))}
      </div>
    </div>
  );
};

const OtherNotification = ({ data }: { data: NotificationData }) => {
  const [channel, setChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    if (data.channel_id) {
      Channel.getById(data.channel_id).then((res) => {
        setChannel(res);
      });
    }
  }, [data.channel_id]);

  return (
    <div tw="py-[24px] flex justify-between items-center gap-2 border-b-2 border-[#E8E8E8] dark:border-[#282828]">
      <div tw="flex items-center gap-[14px]">
        <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
          <Avatar pic={channel?.channel_profile_image_url} />
        </Link>
        <span tw="text-[17px] text-dark dark:text-light/90">
          {data.title} -{' '}
          <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
            {data.channel_name}
          </Link>
        </span>
      </div>
      <div tw="text-[17px] text-dark dark:text-light/90">
        {timeAgo(new Date(data.createdAt))}
      </div>
    </div>
  );
};

const PostNotification = ({ data }: { data: NotificationData }) => {
  const [channel, setChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    Channel.getById(data.channel_id).then((res) => {
      setChannel(res);
    });
  }, [data.channel_id]);

  return (
    <div tw="py-[24px] flex justify-between items-center gap-2 border-b-2 border-[#E8E8E8] dark:border-[#282828]">
      <div tw="flex items-center gap-[14px]">
        <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
          <Avatar pic={channel?.channel_profile_image_url} />
        </Link>
        <span tw="text-[17px] text-dark dark:text-light/90">
          {data.title} in{' '}
          <Link to={`/channels/${channel?._id}?tab=channel-posts`}>
            {data.channel_name}
          </Link>
        </span>
      </div>
      <div tw="text-[17px] text-dark dark:text-light/90">
        {timeAgo(new Date(data.createdAt))}
      </div>
    </div>
  );
};

const ListedNotification = ({ data }: { data: NotificationData }) => {
  const [nft, setNft] = useState<NftData | null>(null);
  const [channel, setChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    Channel.getById(data.channel_id).then((res) => {
      setChannel(res);
    });
  }, [data.channel_id]);

  useEffect(() => {
    if (data.nft_id) {
      Nft.getById(data.nft_id).then((res) => {
        setNft(res);
      });
    }
  }, [data.nft_id]);

  return (
    <div tw="py-[24px] flex justify-between items-center gap-2 border-b-2 border-[#E8E8E8] dark:border-[#282828]">
      <div tw="flex items-center gap-[14px]">
        <Link to={`/item/${data.nft_id}`}>
          <Avatar pic={nft?.image} />
        </Link>
        <span tw="text-[17px] text-dark dark:text-light/90">
          <Link to={`/item/${data.nft_id}`}>{nft?.name}</Link> has been listed
          on{' '}
          <Link to={`/channels/${data.channel_id}?tab=channel-posts`}>
            {data.channel_name}
          </Link>
        </span>
        <Link to={`/channels/${data.channel_id}?tab=channel-posts`}>
          <ChannelImage pic={channel?.channel_profile_image_url} />
        </Link>
      </div>
      <div tw="text-[17px] text-dark dark:text-light/90">
        {timeAgo(new Date(data.createdAt))}
      </div>
    </div>
  );
};

const NotificationItem = ({ data }: { data: NotificationData }) => {
  return (
    <div tw="relative">
      {data.unread && (
        <div tw="absolute left-[-24px] top-1/2 translate-y-[-50%] w-[8px] min-w-[8px] h-[8px] bg-[#DD3939] rounded-full" />
      )}
      {['joined'].includes(data.title.toLowerCase()) && (
        <JoinNotification data={data} />
      )}
      {['new post', 'pinned post'].includes(data.title.toLowerCase()) && (
        <PostNotification data={data} />
      )}
      {['listed'].includes(data.title.toLowerCase()) && (
        <ListedNotification data={data} />
      )}
      {!['joined', 'new post', 'pinned post', 'listed'].includes(
        data.title.toLowerCase()
      ) && <OtherNotification data={data} />}
    </div>
  );
};

const TabNotifications = (props: {
  weekly: NotificationData[];
  monthly: NotificationData[];
  early: NotificationData[];
}) => {
  return (
    <div tw="mx-auto px-4 pb-8 w-full max-w-[1392px]">
      <div tw="px-0 md:px-6 pb-8">
        {props.weekly && props.weekly.length > 0 && (
          <>
            <h3 tw="py-2 flex items-center gap-[14px]">
              <span tw="font-bold text-[23px] tracking-tight leading-[150%] text-black dark:text-white">
                This Week
              </span>
              <span tw="font-normal text-[17px] text-[#DD3939]">
                {props.weekly.filter((item) => item.unread).length} unread
                notifications
              </span>
            </h3>
            <div>
              {props.weekly.map((item) => (
                <NotificationItem key={item._id} data={item} />
              ))}
            </div>
          </>
        )}
        {props.monthly && props.monthly.length > 0 && (
          <>
            <h3 tw="pt-10 pb-2 flex items-center gap-[14px]">
              <span tw="font-bold text-[23px] tracking-tight leading-[150%] text-black dark:text-white">
                This Month
              </span>
              <span tw="font-normal text-[17px] text-[#DD3939]">
                {props.monthly.filter((item) => item.unread).length} unread
                notifications
              </span>
            </h3>
            <div>
              {props.monthly.map((item) => (
                <NotificationItem key={item._id} data={item} />
              ))}
            </div>
          </>
        )}
        {props.early && props.early.length > 0 && (
          <>
            <h3 tw="pt-10 pb-2 flex items-center gap-[14px]">
              <span tw="font-bold text-[23px] tracking-tight leading-[150%] text-black dark:text-white">
                Earlier
              </span>
              <span tw="font-normal text-[17px] text-[#DD3939]">
                {props.early.filter((item) => item.unread).length} unread
                notifications
              </span>
            </h3>
            <div>
              {props.early.map((item) => (
                <NotificationItem key={item._id} data={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TabNotifications;
