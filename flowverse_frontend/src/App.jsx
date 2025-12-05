import { Routes, Route } from "react-router-dom"
import Homepage from "./Components/Home"
import Signup from "./Components/Signup"
import Login from "./Components/Login"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App;