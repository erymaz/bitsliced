import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

// import CollectionCard from '../../components/CollectionCard';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';

const CreateCollectionSuccessPage = () => {
  const { darkMode } = useContext(UserContext);
  const { createdCollection } = useContext(UserContext);

  return (
    <div tw="mx-auto py-8 w-full">
      <h2 tw="mx-auto pb-32 w-full max-w-[814px] font-semibold text-[60px] tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Congratulations {createdCollection?.collection_name} has been created!
      </h2>
      <div
        css={{
          backgroundImage: `url(${createdCollection?.collection_background_image_url})`,
        }}
        tw="h-[280px] flex justify-center bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover"
      >
        <div tw="mt-[-86px] w-[200px]">
          <div
            css={{
              backgroundImage: `url(${createdCollection?.collection_profile_image_url})`,
            }}
            tw="w-[200px] h-[200px] rounded-full bg-[#0001] dark:bg-[#fff1] bg-no-repeat bg-center bg-cover backdrop-blur-xl"
          />
          <div tw="pt-[64px]">
            <Link
              to={`/collection/${createdCollection?._id}`}
              tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
            >
              <span tw="text-base tracking-tight">View Collection</span>
              <div tw="-rotate-90 scale-75">
                {getIcon('dropdown', darkMode ? '#000' : '#fff')}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCollectionSuccessPage;
