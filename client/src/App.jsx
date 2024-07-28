import { useState } from 'react'
import {useSelector}from "react-redux"
import {Route,BrowserRouter as Router,Routes} from "react-router-dom"
import User from './components/User'
import SignIn from './pages/SignIn'
import SignUpNew from './pages/SignUp'
import Home from './pages/Home'
import PrivateRoute from './PrivateRoute'
import Profile from './pages/Profile'
import CommunityHome from './pages/CommunityHome'
import Post from './pages/Post'
import AllCommunities from './pages/AllCommunities'


function App() {
  const userData = useSelector((state) => state.auth?.userData);
  const adminAccessToken = JSON.parse(
    localStorage.getItem("admin")
  )?.accessToken;


  return (
      <Routes>

        <Route element={<PrivateRoute userData={userData}/>}>
          <Route path='/' element={<Home/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/community/:communityName' element={<CommunityHome/>}/>
          <Route path='/post/:postId' element={<Post/>}/>
          <Route path='communities'element = {<AllCommunities/>}/>
        </Route>
        <Route path='/signin' element = {<SignIn/>}/>
        <Route path='/signup' element={<SignUpNew/>}/>

      </Routes>
  )
}

export default App
