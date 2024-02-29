import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { NoEthereumProviderError } from '@web3-react/injected-connector';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { UserContext } from '../../contexts/UserContext';
import {
  coinbaseConnector,
  ConnectorType,
  injectedConnector,
  walletConnectConnector,
} from './connectors';
import { getWalletAddressAbbr } from './library';
import { triggerToast, updateToast } from './toast';
import { useIsMounted } from './useIsMounted';
declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

const getConnector = (type: ConnectorType) => {
  switch (type) {
    case 'METAMASK':
      return injectedConnector;
    case 'COINBASE':
      return coinbaseConnector;
    case 'WALLETCONNECT':
      return walletConnectConnector;
  }
};

export const useWeb3Provider = () => {
  const isMounted = useIsMounted();
  const { account, activate, chainId, deactivate, error, ...restParams } =
    useWeb3React<Web3Provider>();
  const [loading, setLoading] = useState(false);
  const { logout, setIsWalletConnectOpened } = useContext(UserContext);

  const connect = useCallback(
    async (connectorType: ConnectorType) => {
      setLoading(true);
      const connector = getConnector(connectorType);

      if (connectorType === 'COINBASE') {
        const coinbaseProvider = await coinbaseConnector.getProvider();
        if (coinbaseProvider) {
          // @ts-ignore
          connector.coinbaseProvider = undefined;
        }
      }

      if (connectorType === 'WALLETCONNECT') {
        const walletConnectProvider =
          await walletConnectConnector.getProvider();
        if (walletConnectProvider) {
          // @ts-ignore
          connector.walletConnectProvider = undefined;
        }
      }

      activate(connector, undefined, true)
        .then(() => {
          triggerToast('WALLET_CONNECT');
        })
        .catch((err) => {
          console.error('useWeb3Provider: ', err);
          if (err instanceof NoEthereumProviderError) {
            triggerToast('NO_ETHEREUMPROVIDER');
          }
          if (err instanceof UnsupportedChainIdError) {
            triggerToast('WRONG_NETWORK');
            if (connectorType === 'METAMASK') {
              window.ethereum?.request!({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x5' }],
              }).catch(() => {
                // window.location.href = '/';
                logout();
              });
              // .catch((switchError) => {
              //   // if (switchError.code === 4902) {
              //   //   window.ethereum?.request!({
              //   //     method: 'wallet_addEthereumChain',
              //   //     params: [
              //   //       {
              //   //         // blockExplorerUrls: ['https://goerli.etherscan.io'],
              //   //         chainId: '0x5',
              //   //         // chainName: 'Goerli test network',
              //   //         // iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"],
              //   //         // nativeCurrency: { decimals: 18, name: 'GoerliETH',  symbol: 'GoerliETH' },
              //   //         // rpcUrls: ['https://goerli.infura.io/v3/']
              //   //       }
              //   //     ],
              //   //   });
              //   // }
              // })
            }
          }
        })
        .then(() => {
          if (isMounted.current) {
            setLoading(false);
            setIsWalletConnectOpened(false);
          }
          return;
        });
    },
    [activate, isMounted, setIsWalletConnectOpened]
  );

  const disconnect = useCallback(() => {
    if (account) {
      deactivate();
      // triggerToast('WALLET_DISCONNECT', getWalletAddressAbbr(account));
    }
  }, [account, deactivate]);

  const isUnsupportedChainId = useMemo(() => {
    return error instanceof UnsupportedChainIdError;
  }, [error]);

  useEffect(() => {
    if (account) {
      updateToast('WALLET_CONNECT', getWalletAddressAbbr(account));
    }
  }, [account]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('chainId', chainId);
  }, [chainId]);

  return {
    ...restParams,
    account,
    activate: connect,
    chainId,
    deactivate: disconnect,
    error,
    isUnsupportedChainId,
    loading,
  };
};
