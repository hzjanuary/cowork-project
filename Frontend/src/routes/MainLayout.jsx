import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const authPage = ['/login', '/register', '/verify-otp'].includes(location.pathname);

    return (
        <div className={authPage ? 'app-shell auth-shell' : 'app-shell'}>
            {!authPage && <Header />}
            <main className={authPage ? 'auth-main' : 'app-main'}>{children}</main>
            {!authPage && <Footer />}
        </div>
    );
};

export default MainLayout;
