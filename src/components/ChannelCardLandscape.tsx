import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth } from '../api/api';
import { UserContext } from '../contexts/UserContext';
import { ChannelData, User } from '../type.d';
import { shortAddress } from '../utils';
import { alertError } from '../utils/toast';
import { getIcon } from './ColoredIcon';

const ChannelCardLandscape = ({
  channel,
  editable,
  landscape,
}: {
  channel: ChannelData;
  editable?: boolean;
  landscape?: boolean;
}) => {
  const { darkMode, user } = useContext(UserContext);

  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    Auth.getByWallet(channel.channel_owner)
      .then((res) => {
        if (res) {
          setOwner(res as User);
        }
      })
      .catch((e) => {
        alertError(e.toString());
      });
  }, [channel]);

  return (
    <div
      css={{
        boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)',
        display: landscape ? 'flex' : 'block',
        maxWidth: landscape ? 'max-content' : 'unset',
      }}
      tw="bg-white dark:bg-[#fff2] rounded-lg"
    >
      <Link to={`/channels/${channel._id}`}>
        <div
          css={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0.189) 73.96%, rgba(0, 0, 0, 0.3) 100%), url(${channel.channel_background_image_url})`,
            minWidth: landscape ? 240 : 'unset',
          }}
          tw="pt-[100%] relative bg-center bg-cover rounded-lg"
        >
          <div
            css={{
              backgroundImage: `url(${channel.channel_profile_image_url})`,
              bottom: landscape ? '50%' : -60,
              boxShadow: landscape ? '0 1px 60px #000' : 'unset',
              height: landscape ? 120 : 80,
              left: landscape ? '50%' : 10,
              minWidth: landscape ? 120 : 80,
              transform: landscape ? 'translate(-50%, 30%)' : 'unset',
              width: landscape ? 120 : 80,
            }}
            tw="absolute bg-[#fff] border-2 border-white rounded-full bg-no-repeat bg-center bg-cover z-20 backdrop-blur-xl"
          />
        </div>
      </Link>
      <div
        css={{ paddingLeft: landscape ? 10 : 100 }}
        tw="pt-1 pb-2.5 pr-2.5 flex justify-between items-center"
      >
        <div tw="flex items-center gap-2.5 overflow-hidden">
          <div tw="overflow-hidden">
            <Link to={`/channels/${channel._id}`} tw="overflow-hidden">
              <div tw="flex items-center gap-[7px] overflow-hidden">
                <span
                  css={{ textOverflow: 'ellipsis' }}
                  tw="font-semibold text-base tracking-tight capitalize text-dark dark:text-light/90 whitespace-nowrap overflow-hidden"
                >
                  {channel.channel_name}
                </span>
                {owner?.verified && getIcon('verified', '#3169FA')}
              </div>
            </Link>
            <Link to={`/profile/${owner?._id}`} tw="overflow-hidden">
              <div tw="whitespace-nowrap">
                <span tw="text-sm text-[#8A8A8A] tracking-tight">by</span>{' '}
                <span
                  css={{ textOverflow: 'ellipsis' }}
                  title={`${owner?.name} (${channel.channel_owner})`}
                  tw="text-sm tracking-tight text-dark dark:text-light/90 whitespace-nowrap overflow-hidden"
                >
                  {owner?.name} ({shortAddress(channel.channel_owner, 1, 2)})
                </span>
              </div>
            </Link>
            {landscape && (
              <div tw="pt-4">
                <Link
                  to={`/channels/${channel._id}`}
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light hover:opacity-80 transition-all duration-200"
                >
                  {getIcon('views', darkMode ? '#000' : '#fff')}
                  <span tw="text-[17px] text-light dark:text-dark">
                    View Channel
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
        {(editable || user?.walletAddress === owner?.walletAddress) && (
          <div>
            <Link
              title="Edit collection"
              to={`/create/edit-channel/${channel._id}`}
              tw="px-1 h-10 flex items-center gap-[7px] text-base tracking-tight bg-transparent"
            >
              {getIcon('edit', darkMode ? '#fff' : '#000')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelCardLandscape;
