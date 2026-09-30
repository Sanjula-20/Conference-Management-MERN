import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useLocation, Outlet } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dates from './Dates.jsx'

import Committee from './Committee.jsx'
import Speakers from './Speakers.jsx'
import Schedule from './Schedule.jsx'
import { Registration } from './Registration.jsx'
import Admin from './Admin.jsx'
import Reviewer from './Reviewer.jsx'
import PasswordChange from './PasswordChange.jsx'
import ResourceNotFound from './ResourceNotFound.jsx'
import Auth from './Auth.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { FontStyleProvider } from './context/FontStyleContext'
import ReviewerDashboard from './ReviewerDashboard.jsx'
import PaperStatus from './PaperStatus.jsx'
import  RegistrationTable from './Fees.jsx'
import ResearchTracks from './ResearchTracks.jsx'
import ProgramCommittee from './ProgramCommitte.jsx'
import OrganizingCommittee from './OrganizingCommittee.jsx'
import Layout from './Layout.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import Payment from './Payment.jsx'
import CancelPayment from './CancelPayment.jsx'
import SuccessPayment from './SuccessPayment.jsx'
import PaymentDashboard from './PaymentDashboard.jsx'
import ChairpersonDashboard from './ChairpersonDashboard.jsx'
import OAuthCallback from './OAuthCallback.jsx'

// Root component that includes ScrollToTop
function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <ResourceNotFound />,
      children: [
        { index: true, element: <App /> },
        { path: 'auth', element: <Auth /> },
        { path: 'oauth/callback', element: <OAuthCallback /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
              { path: 'dates', element: <Dates /> },
        { path: 'tracks', element: <ResearchTracks />  },
        { path: 'committee', element: <Committee /> },
        { path: 'program-committee', element: <ProgramCommittee /> },
        { path: 'organizing-committee', element: <OrganizingCommittee /> },
        { path: 'speakers', element: <Speakers /> },
        { path: 'schedule', element: <Schedule /> },
        { path: 'registration', element: <Registration /> },
        { path: 'admin', element: <Admin /> },
        { path: 'reviewer', element: <Reviewer /> },
        { path: 'reviewer-dashboard', element: <ReviewerDashboard /> },
        { path: 'chairperson', element: <ChairpersonDashboard /> },
        { path: 'paper-status', element: <PaperStatus /> },
        { path: 'change-password', element: <PasswordChange /> },
        { path: 'reset-password/:token', element: <ResetPassword /> },
        { path: 'fees', element: <RegistrationTable /> },
        { path: 'payment', element: <Payment /> },
        { path: 'payment-dashboard', element: <PaymentDashboard /> },
        { path: 'success-payment', element: <SuccessPayment /> },
        { path: 'cancel-payment', element: <CancelPayment /> }

      ]









      
    }
  ],
  {
    basename: '/ICoDSES/'
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FontStyleProvider>
        <RouterProvider router={router} />
      </FontStyleProvider>
    </AuthProvider>
  </StrictMode>
)
