/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIConsultation from './pages/AIConsultation';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import BloodBank from './pages/BloodBank';
import Dashboard from './pages/Dashboard';
import DoctorConsultations from './pages/DoctorConsultations';
import DoctorProfile from './pages/DoctorProfile';
import Doctors from './pages/Doctors';
import DrugInteractionChecker from './pages/DrugInteractionChecker';
import Emergency from './pages/Emergency';
import Forum from './pages/Forum';
import HealthRiskAssessment from './pages/HealthRiskAssessment';
import Home from './pages/Home';
import Hospitals from './pages/Hospitals';
import MedicalRecords from './pages/MedicalRecords';
import MedicineChecker from './pages/MedicineChecker';
import MyConsultations from './pages/MyConsultations';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SkinChecker from './pages/SkinChecker';
import Telemedicine from './pages/Telemedicine';
import SBLanding from './pages/SBLanding';
import SBDashboard from './pages/SBDashboard';
import SBDoctors from './pages/SBDoctors';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIConsultation": AIConsultation,
    "AdminDashboard": AdminDashboard,
    "Analytics": Analytics,
    "Appointments": Appointments,
    "BloodBank": BloodBank,
    "Dashboard": Dashboard,
    "DoctorConsultations": DoctorConsultations,
    "DoctorProfile": DoctorProfile,
    "Doctors": Doctors,
    "DrugInteractionChecker": DrugInteractionChecker,
    "Emergency": Emergency,
    "Forum": Forum,
    "HealthRiskAssessment": HealthRiskAssessment,
    "Home": Home,
    "Hospitals": Hospitals,
    "MedicalRecords": MedicalRecords,
    "MedicineChecker": MedicineChecker,
    "MyConsultations": MyConsultations,
    "Profile": Profile,
    "Settings": Settings,
    "SkinChecker": SkinChecker,
    "Telemedicine": Telemedicine,
    "SBLanding": SBLanding,
    "SBDashboard": SBDashboard,
    "SBDoctors": SBDoctors,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};