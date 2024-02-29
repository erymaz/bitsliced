import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Collection, Nft } from '../../api/api';
import BackLink from '../../components/BackLink';
import { getIcon } from '../../components/ColoredIcon';
import FileDropZone from '../../components/FileDropZone';
import {
  StyledCard,
  StyledCardSubtitle,
  StyledCardTitle,
  StyledInput,
  StyledPageTitle,
  StyledTextArea,
} from '../../components/lib/StyledComponents';
import PropertyEditor from '../../components/PropertyEditor';
import { UserContext } from '../../contexts/UserContext';
import {
  CollectionData,
  defaultNftData,
  NftData,
  Property,
} from '../../type.d';
import { validateUrl } from '../../utils';
import { alertError } from '../../utils/toast';
import { menuItemsForMintingPages } from '../MintPage';

const MintNftPage = () => {
  const navigate = useNavigate();
  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setCreatedNft,
    setCustomMenuItems,
    user,
  } = useContext(UserContext);

  const [nft, setNft] = useState<NftData>(defaultNftData);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [showCollections, setShowCollections] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [feeError, setFeeError] = useState<boolean>(false);

  useEffect(() => {
    setCustomMenuItems([
      { icon: 'back', label: 'Back', link: '/create' },
      ...menuItemsForMintingPages,
    ]);
  }, []);

  useEffect(() => {
    if (user?.walletAddress) {
      increaseLoading(true);
      Collection.getByOwner(user.walletAddress)
        .then((res: CollectionData[]) => {
          setCollections(res);
        })
        .catch((e: any) => {
          console.error(e);
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [user]);

  const setNftField = (
    field: string,
    value: string | number | string[] | Property[]
  ) => {
    setNft({ ...nft, [field]: value });
  };

  useEffect(() => {
    setNftField('attributes', properties);
  }, [properties]);

  const validateNft = (data: NftData): string[] => {
    const res = [];
    if (data.name.trim().length === 0) {
      res.push('NFT name cannot be empty.');
    }
    if (data.image.length === 0) {
      res.push('NFT file should be uploaded!');
    }
    if (data.fee > 10) {
      res.push('Royalties cannot be higher than 10%');
    }
    return res;
  };

  const submitNftData = () => {
    const errors = validateNft(nft);

    if (errors.length > 0) {
      for (const error of errors) {
        alertError(error);
      }
      return;
    }

    increaseLoading(true);
    Nft.create({
      ...nft,
      creator: user?.walletAddress ?? '',
      owner: user?.walletAddress ?? '',
    })
      .then((res) => {
        if (res) {
          setCreatedNft(res);
          navigate('/create/mint-nft-success');
        }
      })
      .catch((e) => {
        console.error(e);
        if (e.response?.data) {
          alertError(
            `${e.response.data.statusCode}: ${e.response.data.message}`
          );
        } else {
          alertError('NFT minting failed!');
        }
      })
      .finally(() => {
        decreaseLoading(true);
      });
  };

  return (
    <div tw="mx-auto px-4 py-8 w-full max-w-[1392px]">
      <div tw="inline-block">
        <BackLink handleBack={() => navigate(-1)} />
      </div>
      <div tw="mx-auto pt-8 w-full max-w-[755px]">
        <StyledPageTitle>Create NFT</StyledPageTitle>
        <div tw="py-8 flex flex-col gap-3.5">
          <StyledCard>
            <StyledCardTitle>
              Upload Image, 3D Model, Video (Max size: 100mb)*
            </StyledCardTitle>
            <StyledCardSubtitle>
              Supported file types JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG,
              GLB, GLTF
            </StyledCardSubtitle>
            <div tw="w-full max-w-[350px]">
              <FileDropZone
                id="image"
                setUploadedFileUrl={(url: string) => {
                  setNftField('image', url);
                }}
              />
            </div>
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>NFT Name</StyledCardTitle>
            <StyledInput
              value={nft.name}
              onChange={(e) => setNftField('name', e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>External Link</StyledCardTitle>
            <StyledInput
              type="url"
              value={nft.external_url}
              onChange={(e) => setNftField('external_url', e.target.value)}
            />
            {!validateUrl(nft.external_url) && (
              <div tw="pt-1 text-[12px] text-[#d40]">Invalid URL</div>
            )}
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Description</StyledCardTitle>
            <StyledTextArea
              value={nft.description}
              onChange={(e) => setNftField('description', e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Add to your Collection</StyledCardTitle>
            <div tw="relative flex items-center gap-3.5">
              <StyledInput
                readOnly
                value={
                  collections.find((item) => item._id === nft.collection_id)
                    ?.collection_name ?? '[Not selected]'
                }
              />
              <span
                tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-dark dark:text-light  cursor-pointer"
                onClick={() => setShowCollections(!showCollections)}
              >
                Choose Collection
              </span>
              {showCollections && (
                <>
                  <div
                    tw="fixed left-0 top-0 w-full h-full z-20"
                    onClick={() => setShowCollections(false)}
                  />
                  <ul tw="absolute left-0 top-[48px] w-full max-h-[320px] bg-white shadow-lg rounded-[7px] overflow-auto z-30">
                    {collections && collections.length > 0 ? (
                      collections.map((item: CollectionData) => (
                        <li
                          key={item._id}
                          tw="flex items-center hover:bg-[#0001] gap-2 border-t border-[rgba(0, 0, 0, 0.15)] cursor-pointer"
                          onClick={() => {
                            setNftField('collection_id', item._id ?? '');
                            setShowCollections(false);
                          }}
                        >
                          <div
                            css={{
                              backgroundImage: `url(${item.collection_profile_image_url})`,
                            }}
                            tw="w-[60px] h-[60px] bg-no-repeat bg-center bg-cover bg-[rgba(245,245,247,0.5)] rounded-[7px]"
                          />
                          <span tw="text-dark">{item.collection_name}</span>
                        </li>
                      ))
                    ) : (
                      <li
                        tw="px-10 h-[60px] flex items-center text-dark border-t border-[rgba(0, 0, 0, 0.15)]"
                        onClick={() => setShowCollections(false)}
                      >
                        No collection. Please create one{' '}
                        <Link
                          to="/create/create-collection"
                          tw="pl-2 underline text-dark dark:text-light "
                        >
                          here
                        </Link>
                        .
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Properties</StyledCardTitle>
            <StyledCardSubtitle tw="pt-0">
              Properties show up underneath your item, are clickable, and can be
              filtered in your collection's sidebar.
            </StyledCardSubtitle>
            <PropertyEditor onChange={setProperties} />
          </StyledCard>
          {/* <StyledCard>
            <StyledCardTitle>Network</StyledCardTitle>
            <div tw="flex items-center gap-3.5">
              <StyledInput readOnly value="[Network]" />
              <span tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-gray-500  cursor-not-allowed">
                Choose Network
              </span>
            </div>
          </StyledCard> */}
          <StyledCard>
            <StyledCardTitle>Supply</StyledCardTitle>
            <StyledCardSubtitle tw="pt-0">
              How many items do you want to mint? Free of cost.
            </StyledCardSubtitle>
            <StyledInput
              max={10}
              min={1}
              step={0.1}
              type="number"
              value={nft.supply}
              onChange={(e) => {
                setNftField('supply', Number(e.target.value));
              }}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Royalties</StyledCardTitle>
            <StyledCardSubtitle tw="pt-0">
              Royalty fee of each item traded
            </StyledCardSubtitle>
            {feeError && (
              <StyledCardSubtitle tw="pt-0 text-[#DD3939]">
                Royalties can't be higher than 10%
              </StyledCardSubtitle>
            )}
            <div tw="flex items-center gap-1">
              <StyledInput
                max={10}
                min={0}
                step={0.1}
                type="number"
                value={nft.fee}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (value > 10) {
                    setFeeError(true);
                    value = 10;
                  } else {
                    setFeeError(false);
                  }
                  setNftField('fee', value);
                }}
              />
              <span tw="font-semibold text-[22px] text-[#888]">%</span>
            </div>
          </StyledCard>
        </div>
        <div tw="pb-8 flex justify-center">
          <button
            tw="flex items-center gap-1 hover:opacity-75"
            onClick={() => {
              submitNftData();
            }}
          >
            <span tw="font-semibold text-base text-dark dark:text-light ">
              Create NFT
            </span>
            <div tw="-rotate-90 scale-75">
              {getIcon('dropdown', darkMode ? '#fff' : '#000')}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintNftPage;
