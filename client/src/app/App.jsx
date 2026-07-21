import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

import MarketingLayout from '@/layouts/MarketingLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

// Every route is code-split (React.lazy) so the initial bundle only ships
// the marketing shell — dashboard/admin/creator chunks load on demand.
const Landing = lazy(() => import('@/pages/marketing/Landing'))
const Features = lazy(() => import('@/pages/marketing/Features'))
const Pricing = lazy(() => import('@/pages/marketing/Pricing'))
const About = lazy(() => import('@/pages/marketing/About'))
const Contact = lazy(() => import('@/pages/marketing/Contact'))

const Login = lazy(() => import('@/pages/auth/Login'))
const Signup = lazy(() => import('@/pages/auth/Signup'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const OtpVerification = lazy(() => import('@/pages/auth/OtpVerification'))

const Home = lazy(() => import('@/pages/dashboard/Home'))
const Discover = lazy(() => import('@/pages/dashboard/Discover'))
const Search = lazy(() => import('@/pages/dashboard/Search'))
const Rooms = lazy(() => import('@/pages/dashboard/Rooms'))
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'))
const Messages = lazy(() => import('@/pages/dashboard/Messages'))

const CreateRoom = lazy(() => import('@/pages/rooms/CreateRoom'))
const RoomDetails = lazy(() => import('@/pages/rooms/RoomDetails'))

const Playlists = lazy(() => import('@/pages/playlists/Playlists'))
const PlaylistDetails = lazy(() => import('@/pages/playlists/PlaylistDetails'))

const Library = lazy(() => import('@/pages/library/Library'))

const Profile = lazy(() => import('@/pages/profile/Profile'))
const EditProfile = lazy(() => import('@/pages/profile/EditProfile'))

const CreatorDashboard = lazy(() => import('@/pages/creator/CreatorDashboard'))
const Wallet = lazy(() => import('@/pages/creator/Wallet'))

const Settings = lazy(() => import('@/pages/settings/Settings'))
const AccountSettings = lazy(() => import('@/pages/settings/AccountSettings'))
const SecuritySettings = lazy(() => import('@/pages/settings/SecuritySettings'))
const AppearanceSettings = lazy(() => import('@/pages/settings/AppearanceSettings'))
const PrivacySettings = lazy(() => import('@/pages/settings/PrivacySettings'))
const BlockedUsers = lazy(() => import('@/pages/settings/BlockedUsers'))

const Subscription = lazy(() => import('@/pages/subscription/Subscription'))
const HelpCenter = lazy(() => import('@/pages/help/HelpCenter'))

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'))
const ManageUsers = lazy(() => import('@/pages/admin/ManageUsers'))
const ManageRooms = lazy(() => import('@/pages/admin/ManageRooms'))
const ReportedMessages = lazy(() => import('@/pages/admin/ReportedMessages'))
const Moderation = lazy(() => import('@/pages/admin/Moderation'))

const NotFound = lazy(() => import('@/pages/errors/NotFound'))
const ServerError = lazy(() => import('@/pages/errors/ServerError'))
const Maintenance = lazy(() => import('@/pages/errors/Maintenance'))
const OAuthCallback = lazy(() => import('@/pages/auth/OAuthCallback'))

export default function App() {
  return (
    <Routes>
      {/* Marketing */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/verify-email" element={<OtpVerification />} />
      </Route>
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* App (dashboard shell) — requires auth */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="search" element={<Search />} />

          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/create" element={<CreateRoom />} />
          <Route path="rooms/:roomId" element={<RoomDetails />} />

          <Route path="playlists" element={<Playlists />} />
          <Route path="playlists/:playlistId" element={<PlaylistDetails />} />

          <Route path="library" element={<Library />} />

          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="users/:id" element={<Profile />} />

          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />

          <Route path="creator" element={<CreatorDashboard />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="help" element={<HelpCenter />} />

          <Route path="settings" element={<Settings />}>
            <Route index element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="blocked" element={<BlockedUsers />} />
          </Route>

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="rooms" element={<ManageRooms />} />
              <Route path="reports" element={<ReportedMessages />} />
              <Route path="moderation" element={<Moderation />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Standalone error/status pages */}
      <Route path="/500" element={<ServerError />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
