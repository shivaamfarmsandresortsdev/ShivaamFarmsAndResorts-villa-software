import React, {useState} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Footer from "./components/Footer/Footer.jsx"
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff.jsx";
import Finance from "./pages/Finance.jsx";
import Booking from "./pages/Booking.jsx";
import Stocks from "./pages/Stocks.jsx";
import CheckInForm from "./pages/CheckInForm.jsx"
import Settings from "./pages/Settings.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";


const App = () => {
    const [isSidebarOpen,
        setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <Router>
        <ScrollToTop/>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>

            <div className="main-content">
                <Navbar toggleSidebar={toggleSidebar}/>
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={< Dashboard />}/>
                        <Route path="/staff" element={< Staff />}/>
                        <Route path="/finance" element={< Finance />}/>
                        <Route path="/booking" element={< Booking />}/>
                        <Route path="/stocks" element={< Stocks />}/>
                        <Route path="/checkInForm" element={< CheckInForm />} />
                        <Route path="/settings" element={< Settings />}/>
                    </Routes>
                </div>
                <Footer/>
            </div>
        </Router>
    );
};

export default App;
