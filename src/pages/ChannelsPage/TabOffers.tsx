import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Channeloffer } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, ChannelOfferData, OrderStatus, User } from '../../type.d';
import AcceptChannelOfferPopup from '../PurchasePopups/AcceptChannelOfferPopup';

const OfferItem = ({
  channel,
  item,
  selectOffer,
  setBuyer,
}: {
  item: ChannelOfferData;
  channel?: ChannelData;
  selectOffer: () => void;
  setBuyer: (buyer: User) => void;
}) => {
  const { darkMode } = useContext(UserContext);

  const [buyer, _setBuyer] = useState<User | null>(null);

  useEffect(() => {
    if (item.buyer) {
      Auth.getByWallet(item.buyer).then((res) => {
        if (res) {
          _setBuyer(res);
          setBuyer(res);
        }
      });
    }
  }, [item.buyer]);

  useEffect(() => {
    console.log(item);
  }, [item]);

  return (
    <div
      css={{ gridTemplateColumns: '' }}
      tw="py-4 grid grid-cols-[3fr 1fr 1fr 1.4fr] md:grid-cols-[3fr 1fr 1fr 1.4fr] gap-2 items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
    >
      <div tw="flex items-center flex-wrap md:flex-nowrap gap-3.5">
        <Link title={buyer?.name} to={`/profile/${buyer?._id}`}>
          <div
            css={{ backgroundImage: `url(${buyer?.profile_image_url})` }}
            tw="w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-full"
          />
        </Link>
        <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          Offer received by{' '}
          <Link to={`/profile/${buyer?._id}`} tw="font-semibold border-b">
            {buyer?.name}
          </Link>{' '}
          for {channel?.channel_name}
        </span>
        <div
          css={{
            backgroundImage: `url(${channel?.channel_profile_image_url})`,
          }}
          tw="w-[80px] min-w-[80px] h-[40px] bg-no-repeat bg-center bg-cover rounded-[8px]"
        />
      </div>
      <div>
        <div tw="font-semibold text-base text-dark dark:text-light/90">
          {new Date(item.startTime).toLocaleDateString()}-
          {new Date(item.endTime).toLocaleDateString()}
        </div>
        <div tw="pt-1 text-[14px] text-gray-500 ">Duration</div>
      </div>
      <div>
        <div tw="flex items-center gap-[4px] font-semibold text-base text-dark dark:text-light/90">
          {getIcon('sliced', darkMode ? '#fff' : '#000')} {item.price}
        </div>
        <div tw="pt-1 text-[14px] text-gray-500 ">Offer Amount</div>
      </div>
      <div tw="flex justify-center items-center gap-3.5 flex-wrap md:flex-nowrap">
        {item.status === OrderStatus.PENDING && (
          <>
            <button
              tw="px-6 h-[46px] flex justify-center items-center font-semibold text-base text-green-500 bg-[rgba(53, 206, 50, 0.2)] border border-green-500 rounded-[10px]"
              onClick={() => {
                selectOffer();
              }}
            >
              Accept
            </button>
            <button
              tw="px-6 h-[46px] flex justify-center items-center font-semibold text-base text-green-500 bg-[rgba(53, 206, 50, 0.2)] border border-green-500 rounded-[10px]"
              onClick={() => {
                return;
              }}
            >
              Decline
            </button>
          </>
        )}
        {item.status === OrderStatus.ACCEPTED && (
          <div tw="px-6 h-[46px] flex justify-center items-center font-semibold text-base text-green-500">
            Accepted
          </div>
        )}
        {item.status === OrderStatus.CANCELED && (
          <div tw="px-6 h-[46px] flex justify-center items-center font-semibold text-base text-green-500">
            N/A
          </div>
        )}
      </div>
    </div>
  );
};

const TabOffers = ({ channel }: { channel?: ChannelData }) => {
  const { darkMode } = useContext(UserContext);

  const [offers, setOffers] = useState<ChannelOfferData[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<ChannelOfferData | null>(
    null
  );
  const [buyer, setBuyer] = useState<User | null>(null);

  useEffect(() => {
    if (channel?._id) {
      Channeloffer.getByChannelId(channel._id).then((res) => {
        if (res) {
          setOffers(res);
        }
      });
    }
  }, [channel?._id]);

  return (
    <div tw="mx-auto px-4 pb-8 w-full max-w-[1392px]">
      {selectedOffer && (
        <AcceptChannelOfferPopup
          buyer={buyer ?? undefined}
          channel={channel}
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
      <div tw="px-0 py-8">
        {offers.map((item) => (
          <OfferItem
            key={item._id}
            channel={channel}
            item={item}
            selectOffer={() => setSelectedOffer(item)}
            setBuyer={setBuyer}
          />
        ))}
        {/* <div tw="pt-[60px] flex justify-center">
          <button
            tw="flex items-center gap-2.5 hover:opacity-75"
            onClick={() => setLimit((prevValue) => prevValue + 10)}
          >
            {getIcon('loading', '#3169FA')}
            <span tw="font-semibold text-base tracking-tight text-dark dark:text-light ">
              Load more
            </span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default TabOffers;
