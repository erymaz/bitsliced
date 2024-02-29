import { ethers } from 'ethers';
const erc20ABI = require('./abis/erc20.json');

export const getWalletAddressAbbr = (address?: string | null) => {
  return address
    ? `${address.slice(0, 7)}...${address.slice(address.length - 5)}`
    : '';
};

export const getETHBalance = async (wallet: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_BLOCKCHAIN_RPC
    );
    const balance = await provider.getBalance(wallet);
    return ethers.utils.formatUnits(balance, 18);
  } catch (e) {
    console.error(e);
  }
  return '0';
};

export const getTokenBalance = async (
  wallet: string,
  tokenContract: string
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_BLOCKCHAIN_RPC
    );
    const contract = new ethers.Contract(tokenContract, erc20ABI, provider);
    const balance = await contract.balanceOf(wallet);
    const decimals = await contract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch (e) {
    console.error(e);
  }
  return '0';
};
