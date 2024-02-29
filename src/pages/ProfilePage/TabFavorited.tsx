import 'twin.macro';

import { useState } from 'react';

import ItemCardMockup from '../../components/ItemCardMockup';
import MultiCarousel from '../../components/lib/multi-carousel';
import { IItem } from '../../type.d';

const items: IItem[] = [
  {
    collectionName: '[Collection Name]',
    id: '100001',
    itemName: '[NFT Name] #6134',
    pic: 'profile/fav-item1.jpg',
    price: '12.31K',
  },
  {
    collectionName: '[Collection Name]',
    id: '100002',
    itemName: '[NFT Name] #6134',
    pic: 'profile/fav-item2.jpg',
    price: '12.31K',
  },
  {
    collectionName: '[Collection Name]',
    collectionVerified: true,
    id: '100003',
    itemName: '[NFT Name] #6134',
    pic: 'profile/fav-item3.jpg',
    price: '12.31K',
  },
  {
    collectionName: '[Collection Name]',
    id: '100004',
    itemName: '[NFT Name] #6134',
    pic: 'profile/fav-item4.jpg',
    price: '12.31K',
  },
  {
    collectionName: '[Collection Name]',
    id: '100005',
    itemName: '[NFT Name] #6134',
    pic: 'profile/fav-item5.jpg',
    price: '12.31K',
  },
];

const TabFavorited = () => {
  const [current, setCurrent] = useState<number>(0);
  const [show, setShow] = useState<number>(1);

  return (
    <div tw="mx-auto w-full">
      <div tw="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {items.map((item) => (
          <ItemCardMockup
            key={item.id}
            item={item}
            openPurchasePopup={() => {
              return;
            }}
          />
        ))}
      </div>
      <div tw="block md:hidden pt-[60px] overflow-hidden">
        <MultiCarousel
          breakpoints={[
            { 1400: 6 },
            { 1200: 5 },
            { 992: 4 },
            { 768: 3 },
            { 600: 2 },
            { 0: 1 },
          ]}
          setCurrent={setCurrent}
          setShow={setShow}
          show={4}
        >
          {items.map((item: IItem) => (
            <div key={item.id} tw="px-2">
              <ItemCardMockup
                key={item.id}
                item={item}
                openPurchasePopup={() => {
                  return;
                }}
              />
            </div>
          ))}
        </MultiCarousel>
      </div>
    </div>
  );
};

export default TabFavorited;
