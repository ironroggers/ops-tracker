import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Action from "./screens/Action";
import ExecuteActions from "./components/ExecuteActions";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Calendar from './screens/Calendar';

function AppLayout() {
  const location = useLocation();
  const isActionRoute = location.pathname.startsWith("/action");
  return (
    <>
      {!isActionRoute && <Sidebar />}
      <div className={isActionRoute ? undefined : "with-sidebar"} style={{ paddingTop: 0 }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Dashboard />
              </>
            }
          />
          <Route path="/action" element={<Action />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/execute" element={<ExecuteActions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
