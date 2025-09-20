import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StatementUpload from "./pages/StatementUpload";
import Transactions from "./pages/Transactions";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/upload" element={<StatementUpload />} />
      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  );
};

export default AppRoutes;
