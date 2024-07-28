import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter}from 'react-router-dom'
import AppContainer from './AppContainer.jsx'
import './index.css'
import 'tailwindcss/tailwind.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContainer/>
  </BrowserRouter>
   
)
