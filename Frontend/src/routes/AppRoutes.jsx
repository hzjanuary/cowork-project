import { Navigate, Routes, Route } from 'react-router-dom';
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
import DoTest from '../pages/TestPage/DoTest.jsx';
import AdminDashboard from '../pages/Admin/AdminDashboard.jsx';
import StudentDashboard from '../pages/Student/StudentDashboard.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import { getRoleHomePath } from './roleRoutes.js';
import { useAuth } from '../hooks/useAuth.js';
import { ToastContainer } from 'react-toastify'

const RoleLanding = () => {
    const { account, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Home />;
    return <Navigate to={getRoleHomePath(account?.role)} replace />;
};

const AppRoutes = () => {
    return (
        <>
            <MainLayout>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<RoleLanding />} />
                    <Route path="/verify-otp" element={<OTPVerify />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/admin" element={<ProtectedRoutes roles={['admin']}><AdminDashboard /></ProtectedRoutes>} />
                    <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="/teacher" element={<ProtectedRoutes roles={['teacher']}><Home /></ProtectedRoutes>} />
                    <Route path="/teacher/dashboard" element={<Navigate to="/teacher" replace />} />
                    <Route path="/student" element={<ProtectedRoutes roles={['student', 'user']}><StudentDashboard /></ProtectedRoutes>} />
                    <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
                    <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
                    <Route path="/questions" element={<ProtectedRoutes roles={['teacher']}><QuestionList /></ProtectedRoutes>} />
                    <Route path="/questions/new" element={<ProtectedRoutes roles={['teacher']}><CreateQuestion /></ProtectedRoutes>} />
                    <Route path="/tests" element={<ProtectedRoutes><TestList /></ProtectedRoutes>} />
                    <Route path="/tests/new" element={<ProtectedRoutes roles={['teacher']}><CreateTest /></ProtectedRoutes>} />
                    <Route path="/tests/:id/do" element={<ProtectedRoutes roles={['student', 'user']}><DoTest /></ProtectedRoutes>} />
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
