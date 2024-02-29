import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Collection } from '../../api/api';
import BackLink from '../../components/BackLink';
import CategorySelector from '../../components/CategorySelector';
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
import { UserContext } from '../../contexts/UserContext';
import { CollectionData, defaultCollectionData } from '../../type.d';
import { alertError, alertSuccess } from '../../utils/toast';
import { tokens } from '../../utils/tokens';
import { data as categories } from '../Home/CategoriesSection';
import { menuItemsForMintingPages } from '../MintPage';

const CreateCollectionPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    darkMode,
    decreaseLoading,
    increaseLoading,
    setCreatedCollection,
    setCustomMenuItems,
    user,
  } = useContext(UserContext);

  const [collection, setCollection] = useState<CollectionData>(
    defaultCollectionData
  );
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(
    tokens.filter((item) => item.required).map((item) => item.address)
  );
  const [availableSubmit, setAvaiableSubmit] = useState<boolean>(false);
  const [duplicate, setDuplicate] = useState<boolean>(false);
  const [feeError, setFeeError] = useState<boolean>(false);
  const [waitingTransaction, setWaitingTransaction] = useState<boolean>(false);
  const [oldName, setOldName] = useState<string>('');

  useEffect(() => {
    setCustomMenuItems([
      { icon: 'back', label: 'Back', link: '/create' },
      ...menuItemsForMintingPages,
    ]);

    const categoryList = categories.map((item) => item.title);
    setCategoryList(categoryList);
  }, []);

  useEffect(() => {
    if (params?.id) {
      Collection.getById(params.id)
        .then((res) => {
          if (res) {
            setCollection(res);
            setSelectedTokens(res.collection_payment_tokens);
            setOldName(res.collection_name);
            setDuplicate(false);
            setAvaiableSubmit(true);
          }
        })
        .catch((e) => {
          console.error();
          alertError(e.toString());
        });
    }
  }, [params?.id]);

  const setCollectionField = (
    field: string,
    value: string | number | string[]
  ) => {
    setCollection({ ...collection, [field]: value });
  };

  useEffect(() => {
    setCollectionField('collection_category', selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setCollectionField('collection_payment_tokens', selectedTokens);
  }, [selectedTokens]);

  const validateCollection = (collection: CollectionData): string[] => {
    const res = [];
    try {
      if ((collection.collection_name ?? '').trim().length === 0) {
        res.push('Collection name cannot be empty.');
      }
      if ((collection.collection_category ?? []).length === 0) {
        res.push('Collection category cannot be empty.');
      }
      if ((collection.collection_profile_image_url ?? '').length === 0) {
        res.push('Collection profile image cannot be null.');
      }
      if ((collection.collection_background_image_url ?? '').length === 0) {
        res.push('Collection background image cannot be null.');
      }
      if ((collection.collection_fee ?? 0) > 10) {
        res.push('Royalties cannot be higher than 10%');
      }
    } catch (e) {
      console.error(e);
    }
    return res;
  };

  const toggleToken = (tok: string) => {
    if (selectedTokens.includes(tok)) {
      setSelectedTokens(selectedTokens.filter((item) => item !== tok));
    } else {
      setSelectedTokens([...selectedTokens, tok]);
    }
  };

  const submitCollection = (collectionData: CollectionData) => {
    increaseLoading(true);
    setWaitingTransaction(true);
    if (params?.id) {
      const {
        collection_trending,
        collection_viewed,
        createdAt,
        nftsCount,
        updatedAt,
        ...payload
      } = collection;
      Collection.update(payload)
        .then((res) => {
          if (res) {
            setCollection(res);
            alertSuccess('Your collection has been updated successfully!');
            navigate(`/collection/${params.id}`);
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode}: ${e.response.data.message}`
            );
          } else {
            alertError('Collection updating failed!');
          }
        })
        .finally(() => {
          decreaseLoading(true);
          setWaitingTransaction(false);
        });
    } else {
      Collection.create({
        ...collectionData,
        collection_creator: user?.walletAddress ?? '',
        collection_owner: user?.walletAddress ?? '',
      })
        .then((res) => {
          if (res) {
            setCreatedCollection(res);
            navigate('/create/create-collection-success');
          }
        })
        .catch((e) => {
          console.error(e);
          if (e.response?.data) {
            alertError(
              `${e.response.data.statusCode}: ${e.response.data.message}`
            );
          } else {
            alertError('Collection creating failed!');
          }
        })
        .finally(() => {
          decreaseLoading(true);
          setWaitingTransaction(false);
        });
    }
  };

  const handleCreateCollection = async () => {
    const errors = validateCollection(collection);

    if (errors.length > 0) {
      for (const error of errors) {
        alertError(error);
      }
      return;
    }

    await checkDuplicateOfName(collection.collection_name);

    submitCollection(collection);
  };

  const checkDuplicateOfName = async (name: string): Promise<boolean> => {
    if (name.trim().length === 0) {
      return true;
    }

    const res = await Collection.getByName(name);
    if (res && oldName !== name) {
      setDuplicate(true);
      setAvaiableSubmit(false);
      return true;
    } else {
      setDuplicate(false);
      setAvaiableSubmit(true);
      return false;
    }
  };

  return (
    <>
      {waitingTransaction && (
        <div tw="fixed left-0 top-0 w-full h-full flex justify-center items-center z-20">
          <div tw="px-6 py-2 w-full max-w-[380px] font-semibold text-base leading-[150%] tracking-tight text-center text-gray-500 bg-white rounded-[7px] shadow-lg">
            Waiting the transaction to be confirmed...
          </div>
        </div>
      )}
      <div
        css={waitingTransaction ? { filter: 'blur(8px)' } : {}}
        tw="mx-auto px-4 py-8 w-full max-w-[1392px]"
      >
        <div tw="inline-block">
          <BackLink handleBack={() => navigate(-1)} />
        </div>
        <div tw="mx-auto pt-8 w-full max-w-[755px]">
          <StyledPageTitle>
            {params?.id
              ? `Edit ${collection.collection_name}`
              : 'Create your Collection'}
          </StyledPageTitle>
          <div tw="py-8 flex flex-col gap-3.5">
            <StyledCard>
              <StyledCardTitle>
                Upload Collection Profile Image, 3D Model, Video (Max size:
                100mb)*
              </StyledCardTitle>
              <StyledCardSubtitle>
                Supported file types JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV,
                OGG, GLB, GLTF. 350 x 350 recommended.
              </StyledCardSubtitle>
              <div tw="w-full max-w-[200px]">
                <FileDropZone
                  rounded
                  default={collection.collection_profile_image_url}
                  id="collection_profile_image_url"
                  setUploadedFileUrl={(url: string) =>
                    setCollectionField('collection_profile_image_url', url)
                  }
                />
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>
                Collection background image (Upload Image, 3D Model, Video)
              </StyledCardTitle>
              <StyledCardSubtitle>
                Supported file types JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV,
                OGG, GLB, GLTF. 1200 x 220 recommended.{' '}
              </StyledCardSubtitle>
              <FileDropZone
                default={collection.collection_background_image_url}
                id="collection_background_image_url"
                setUploadedFileUrl={(url: string) =>
                  setCollectionField('collection_background_image_url', url)
                }
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Collection</StyledCardTitle>
              <StyledInput
                value={collection.collection_name}
                onBlur={(e) => checkDuplicateOfName(e.target.value)}
                onChange={(e) => {
                  setCollectionField('collection_name', e.target.value);
                  setDuplicate(false);
                  setAvaiableSubmit(false);
                }}
              />
              {duplicate && (
                <div tw="pt-2 text-xs text-[#DD3939]">
                  * This name is occupied by the other collection.
                </div>
              )}
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Description</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                The description will be included on the Collections profile
                page. Markdown syntax is supported.
              </StyledCardSubtitle>
              <StyledTextArea
                value={collection.collection_description}
                onChange={(e) =>
                  setCollectionField('collection_description', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard tw="relative">
              <StyledCardTitle>Category</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Add up to 3 categories to help your item to be discoverable.
              </StyledCardSubtitle>
              <CategorySelector
                default={collection.collection_category}
                limit={3}
                options={categoryList}
                onChange={setSelectedCategories}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Website Link</StyledCardTitle>
              <StyledInput
                value={collection.collection_website_link}
                onChange={(e) =>
                  setCollectionField('collection_website_link', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Twitter Link</StyledCardTitle>
              <StyledInput
                value={collection.collection_twitter_link}
                onChange={(e) =>
                  setCollectionField('collection_twitter_link', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Discord Link</StyledCardTitle>
              <StyledInput
                value={collection.collection_discord_link}
                onChange={(e) =>
                  setCollectionField('collection_discord_link', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Telegram Link</StyledCardTitle>
              <StyledInput
                value={collection.collection_telegram_link}
                onChange={(e) =>
                  setCollectionField('collection_telegram_link', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Payment tokens</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                These are the tokens that can be used to trade your items.
              </StyledCardSubtitle>
              <div tw="flex justify-center md:justify-start items-center gap-2.5 flex-wrap">
                {tokens.map((item) => (
                  <div
                    key={item.name}
                    css={
                      selectedTokens.includes(item.address)
                        ? {
                            backgroundColor: '#EBF0FF',
                            borderColor: darkMode ? '#fff' : '#000',
                            color: '#000',
                          }
                        : {
                            backgroundColor: 'rgba(245, 245, 247, 0.5)',
                            borderColor: 'rgba(0, 0, 0, 0.15)',
                            color: '#0008',
                          }
                    }
                    tw="p-2.5 flex items-center gap-[9px] bg-[#F5F5F7] dark:bg-[#fff1] border rounded-[7px] cursor-pointer"
                    onClick={() => {
                      if (item.required) {
                        return;
                      }
                      toggleToken(item.address);
                    }}
                  >
                    {getIcon(item.icon, darkMode ? '#fff' : '#000')}
                    <div>
                      <div
                        css={
                          selectedTokens.includes(item.address)
                            ? {
                                color: darkMode ? '#fff' : '#000',
                              }
                            : {
                                color: darkMode ? '#fff4' : '#0008',
                              }
                        }
                        tw="font-semibold text-[23px] tracking-tight leading-[140%]"
                      >
                        {item.name}
                      </div>
                      <div tw="text-[14px] tracking-tight leading-[120%] text-[#4d4d4d] dark:text-[#b2b2b2]">
                        {item.network}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Royalties</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Royalty fee for items within the Collection
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
                  value={collection.collection_fee}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value > 10) {
                      setFeeError(true);
                      value = 10;
                    } else {
                      setFeeError(false);
                    }
                    setCollectionField('collection_fee', value);
                  }}
                />
                <span tw="font-semibold text-[22px] text-[#888]">%</span>
              </div>
            </StyledCard>
          </div>
          <div tw="pb-8 flex justify-center">
            <button
              title={
                availableSubmit
                  ? undefined
                  : 'Collection name is required and must be unique.'
              }
              tw="flex items-center gap-1 hover:opacity-75"
              onClick={
                availableSubmit
                  ? () => handleCreateCollection()
                  : () => {
                      alertError(
                        'Collection name is required and must be unique.'
                      );
                    }
              }
              // submitCollection()
            >
              <span
                css={{
                  color: availableSubmit
                    ? darkMode
                      ? '#fff'
                      : '#000'
                    : darkMode
                    ? '#fff5'
                    : '#0005',
                }}
                tw="font-semibold text-base"
              >
                Next
              </span>
              <div tw="-rotate-90 scale-75">
                {getIcon(
                  'dropdown',
                  availableSubmit
                    ? darkMode
                      ? '#fff'
                      : '#000'
                    : darkMode
                    ? '#fff5'
                    : '#0005'
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCollectionPage;
