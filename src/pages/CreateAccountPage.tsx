import 'twin.macro';

import crypto from 'crypto-js';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Auth } from '../api/api';
import iconBlockWallet from '../assets/images/logo-blockwallet.png';
import iconCoinbaseWallet from '../assets/images/logo-coinbase-wallet.png';
import iconFortmatic from '../assets/images/logo-fortmatic.png';
import iconMetaMask from '../assets/images/logo-metamask.png';
import iconWalletConnect from '../assets/images/logo-wallet-connect.png';
import TopBanner from '../components/TopBanner';
import { UserContext } from '../contexts/UserContext';
import { parseJwt } from '../utils';
import { alertError } from '../utils/toast';
import { ConnectorType } from '../utils/web3/connectors';
import { useWeb3Provider } from '../utils/web3/useWeb3Provider';

export const wallets = [
  {
    icon: iconBlockWallet,
    key: 'blockwallet',
    recommended: true,
    title: 'BlockWallet',
  },
  { icon: iconMetaMask, key: 'METAMASK', title: 'MetaMask' },
  { icon: iconCoinbaseWallet, key: 'COINBASE', title: 'Coinbase Wallet' },
  { icon: iconWalletConnect, key: 'WALLETCONNECT', title: 'WalletConnect' },
  { icon: iconFortmatic, key: 'fortmatic', title: 'Fortmatic' },
];

const CreateAccountPage = () => {
  const {
    decreaseLoading,
    increaseLoading,
    setAuthData,
    setUser,
    setWalletType,
    walletType,
  } = useContext(UserContext);

  const { account, activate, chainId } = useWeb3Provider();
  const navigate = useNavigate();
  const [queryParams] = useSearchParams();

  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (walletType === 'METAMASK' || walletType === 'WALLETCONNECT') {
      activate(walletType);
    }
  }, [walletType, activate]);

  useEffect(() => {
    const redirect = queryParams.get('redirect');
    if (redirect) {
      setRedirect(redirect);
    }
  }, [queryParams]);

  const login = async (account: string) => {
    const password = crypto
      .SHA512(account + process.env.REACT_APP_API_PASSWORD)
      .toString(crypto.enc.Base64);

    increaseLoading(true);
    Auth.login({
      password: password,
      username: account,
    })
      .then((res) => {
        if (res?.access_token) {
          window.localStorage.setItem('accessToken', res.access_token);
          const decoded = parseJwt(res.access_token);
          setAuthData({ ...res, user: decoded });
          increaseLoading(true);
          Auth.get(decoded.userId)
            .then((res) => {
              setUser(res);
              // store account, chainId, walletType to localStorage
              window.localStorage.setItem('account', account);
              if (redirect) {
                navigate(redirect);
              } else {
                navigate(`/profile/${decoded.userId}`);
              }
            })
            .catch((e) => console.error(e))
            .finally(() => {
              decreaseLoading(true);
            });
        }
      })
      .catch((e) => {
        console.error(e);
        alertError(e.toString());
      })
      .finally(() => {
        decreaseLoading(true);
      });
  };

  useEffect(() => {
    console.log('chainId, account', chainId, account);
    if (chainId === 5) {
      if (account) {
        login(account);
      }
    }
  }, [account, chainId]);

  return (
    <div tw="mx-auto pb-[155px] w-full">
      <TopBanner
        text={
          <>
            Create
            <span tw="hidden md:inline text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {' '}
              your own
            </span>{' '}
            Channel without any fee for the first 2 Months.
            <span tw="hidden md:inline text-base tracking-tight leading-[150%] text-dark dark:text-light/90">
              {' '}
              Read our article
            </span>
          </>
        }
      />
      <h2 tw="mx-auto px-4 pt-16 w-full max-w-[846px] font-semibold text-3xl md:text-5xl tracking-tight leading-[110%] text-center text-dark dark:text-light/90">
        Connect your wallet.
      </h2>
      <p tw="mx-auto px-4 pb-[60px] w-full max-w-[471px] pt-8 text-base tracking-tight leading-[150%] text-center text-dark dark:text-light/90">
        Please connect your wallet to start interacting with the Sliced app. If
        you don't have a wallet yet, we recommend the wallet by{' '}
        <a
          href="https://blockwallet.com"
          rel="noreferrer"
          target="_blank"
          tw="text-base tracking-tight leading-[150%] text-hero-purpledark dark:text-hero-bluelight"
        >
          BlockWallet
        </a>
        .
      </p>

      <div tw="px-4">
        <ul tw="mx-auto w-full max-w-[740px] flex flex-col gap-[1px] rounded-xl overflow-hidden bg-white dark:bg-white/5">
          {wallets.map((item) => (
            <li
              key={item.title}
              tw="px-6 h-[72px] flex justify-between items-center hover:bg-dark/10 dark:hover:bg-light/10  cursor-pointer border-b-[1px] border-dark/10 dark:border-light/5 last:border-none"
              onClick={() => {
                setWalletType(item.key as ConnectorType);
              }}
            >
              <div tw="flex items-center gap-[7px]">
                <img alt="wallet" src={item.icon} width={24} />
                <span tw="font-semibold text-base tracking-tight text-dark dark:text-light/90">
                  {item.title}
                </span>
              </div>
              {item.recommended && (
                <span tw="px-2 flex items-center h-[26px] font-medium text-xs tracking-tight text-dark dark:text-light border border-hero-purpledark dark:border-hero-bluelight rounded-[100px]">
                  Recommended
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateAccountPage;
