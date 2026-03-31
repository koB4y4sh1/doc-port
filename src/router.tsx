import {createBrowserRouter} from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import AccountPage from './pages/AccountPage';
import ArticlePage from './pages/ArticlePage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignOutPage from './pages/SignOutPage';
import SignUpPage from './pages/SignUpPage';

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/sign-out',
    element: <SignOutPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {path: '/', element: <HomePage />},
          {path: '/article/:slug', element: <ArticlePage />},
          {path: '/account', element: <AccountPage />},
        ],
      },
    ],
  },
]);
