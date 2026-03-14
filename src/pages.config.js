/**
 * pages.config.js - Page routing configuration
 *
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 *
 * FIXED (2026-03-14):
 *  - mainPage changed from "Dashboard" → "SBLanding" (P0 routing fix)
 *  - Removed legacy duplicate pages (AIConsultation, Analytics, Appointments,
 *    BloodBank, Dashboard, DoctorConsultations, DoctorProfile, Doctors,
 *    Emergency, Forum, HealthRiskAssessment, Home, Hospitals, MedicalRecords,
 *    MedicineChecker, MyConsultations, Profile, SkinChecker, Telemedicine)
 *    in favour of the SB* equivalents.
 *  - Kept: AdminDashboard, DrugInteractionChecker, Settings (no SB equivalent)
 */
import AdminDashboard from './pages/AdminDashboard';
import DrugInteractionChecker from './pages/DrugInteractionChecker';
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
import __Layout from './Layout.jsx';

export const PAGES = {
  "AdminDashboard": AdminDashboard,
  "DrugInteractionChecker": DrugInteractionChecker,
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
}

export const pagesConfig = {
  mainPage: "SBLanding",
  Pages: PAGES,
  Layout: __Layout,
};
