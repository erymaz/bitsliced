import 'twin.macro';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Channel } from '../../api/api';
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
import {
  ChannelData,
  ChannelPermission,
  ChannelPermissionTitle,
  defaultChannelData,
  defaultChannelPermission,
  Property,
} from '../../type.d';
import { validateUrl } from '../../utils';
import { alertError, alertSuccess, alertWarning } from '../../utils/toast';
import { data as categories } from '../Home/CategoriesSection';

const EditChannelPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { darkMode, decreaseLoading, increaseLoading, setCreatedChannel } =
    useContext(UserContext);

  const [channel, setChannel] = useState<ChannelData>(defaultChannelData);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<boolean[]>(
    defaultChannelPermission
  );
  const [availableSubmit, setAvaiableSubmit] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setChannelField = (
    field: string,
    value: string | number | boolean | string[] | boolean[] | Property[]
  ) => {
    setChannel({ ...channel, [field]: value });
  };

  useEffect(() => {
    const categoryList = categories.map((item) => item.title);
    setCategoryList(categoryList);
  }, []);

  useEffect(() => {
    if (params?.id) {
      Channel.getById(params.id)
        .then((res) => {
          if (res) {
            console.log('edit', res);
            setChannel(res);
            if (res.channel_permissions && res.channel_permissions.length > 0) {
              setPermissions(res.channel_permissions);
            }
            setAvaiableSubmit(true);
          }
        })
        .catch((e) => {
          console.error();
          alertError(e.toString());
        });
    }
  }, [params?.id]);

  useEffect(() => {
    setChannelField('channel_category', selectedCategories);
  }, [selectedCategories]);

  useEffect(() => {
    setChannelField('channel_permissions', permissions);
  }, [permissions]);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  }, [errorMessage]);

  const validUrl = useMemo(
    () => validateUrl(channel.channel_external_link),
    [channel]
  );

  const toggleEvrythingPermission = () => {
    if (permissions[ChannelPermission.EVERYTHING]) {
      setPermissions([
        false,
        permissions[ChannelPermission.CREATE_POSTS],
        permissions[ChannelPermission.COMMENT_LINKS],
        permissions[ChannelPermission.COMMENT_MEDIA],
      ]);
    } else {
      setPermissions([true, true, true, true]);
    }
  };

  const togglePermission = (index: ChannelPermission) => {
    const newValue = [...(permissions ?? defaultChannelPermission)];
    newValue[index] = !permissions[index];
    if (index > ChannelPermission.EVERYTHING && permissions[index]) {
      newValue[ChannelPermission.EVERYTHING] = false;
    }
    if (
      newValue[ChannelPermission.CREATE_POSTS] &&
      newValue[ChannelPermission.COMMENT_LINKS] &&
      newValue[ChannelPermission.COMMENT_MEDIA]
    ) {
      newValue[ChannelPermission.EVERYTHING] = true;
    }
    setPermissions(newValue);
  };

  const validateCollection = (channel: ChannelData): string[] => {
    const res = [];
    if ((channel.channel_category ?? []).length === 0) {
      res.push('Collection category cannot be empty.');
    }
    if ((channel.channel_profile_image_url ?? '').trim().length === 0) {
      res.push('Collection profile image cannot be null.');
    }
    if ((channel.channel_background_image_url ?? '').trim().length === 0) {
      res.push('Collection background image cannot be null.');
    }
    return res;
  };

  const handleUpdateChannel = async () => {
    const errors = validateCollection(channel);
    console.log(channel);

    if (errors.length > 0) {
      for (const error of errors) {
        alertError(error);
      }
      return;
    }

    if (params?.id) {
      increaseLoading(true);
      Channel.update(params.id, {
        channel_background_image_url: channel.channel_background_image_url,
        channel_category: channel.channel_category,
        channel_description: channel.channel_description,
        channel_external_link: channel.channel_external_link,
        channel_permissions: channel.channel_permissions,
        channel_profile_image_url: channel.channel_profile_image_url,
        channel_ticket_price: channel.channel_ticket_price,
      })
        .then((res) => {
          setCreatedChannel(res);
          setChannel(res);
          alertSuccess('Your channel has been updated!');
          navigate(`/channels/${params.id}`);
        })
        .catch((e) => alertError(JSON.stringify(e)))
        .finally(() => decreaseLoading(true));
    }
  };

  return (
    <>
      <div tw="mx-auto px-4 py-8 w-full max-w-[1392px]">
        <div tw="inline-block">
          <BackLink handleBack={() => navigate(-1)} />
        </div>
        <div tw="mx-auto pt-8 w-full max-w-[755px]">
          <StyledPageTitle>
            {params?.id
              ? `Edit ${channel.channel_name}`
              : 'Create your Channel'}
          </StyledPageTitle>
          <div tw="py-8 flex flex-col gap-3.5">
            <StyledCard>
              <StyledCardTitle>
                Channel profile image (Upload Image, 3D Model, Video)
              </StyledCardTitle>
              <div tw="w-full max-w-[350px]">
                <FileDropZone
                  default={channel.channel_profile_image_url}
                  id="channel_profile_image_url"
                  setUploadedFileUrl={(url: string) => {
                    setChannelField('channel_profile_image_url', url);
                  }}
                />
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>
                Channel background image (Upload Image, 3D Model, Video)
              </StyledCardTitle>
              <FileDropZone
                default={channel.channel_background_image_url}
                id="channel_background_image_url"
                setUploadedFileUrl={(url: string) => {
                  setChannelField('channel_background_image_url', url);
                }}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>External Link</StyledCardTitle>
              <StyledInput
                type="url"
                value={channel.channel_external_link}
                onChange={(e) =>
                  setChannelField('channel_external_link', e.target.value)
                }
              />
              {!validUrl && (
                <div tw="pt-1 text-[12px] text-[#d40]">Invalid URL</div>
              )}
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Description</StyledCardTitle>
              <StyledTextArea
                value={channel.channel_description}
                onChange={(e) =>
                  setChannelField('channel_description', e.target.value)
                }
              />
            </StyledCard>
            <StyledCard tw="relative">
              <StyledCardTitle>Category</StyledCardTitle>
              <StyledCardSubtitle tw="pt-0">
                Add up to 3 categories to help your item to be discoverable.
              </StyledCardSubtitle>
              <CategorySelector
                default={channel.channel_category}
                limit={3}
                options={categoryList}
                onChange={setSelectedCategories}
              />
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>Channel Permissions</StyledCardTitle>
              <div tw="flex flex-col gap-2.5">
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.EVERYTHING]}
                    id="permission1"
                    type="checkbox"
                    onClick={() => toggleEvrythingPermission()}
                  />
                  <label
                    htmlFor="permission1"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.EVERYTHING]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.CREATE_POSTS]}
                    id="permission2"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.CREATE_POSTS)
                    }
                  />
                  <label
                    htmlFor="permission2"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.CREATE_POSTS]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.COMMENT_LINKS]}
                    id="permission3"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.COMMENT_LINKS)
                    }
                  />
                  <label
                    htmlFor="permission3"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.COMMENT_LINKS]}
                  </label>
                </div>
                <div tw="flex items-center gap-2">
                  <input
                    checked={permissions?.[ChannelPermission.COMMENT_MEDIA]}
                    id="permission4"
                    type="checkbox"
                    onClick={() =>
                      togglePermission(ChannelPermission.COMMENT_MEDIA)
                    }
                  />
                  <label
                    htmlFor="permission4"
                    tw="text-base tracking-tight leading-[150%] text-dark dark:text-light/90"
                  >
                    {ChannelPermissionTitle[ChannelPermission.COMMENT_MEDIA]}
                  </label>
                </div>
              </div>
            </StyledCard>
            <StyledCard>
              <StyledCardTitle>
                Set the Channel Ticket price to subscribe to your Channel
              </StyledCardTitle>
              <StyledInput
                min={0.01}
                step={0.1}
                type="number"
                value={channel.channel_ticket_price}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  setChannelField('channel_ticket_price', value);
                }}
              />
            </StyledCard>
          </div>
          <div tw="pb-8 flex justify-center">
            <button
              // to="/create/mint-channel-success"
              title={
                availableSubmit
                  ? undefined
                  : 'Channel name is required and must be unique.'
              }
              tw="flex items-center gap-1 hover:opacity-75"
              onClick={() =>
                availableSubmit && validUrl
                  ? handleUpdateChannel()
                  : () => {
                      if (!validUrl) {
                        alertWarning('Invalid external link!');
                      }
                      return;
                    }
              }
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
                Save Channel
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

export default EditChannelPage;
