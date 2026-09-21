import { Navigate, Route, Routes } from 'react-router-dom'
import Launcher from './pages/Launcher'
import AppLayout from './pages/AppLayout'
import HomeStub from './pages/HomeStub'
import Messages from './pages/Messages'
import CommunityShell from './pages/community/CommunityShell'
import GroupsTab from './pages/community/GroupsTab'
import PixelPalFeedTab from './pages/community/PixelPalFeedTab'
import MyAsk from './pages/community/MyAsk'
import Chat from './pages/community/Chat'
import PalMatchHowItWorks from './pages/pal-match/HowItWorks'
import PalMatchRequestNeeds from './pages/pal-match/RequestNeeds'
import PalMatchRequestNote from './pages/pal-match/RequestNote'
import PalMatchSocialProfilePreview from './pages/pal-match/SocialProfilePreview'
import PalMatchSocialProfileEdit from './pages/pal-match/SocialProfileEdit'
import PalMatchFinding from './pages/pal-match/PixelPalFinding'
import PalMatchFound from './pages/pal-match/PixelPalMatchFound'
import PalMatchNoMatchYet from './pages/pal-match/PixelPalNoMatchYet'
import PalMatchChat from './pages/pal-match/PixelPalChat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />

      {/* Short, shareable entry points (deep links) into the two features —
          each just forwards to its real route, so the in-app URLs stay the
          single source of truth. */}
      <Route path="/peer-support" element={<Navigate to="/groups/pixel-pal" replace />} />
      <Route path="/pixel-pal" element={<Navigate to="/pixel-pal-match/how-it-works" replace />} />

      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomeStub />} />
        <Route path="/messages" element={<Messages />} />

        <Route path="/groups" element={<CommunityShell />}>
          <Route index element={<GroupsTab />} />
          <Route path="pixel-pal" element={<PixelPalFeedTab />} />
        </Route>
        <Route path="/groups/pixel-pal/my-ask" element={<MyAsk />} />
        <Route path="/groups/pixel-pal/chat/:conversationId" element={<Chat />} />

        {/* Pal Auto Match — ported from V2, Phase 2A: onboarding through the
            matching result screens only, not yet connected to a conversation. */}
        <Route path="/pixel-pal-match/how-it-works" element={<PalMatchHowItWorks />} />
        <Route path="/pixel-pal-match/request/needs" element={<PalMatchRequestNeeds />} />
        <Route path="/pixel-pal-match/request/note" element={<PalMatchRequestNote />} />
        <Route path="/pixel-pal-match/social-profile-preview" element={<PalMatchSocialProfilePreview />} />
        <Route path="/pixel-pal-match/social-profile-edit" element={<PalMatchSocialProfileEdit />} />
        <Route path="/pixel-pal-match/finding" element={<PalMatchFinding />} />
        <Route path="/pixel-pal-match/match-found" element={<PalMatchFound />} />
        <Route path="/pixel-pal-match/no-match-yet" element={<PalMatchNoMatchYet />} />
        <Route path="/pixel-pal-match/chat/:conversationId" element={<PalMatchChat />} />
      </Route>
    </Routes>
  )
}

export default App
