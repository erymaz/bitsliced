/* eslint-disable react-hooks/exhaustive-deps */
import 'twin.macro';

import { ReactNode, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from '../contexts/UserContext';
import AuctionBidPopup from '../pages/PurchasePopups/AuctionBidPopup';
import MakeChannelOfferPopup from '../pages/PurchasePopups/MakeChannelOfferPopup';
import MakeOfferPopup from '../pages/PurchasePopups/MakeOfferPopup';
import MakeTicketOfferPopup from '../pages/PurchasePopups/MakeTicketOfferPopup';
import NftBuyingPopup from '../pages/PurchasePopups/NftBuyingPopup';
import TicketOffersPopup from '../pages/PurchasePopups/TicketOffersPopup';
import { alertError } from '../utils/toast';
import Footer from './Footer';
import Header from './Header';

const Layout = ({
  children,
  menuOpened,
  onToggleMenu,
}: {
  children: ReactNode;
  menuOpened: boolean;
  onToggleMenu: () => void;
}) => {
  //   const { pathname } = useLocation();
  const {
    channelToOffer,
    makeOfferData,
    nftToBid,
    nftToBuy,
    setChannelToOffer,
    setMakeOfferData,
    setNftToBid,
    setNftToBuy,
    setTicketToAccept,
    setTicketToOffer,
    ticketToAccept,
    ticketToOffer,
    user,
  } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && (nftToBuy || nftToBid)) {
      alertError('To buy an NFT, join please!');
      setNftToBuy(undefined);
      setNftToBid(undefined);
      navigate('/join?redirect=/explore');
    }
  }, [user, nftToBuy, nftToBid]);

  useEffect(() => {
    if (!user && makeOfferData) {
      alertError('To make an offer, join please!');
      setMakeOfferData(undefined);
      navigate('/join?redirect=/explore');
    }
  }, [user, makeOfferData]);

  useEffect(() => {
    if (!user && channelToOffer) {
      alertError('To make an offer, join please!');
      const channelId = channelToOffer._id;
      setChannelToOffer(undefined);
      navigate(`/join?redirect=/channels/${channelId}`);
    }
  }, [user, channelToOffer]);

  useEffect(() => {
    if (!user && ticketToOffer) {
      alertError('To make an offer, join please!');
      setTicketToOffer(undefined);
      navigate('/join?redirect=/channels?tab=tradable-channel-tickets');
    }
  }, [user, ticketToOffer]);

  useEffect(() => {
    if (!user && ticketToAccept) {
      alertError('To accept an offer, join please!');
      setTicketToAccept(undefined);
      navigate('/join?redirect=/channels?tab=tradable-channel-tickets');
    }
  }, [user, ticketToAccept]);

  return (
    <>
      {/* <Spinner open={isLoading > 0} /> */}
      {user && nftToBuy && (
        <NftBuyingPopup
          item={nftToBuy}
          onClose={() => setNftToBuy(undefined)}
        />
      )}
      {user && nftToBid && (
        <AuctionBidPopup
          item={nftToBid}
          onClose={() => setNftToBid(undefined)}
        />
      )}
      {user && makeOfferData && (
        <MakeOfferPopup
          collection={makeOfferData.collection}
          nft={makeOfferData.nft}
          onClose={() => setMakeOfferData(undefined)}
        />
      )}
      {user && channelToOffer && (
        <MakeChannelOfferPopup
          item={channelToOffer}
          onClose={() => setChannelToOffer(undefined)}
        />
      )}
      {user && ticketToOffer && (
        <MakeTicketOfferPopup
          item={ticketToOffer}
          onClose={() => setTicketToOffer(undefined)}
        />
      )}
      {user && ticketToAccept && (
        <TicketOffersPopup
          ticket={ticketToAccept}
          onClose={() => setTicketToAccept(undefined)}
        />
      )}
      <main tw="bg-light dark:bg-dark w-auto">
        <div tw="mx-auto w-full max-w-[2424px]">
          <Header menuOpened={menuOpened} onToggleMenu={onToggleMenu} />
          <div tw="w-full relative min-h-full">{children}</div>
          <Footer />
        </div>
      </main>
    </>
  );
};

export default Layout;
