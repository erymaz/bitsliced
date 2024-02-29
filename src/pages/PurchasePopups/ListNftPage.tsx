import 'twin.macro';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import '../../components/DateRange.scss';

import { useContext, useEffect, useState } from 'react';
import { StaticRange } from 'react-date-range';
import { useNavigate, useParams } from 'react-router-dom';

import { Collection, Nft } from '../../api/api';
import BackLink from '../../components/BackLink';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, NftData } from '../../type.d';
import { getMimeType } from '../../utils';
import { alertError } from '../../utils/toast';
import ListAuctionSection from './ListAuctionSection';
import ListFixedPriceSection from './ListFixedPriceSection';

const createStaticRange = (param: {
  label: string;
  days?: number;
  weeks?: number;
  months?: number;
}): StaticRange => {
  const start = new Date();
  const end = new Date(start);
  if (param.days) {
    end.setDate(end.getDate() + param.days);
  } else if (param.weeks) {
    end.setDate(end.getDate() + param.weeks * 7);
  } else if (param.months) {
    end.setMonth(end.getMonth() + param.months);
  }

  return {
    hasCustomRendering: false,
    isSelected: () => true,
    label: param.label,
    range: () => ({
      endDate: end,
      startDate: start,
    }),
  };
};

export const availableRanges: StaticRange[] = [
  createStaticRange({ days: 1, label: '24 Hours' }),
  createStaticRange({ days: 3, label: '3 Days' }),
  createStaticRange({ label: '1 Week', weeks: 1 }),
  createStaticRange({ label: '2 Weeks', weeks: 2 }),
  createStaticRange({ label: '3 Weeks', weeks: 3 }),
  createStaticRange({ label: '1 Month', months: 1 }),
  createStaticRange({ label: '2 Months', months: 2 }),
  createStaticRange({ label: '3 Months', months: 3 }),
];

const ListNftPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { darkMode, decreaseLoading, increaseLoading } =
    useContext(UserContext);

  const [nftData, setNftData] = useState<NftData | null>(null);
  const [type, setType] = useState<number>(0);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [mimeType, setMimeType] = useState<string>('');

  useEffect(() => {
    if (params.nft) {
      increaseLoading(true);
      Nft.getById(params.nft)
        .then((res: NftData) => {
          if (res) {
            setNftData(res);
            setMimeType(getMimeType(res.image));
            if (res.collection_id) {
              Collection.getById(res.collection_id).then(
                (collection: CollectionData) => {
                  if (collection) {
                    setCollection(collection);
                  }
                }
              );
            }
          }
        })
        .catch((e) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => {
          decreaseLoading(true);
        });
    }
  }, [params.nft, increaseLoading, decreaseLoading]);

  return (
    <div tw="mx-auto px-4 py-8 w-full max-w-[1392px]">
      <div tw="inline-block">
        <BackLink handleBack={() => navigate(-1)} />
      </div>
      <h2 tw="font-semibold text-xl capitalize tracking-tight leading-[150%] text-center text-[#2F2F2F] dark:text-[#e1e1e1]">
        List {nftData?.name}
      </h2>
      <div tw="mx-auto pt-4 md:pt-8 pb-8 w-full max-w-[1034px] grid grid-cols-1 md:grid-cols-[1fr 255px] gap-6">
        <div tw="order-last md:order-first">
          <div tw="flex flex-col gap-3.5">
            <div tw="p-3.5 bg-white dark:bg-[#fff1] rounded-lg">
              <h3 tw="pb-1 flex items-center gap-2.5">
                <span tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                  Type
                </span>
                {getIcon('info', darkMode ? '#fff' : '#000')}
              </h3>
              <div tw="grid grid-cols-2 gap-2.5">
                <div
                  css={{
                    backgroundColor:
                      type === 0
                        ? 'rgba(49, 105, 250, 0.15)'
                        : darkMode
                        ? '#fff2'
                        : 'rgba(245, 245, 247, 0.5)',
                    borderColor:
                      type === 0
                        ? 'rgba(49, 105, 250, 0.15)'
                        : 'rgba(0, 0, 0, 0.15)',
                  }}
                  tw="px-2 h-[46px] flex justify-center items-center text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border rounded-[7px] cursor-pointer"
                  onClick={() => setType(0)}
                >
                  Fixed Price
                </div>
                <div
                  css={{
                    backgroundColor:
                      type === 1
                        ? 'rgba(49, 105, 250, 0.15)'
                        : darkMode
                        ? '#fff2'
                        : 'rgba(245, 245, 247, 0.5)',
                    borderColor:
                      type === 1
                        ? 'rgba(49, 105, 250, 0.15)'
                        : 'rgba(0, 0, 0, 0.15)',
                  }}
                  tw="px-2 h-[46px] flex justify-center items-center text-base tracking-tight leading-[150%] text-dark dark:text-light/90 border rounded-[7px] cursor-pointer"
                  onClick={() => setType(1)}
                >
                  Timed Auction
                </div>
              </div>
            </div>
            {type === 0 ? <ListFixedPriceSection /> : <ListAuctionSection />}
          </div>
        </div>
        <div tw="relative">
          <div tw="h-auto bg-white dark:bg-[#fff1] rounded-lg sticky top-24">
            <div
              css={{
                backgroundImage: mimeType.startsWith('video')
                  ? 'none'
                  : `url(${nftData?.image})`,
              }}
              tw="relative pt-[100%] bg-[#D9D9D9] bg-no-repeat bg-center bg-contain rounded-lg overflow-hidden"
            >
              {mimeType.startsWith('video') && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  tw="absolute left-0 top-0 w-full h-full object-contain z-10"
                >
                  <source src={nftData?.image} type={mimeType} />
                </video>
              )}
            </div>
            <div tw="px-2.5 pt-2.5 pb-[25px]">
              <div tw="flex items-center gap-1.5 text-[10px] tracking-tight capitalize text-[rgba(0, 0, 0, 0.77)] dark:text-[rgba(255, 255, 255, 0.77)]">
                {collection?.collection_name}
              </div>
              <div>
                <div tw="pt-1 font-semibold text-xs tracking-tight capitalize text-dark dark:text-light/90">
                  {nftData?.name}
                </div>
              </div>
              {/* <div tw="pt-2.5 flex items-center gap-0.5">
                {getIcon('sliced-small', '#000')}
                <span tw="font-semibold text-sm tracking-tight text-dark">
                  0
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListNftPage;
