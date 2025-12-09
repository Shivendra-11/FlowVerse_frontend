import { Routes, Route, Navigate } from "react-router-dom"
import Homepage from "./Components/Home"
import Signup from "./Components/Signup"
import Login from "./Components/Login"
import { restoreAuth } from "./authSlice"; 
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react";

function App() {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth); 
  const dispatch = useDispatch();

  useEffect(() => {
    // Try to restore authentication from localStorage on app load
    dispatch(restoreAuth());
  }, [dispatch]);

  // Show loading spinner while checking auth
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
    </Routes>
  )
}

export default App;