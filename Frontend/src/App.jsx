import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { QuestionProvider } from "./context/QuestionContext.jsx";
import { TestProvider } from "./context/TestContext.jsx";
import AppRoutes from "./routes/AppRoutes";


const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <QuestionProvider>
            <TestProvider>
              <Router>
                <AppRoutes />
              </Router>
            </TestProvider>
          </QuestionProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
