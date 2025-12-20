// client/src/components/MainLayout.jsx
import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
