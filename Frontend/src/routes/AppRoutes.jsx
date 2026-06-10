import { Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import Login from '../pages/Authentication/Login.jsx';
import Register from '../pages/Authentication/Register.jsx';
import OTPVerify from '../pages/Authentication/OTPVerify.jsx';
import ForgotPassword from '../pages/Authentication/ForgotPassword.jsx';
import ResetPassword from '../pages/Authentication/ResetPassword.jsx';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import FAQ from '../pages/FAQ.jsx';
import QuestionList from '../pages/QuestionPage/QuestionList.jsx';
import CreateQuestion from '../pages/QuestionPage/CreateQuestion.jsx';
import TestList from '../pages/TestPage/TestList.jsx';
import CreateTest from '../pages/TestPage/CreateTest.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import { ToastContainer } from 'react-toastify'

const AppRoutes = () => {
    return (
        <>
            <MainLayout>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/verify-otp" element={<OTPVerify />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
                    <Route path="/questions" element={<ProtectedRoutes><QuestionList /></ProtectedRoutes>} />
                    <Route path="/questions/new" element={<ProtectedRoutes><CreateQuestion /></ProtectedRoutes>} />
                    <Route path="/tests" element={<ProtectedRoutes><TestList /></ProtectedRoutes>} />
                    <Route path="/tests/new" element={<ProtectedRoutes><CreateTest /></ProtectedRoutes>} />
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
