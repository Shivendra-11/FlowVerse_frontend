import { Routes, Route, Navigate } from "react-router-dom"
import Homepage from "./Components/Home"
import Signup from "./Components/Signup"
import Login from "./Components/Login"
import {checkAuth} from "./authSlice"; 
import { useDispatch,useSelector } from "react-redux"
import { useEffect } from "react";

function App() {
const { isAuthenticated } = useSelector((state) => state.auth); 
const dispatch = useDispatch();

useEffect(() => {
    dispatch(checkAuth());
}, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
    </Routes>
  )
}

export default App;