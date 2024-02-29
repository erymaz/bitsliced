import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import ChannelCard from '../../components/ChannelCard';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';

const MintChannelSuccessPage = () => {
  const { createdChannel, darkMode, user } = useContext(UserContext);

  return (
    <div tw="mx-auto py-8 w-full">
      <h2 tw="mx-auto pb-16 w-full max-w-[814px] font-semibold text-[60px] tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Congratulations your Channel has been created!
      </h2>
      <div>
        <div tw="mx-auto w-full max-w-[377px] rounded-lg overflow-hidden px-4">
          <ChannelCard data={createdChannel} />
        </div>
      </div>
      <div tw="pt-10 pb-[100px] flex justify-center items-center gap-[42px]">
        <Link
          to={`/profile/${user?._id}?tab=created-channels`}
          tw="flex items-center gap-1 hover:opacity-75"
        >
          <span tw="font-semibold text-base text-dark dark:text-light ">
            View Channel
          </span>
          <div tw="-rotate-90 scale-75">
            {getIcon('dropdown', darkMode ? '#fff' : '#000')}
          </div>
        </Link>
        <Link
          to={`/profile/${user?._id}?tab=created-channels`}
          tw="flex items-center gap-1 hover:opacity-75"
        >
          <span tw="font-semibold text-base text-dark dark:text-light ">
            List of created Channels
          </span>
          <div tw="-rotate-90 scale-75">
            {getIcon('dropdown', darkMode ? '#fff' : '#000')}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MintChannelSuccessPage;
