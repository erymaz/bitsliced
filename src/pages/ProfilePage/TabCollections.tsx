import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Collection } from '../../api/api';
import CollectionCard from '../../components/CollectionCard';
import CollectionCardShimmer from '../../components/CollectionCardShimmer';
import { getIcon } from '../../components/ColoredIcon';
import MultiCarousel from '../../components/lib/multi-carousel';
import { FilterLineWidget } from '../../components/lib/StyledComponents';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, User } from '../../type.d';
import { nFormatter, shortAddress } from '../../utils';
import { alertError } from '../../utils/toast';

const TabCollections = ({ selectedUser }: { selectedUser: User | null }) => {
  const { darkMode, decreaseLoading, increaseLoading, isLoading, user } =
    useContext(UserContext);

  const [viewStyle, setViewStyle] = useState<string>('large-grid');
  const [, setCurrent] = useState<number>(0);
  const [, setShow] = useState<number>(1);
  const [myCollections, setMyCollections] = useState<CollectionData[]>([]);
  const [createdCollections, setCreatedCollections] = useState<
    CollectionData[]
  >([]);
  const [ownedCollections, setOwnedCollections] = useState<CollectionData[]>(
    []
  );

  useEffect(() => {
    if (selectedUser) {
      increaseLoading(true);
      Collection.getByCreator(selectedUser.walletAddress)
        .then((res: CollectionData[]) => {
          console.log('created collections:', res);
          setCreatedCollections(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
      increaseLoading(true);
      Collection.getByOwner(selectedUser.walletAddress)
        .then((res: CollectionData[]) => {
          console.log('owned collections:', res);
          setOwnedCollections(res);
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [selectedUser, increaseLoading, decreaseLoading]);

  const addCollections = (data: CollectionData[]) => {
    const ids = myCollections.map((item) => item._id);
    setMyCollections([
      ...myCollections,
      ...data.filter((item) => !ids.includes(item._id)),
    ]);
  };

  useEffect(() => {
    if (createdCollections && createdCollections.length > 0) {
      addCollections(createdCollections);
    }
  }, [createdCollections]);

  useEffect(() => {
    if (ownedCollections && ownedCollections.length > 0) {
      addCollections(ownedCollections);
    }
  }, [ownedCollections]);

  return (
    <div tw="mx-auto pb-10 w-full max-w-[1392px]">
      <FilterLineWidget
        count={myCollections.length}
        countLabel="of Collections"
        viewStyle={{
          onChange: setViewStyle,
          options: ['large-grid', 'list'],
          value: viewStyle,
        }}
      />
      {viewStyle === 'large-grid' && (
        <>
          <div tw="py-8 hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {isLoading
              ? [0, 1, 2, 3].map((item) => <CollectionCardShimmer key={item} />)
              : myCollections.map((item: CollectionData) => (
                  <CollectionCard
                    key={item._id}
                    editable={
                      user?.walletAddress === selectedUser?.walletAddress
                    }
                    item={item}
                  />
                ))}
          </div>
          <div tw="block md:hidden pt-[86px] md:pt-[32px] overflow-hidden">
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
              {myCollections.map((item: CollectionData) => (
                <div key={item._id} tw="px-2">
                  <CollectionCard
                    editable={
                      user?.walletAddress === selectedUser?.walletAddress
                    }
                    item={item}
                  />
                </div>
              ))}
            </MultiCarousel>
          </div>
        </>
      )}
      {viewStyle === 'list' && (
        <div tw="px-8 py-8">
          {myCollections.map((item: CollectionData) => (
            <div
              key={item._id}
              css={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr 60px' }}
              tw="py-[22px] grid items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
            >
              <div tw="flex items-center gap-5">
                <div
                  css={{
                    backgroundImage: `url(${item.collection_profile_image_url})`,
                  }}
                  tw="w-[60px] h-[60px] bg-[#0001] bg-no-repeat bg-center bg-cover rounded-full"
                />
                <div>
                  <div tw="font-semibold text-2xl tracking-tight text-dark dark:text-light/90">
                    {item.collection_name}
                  </div>
                  <div tw="text-base tracking-tight text-[#2F2F2F] dark:text-[#c1c1c1]">
                    by {shortAddress(item.collection_creator)}
                  </div>
                </div>
              </div>
              <div tw="flex flex-col gap-[5px]">
                <div tw="flex items-center gap-[7px]">
                  {getIcon('sliced', darkMode ? '#fff' : '#000')}
                  <span tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                    {item.accounting?.volume
                      ? nFormatter(item.accounting.volume)
                      : 0}
                  </span>
                </div>
                <div tw="text-sm tracking-tight text-[#8A8A8A]">Volume</div>
              </div>
              <div tw="flex flex-col gap-[5px]">
                <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                  {item.accounting?.sales
                    ? nFormatter(item.accounting.sales)
                    : 0}
                </div>
                <div tw="text-sm tracking-tight text-[#8A8A8A]">Sales</div>
              </div>
              <div tw="flex flex-col gap-[5px]">
                <div tw="flex items-center gap-[7px]">
                  {getIcon('sliced', darkMode ? '#fff' : '#000')}
                  <span tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                    {item.accounting?.avgPrice
                      ? nFormatter(item.accounting.avgPrice)
                      : 0}
                  </span>
                </div>
                <div tw="text-sm tracking-tight text-[#8A8A8A]">Avg. price</div>
              </div>
              <div tw="flex flex-col gap-[5px]">
                <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                  {item.accounting?.owners
                    ? nFormatter(item.accounting.owners)
                    : 0}
                </div>
                <div tw="text-sm tracking-tight text-[#8A8A8A]">Owners</div>
              </div>
              <div tw="flex flex-col gap-[5px]">
                <div tw="font-bold text-[23px] leading-[150%] tracking-tight text-dark dark:text-light/90">
                  {item.accounting?.items
                    ? nFormatter(item.accounting.items)
                    : 0}
                </div>
                <div tw="text-sm tracking-tight text-[#8A8A8A]">Items</div>
              </div>
              {user?.walletAddress === selectedUser?.walletAddress && (
                <Link
                  to={`/create/edit-collection/${item._id}`}
                  tw="px-3.5 h-10 flex items-center gap-[7px] text-base tracking-tight text-dark dark:text-light  bg-transparent border-2 border-[#3169FA] rounded-[100px] duration-300"
                >
                  Edit
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabCollections;
