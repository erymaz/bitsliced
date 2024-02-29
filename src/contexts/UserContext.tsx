import { createContext, FC, useEffect, useState } from 'react';

import {
  AuthResultData,
  ChannelData,
  CollectionData,
  MenuItem,
  NftData,
  TicketData,
  User,
} from '../type.d';
import { ConnectorType } from '../utils/web3/connectors';
import { useWeb3Provider } from '../utils/web3/useWeb3Provider';

const emptyFunc = () => {
  return;
};

type UserContextState = {
  darkMode?: boolean;
  authData?: AuthResultData;
  isLoading: number;
  isWalletConnectOpened: boolean;
  user?: User;
  nftToBuy?: Partial<NftData>;
  nftToBid?: Partial<NftData>;
  channelToOffer?: Partial<ChannelData>;
  ticketToOffer?: Partial<TicketData>;
  ticketToAccept?: Partial<TicketData>;
  makeOfferData?: {
    nft?: Partial<NftData>;
    collection?: CollectionData;
  };
  walletType?: ConnectorType;
  createdCollection?: CollectionData;
  createdNft?: NftData;
  createdChannel?: ChannelData;
  customMenuItems?: MenuItem[];
  setDarkMode: (value?: boolean) => void;
  setNftToBuy: (value?: Partial<NftData>) => void;
  setNftToBid: (value?: Partial<NftData>) => void;
  setChannelToOffer: (value?: Partial<ChannelData>) => void;
  setTicketToOffer: (value?: Partial<ChannelData>) => void;
  setTicketToAccept: (value?: Partial<ChannelData>) => void;
  setMakeOfferData: (value?: {
    nft?: Partial<NftData>;
    collection?: CollectionData;
  }) => void;
  setAuthData: (value?: AuthResultData) => void;
  setIsLoading: (value: number) => void;
  decreaseLoading: (value: boolean) => void;
  increaseLoading: (value: boolean) => void;
  setIsWalletConnectOpened: (value: boolean) => void;
  setUser: (value?: User) => void;
  setWalletType: (value?: ConnectorType) => void;
  setCreatedCollection: (value?: CollectionData) => void;
  setCreatedNft: (value?: NftData) => void;
  setCreatedChannel: (value?: ChannelData) => void;
  setCustomMenuItems: (value?: MenuItem[]) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextState>({
  authData: undefined,
  channelToOffer: undefined,
  createdChannel: undefined,
  createdCollection: undefined,
  createdNft: undefined,
  customMenuItems: [],
  darkMode: false,
  decreaseLoading: emptyFunc,
  increaseLoading: emptyFunc,
  isLoading: 0,
  isWalletConnectOpened: false,
  logout: emptyFunc,
  makeOfferData: undefined,
  nftToBid: undefined,
  nftToBuy: undefined,
  setAuthData: emptyFunc,
  setChannelToOffer: emptyFunc,
  setCreatedChannel: emptyFunc,
  setCreatedCollection: emptyFunc,
  setCreatedNft: emptyFunc,
  setCustomMenuItems: emptyFunc,
  setDarkMode: emptyFunc,
  setIsLoading: emptyFunc,
  setIsWalletConnectOpened: emptyFunc,
  setMakeOfferData: emptyFunc,
  setNftToBid: emptyFunc,
  setNftToBuy: emptyFunc,
  setTicketToAccept: emptyFunc,
  setTicketToOffer: emptyFunc,
  setUser: emptyFunc,
  setWalletType: emptyFunc,
  ticketToAccept: undefined,
  ticketToOffer: undefined,
  user: undefined,
  walletType: undefined,
});

export const UserContextProvider: FC = ({ children }) => {
  const { deactivate } = useWeb3Provider();

  const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);
  const [increasing, increaseLoading] = useState<boolean>(false);
  const [decreasing, decreaseLoading] = useState<boolean>(false);

  const [authData, setAuthData] = useState<AuthResultData | undefined>(
    undefined
  );
  const [user, setUser] = useState<User | undefined>(undefined);
  const [nftToBuy, setNftToBuy] = useState<Partial<NftData> | undefined>(
    undefined
  );
  const [nftToBid, setNftToBid] = useState<Partial<NftData> | undefined>(
    undefined
  );
  const [channelToOffer, setChannelToOffer] = useState<
    Partial<ChannelData> | undefined
  >(undefined);
  const [ticketToOffer, setTicketToOffer] = useState<
    Partial<TicketData> | undefined
  >(undefined);
  const [ticketToAccept, setTicketToAccept] = useState<
    Partial<TicketData> | undefined
  >(undefined);
  const [makeOfferData, setMakeOfferData] = useState<
    | {
        nft?: Partial<NftData>;
        collection?: CollectionData;
      }
    | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<number>(0);
  const [isWalletConnectOpened, setIsWalletConnectOpened] =
    useState<boolean>(false);
  const [walletType, setWalletType] = useState<ConnectorType | undefined>(
    undefined
  );
  const [createdCollection, setCreatedCollection] = useState<
    CollectionData | undefined
  >(undefined);
  const [createdNft, setCreatedNft] = useState<NftData | undefined>(undefined);
  const [createdChannel, setCreatedChannel] = useState<ChannelData | undefined>(
    undefined
  );
  const [customMenuItems, setCustomMenuItems] = useState<
    MenuItem[] | undefined
  >(undefined);

  useEffect(() => {
    const walletType = window.localStorage.getItem('walletType');
    if (walletType) {
      setWalletType(walletType as ConnectorType);
    } else {
      window.localStorage.removeItem('accessToken');
      setAuthData(undefined);
      setUser(undefined);
      setWalletType(undefined);
    }
    const darkMode = window.localStorage.getItem('darkMode');
    if (darkMode && darkMode === '1') {
      document.body.classList.add('dark');
      setDarkMode(true);
    } else {
      document.body.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (walletType) {
      window.localStorage.setItem('walletType', walletType);
    } else {
      window.localStorage.removeItem('walletType');
    }
  }, [walletType]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      window.localStorage.setItem('darkMode', '1');
    } else {
      document.body.classList.remove('dark');
      window.localStorage.setItem('darkMode', '0');
    }
  }, [darkMode]);

  const logout = () => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('walletType');
    setAuthData(undefined);
    setUser(undefined);
    setWalletType(undefined);
    deactivate();
  };

  useEffect(() => {
    if (increasing) {
      increaseLoading(false);
      setIsLoading((prev) => prev + 1);
    }
  }, [increasing]);

  useEffect(() => {
    if (decreasing) {
      decreaseLoading(false);
      setIsLoading((prev) => (prev > 0 ? prev - 1 : 0));
    }
  }, [decreasing]);

  return (
    <UserContext.Provider
      value={{
        authData,
        channelToOffer,
        createdChannel,
        createdCollection,
        createdNft,
        customMenuItems,
        darkMode,
        decreaseLoading,
        increaseLoading,
        isLoading,
        isWalletConnectOpened,
        logout,
        makeOfferData,
        nftToBid,
        nftToBuy,
        setAuthData,
        setChannelToOffer,
        setCreatedChannel,
        setCreatedCollection,
        setCreatedNft,
        setCustomMenuItems,
        setDarkMode,
        setIsLoading,
        setIsWalletConnectOpened,
        setMakeOfferData,
        setNftToBid,
        setNftToBuy,
        setTicketToAccept,
        setTicketToOffer,
        setUser,
        setWalletType,
        ticketToAccept,
        ticketToOffer,
        user,
        walletType,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
