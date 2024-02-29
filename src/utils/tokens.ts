import { TokenAPI } from '../api/api';
import { Token } from '../type.d';
import { getETHBalance, getTokenBalance } from './web3/library';

export const mandatoryTokens = [
  process.env.REACT_APP_SLICED_ADDRESS,
  process.env.REACT_APP_ETH_ADDRESS,
];

export const tokens = [
  {
    address: process.env.REACT_APP_SLICED_ADDRESS ?? '',
    icon: 'sliced',
    name: 'SLICED',
    network: 'Bitsliced',
    required: true,
  },
  {
    address: process.env.REACT_APP_ETH_ADDRESS ?? '',
    icon: 'ethereum',
    name: 'ETH',
    network: 'Ethereum',
    required: true,
  },
  {
    address: process.env.REACT_APP_WETH_ADDRESS ?? '',
    icon: 'weth',
    name: 'wETH',
    network: 'wEthereum',
  },
  {
    address: process.env.REACT_APP_USDC_ADDRESS ?? '',
    icon: 'usdc',
    name: 'USDC',
    network: 'Ethereum',
  },
];

export const getTokenInfoByAddress = (address: string): Token | undefined => {
  const found = tokens.find((item) => item.address === address);
  return found ?? undefined;
};

export const getTokenAddress = (name: string): string | undefined => {
  const found = tokens.find((item) => item.name === name);
  return found?.address ?? undefined;
};

export const getTokenPriceByAddress = async (
  address?: string | null
): Promise<number> => {
  if (address) {
    const price = await TokenAPI.getPrice(address);
    return price;
  }
  return 0;
};

export interface TokenBalance {
  balance: number;
  price: number;
  valueInUsd: number;
}

export const defaultTokenBalance: TokenBalance = {
  balance: 0,
  price: 0,
  valueInUsd: 0,
};

export const getBalanceByToken = async (
  account: string,
  tokenAddress?: string
): Promise<TokenBalance> => {
  let balance = '0';

  if (tokenAddress && tokenAddress !== process.env.REACT_APP_ETH_ADDRESS) {
    balance = await getTokenBalance(account, tokenAddress);
  } else {
    balance = await getETHBalance(account);
  }
  const price = await getTokenPriceByAddress(tokenAddress);

  return {
    balance: Number(balance),
    price,
    valueInUsd: Number(balance) * price,
  };
};
