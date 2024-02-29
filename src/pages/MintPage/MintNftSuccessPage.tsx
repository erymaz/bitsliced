import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { getIcon } from '../../components/ColoredIcon';
import ItemCard from '../../components/ItemCard';
import { UserContext } from '../../contexts/UserContext';

const MintNftSuccessPage = () => {
  const { createdNft, darkMode, user } = useContext(UserContext);

  return (
    <div tw="mx-auto py-8 w-full">
      <h2 tw="mx-auto pb-16 w-full max-w-[814px] font-semibold text-[60px] tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Congratulations your NFT has been created!
      </h2>
      <div tw="bg-no-repeat bg-center">
        <div tw="mx-auto w-full max-w-[280px] rounded-lg overflow-hidden">
          <ItemCard
            data={createdNft ? { ...createdNft, noAction: true } : null}
          />
        </div>
      </div>
      <div tw="pt-10 pb-[100px] flex justify-center items-center gap-[42px]">
        <Link
          to={`/item/${createdNft?._id}`}
          tw="flex items-center gap-1 hover:opacity-75"
        >
          <span tw="font-semibold text-base text-dark dark:text-light ">
            View Item
          </span>
          <div tw="-rotate-90 scale-75">
            {getIcon('dropdown', darkMode ? '#fff' : '#000')}
          </div>
        </Link>
        <Link
          to={`/profile/${user?._id}?tab=items`}
          tw="flex items-center gap-1 hover:opacity-75"
        >
          <span tw="font-semibold text-base text-dark dark:text-light ">
            List of created items
          </span>
          <div tw="-rotate-90 scale-75">
            {getIcon('dropdown', darkMode ? '#fff' : '#000')}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default MintNftSuccessPage;
