import 'react-toastify/dist/ReactToastify.css';
import './styles/toastify.css';

import { useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { ToastContainer } from 'react-toastify';

import Layout from './components/Layout';
import MobileMenu from './components/MobileMenu';
import { UserContext, UserContextProvider } from './contexts/UserContext';
import CashbackPage from './pages/CashbackPage';
import ChannelDashboard from './pages/ChannelDashboard';
import ChannelsPage from './pages/ChannelsPage';
import CollectionPage from './pages/CollectionPage';
import CreateAccountPage from './pages/CreateAccountPage';
import Explore from './pages/Explore';
import HelpPage from './pages/HelpPage';
import Home from './pages/Home';
import IconTestPage from './pages/IconTestPage';
import ItemPage from './pages/ItemPage';
import MintPage from './pages/MintPage';
import CreateCollectionPage from './pages/MintPage/CreateCollectionPage';
import CreateCollectionSuccessPage from './pages/MintPage/CreateCollectionSuccessPage';
import EditChannelPage from './pages/MintPage/EditChannelPage';
import EditNftPage from './pages/MintPage/EditNftPage';
import MintChannelPage from './pages/MintPage/MintChannelPage';
import MintChannelSuccessPage from './pages/MintPage/MintChannelSuccessPage';
import MintNftPage from './pages/MintPage/MintNftPage';
import MintNftSuccessPage from './pages/MintPage/MintNftSuccessPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/ProfilePage/EditProfilePage';
import ListNftPage from './pages/PurchasePopups/ListNftPage';
import SlicedNftPage from './pages/SlicedNftPage';
import { alertError } from './utils/toast';

const PrivateRoute = ({ children }: { children: any }) => {
  const location = useLocation();
  const { authData } = useContext(UserContext);

  useEffect(() => {
    if (!authData) {
      alertError('To access the page, please login first.');
    }
  }, [authData]);

  return authData ? (
    children
  ) : (
    <Navigate to={`/join?redirect=${location.pathname}${location.search}`} />
  );
};

const App = () => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  // useEagerConnect();
  // useWeb3Listener();

  const toggleMenu = () => {
    setIsMenuOpened(!isMenuOpened);
  };

  return (
    <UserContextProvider>
      <ParallaxProvider>
        <ToastContainer
          autoClose={3000}
          hideProgressBar={true}
          limit={5}
          pauseOnFocusLoss={false}
          theme="colored"
          tw="pt-5"
        />
        <Layout menuOpened={isMenuOpened} onToggleMenu={toggleMenu}>
          <Routes>
            <Route element={<Home />} path="/" />
            <Route element={<Home />} path="/home" />
            <Route element={<ChannelDashboard />} path="/channels" />
            <Route element={<ChannelsPage joined />} path="/channels/:id" />
            <Route
              element={<ChannelsPage joined />}
              path="/channels/:id/joined"
            />
            <Route element={<Explore />} path="/explore" />
            <Route element={<ItemPage />} path="/item/:id" />
            <Route element={<CollectionPage />} path="/collection/:id" />
            <Route
              element={<ProfilePage />}
              path="/profile/wallet-address/:addr"
            />
            <Route element={<ProfilePage />} path="/profile/:id" />
            <Route
              element={
                <PrivateRoute>
                  <EditProfilePage />
                </PrivateRoute>
              }
              path="/profile/:id/edit"
            />
            <Route
              element={
                <PrivateRoute>
                  <ListNftPage />
                </PrivateRoute>
              }
              path="/nft/:nft/list"
            />
            <Route
              element={
                <PrivateRoute>
                  <EditNftPage />
                </PrivateRoute>
              }
              path="/nft/:nft/edit"
            />
            <Route
              element={
                <PrivateRoute>
                  <MintPage />
                </PrivateRoute>
              }
              path="/create"
            />
            <Route
              element={
                <PrivateRoute>
                  <MintChannelPage />
                </PrivateRoute>
              }
              path="/create/mint-channel"
            />
            <Route
              element={
                <PrivateRoute>
                  <EditChannelPage />
                </PrivateRoute>
              }
              path="/create/edit-channel/:id"
            />
            <Route
              element={
                <PrivateRoute>
                  <MintChannelSuccessPage />
                </PrivateRoute>
              }
              path="/create/mint-channel-success"
            />
            <Route
              element={
                <PrivateRoute>
                  <MintNftPage />
                </PrivateRoute>
              }
              path="/create/mint-nft"
            />
            <Route
              element={
                <PrivateRoute>
                  <MintNftSuccessPage />
                </PrivateRoute>
              }
              path="/create/mint-nft-success"
            />
            <Route
              element={
                <PrivateRoute>
                  <CreateCollectionPage />
                </PrivateRoute>
              }
              path="/create/create-collection"
            />
            <Route
              element={
                <PrivateRoute>
                  <CreateCollectionPage />
                </PrivateRoute>
              }
              path="/create/edit-collection/:id"
            />
            <Route
              element={
                <PrivateRoute>
                  <CreateCollectionSuccessPage />
                </PrivateRoute>
              }
              path="/create/create-collection-success"
            />
            <Route element={<CreateAccountPage />} path="/join" />
            <Route element={<CashbackPage />} path="/earn" />
            <Route element={<SlicedNftPage />} path="/sliced-nft" />
            <Route element={<HelpPage />} path="/help" />
            <Route element={<IconTestPage />} path="/icon-test" />
          </Routes>
          {isMenuOpened && (
            <MobileMenu onClose={() => setIsMenuOpened(false)} />
          )}
        </Layout>
      </ParallaxProvider>
    </UserContextProvider>
  );
};

export default App;
