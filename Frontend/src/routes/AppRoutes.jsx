import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import Login from '../pages/Authentication/Login.jsx';
import Register from '../pages/Authentication/Register.jsx';
import OTPVerify from '../pages/Authentication/OTPVerify.jsx';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import { ToastContainer } from 'react-toastify'

const AppRoutes = () => {
    return (
        <>
            <MainLayout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/verify-otp" element={<OTPVerify />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </MainLayout>
        </>
    )
}

export default AppRoutes;