import 'twin.macro';

import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { UserContext } from '../contexts/UserContext';
import { wallets } from '../pages/CreateAccountPage';
import { Token } from '../type';
import { nFormatter, shortAddress } from '../utils';
import {
  defaultTokenBalance,
  getBalanceByToken,
  TokenBalance,
  tokens,
} from '../utils/tokens';
import { useWeb3Provider } from '../utils/web3/useWeb3Provider';
import { getIcon } from './ColoredIcon';

const getWalletInfo = (key: string) => wallets.find((item) => item.key === key);

const tabs = ['history', 'cashback', 'royalty'];

const tabData = [
  {
    icon: 'item1-icon.png',
    text: 'Trade',
    type: '[Cashback]',
    user: 'Spirit Ninja #124',
  },
  {
    icon: 'item2-icon.png',
    text: 'Trade',
    type: '[Cashback]',
    user: 'Voxie #1175',
  },
];

const BalanceItem = forwardRef(
  (
    props: {
      account: string;
      token: Token;
      setTokenBalance: (token: string, balance: TokenBalance) => void;
    },
    ref
  ) => {
    const { darkMode } = useContext(UserContext);

    const [balance, setBalance] = useState<TokenBalance>(defaultTokenBalance);
    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      refreshItem() {
        setLoaded(false);
      },
    }));

    useEffect(() => {
      if (!loaded && props.account && props.token?.address) {
        setLoading(true);
        getBalanceByToken(props.account, props.token.address)
          .then((res) => {
            setBalance(res);
            props.setTokenBalance(props.token.address, res);
            setLoaded(true);
          })
          .finally(() => setLoading(false));
      }
    }, [props, loaded]);

    return (
      <li tw="px-6 py-3 bg-[#ecf0ff] dark:bg-[#0a0b2e]">
        <div tw="pb-1 text-base tracking-tight text-[#4D4D4D] dark:text-[#d4d4d4]">
          {props.token.name} Balance
        </div>
        <div tw="flex items-center gap-2.5">
          <div tw="w-[24px] flex justify-center">
            {getIcon(props.token.icon, darkMode ? '#fff' : '#000')}
          </div>
          <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
            {loading ? '...' : nFormatter(balance.balance, 8)}
          </span>
          <span tw="text-sm tracking-tight text-[#4D4D4D] dark:text-[#d4d4d4]">
            (${loading ? '...' : nFormatter(balance.valueInUsd, 2)})
          </span>
        </div>
      </li>
    );
  }
);

const WalletPopup = (props: { handleClose: () => void }) => {
  const { darkMode, user, walletType } = useContext(UserContext);
  const { account } = useWeb3Provider();

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);
  const [balances, setBalances] = useState<{ [token: string]: TokenBalance }>(
    {}
  );

  const refs = useRef<any[]>([]);

  const setTokenBalance = (token: string, balance: TokenBalance) => {
    setBalances((prev) => ({ ...prev, [token]: balance }));
  };

  const totalUsdValue = useMemo(() => {
    return Object.values(balances).reduce((p, a) => p + a.valueInUsd, 0);
  }, [balances]);

  return (
    <>
      <div
        tw="fixed left-0 top-0 w-full h-[100vh]"
        onClick={props.handleClose}
      />
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          tw="fixed left-0 top-0 w-full h-full z-10 duration-300"
          onClick={props.handleClose}
        />
        <div
          className="slide-left no-scrollbar"
          tw="w-full md:max-w-[554px] max-w-none h-[calc(100vh - 64px)] xl:h-[calc(100vh - 81px)] p-5 xl:p-[30px] fixed right-0 top-[64px] xl:top-[81px] bg-light dark:bg-dark z-20 shadow-xl overflow-auto"
        >
          {selectedWallet ? (
            <>
              <div tw="flex justify-between items-center flex-wrap gap-2">
                <div
                  tw="flex items-center gap-[7px]"
                  onClick={() => setSelectedWallet(null)}
                >
                  <img
                    alt="wallet"
                    src={getWalletInfo(selectedWallet)?.icon}
                    width={24}
                  />
                  <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
                    {getWalletInfo(selectedWallet)?.title}
                  </span>
                  {getIcon('dropdown', darkMode ? '#fff' : '#000')}
                </div>
                <button
                  tw="px-[14px] h-10 flex items-center gap-[7px] border-2 border-dark dark:border-light rounded-[100px]"
                  onClick={() => {
                    refs.current?.forEach((el) => {
                      el?.refreshItem();
                    });
                  }}
                >
                  {getIcon('reload', darkMode ? '#fff' : '#000')}
                  <span tw="text-base tracking-tight text-dark dark:text-light ">
                    Refresh Funds
                  </span>
                </button>
              </div>
              <div tw="pt-2 pb-[30px]">
                <span tw="text-base tracking-tight text-[#8A8A8A]">
                  {walletType === selectedWallet && account
                    ? 'Connected Wallet'
                    : 'Disconnected'}
                </span>
                {walletType === selectedWallet && account && (
                  <>
                    {' '}
                    <span tw="text-base tracking-tight text-dark dark:text-light/90">
                      ({shortAddress(user?.walletAddress)})
                    </span>
                  </>
                )}
              </div>
              <div tw="mx-[-30px] px-[30px] pt-[30px] border-t-2 border-[#E8E8E8] dark:border-[#181818]">
                <ul tw="flex flex-col gap-[1px] bg-[rgba(49, 105, 250, 0.15)] dark:bg-[#fff2] rounded-[32px] overflow-hidden z-20">
                  {walletType === selectedWallet && account ? (
                    <>
                      {tokens.map((token) => (
                        <BalanceItem
                          key={token.address}
                          ref={(el: any) => refs.current.push(el)}
                          account={account}
                          setTokenBalance={setTokenBalance}
                          token={token}
                        />
                      ))}
                      <li tw="px-6 py-3 bg-[#ecf0ff] dark:bg-[#0a0b2e] flex justify-between items-center">
                        <div>
                          <div tw="pb-1 text-base tracking-tight text-[#4D4D4D] dark:text-[#d4d4d4]">
                            Total balance
                          </div>
                          <div tw="flex items-center gap-2.5">
                            <span tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
                              ${nFormatter(totalUsdValue, 2)}
                            </span>
                          </div>
                        </div>
                        <button tw="px-3.5 h-10 inline-flex items-center gap-[7px] tracking-tight rounded-lg bg-dark dark:bg-light text-light dark:text-dark">
                          {getIcon('add', darkMode ? '#000' : '#fff')}
                          Add Funds
                        </button>
                      </li>
                    </>
                  ) : (
                    <li tw="px-6 h-[120px] flex items-center bg-[#ecf0ff] dark:bg-[#0a0b2e]">
                      <span tw="text-base tracking-tight text-[#4D4D4D] dark:text-[#d4d4d4]">
                        To see the balance, connect wallet please.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
              <div tw="mx-[-30px] pt-10 px-11 flex items-center gap-[52px] border-b-2 border-[#E8E8E8] dark:border-[#181818]">
                {tabs.map((item) => (
                  <span
                    key={item}
                    css={
                      selectedTab === item
                        ? {
                            borderBottomColor: '#3169FA',
                            color: darkMode ? '#fff' : '#000',
                          }
                        : {
                            borderBottomColor: 'transparent',
                            color: darkMode ? '#fff8' : '#0008',
                          }
                    }
                    tw="pb-3 font-semibold text-base tracking-tight leading-[150%] capitalize border-b-2 duration-500"
                    onClick={() => setSelectedTab(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div>
                {tabData.map((item) => (
                  <div
                    key={item.icon}
                    tw="py-6 flex justify-between items-center border-b-2 border-[#E8E8E8] dark:border-[#181818]"
                  >
                    <div tw="flex items-center gap-2.5">
                      <div
                        css={{ backgroundImage: `url(/images/${item.icon})` }}
                        tw="w-11 h-11 bg-no-repeat bg-center bg-contain"
                      />
                      <div>
                        <div tw="font-semibold text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                          {item.text}
                        </div>
                        <div tw="pt-1 text-sm tracking-tight text-[#4D4D4D] dark:text-[#d4d4d4]">
                          {item.user}
                        </div>
                      </div>
                    </div>
                    <div tw="font-semibold text-base tracking-tight leading-[150%] text-green-500">
                      {item.type}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 tw="font-semibold text-lg tracking-tight leading-[150%] text-dark dark:text-light/90">
                My Wallet
              </h3>
              <p tw="pt-5 pb-10 text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
                Please connect your wallet to start interacting with the Sliced
                app. If you don't have a wallet yet, we recommend the wallet by{' '}
                <a
                  href="/"
                  rel="noreferrer"
                  target="_blank"
                  tw="text-base tracking-tight leading-[150%] text-dark dark:text-light "
                >
                  BlockWallet
                </a>
                .
              </p>
              <ul tw="rounded-[14px] overflow-hidden">
                {wallets.map((item) => (
                  <li
                    key={item.key}
                    tw="relative px-6 h-[72px] flex justify-between items-center bg-dark/5 dark:bg-light/5 hover:bg-[rgba(49, 105, 250, 0.15)] border-b border-[rgba(49, 105, 250, 0.15)] z-0 hover:z-10 hover:shadow-sm cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWallet(item.key);
                    }}
                  >
                    <div tw="flex items-center gap-[7px]">
                      <img alt="wallet" src={item.icon} width={24} />
                      <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
                        {item.title}
                      </span>
                    </div>
                    {item.key === walletType && account && (
                      <span tw="text-[12px] text-[#DD3939] tracking-tight">
                        Connected
                      </span>
                    )}
                    {item.recommended && (
                      <span tw="px-2 flex items-center h-[26px] font-medium text-xs tracking-tight text-dark dark:text-light  border border-[rgba(49, 105, 250, 0.5)] rounded-[100px]">
                        Recommended
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletPopup;
