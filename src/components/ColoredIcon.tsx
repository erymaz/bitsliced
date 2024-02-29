import { ReactComponent as ActivityIcon } from '../assets/icons/activity.svg';
import { ReactComponent as AddIcon } from '../assets/icons/add.svg';
import { ReactComponent as AlertIcon } from '../assets/icons/alert.svg';
import { ReactComponent as ArrowIcon } from '../assets/icons/arrow.svg';
import { ReactComponent as BackIcon } from '../assets/icons/back.svg';
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar.svg';
import { ReactComponent as CartIcon } from '../assets/icons/cart.svg';
import { ReactComponent as CashbackIcon } from '../assets/icons/cashback.svg';
import { ReactComponent as ChannelIcon } from '../assets/icons/channel.svg';
import { ReactComponent as CharityIcon } from '../assets/icons/charity.svg';
import { ReactComponent as ChatIcon } from '../assets/icons/chat.svg';
import { ReactComponent as CheckIcon } from '../assets/icons/check.svg';
import { ReactComponent as CollectionIcon } from '../assets/icons/collection.svg';
import { ReactComponent as ContractIcon } from '../assets/icons/contract.svg';
import { ReactComponent as CreateIcon } from '../assets/icons/create.svg';
import { ReactComponent as DetailsIcon } from '../assets/icons/details.svg';
import { ReactComponent as DisconnectIcon } from '../assets/icons/disconnect.svg';
import { ReactComponent as DiscordIcon } from '../assets/icons/discord.svg';
import { ReactComponent as DownvoteIcon } from '../assets/icons/downvote.svg';
import { ReactComponent as DropdownIcon } from '../assets/icons/dropdown.svg';
import { ReactComponent as EarnIcon } from '../assets/icons/earn.svg';
import { ReactComponent as EditIcon } from '../assets/icons/edit.svg';
import { ReactComponent as EthereumIcon } from '../assets/icons/ethereum.svg';
import { ReactComponent as EtherscanIcon } from '../assets/icons/etherscan.svg';
import { ReactComponent as ExploreIcon } from '../assets/icons/explore.svg';
import { ReactComponent as FilterIcon } from '../assets/icons/filter.svg';
import { ReactComponent as FlagIcon } from '../assets/icons/flag.svg';
import { ReactComponent as GamingIcon } from '../assets/icons/gaming.svg';
import { ReactComponent as GasTrackerIcon } from '../assets/icons/gas-tracker.svg';
import { ReactComponent as HeartIcon } from '../assets/icons/heart.svg';
import { ReactComponent as HeartRedIcon } from '../assets/icons/heart-red.svg';
import { ReactComponent as HighestFloorIcon } from '../assets/icons/highest-floor.svg';
import { ReactComponent as InboxIcon } from '../assets/icons/inbox.svg';
import { ReactComponent as InfoIcon } from '../assets/icons/info.svg';
import { ReactComponent as InstagramIcon } from '../assets/icons/instagram.svg';
import { ReactComponent as LargeGridIcon } from '../assets/icons/large-grid.svg';
import { ReactComponent as LinkIcon } from '../assets/icons/link.svg';
import { ReactComponent as LinkedinIcon } from '../assets/icons/linkedin.svg';
import { ReactComponent as ListIcon } from '../assets/icons/list.svg';
import { ReactComponent as ListingIcon } from '../assets/icons/listing.svg';
import { ReactComponent as LoadingIcon } from '../assets/icons/loading.svg';
import { ReactComponent as LooksRareIcon } from '../assets/icons/looksrare.svg';
import { ReactComponent as MaticIcon } from '../assets/icons/matic.svg';
import { ReactComponent as MediumIcon } from '../assets/icons/medium.svg';
import { ReactComponent as MintedIcon } from '../assets/icons/minted.svg';
import { ReactComponent as MoonIcon } from '../assets/icons/moon.svg';
import { ReactComponent as MoreIcon } from '../assets/icons/more.svg';
import { ReactComponent as NotificationIcon } from '../assets/icons/notification.svg';
import { ReactComponent as OfferIcon } from '../assets/icons/offer.svg';
import { ReactComponent as OpenSeaIcon } from '../assets/icons/opensea.svg';
import { ReactComponent as PinIcon } from '../assets/icons/pin.svg';
import { ReactComponent as PlayIcon } from '../assets/icons/play.svg';
import { ReactComponent as ProfileIcon } from '../assets/icons/profile.svg';
import { ReactComponent as RealEstateIcon } from '../assets/icons/real-estate.svg';
import { ReactComponent as ReloadIcon } from '../assets/icons/reload.svg';
import { ReactComponent as SbtsIcon } from '../assets/icons/sbts.svg';
import { ReactComponent as SearchIcon } from '../assets/icons/search.svg';
import { ReactComponent as SettingsIcon } from '../assets/icons/settings.svg';
import { ReactComponent as ShareIcon } from '../assets/icons/share.svg';
import { ReactComponent as SlicedLogo } from '../assets/icons/sliced.svg';
import { ReactComponent as SlicedLogoSmall } from '../assets/icons/sliced-small.svg';
import { ReactComponent as SlicesIcon } from '../assets/icons/slices.svg';
import { ReactComponent as SmallGridIcon } from '../assets/icons/small-grid.svg';
import { ReactComponent as SunIcon } from '../assets/icons/sun.svg';
import { ReactComponent as TelegramIcon } from '../assets/icons/telegram.svg';
import { ReactComponent as TraitsniperIcon } from '../assets/icons/traitsniper.svg';
import { ReactComponent as TransferIcon } from '../assets/icons/transfer.svg';
import { ReactComponent as TwitterIcon } from '../assets/icons/twitter.svg';
import { ReactComponent as UploadIcon } from '../assets/icons/upload.svg';
import { ReactComponent as UpvoteIcon } from '../assets/icons/upvote.svg';
import { ReactComponent as UsdcIcon } from '../assets/icons/usdc.svg';
import { ReactComponent as VerifiedIcon } from '../assets/icons/verified.svg';
import { ReactComponent as ViewsIcon } from '../assets/icons/views.svg';
import { ReactComponent as WalletIcon } from '../assets/icons/wallet.svg';
import { ReactComponent as WebsiteIcon } from '../assets/icons/website.svg';
import { ReactComponent as WethIcon } from '../assets/icons/weth.svg';
import { ReactComponent as X2Y2Icon } from '../assets/icons/x2y2.svg';

export const getIcon = (key?: string, color: string = '#000') => {
  if (key === 'activity') return <ActivityIcon fill={color} stroke={color} />;
  else if (key === 'add') return <AddIcon fill={color} stroke={color} />;
  else if (key === 'alert') return <AlertIcon fill={color} stroke={color} />;
  else if (key === 'arrow') return <ArrowIcon fill={color} stroke={color} />;
  else if (key === 'back') return <BackIcon fill={color} stroke={color} />;
  else if (key === 'calendar')
    return <CalendarIcon fill={color} stroke={color} />;
  else if (key === 'cart') return <CartIcon fill={color} stroke={color} />;
  else if (key === 'cashback')
    return <CashbackIcon fill={color} stroke={color} />;
  else if (key === 'channel')
    return <ChannelIcon fill={color} stroke={color} />;
  else if (key === 'charity')
    return <CharityIcon fill={color} stroke={color} />;
  else if (key === 'chat') return <ChatIcon fill={color} stroke={color} />;
  else if (key === 'check') return <CheckIcon fill={color} stroke={color} />;
  else if (key === 'collection')
    return <CollectionIcon fill={color} stroke={color} />;
  else if (key === 'contract')
    return <ContractIcon fill={color} stroke={color} />;
  else if (key === 'create') return <CreateIcon fill={color} stroke={color} />;
  else if (key === 'details')
    return <DetailsIcon fill={color} stroke={color} />;
  else if (key === 'disconnect')
    return <DisconnectIcon fill={color} stroke={color} />;
  else if (key === 'discord')
    return <DiscordIcon fill={color} stroke={color} />;
  else if (key === 'downvote')
    return <DownvoteIcon fill={color} stroke={color} />;
  else if (key === 'dropdown')
    return <DropdownIcon fill={color} stroke={color} />;
  else if (key === 'earn') return <EarnIcon fill={color} stroke={color} />;
  else if (key === 'edit') return <EditIcon fill={color} stroke={color} />;
  else if (key === 'ethereum')
    return <EthereumIcon fill={color} stroke={color} />;
  else if (key === 'etherscan')
    return <EtherscanIcon fill={color} stroke={color} />;
  else if (key === 'explore')
    return <ExploreIcon fill={color} stroke={color} />;
  else if (key === 'filter') return <FilterIcon fill={color} stroke={color} />;
  else if (key === 'flag') return <FlagIcon fill={color} stroke={color} />;
  else if (key === 'gaming') return <GamingIcon fill={color} stroke={color} />;
  else if (key === 'gas-tracker')
    return <GasTrackerIcon fill={color} stroke={color} />;
  else if (key === 'heart') return <HeartIcon fill={color} stroke={color} />;
  else if (key === 'heart-red') return <HeartRedIcon />;
  else if (key === 'highest-floor')
    return <HighestFloorIcon fill={color} stroke={color} />;
  else if (key === 'inbox') return <InboxIcon fill={color} stroke={color} />;
  else if (key === 'info') return <InfoIcon fill={color} stroke={color} />;
  else if (key === 'instagram')
    return <InstagramIcon fill={color} stroke={color} />;
  else if (key === 'large-grid')
    return <LargeGridIcon fill={color} stroke={color} />;
  else if (key === 'link') return <LinkIcon fill={color} stroke={color} />;
  else if (key === 'linkedin')
    return <LinkedinIcon fill={color} stroke={color} />;
  else if (key === 'list') return <ListIcon fill={color} stroke={color} />;
  else if (key === 'listing')
    return <ListingIcon fill={color} stroke={color} />;
  else if (key === 'loading')
    return <LoadingIcon fill={color} stroke={color} />;
  else if (key === 'looksrare')
    return <LooksRareIcon fill={color} stroke={color} />;
  else if (key === 'matic') return <MaticIcon fill={color} stroke={color} />;
  else if (key === 'medium') return <MediumIcon fill={color} stroke={color} />;
  else if (key === 'minted') return <MintedIcon fill={color} stroke={color} />;
  else if (key === 'moon') return <MoonIcon fill={color} stroke={color} />;
  else if (key === 'more') return <MoreIcon fill={color} stroke={color} />;
  else if (key === 'notification')
    return <NotificationIcon fill={color} stroke={color} />;
  else if (key === 'offer') return <OfferIcon fill={color} stroke={color} />;
  else if (key === 'opensea')
    return <OpenSeaIcon fill={color} stroke={color} />;
  else if (key === 'pin') return <PinIcon fill={color} stroke={color} />;
  else if (key === 'play') return <PlayIcon fill={color} stroke={color} />;
  else if (key === 'profile')
    return <ProfileIcon fill={color} stroke={color} />;
  else if (key === 'real-estate')
    return <RealEstateIcon fill={color} stroke={color} />;
  else if (key === 'reload') return <ReloadIcon fill={color} stroke={color} />;
  else if (key === 'sbts') return <SbtsIcon fill={color} stroke={color} />;
  else if (key === 'search') return <SearchIcon fill={color} stroke={color} />;
  else if (key === 'settings')
    return <SettingsIcon fill={color} stroke={color} />;
  else if (key === 'share') return <ShareIcon fill={color} stroke={color} />;
  else if (key === 'sliced') return <SlicedLogo fill={color} stroke={color} />;
  else if (key === 'sliced-small')
    return <SlicedLogoSmall fill={color} stroke={color} />;
  else if (key === 'slices') return <SlicesIcon fill={color} stroke={color} />;
  else if (key === 'small-grid')
    return <SmallGridIcon fill={color} stroke={color} />;
  else if (key === 'sun') return <SunIcon fill={color} stroke={color} />;
  else if (key === 'telegram')
    return <TelegramIcon fill={color} stroke={color} />;
  else if (key === 'traitsniper')
    return <TraitsniperIcon fill={color} stroke={color} />;
  else if (key === 'transfer')
    return <TransferIcon fill={color} stroke={color} />;
  else if (key === 'twitter')
    return <TwitterIcon fill={color} stroke={color} />;
  else if (key === 'upload') return <UploadIcon fill={color} stroke={color} />;
  else if (key === 'upvote') return <UpvoteIcon fill={color} stroke={color} />;
  else if (key === 'usdc') return <UsdcIcon fill={color} stroke={color} />;
  else if (key === 'verified')
    return <VerifiedIcon fill={color} stroke={color} />;
  else if (key === 'views') return <ViewsIcon fill={color} stroke={color} />;
  else if (key === 'wallet') return <WalletIcon fill={color} stroke={color} />;
  else if (key === 'website')
    return <WebsiteIcon fill={color} stroke={color} />;
  else if (key === 'weth') return <WethIcon fill={color} stroke={color} />;
  else if (key === 'x2y2') return <X2Y2Icon fill={color} stroke={color} />;
  return null;
};
