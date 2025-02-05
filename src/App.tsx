import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from './components/Layout'
import JournalPage from './pages/JournalPage'
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JournalPage />} />
        </Routes>
        <Toaster />
      </Layout>
    </Router>
  );
}

export default App; 