import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Action from "./screens/Action";
import ExecuteActions from "./components/ExecuteActions";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Calendar from './screens/Calendar';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="with-sidebar" style={{ paddingTop: 0 }}>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <Dashboard />
            </>
          } />
          <Route path="/action" element={<Action />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/execute" element={<ExecuteActions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
