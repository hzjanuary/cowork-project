import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import Login from '../pages/Authentication/Login.jsx';
import Register from '../pages/Authentication/Register.jsx';
import OTPVerify from '../pages/Authentication/OTPVerify.jsx';
import ForgotPassword from '../pages/Authentication/ForgotPassword.jsx';
import ResetPassword from '../pages/Authentication/ResetPassword.jsx';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import CreateProfile from '../pages/CreateProfile.jsx';
import FAQ from '../pages/FAQ.jsx';
import AdminLogin from '../pages/Authentication/Admin/AdminLogin.jsx';
import AccountList from '../pages/Authentication/Admin/AccountList.jsx';
import AnswerQuestion from '../pages/QuestionPage/AnswerQuestion.jsx';
import CreateQuestion from '../pages/QuestionPage/CreateQuestion.jsx';
import Question from '../pages/QuestionPage/Question.jsx';
import QuestionList from '../pages/QuestionPage/QuestionList.jsx';
import CreateTest from '../pages/TestPage/CreateTest.jsx';
import DoTest from '../pages/TestPage/DoTest.jsx';
import Test from '../pages/TestPage/Test.jsx';
import TestList from '../pages/TestPage/TestList.jsx';
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
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Routes */}
                    <Route path="/profile" element={
                        <ProtectedRoutes>
                            <Profile />
                        </ProtectedRoutes>
                    } />
                    <Route path="/create-profile" element={
                        <ProtectedRoutes>
                            <CreateProfile />
                        </ProtectedRoutes>
                    } />

                    {/* Question Routes */}
                    <Route path="/questions" element={
                        <ProtectedRoutes>
                            <QuestionList />
                        </ProtectedRoutes>
                    } />
                    <Route path="/create-question" element={
                        <ProtectedRoutes>
                            <CreateQuestion />
                        </ProtectedRoutes>
                    } />
                    <Route path="/questions/:id" element={
                        <ProtectedRoutes>
                            <Question />
                        </ProtectedRoutes>
                    } />
                    <Route path="/questions/:id/answer" element={
                        <ProtectedRoutes>
                            <AnswerQuestion />
                        </ProtectedRoutes>
                    } />

                    {/* Test Routes */}
                    <Route path="/tests" element={
                        <ProtectedRoutes>
                            <TestList />
                        </ProtectedRoutes>
                    } />
                    <Route path="/create-test" element={
                        <ProtectedRoutes>
                            <CreateTest />
                        </ProtectedRoutes>
                    } />
                    <Route path="/tests/:id" element={
                        <ProtectedRoutes>
                            <Test />
                        </ProtectedRoutes>
                    } />
                    <Route path="/tests/:id/do" element={
                        <ProtectedRoutes>
                            <DoTest />
                        </ProtectedRoutes>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/accounts" element={
                        <ProtectedRoutes>
                            <AccountList />
                        </ProtectedRoutes>
                    } />
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