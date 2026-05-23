import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import MockExam from './pages/MockExam'
import WrongQuestions from './pages/WrongQuestions'
import Flashcard from './pages/Flashcard'
import KnowledgeBank from './pages/KnowledgeBank'
import LawChanges from './pages/LawChanges'
import Predictions from './pages/Predictions'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/mock" element={<MockExam />} />
        <Route path="/wrong" element={<WrongQuestions />} />
        <Route path="/flashcard" element={<Flashcard />} />
        <Route path="/knowledge" element={<KnowledgeBank />} />
        <Route path="/laws" element={<LawChanges />} />
        <Route path="/predictions" element={<Predictions />} />
      </Routes>
    </BrowserRouter>
  )
}
