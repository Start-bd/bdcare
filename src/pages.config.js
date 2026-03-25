import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import BloodBank from './pages/BloodBank';
import DrugInteractionChecker from './pages/DrugInteractionChecker';
import Emergency from './pages/Emergency';
import Forum from './pages/Forum';
import HealthRiskAssessment from './pages/HealthRiskAssessment';
import Hospitals from './pages/Hospitals';
import MedicineChecker from './pages/MedicineChecker';
import SBAIDoctor from './pages/SBAIDoctor';
import SBDashboard from './pages/SBDashboard';
import SBDoctorProfile from './pages/SBDoctorProfile';
import SBDoctors from './pages/SBDoctors';
import SBEmergency from './pages/SBEmergency';
import SBLanding from './pages/SBLanding';
import SBMedicine from './pages/SBMedicine';
import SBProfile from './pages/SBProfile';
import SBVault from './pages/SBVault';
import Settings from './pages/Settings';
import SkinChecker from './pages/SkinChecker';
import __Layout from './Layout.jsx';

export const PAGES = {
  "AdminDashboard": AdminDashboard,
  "Analytics": Analytics,
  "Appointments": Appointments,
  "BloodBank": BloodBank,
  "DrugInteractionChecker": DrugInteractionChecker,
  "Emergency": Emergency,
  "Forum": Forum,
  "HealthRiskAssessment": HealthRiskAssessment,
  "Hospitals": Hospitals,
  "MedicineChecker": MedicineChecker,
  "SBAIDoctor": SBAIDoctor,
  "SBDashboard": SBDashboard,
  "SBDoctorProfile": SBDoctorProfile,
  "SBDoctors": SBDoctors,
  "SBEmergency": SBEmergency,
  "SBLanding": SBLanding,
  "SBMedicine": SBMedicine,
  "SBProfile": SBProfile,
  "SBVault": SBVault,
  "Settings": Settings,
  "SkinChecker": SkinChecker,
}

export const pagesConfig = {
  mainPage: "SBLanding",
  Pages: PAGES,
  Layout: __Layout,
};