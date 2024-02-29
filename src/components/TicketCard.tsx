import 'twin.macro';

import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Channel } from '../api/api';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, TicketData, TransactionStatus, User } from '../type.d';
import { alertError } from '../utils/toast';
import { getIcon } from './ColoredIcon';

const StatusLabel = {
  [TransactionStatus.PENDING]: 'Pending',
  [TransactionStatus.CONFIRMED]: 'Tradable',
  [TransactionStatus.FAILED]: 'Invalid',
};

const TicketCard = ({
  item,
  onRenewPopup,
}: {
  item: TicketData;
  onRenewPopup?: (params: {
    channel: ChannelData | null;
    ticket: TicketData;
  }) => void;
}) => {
  const { darkMode, setTicketToAccept, setTicketToOffer, user } =
    useContext(UserContext);

  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      Channel.getById(item.channel_id)
        .then((res) => {
          if (res) {
            setChannel(res);
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
      Auth.getByWallet(item.owner).then((res) => setOwner(res));
      const now = new Date().getTime();
      setExpired(now >= item.expiredTimestamp);
    }
  }, [item]);

  return (
    <div
      key={item._id}
      title={`Owned by ${owner?.name}`}
      tw="relative flex flex-col justify-between overflow-hidden bg-white dark:bg-light/5 dark:bg-gradient-to-br dark:from-white/5  dark:via-light/10 dark:to-white/5 rounded-lg"
    >
      <Link to={`/channels/${channel?._id}`}>
        <div
          css={{
            backgroundImage: `url(${channel?.channel_profile_image_url})`,
          }}
          tw="pt-[100%] relative bg-white bg-center bg-cover rounded-t-lg z-0"
        >
          <picture tw="absolute left-0 top-0 w-full h-full backdrop-blur-lg rounded-t-lg overflow-hidden z-10">
            <source
              srcSet={channel?.channel_profile_image_url}
              tw="w-full h-full object-contain object-center rounded-t-lg"
              type="image/avif"
            />
            <source
              srcSet={channel?.channel_profile_image_url}
              tw="w-full h-full object-contain object-center rounded-t-lg"
              type="image/webp"
            />
            <img
              alt=""
              src={channel?.channel_profile_image_url}
              tw="w-full h-full object-contain object-center rounded-t-lg"
            />
          </picture>
          <div
            css={{
              backgroundImage:
                'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0.189) 73.96%, rgba(0, 0, 0, 0.7) 100%)',
            }}
            tw="absolute left-0 top-0 w-full h-full rounded-t-lg z-20"
          >
            <div tw="absolute top-2 left-2 font-medium text-sm text-light border-[1px] border-light bg-dark/40 backdrop-blur-md rounded-3xl px-3 py-1 z-30 select-none flex gap-2 items-center">
              <span tw="font-medium text-sm text-light/90 capitalize">
                {expired
                  ? 'Expired'
                  : item.is_tradable
                  ? StatusLabel[item.status]
                  : 'Not Tradable'}
              </span>
              <span
                css={{
                  backgroundColor: expired
                    ? '#999'
                    : item.is_tradable
                    ? '#2b2'
                    : '#DD3939',
                }}
                tw="w-1.5 h-1.5 border border-[#0002] rounded-full"
              />
            </div>
          </div>
          {channel?.joinedUsers && channel.joinedUsers.length > 0 && (
            <div tw="absolute w-full bottom-2 left-2 flex items-center z-20">
              {channel.joinedUsers.slice(0, 3).map((u) => (
                <div
                  key={u._id}
                  css={{ backgroundImage: `url(${u.profile_image_url})` }}
                  title={u.name}
                  tw="mr-[-8px] w-6 h-6 bg-dark/50 dark:bg-light/50 bg-no-repeat bg-center bg-cover backdrop-blur-lg rounded-full"
                />
              ))}
              <span tw="ml-3 text-[10px] tracking-tight text-light truncate break-all">
                Joined by {channel?.joinedUsers?.length} users
              </span>
            </div>
          )}
        </div>
      </Link>
      <div tw="flex flex-col p-3 space-y-1">
        <div tw="flex items-center gap-1.5 text-[10px] tracking-tight leading-[150%] capitalize text-gray-500 truncate break-all">
          Channel Ticket
        </div>
        <div tw="flex items-center justify-between">
          <div tw="font-semibold text-xs tracking-tight leading-[150%] text-dark dark:text-light/90 truncate break-all">
            {channel?.channel_name}
          </div>
          <div tw="flex items-center space-x-1">
            {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-sm tracking-tight text-dark dark:text-light/90">
              {item.price}
            </span>
          </div>
        </div>
      </div>
      <div tw="relative w-full border-dashed border-[1px] border-light dark:border-dark before:absolute before:content-[''] before:w-6 before:h-6 before:rounded-full before:bg-light before:dark:bg-dark before:bottom-[-0.75rem] before:left-[-0.75rem] before:z-30 after:absolute after:content-[''] after:w-6 after:h-6 after:rounded-full after:bg-light after:dark:bg-dark after:bottom-[-0.75rem] after:right-[-0.75rem] after:z-30"></div>
      <div tw="flex flex-col p-3 space-y-1 gap-3">
        <div tw="flex flex-wrap justify-start items-center gap-1">
          <span tw="text-xs text-gray-500">
            {expired ? 'Expired at' : 'Expires on'}
          </span>{' '}
          <span tw="text-xs text-dark dark:text-light/90">
            {format(new Date(item.expiredTimestamp), 'MM/dd/yyyy, hh:mm a')}
          </span>
        </div>
        {!expired && user?.walletAddress !== item.owner && (
          <button
            style={{ visibility: item.is_tradable ? 'visible' : 'hidden' }}
            tw="h-10 flex items-center gap-1 tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
            onClick={() => setTicketToOffer(item)}
          >
            {getIcon('offer', darkMode ? '#fff' : '#000')}
            <span tw="font-semibold text-sm tracking-tight">Make offer</span>
          </button>
        )}
        {!expired &&
          user?.walletAddress === item.owner &&
          (item.is_tradable ? (
            <button
              tw="px-3.5 h-10 flex items-center gap-1 tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
              onClick={() => setTicketToAccept(item)}
            >
              {getIcon('offer', darkMode ? '#000' : '#fff')}
              <span tw="font-semibold text-sm tracking-tight">View offers</span>
            </button>
          ) : (
            <div tw="h-10" />
          ))}
        {expired &&
          (user?.walletAddress === item.owner ? (
            <button
              tw="px-3.5 h-10 flex items-center gap-1 tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
              onClick={
                onRenewPopup
                  ? () => onRenewPopup({ channel, ticket: item })
                  : () => {
                      return;
                    }
              }
            >
              {getIcon('offer', darkMode ? '#000' : '#fff')}
              <span
                style={{ textOverflow: 'ellipsis' }}
                title="Renew Channel Ticket"
                tw="font-semibold text-sm tracking-tight whitespace-nowrap overflow-hidden"
              >
                Renew Channel Ticket
              </span>
            </button>
          ) : (
            <div tw="h-10" />
          ))}
      </div>
    </div>
  );
};

export default TicketCard;
