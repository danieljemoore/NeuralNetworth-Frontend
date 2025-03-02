import React, { } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from '@/context/ThemeProvider';
import { WebSocketProvider } from '@/context/WebSocketProvider';
import { UserProvider } from '@/context/UserProvider';
import StoryIntroPage from '@/pages/StoryIntroPage';
import PlayerNamePage from '@/pages/PlayerNamePage';
import CompanyList from '@/components/CompanyList';
import WebSocketComponent from '@/components/WebSocketComponent';
import WebSocketDisplay from '@/components/WebSocketDisplay';
import PlayerStatusHeader from '@/components/PlayerStatusHeader';
import FooterNav from '@/components/FooterNav';
import StartGameButton from '@/components/StartGameButton';
import Timer from '@/components/Timer';

const App = () => {
  return (
    <div className="App">
      <WebSocketProvider>
        <UserProvider>
          <ThemeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<StoryIntroPage />} />
                <Route path="/name" element={<PlayerNamePage />} />
                <Route path="/stocks" element={
                  <>
                    <div className="sticky top-0 shadow-md z-10">
                      <PlayerStatusHeader />
                    </div>
                    <div className="pb-10">
                      <CompanyList />
                    </div>
                    <div className="fixed bottom-0 right-0 p-4">
                      <FooterNav />
                    </div>
                  </>
                } />
                <Route path="/websocket" element={<WebSocketDisplay />} />
                <Route path="/testing" element={
                  <>
                    <PlayerStatusHeader />
                    <CompanyList />
                    <Timer />
                    <WebSocketDisplay />
                  </>
                } />
              </Routes>
            </Router>
          </ThemeProvider>
        </UserProvider>
      </WebSocketProvider>
    </div>
  )
};

export default App;
