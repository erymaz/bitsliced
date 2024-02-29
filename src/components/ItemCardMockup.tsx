import 'twin.macro';

import { useContext } from 'react';
import { Link } from 'react-router-dom';

import iconVerified from '../assets/svgs/icon-verified.svg';
import { UserContext } from '../contexts/UserContext';
import { IItem } from '../type.d';
import { getIcon } from './ColoredIcon';

const ItemCardMockup = ({
  item,
  openPurchasePopup,
}: {
  item: IItem | null;
  openPurchasePopup: (item: IItem) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  return item ? (
    <div
      key={item.id}
      css={{ boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.1)' }}
      tw="rounded-lg dark:bg-[#fff1]"
    >
      <Link to={`/item/${item.id}`}>
        <div
          css={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.179474) 29.92%, rgba(0, 0, 0, 0.189) 73.96%, rgba(0, 0, 0, 0.3) 100%), url(/images/${item.pic})`,
          }}
          tw="pt-[100%] relative bg-center bg-cover rounded-lg"
        >
          <div tw="absolute left-2.5 bottom-2.5 flex items-center">
            {item.joinedUsers?.map((u) => (
              <div
                key={u}
                css={{ backgroundImage: `url(/images/${u})` }}
                tw="mr-[-14px] w-[30px] h-[30px] box-border bg-no-repeat bg-center bg-cover border-2 border-[#666] rounded-full"
              />
            ))}
            <span tw="ml-[21px] text-[10px] tracking-tight">
              Joined by {item.joinedUsers?.length} users
            </span>
          </div>
        </div>
      </Link>
      <div tw="p-2.5">
        <div tw="flex items-center gap-1.5 text-[10px] tracking-tight text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
          {item.collectionName}
          {item.collectionVerified && (
            <img alt="verified" src={iconVerified} width={11} />
          )}
        </div>
        <Link to={`/item/${item.id}`}>
          <div tw="pt-1 font-semibold text-xs tracking-tight text-dark dark:text-light/90">
            {item.itemName}
          </div>
        </Link>
        <div tw="pt-2.5 flex items-center gap-0.5">
          {getIcon('sliced-small', darkMode ? '#fff' : '#000')}
          <span tw="font-semibold text-sm tracking-tight text-dark dark:text-light/90">
            {item.price}
          </span>
        </div>
        <div tw="pt-[22px]">
          <button
            tw="px-4 w-full h-10 flex items-center gap-[7px] bg-[#3169FA] rounded-[100px]"
            onClick={() => openPurchasePopup(item)}
          >
            {getIcon('wallet', '#fff')}
            <span tw="font-semibold text-base tracking-tight text-light/90">
              Buy now
            </span>
          </button>
        </div>
        <div tw="pt-2.5">
          <button tw="px-4 w-full h-10 flex items-center gap-[7px]">
            {getIcon('offer', '#3169FA')}
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light">
              Make offer
            </span>
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ItemCardMockup;
