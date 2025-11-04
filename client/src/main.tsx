import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './routes/App'
import Dashboard from './routes/Dashboard'
import Admin from './routes/Admin'
import Login from './routes/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'admin', element: <Admin /> },
      { path: 'login', element: <Login /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
