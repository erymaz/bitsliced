import 'twin.macro';

import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Auth } from '../../api/api';
import BackLink from '../../components/BackLink';
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
import { alertError, alertSuccess } from '../../utils/toast';

const EditProfilePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { decreaseLoading, increaseLoading, logout, setUser, user } =
    useContext(UserContext);

  const [profile_image_url, setProfileImageUrl] = useState<string>('');
  const [background_image_url, setCoverImageUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [nameToDelete, setNameToDelete] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [website_link, setWebSiteLink] = useState<string>('');
  const [discord_link, setDiscordLink] = useState<string>('');
  const [twitter_link, setTwitterLink] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    if (params.id && user?._id && params.id !== user._id) {
      navigate(-1);
    }
  }, [params.id, user?._id, navigate]);

  useEffect(() => {
    if (params?.id) {
      increaseLoading(true);
      Auth.get(params.id)
        .then((res) => {
          if (res) {
            setProfileImageUrl(res.profile_image_url ?? '');
            setCoverImageUrl(res.background_image_url ?? '');
            setName(res.name ?? '');
            setDescription(res.description ?? '');
            setWebSiteLink(res.website_link ?? '');
            setDiscordLink(res.discord_link ?? '');
            setTwitterLink(res.twitter_link ?? '');
            setWalletAddress(res.walletAddress ?? '');
          }
        })
        .catch((e) => {
          alertError(e.toString());
        })
        .finally(() => decreaseLoading(true));
    }
  }, [params.id, increaseLoading, decreaseLoading]);

  const saveProfile = () => {
    increaseLoading(true);
    Auth.edit(params?.id ?? '', {
      background_image_url,
      description,
      discord_link,
      name,
      profile_image_url,
      twitter_link,
      website_link,
    })
      .then((res) => {
        if (res) {
          setUser(res);
          alertSuccess('Your profile info has been updated successfully!');
          navigate(`/profile/${params?.id}`);
        }
      })
      .catch((e) => alertError(e.toString()))
      .finally(() => decreaseLoading(true));
  };

  const deleteProfile = () => {
    if (nameToDelete === name) {
      increaseLoading(true);
      Auth.delete(params?.id ?? '')
        .then((res) => {
          if (res) {
            logout();
            navigate('/');
          }
        })
        .catch((e) => alertError(e.toString()))
        .finally(() => decreaseLoading(true));
    }
  };

  return (
    <div tw="mx-auto px-4 py-8 w-full max-w-[1392px]">
      <div tw="inline-block">
        <BackLink handleBack={() => navigate(-1)} />
      </div>
      <div tw="mx-auto pt-8 w-full max-w-[755px]">
        <StyledPageTitle>Edit Profile</StyledPageTitle>
        <div tw="py-8 flex flex-col gap-3.5">
          <StyledCard>
            <StyledCardTitle>
              Upload Image, 3D Model, Video (Max size: 100mb)*
            </StyledCardTitle>
            <StyledCardSubtitle>
              Supported file types JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG,
              GLB, GLTF
            </StyledCardSubtitle>
            <div tw="w-full max-w-[200px]">
              <FileDropZone
                rounded
                default={profile_image_url}
                id="image"
                setUploadedFileUrl={(url: string) => {
                  setProfileImageUrl(url);
                }}
              />
            </div>
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>
              Profile background image (Upload Image, 3D Model, Video)
            </StyledCardTitle>
            <StyledCardSubtitle>
              Supported file types JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG,
              GLB, GLTF. 1200 x 220 recommended.
            </StyledCardSubtitle>
            <FileDropZone
              default={background_image_url}
              id="background_image_url"
              setUploadedFileUrl={(url: string) => setCoverImageUrl(url)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Username</StyledCardTitle>
            <StyledInput
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Description</StyledCardTitle>
            <StyledTextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Website</StyledCardTitle>
            <StyledInput
              value={website_link}
              onChange={(e) => setWebSiteLink(e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Discord</StyledCardTitle>
            <StyledInput
              value={discord_link}
              onChange={(e) => setDiscordLink(e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Twitter</StyledCardTitle>
            <StyledInput
              value={twitter_link}
              onChange={(e) => setTwitterLink(e.target.value)}
            />
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>Connected Wallet</StyledCardTitle>
            <div tw="flex items-center gap-3.5">
              <StyledInput
                value={walletAddress}
                // onChange={(e) => setWalletAddress(e.target.value)}
              />
              <button
                tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-dark dark:text-light  cursor-pointer"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Disconnect Wallet
              </button>
            </div>
          </StyledCard>
          <StyledCard>
            <StyledCardTitle>
              Delete User Account (Type in your current Username)
            </StyledCardTitle>
            <div tw="flex items-center gap-3.5">
              <StyledInput
                value={nameToDelete}
                onChange={(e) => setNameToDelete(e.target.value)}
              />
              <button
                tw="px-3.5 font-semibold text-base tracking-tight leading-[150%] whitespace-nowrap text-[#DD3939] cursor-pointer"
                onClick={() => deleteProfile()}
              >
                Delete
              </button>
            </div>
          </StyledCard>
        </div>
        <div tw="pb-8 flex justify-center">
          <button
            tw="px-3.5 h-10 font-semibold text-base tracking-tight leading-[150%] text-light/90 bg-[#3169FA] rounded-[100px]"
            onClick={() => saveProfile()}
          >
            Save Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
