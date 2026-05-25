import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes.js';
import MainLayout from '../MainLayout.jsx';

const AppRoutes = () => {
    return (
        <MainLayout>
            <Routes>
                <Route />
                <Route />
                <Route />
            </Routes>
        </MainLayout>
    )
}

export default AppRoutes;