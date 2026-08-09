import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import MockExam from './pages/MockExam'
import WrongQuestions from './pages/WrongQuestions'
import Flashcard from './pages/Flashcard'
import KnowledgeBank from './pages/KnowledgeBank'
import LawChanges from './pages/LawChanges'
import Predictions from './pages/Predictions'
import ShukeyiGuide from './pages/ShukeyiGuide'
import ExamStats from './pages/ExamStats'
import LawReference from './pages/LawReference'
import WorkedExamples from './pages/WorkedExamples'
import Unlock from './pages/Unlock'
import PaymentResult from './pages/PaymentResult'

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
        <Route path="/shukeyi" element={<ShukeyiGuide />} />
        <Route path="/stats" element={<ExamStats />} />
        <Route path="/law-ref" element={<LawReference />} />
        <Route path="/worked" element={<WorkedExamples />} />
        <Route path="/unlock" element={<Unlock />} />
        <Route path="/payment-result" element={<PaymentResult />} />
      </Routes>
    </BrowserRouter>
  )
}
