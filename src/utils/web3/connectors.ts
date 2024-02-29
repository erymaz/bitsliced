import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const NETWORK_CHAINID = 5;
const NETWORK_RPC =
  'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

// Metamask
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [NETWORK_CHAINID],
});

// WalletConnect
export const walletConnectConnector = new WalletConnectConnector({
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  rpc: { [NETWORK_CHAINID]: NETWORK_RPC },
});

// Coinbase
export const coinbaseConnector = new WalletLinkConnector({
  appName: 'bitSliced',
  supportedChainIds: [NETWORK_CHAINID],
  url: NETWORK_RPC,
});

// Connector Type
export type ConnectorType = 'METAMASK' | 'COINBASE' | 'WALLETCONNECT';
