import AIConsultation from './pages/AIConsultation';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import BloodBank from './pages/BloodBank';
import Dashboard from './pages/Dashboard';
import DoctorConsultations from './pages/DoctorConsultations';
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
import DoctorProfile from './pages/DoctorProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIConsultation": AIConsultation,
    "AdminDashboard": AdminDashboard,
    "Analytics": Analytics,
    "Appointments": Appointments,
    "BloodBank": BloodBank,
    "Dashboard": Dashboard,
    "DoctorConsultations": DoctorConsultations,
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
    "DoctorProfile": DoctorProfile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};