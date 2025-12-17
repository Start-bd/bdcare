import Dashboard from './pages/Dashboard';
import Hospitals from './pages/Hospitals';
import Profile from './pages/Profile';
import AIConsultation from './pages/AIConsultation';
import Emergency from './pages/Emergency';
import BloodBank from './pages/BloodBank';
import Forum from './pages/Forum';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Analytics from './pages/Analytics';
import DrugInteractionChecker from './pages/DrugInteractionChecker';
import HealthRiskAssessment from './pages/HealthRiskAssessment';
import MedicineChecker from './pages/MedicineChecker';
import SkinChecker from './pages/SkinChecker';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import MedicalRecords from './pages/MedicalRecords';
import Telemedicine from './pages/Telemedicine';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Hospitals": Hospitals,
    "Profile": Profile,
    "AIConsultation": AIConsultation,
    "Emergency": Emergency,
    "BloodBank": BloodBank,
    "Forum": Forum,
    "Appointments": Appointments,
    "Doctors": Doctors,
    "Analytics": Analytics,
    "DrugInteractionChecker": DrugInteractionChecker,
    "HealthRiskAssessment": HealthRiskAssessment,
    "MedicineChecker": MedicineChecker,
    "SkinChecker": SkinChecker,
    "Settings": Settings,
    "AdminDashboard": AdminDashboard,
    "MedicalRecords": MedicalRecords,
    "Telemedicine": Telemedicine,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};