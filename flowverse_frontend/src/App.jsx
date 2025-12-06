import { Routes, Route } from "react-router-dom"
import Homepage from "./Components/Home"
import Signup from "./Components/Signup"
import Login from "./Components/Login"
import {checkAuth} from "./redux/authSlice" 
import { useDispatch,useSelector } from "react-redux"
import { useEffect } from "react";

function App() {
const isAuthenticated = useSelector((state) => state.auth);
const dispatch = useDispatch();

useEffect(() => {
    dispatch(checkAuth());
}, [dispatch, isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App;