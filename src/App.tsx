import React from 'react'
import Layout from './components/Layout'
import JournalPage from './pages/JournalPage'
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <Layout>
      <JournalPage />
      <Toaster />
    </Layout>
  )
}

export default App 