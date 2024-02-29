import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Channel } from '../api/api';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, User } from '../type.d';
import { getTickerFromName, nFormatter, shortAddress } from '../utils';
import { alertError } from '../utils/toast';
import { getIcon } from './ColoredIcon';

const ChannelCard = (props: { data?: ChannelData; small?: boolean }) => {
  const { user } = useContext(UserContext);

  const [creator, setCreator] = useState<User | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);

  useEffect(() => {
    // console.log(props.data);
    if (props.data?._id) {
      Channel.getById(props.data._id)
        .then((res) => {
          if (res?.joinedUsers) {
            setJoinedUsers(res.joinedUsers as User[]);
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        });
    }
    if (props.data?.channel_creator) {
      Auth.getByWallet(props.data?.channel_creator).then((user: User) => {
        setCreator(user);
      });
    }
  }, [props.data]);

  return (
    <div
      title={getTickerFromName(props.data?.channel_name)}
      tw="w-auto h-auto relative rounded-lg overflow-hidden"
    >
      <div
        css={{
          backgroundImage: `url(${props.data?.channel_background_image_url})`,
        }}
        tw="pb-[150%] relative bg-white bg-center bg-cover overflow-hidden select-none z-[1] rounded-lg"
      />
      <Link to={`/channels/${props.data?._id}`}>
        <div
          css={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0) 100%)',
          }}
          tw="absolute left-0 top-0 w-full h-full z-20 p-0 md:p-2 flex flex-col justify-between rounded-lg"
        >
          <div tw="flex justify-between p-2 md:p-0 ">
            <div tw="flex flex-col px-3 py-2 text-xs text-light tracking-tight bg-dark/60 backdrop-blur-2xl rounded-md">
              <p tw="text-[10px] text-light/60">Subscription cost</p>
              <div tw="flex items-center gap-1">
                {getIcon('sliced-small', '#fff')}
                <span tw="font-medium text-sm tracking-tight text-light">
                  {nFormatter(props.data?.channel_ticket_price ?? 0, 1)}
                </span>
              </div>
            </div>
            {/* <div tw="flex flex-col px-3 py-2 text-xs text-light tracking-tight bg-dark/60 backdrop-blur-2xl rounded-md">
              <p tw="text-[10px] text-light/60">Trading vol.</p>
              <div tw="font-medium text-sm tracking-tight text-light">
                {sign(14.1)}
                {14.1}%
              </div>
            </div> */}
          </div>
          <div tw="bg-dark/60 p-3 rounded-b-md md:rounded-md backdrop-blur-2xl">
            <div tw="grid grid-flow-col auto-cols-auto gap-2 items-center justify-start">
              <div
                css={{
                  backgroundImage: `url(${props.data?.channel_profile_image_url})`,
                }}
                tw="w-8 lg:w-10 h-8 lg:h-10 relative bg-white bg-center bg-cover overflow-hidden z-0 rounded-full"
              >
                <picture tw="absolute top-0 left-0 w-full h-full backdrop-blur-lg rounded-full z-10">
                  <source
                    srcSet={props.data?.channel_profile_image_url}
                    tw="w-full h-full object-contain object-center"
                    type="image/avif"
                  />
                  <source
                    srcSet={props.data?.channel_profile_image_url}
                    tw="w-full h-full object-contain object-center"
                    type="image/webp"
                  />
                  <img
                    alt=""
                    src={props.data?.channel_profile_image_url}
                    tw="w-full h-full object-contain object-center"
                  />
                </picture>
              </div>
              <div tw="w-full font-semibold text-sm md:text-base tracking-tight text-light truncate">
                {props.data?.channel_name}{' '}
              </div>
            </div>
            <div tw="flex items-center gap-1 py-1">
              <div tw="text-sm tracking-tight text-light/60 max-w-[calc(0.75 * 100%)] truncate">
                by{' '}
                <span tw="font-semibold text-sm tracking-tight text-light truncate">
                  {creator?.name}
                </span>{' '}
              </div>
              <div tw="text-xs text-light/60">
                ({shortAddress(props.data?.channel_creator)})
              </div>
            </div>
            <div tw="text-sm tracking-tight text-light/90 pb-2">
              {nFormatter(joinedUsers.length, 2)}
              <span tw="text-light/60 text-sm tracking-tight">
                {' '}
                user
                {joinedUsers.length > 1 ? 's' : ''} joined
              </span>
            </div>
            {user?.walletAddress &&
            joinedUsers
              .map((u) => u.walletAddress)
              .includes(user?.walletAddress) ? (
              <Link
                to={`/channels/${props.data?._id}`}
                tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight font-medium rounded-lg bg-light/50 backdrop-blur-md text-light opacity-50"
              >
                <span>Joined</span>
              </Link>
            ) : user?.walletAddress === props.data?.channel_owner ? (
              <Link
                to={`/create/edit-channel/${props.data?._id}`}
                tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight font-medium rounded-lg bg-green-500/80 backdrop-blur-md text-light"
              >
                {getIcon('edit', '#fff')}
                <span>Edit</span>
              </Link>
            ) : (
              <Link
                to={`/channels/${props.data?._id}`}
                tw="px-3.5 h-10 flex items-center gap-[7px] tracking-tight font-medium rounded-lg bg-light/40 backdrop-blur-md text-light"
              >
                {getIcon('add', '#fff')}
                <span>Join</span>
              </Link>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ChannelCard;
