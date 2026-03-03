import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PowerBIReport from "./PowerBIReport";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <PowerBIReport />
  </StrictMode>,
)
