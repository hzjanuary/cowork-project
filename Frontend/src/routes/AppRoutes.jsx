import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import MainLayout from './MainLayout.jsx';

const AppRoutes = () => {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </MainLayout>
    )
}

export default AppRoutes;