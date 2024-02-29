import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Auth, Channel, Ticketoffer } from '../../api/api';
import { getIcon } from '../../components/ColoredIcon';
import { UserContext } from '../../contexts/UserContext';
import { ChannelData, TicketData, TicketOfferData, User } from '../../type.d';
import { getMimeType } from '../../utils';
import AcceptChannelOfferPopup from './AcceptChannelOfferPopup';
import AcceptTicketOfferPopup from './AcceptTicketOfferPopup';

const OfferItem = ({
  channel,
  item,
  selectOffer,
  setBuyer,
}: {
  item: TicketOfferData;
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

  return (
    <div
      css={{ gridTemplateColumns: '' }}
      tw="py-4 grid grid-cols-[1fr 1fr auto] md:grid-cols-[1fr 1fr auto] gap-2 items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
    >
      <div tw="flex items-center flex-wrap md:flex-nowrap gap-3.5">
        <Link title={buyer?.name} to={`/profile/${buyer?._id}`}>
          <div
            css={{ backgroundImage: `url(${buyer?.profile_image_url})` }}
            tw="w-[60px] min-w-[60px] h-[60px] bg-white bg-no-repeat bg-center bg-cover rounded-full"
          />
        </Link>
        <span tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
          <Link to={`/profile/${buyer?._id}`} tw="font-semibold border-b">
            {buyer?.name}
          </Link>
        </span>
      </div>
      <div>
        <div tw="flex items-center gap-1 font-semibold text-base text-left text-dark dark:text-light/90">
          {new Date(item.startTime).toLocaleDateString()}-
          {new Date(item.endTime).toLocaleDateString()},
          <div tw="scale-75">
            {getIcon('sliced', darkMode ? '#fff' : '#000')}
          </div>
          {item.price}
        </div>
      </div>
      <div tw="flex justify-center items-center gap-2.5 flex-wrap md:flex-nowrap">
        <button
          tw="px-3.5 h-[40px] flex justify-center items-center font-semibold text-base text-green-500 bg-[rgba(53, 206, 50, 0.2)] border border-green-500 rounded-[10px]"
          onClick={() => {
            selectOffer();
          }}
        >
          Accept
        </button>
        <button
          tw="px-3.5 h-[40px] flex justify-center items-center font-semibold text-base text-green-500 bg-[rgba(53, 206, 50, 0.2)] border border-green-500 rounded-[10px]"
          onClick={() => {
            return;
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
};

const TicketOffersPopup = (props: {
  ticket?: Partial<TicketData>;
  onClose: () => void;
}) => {
  const { darkMode } = useContext(UserContext);

  const [mimeType, setMimeType] = useState<string>('');
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [offers, setOffers] = useState<TicketOfferData[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<TicketOfferData | null>(
    null
  );
  const [buyer, setBuyer] = useState<User | null>(null);

  useEffect(() => {
    if (props.ticket?.channel_id && props.ticket?.ticketId) {
      Channel.getById(props.ticket.channel_id).then((res) => {
        if (res) {
          setChannel(res);
        }
      });

      Ticketoffer.getByChannelId(
        props.ticket.channel_id,
        props.ticket.ticketId
      ).then((res) => {
        setOffers(res);
      });
    }
  }, [props.ticket]);

  useEffect(() => {
    if (channel) {
      setMimeType(getMimeType(channel.channel_profile_image_url));
    }
  }, [channel]);

  return (
    <div tw="px-4 pt-[90px] pb-4 fixed left-0 top-0 w-full h-full flex justify-center items-center z-50 px-4">
      {selectedOffer && (
        <AcceptTicketOfferPopup
          buyer={buyer ?? undefined}
          channel={channel ?? undefined}
          offer={selectedOffer}
          ticket={props.ticket}
          onClose={() => setSelectedOffer(null)}
        />
      )}
      <div
        tw="absolute left-0 top-0 w-full h-full backdrop-blur bg-[#0004] z-10"
        onClick={() => props.onClose()}
      />
      <div
        className="popup-content no-scrollbar"
        tw="relative mx-auto px-10 py-8 w-full max-w-[860px] max-h-full text-center bg-white dark:bg-[#030017] rounded-[32px] overflow-auto z-20"
      >
        <h3 tw="pb-8 font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
          Ticket offers for {channel?.channel_name}
        </h3>
        <div>
          {offers.map((item) => (
            <OfferItem
              key={item._id}
              channel={channel ?? undefined}
              item={item}
              selectOffer={() => setSelectedOffer(item)}
              setBuyer={setBuyer}
            />
          ))}
          {(!offers || offers.length === 0) && (
            <div tw="h-[40px] flex justify-center items-center text-base text-dark dark:text-light/90">
              There is no offer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketOffersPopup;
