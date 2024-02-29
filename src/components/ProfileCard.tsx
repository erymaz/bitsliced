import 'twin.macro';

import { useContext } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Link } from 'react-router-dom';

import { UserContext } from '../contexts/UserContext';
import { User } from '../type.d';
import { shortAddress } from '../utils';
import { alertInfo } from '../utils/toast';
import { getIcon } from './ColoredIcon';

const ProfileCard = ({
  editable,
  landscape,
  profile,
}: {
  profile: User;
  editable?: boolean;
  landscape?: boolean;
}) => {
  const { darkMode, user } = useContext(UserContext);

  return (
    <div
      css={{
        boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)',
        display: landscape ? 'flex' : 'block',
        maxWidth: landscape ? 'max-content' : 'unset',
      }}
      tw="bg-white dark:bg-[#fff2] rounded-lg"
    >
      <Link to={`/profile/${profile._id}`}>
        <div
          css={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0.189) 73.96%, rgba(0, 0, 0, 0.3) 100%), url(${profile.background_image_url})`,
            minWidth: landscape ? 240 : 'unset',
          }}
          tw="pt-[100%] relative bg-center bg-cover rounded-lg"
        >
          <div
            css={{
              backgroundImage: `url(${profile.profile_image_url})`,
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
            <Link to={`/profile/${profile._id}`} tw="overflow-hidden">
              <div tw="flex items-center gap-[7px] overflow-hidden">
                <span
                  css={{ textOverflow: 'ellipsis' }}
                  tw="font-semibold text-base tracking-tight capitalize text-dark dark:text-light/90 whitespace-nowrap overflow-hidden"
                >
                  {profile.name}
                </span>
                {profile.verified && getIcon('verified', '#3169FA')}
              </div>
            </Link>
            <CopyToClipboard
              text={profile.walletAddress ?? ''}
              onCopy={() => alertInfo('Copied.')}
            >
              <div tw="whitespace-nowrap cursor-pointer">
                <span
                  css={{ textOverflow: 'ellipsis' }}
                  title={profile.walletAddress}
                  tw="text-sm tracking-tight text-dark dark:text-light/90 whitespace-nowrap overflow-hidden"
                >
                  {shortAddress(profile.walletAddress, 2, 2)}
                </span>
              </div>
            </CopyToClipboard>
            {landscape && (
              <div tw="pt-4">
                <Link
                  to={`/profile/${profile._id}`}
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light hover:opacity-80 transition-all duration-200"
                >
                  {getIcon('views', darkMode ? '#000' : '#fff')}
                  <span tw="text-[17px] text-light dark:text-dark">
                    View Profile
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
        {(editable || user?.walletAddress === profile?.walletAddress) && (
          <div>
            <Link
              title="Edit collection"
              to={`/profile/${profile._id}/edit`}
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

export default ProfileCard;
