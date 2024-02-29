import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Collection } from '../../api/api';
import imgCard1 from '../../assets/images/hero-slide-card1.jpg';
import imgTab3 from '../../assets/images/tab3.jpg';
// import imgUser1 from '../../assets/images/user1.jpg';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, User } from '../../type.d';
import { shortAddress } from '../../utils';
import { alertError } from '../../utils/toast';

const HomeHeroSection = () => {
  const { darkMode, user } = useContext(UserContext);

  const [selecetedTab, setSelectedTab] = useState<number>(0);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [creator, setCreator] = useState<User | null>(null);

  const prevTab = () => {
    setSelectedTab((preValue) => (preValue > 0 ? preValue - 1 : 0));
  };

  const NextTab = () => {
    setSelectedTab((preValue) =>
      preValue < collections.length - 1 ? preValue + 1 : 0
    );
  };

  useEffect(() => {
    let tmr: NodeJS.Timer;
    Collection.search({
      categories: [],
      limit: 8,
      page: 1,
      sortStr: 'Trending',
    })
      .then((res) => {
        if (res?.collections?.length > 0) {
          setCollections(res.collections);
          setSelectedTab(0);
          tmr = setInterval(() => {
            setSelectedTab((preValue) =>
              preValue < res.collections.length - 1 ? preValue + 1 : 0
            );
          }, 5000);
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      });
    return () => {
      clearInterval(tmr);
    };
  }, []);

  useEffect(() => {
    if (collections?.length > 0) {
      Auth.getByWallet(collections[selecetedTab].collection_creator)
        .then((res) => {
          if (res) {
            setCreator(res);
          }
        })
        .catch((e) => {
          console.error(e);
          alert(e.toString());
        });
    }
  }, [collections, selecetedTab]);

  return (
    <section tw="w-full">
      <div tw="pt-8 flex flex-col lg:flex-row justify-center items-center">
        <div tw="flex justify-start px-4 lg:px-8 w-full lg:w-[50%]">
          <div tw="m-auto max-w-xl">
            <h1 tw="text-3xl md:text-5xl tracking-tight leading-[110%] font-semibold text-dark dark:text-light/90">
              Trade &amp; Slice NFTs and interact with Channels.
            </h1>
            <div tw="pt-[30px] lg:pt-12 flex flex-row lg:flex-col items-center lg:items-start gap-x-3.5 gap-y-6 lg:gap-8 flex-wrap">
              <p tw="inline-block lg:block whitespace-nowrap">
                <Link
                  to="/explore"
                  tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark"
                >
                  Explore
                </Link>

                <span tw="hidden lg:inline pl-2.5 text-base text-dark dark:text-light/90">
                  the Sliced NFT marketplace.
                </span>
              </p>
              <p tw="inline-block lg:block whitespace-nowrap">
                <span tw="hidden lg:inline pr-2.5 text-base text-dark dark:text-light/90">
                  Start to
                </span>

                <Link
                  to="/create"
                  tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
                >
                  Create
                </Link>

                <span tw="hidden lg:inline pl-2.5 text-base text-dark dark:text-light/90">
                  your own NFTs, Collection or a channel.
                </span>
              </p>
              <p tw="inline-block lg:block whitespace-nowrap">
                <Link
                  to={user ? `/profile/${user?._id}` : '/join'}
                  tw="h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg font-medium text-dark dark:text-light/90 bg-transparent border-2 border-gray-500 px-3.5"
                >
                  List
                </Link>
                <span tw="hidden lg:inline pl-2.5 text-base text-dark dark:text-light/90">
                  your favorite NFT today.
                </span>
              </p>
            </div>
            <div tw="w-[100px] h-10 lg:h-[60px] border-b-2 border-black/10 dark:border-white/10" />
            <div tw="pt-5">
              <Link to="" tw="pb-5 flex gap-3 items-center">
                {getIcon('play', darkMode ? '#fff' : '#000')}
                <span tw="font-semibold text-base text-dark dark:text-light/90">
                  How to use the Sliced app.
                </span>
              </Link>
              <Link to="" tw="flex gap-3 items-center">
                {getIcon('play', darkMode ? '#fff' : '#000')}
                <span tw="font-semibold text-base text-dark dark:text-light/90">
                  Why create a Sliced account?
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div tw="pt-[106px] lg:pt-0 w-full lg:w-[50%] overflow-hidden">
          <div tw="w-auto h-[71px] flex items-center gap-[17px] translate-x-[42px] lg:translate-x-0 translate-y-[-60px] lg:translate-y-0 origin-bottom-left">
            <button onClick={() => prevTab()}>
              {getIcon('back', darkMode ? '#fff' : '#000')}
            </button>
            <button onClick={() => NextTab()}>
              {getIcon('arrow', darkMode ? '#fff' : '#000')}
            </button>
          </div>
          <div tw="flex flex-col lg:flex-row">
            <div tw="px-9 lg:px-0 flex flex-row lg:flex-col justify-center lg:justify-start translate-y-[-70px] lg:translate-y-0">
              {collections.map((item, index) => (
                <div
                  key={`carousel-${item._id}`}
                  css={{
                    borderColor:
                      selecetedTab >= index
                        ? darkMode
                          ? '#fff'
                          : '#000'
                        : 'transparent',
                  }}
                  tw="border-t-2 lg:border-t-0 lg:border-l-2"
                >
                  <img
                    alt="tab"
                    css={{
                      opacity: selecetedTab === index ? 1 : 0.3,
                    }}
                    src={item.collection_profile_image_url ?? imgTab3}
                    tw="w-7 h-7 md:w-10 md:h-10 bg-no-repeat bg-center bg-cover cursor-pointer"
                    onClick={() => setSelectedTab(index)}
                  />
                </div>
              ))}
            </div>
            <div
              css={{
                backgroundImage: `url(${
                  collections[selecetedTab]?.collection_background_image_url ??
                  '/images/hero-bg.jpg'
                })`,
              }}
              tw="relative w-full h-96 sm:h-[500px] bg-center bg-cover bg-no-repeat transition-all duration-500 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-dark/20 dark:after:bg-dark/50 after:backdrop-blur-sm after:z-10"
            >
              <div tw="absolute w-[70%] h-[70%] left-1/2 translate-x-[-50%] top-[-70px] min-w-full sm:min-w-[384px] min-h-full sm:min-h-[384px] z-20">
                <Link
                  to={`/collection/${collections[selecetedTab]?._id}`}
                  tw="w-full flex flex-wrap justify-center"
                >
                  {collections[selecetedTab]?.collection_profile_image_url ? (
                    <div tw="relative">
                      <div tw="absolute left-4 top-4 px-4 py-2 flex items-center gap-[9px] bg-black/30 backdrop-blur-lg z-30 rounded-lg">
                        {getIcon('traitsniper', '#fff')}
                        <span
                          css={{ textShadow: '0 0 2px #0008' }}
                          tw="font-semibold text-base tracking-tight leading-[150%] text-light/90"
                        >
                          Trending Collection
                        </span>
                      </div>
                      <div
                        css={{
                          backgroundImage: `url(${collections[selecetedTab]?.collection_profile_image_url})`,
                        }}
                        tw="relative min-w-full min-h-full w-80 h-80 sm:w-96 sm:h-96 bg-white dark:bg-black bg-no-repeat bg-center bg-cover rounded-xl z-20"
                      />
                    </div>
                  ) : (
                    <div tw="relative">
                      <div tw="absolute left-4 top-4 px-4 py-2 flex items-center gap-[9px] bg-black/30 backdrop-blur-lg z-30 rounded-lg">
                        {getIcon('traitsniper', '#fff')}
                        <span
                          css={{ textShadow: '0 0 2px #0008' }}
                          tw="font-semibold text-base tracking-tight leading-[150%] text-light/90"
                        >
                          Trending Collection
                        </span>
                      </div>
                      <img
                        alt="card"
                        src={imgCard1}
                        tw="relative w-80 h-80 sm:w-96 sm:h-96 bg-white dark:bg-black bg-no-repeat bg-center bg-cover rounded-xl z-20"
                      />
                    </div>
                  )}
                  <div tw="bg-light/80 dark:bg-dark/80 relative mx-auto -mt-6 w-72 sm:w-[370px] px-2 sm:px-4 pt-8 sm:pt-10 pb-2 sm:pb-4 flex justify-between items-center backdrop-blur-lg rounded-xl z-10">
                    <div tw="flex items-center gap-[14px] overflow-hidden">
                      <div
                        css={{
                          backgroundImage: `url(${creator?.profile_image_url})`,
                        }}
                        tw="w-[48px] min-w-[48px] h-[48px] lg:w-[60px] lg:min-w-[60px] lg:h-[60px] bg-white/50 dark:bg-black/50 backdrop-blur-md bg-no-repeat bg-center bg-cover rounded-full transition-all duration-300"
                      />
                      <div tw="overflow-hidden">
                        <div tw="w-full font-semibold text-lg lg:text-xl pr-1 tracking-tight whitespace-nowrap overflow-hidden text-dark dark:text-light overflow-ellipsis">
                          {collections[selecetedTab]?.collection_name}
                        </div>
                        <div tw="text-sm lg:text-base pr-1 tracking-tight whitespace-nowrap overflow-hidden text-gray-500 overflow-ellipsis">
                          by{' '}
                          <Link
                            to={`/profile/${creator?._id}`}
                            tw="text-sm lg:text-base tracking-tight whitespace-nowrap overflow-hidden text-dark dark:text-light"
                          >
                            {creator?.name} (
                            {shortAddress(creator?.walletAddress, 2, 4)})
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/collection/${collections[selecetedTab]?._id}`}
                      tw="min-w-[32px] lg:min-w-[40px] h-[32px] lg:h-[40px] flex justify-center items-center bg-dark dark:bg-light rounded-full"
                    >
                      {getIcon('arrow', darkMode ? '#000' : '#fff')}
                    </Link>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
