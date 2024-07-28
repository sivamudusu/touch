import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import OwnPost from "./pages/OwnPost";
import CommunityHome from "./pages/CommunityHome";
import Saved from "./pages/Saved";
import PublicProfile from "./pages/PublicProfile";
import AllCommunities from "./pages/AllCommunities";
import MyCommunities from "./pages/MyCommunities";
import Following from "./pages/Following";
import SignUp from "./pages/SignUp";


export const privateRoutes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/post/:postId",
      element: <Post />,
    },
    {
      path: "/my/post/:postId",
      element: <OwnPost />,
    },
    {
      path: "/community/:communityName",
      element: <CommunityHome />,
    },
    {
      path: "/saved",
      element: <Saved />,
    },
    {
      path: "/user/:userId",
      element: <PublicProfile />,
    },
    {
      path: "/communities",
      element: <AllCommunities />,
    },
    {
      path: "/my-communities",
      element: <MyCommunities />,
    },
    {
      path: "/following",
      element: <Following />,
    },
  ];