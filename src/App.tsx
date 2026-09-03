import { Route, Routes } from 'react-router-dom'
import Launcher from './pages/Launcher'
import AppLayout from './pages/AppLayout'
import HomeStub from './pages/HomeStub'
import Messages from './pages/Messages'
import CommunityShell from './pages/community/CommunityShell'
import GroupsTab from './pages/community/GroupsTab'
import PixelPalFeedTab from './pages/community/PixelPalFeedTab'
import MyAsk from './pages/community/MyAsk'
import Chat from './pages/community/Chat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />

      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomeStub />} />
        <Route path="/messages" element={<Messages />} />

        <Route path="/groups" element={<CommunityShell />}>
          <Route index element={<GroupsTab />} />
          <Route path="pixel-pal" element={<PixelPalFeedTab />} />
        </Route>
        <Route path="/groups/pixel-pal/my-ask" element={<MyAsk />} />
        <Route path="/groups/pixel-pal/chat/:conversationId" element={<Chat />} />
      </Route>
    </Routes>
  )
}

export default App
