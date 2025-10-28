import axios from 'axios';
import authService from './authService';

// Ensure your API URL is correctly set in your environment variables or fallback
const API_URL = process.env.REACT_APP_API_URL || '/api'; // Using relative path as fallback
const api = axios.create({ baseURL: API_URL });

// Request interceptor to add the token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  // Added basic error handling for requests
  return Promise.reject(error);
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(response => {
  return response; // Pass through successful responses
}, error => {
  if (error.response?.status === 401) {
    // Handle unauthorized access - Log out user and redirect to login
    authService.logout();
    // Use window.location to force a full page reload, clearing any component state
    window.location.href = '/login';
    // You might want to show a message to the user here
  }
  return Promise.reject(error); // Pass other errors along
});

// --- Register API --- //
const register = (firstName, lastName, email, password) => {
  return api.post('/auth/register.php', {
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password
  });
};

// --- Forgot Password API --- //
const requestPasswordReset = (email) => {
  // Note: Your API file is named 'request_reset.php'
  return api.post('/auth/request_reset.php', { email });
};
const resetPassword = (token, password) => {
  return api.post('/auth/reset_password.php', { token, password });
};

// --- Cases API ---
const getCases = () => api.get('/cases/read.php');
const getCaseDetails = (id) => api.get(`/cases/read_one.php?id=${id}`);
const createCase = (caseData) => api.post('/cases/create.php', caseData);
const updateCase = (caseData) => api.put('/cases/update.php', caseData);
const deleteCase = (id) => api.post('/cases/delete.php', { id });
const getCasesForClient = (clientId) => api.get(`/cases/read_by_client.php?client_id=${clientId}`);


// --- Schedules API ---
const getSchedules = (startStr, endStr) => api.get(`/schedules/read.php?start=${startStr}&end=${endStr}`);
const createScheduleEvent = (eventData) => api.post('/schedules/create.php', eventData);
const updateScheduleEvent = (eventData) => api.put('/schedules/update.php', eventData);
const deleteScheduleEvent = (id) => api.post('/schedules/delete.php', { id });
const getSchedulesForCase = (case_id) => api.get(`/schedules/read_by_case.php?case_id=${case_id}`);

// --- Documents API ---
const getDocumentsForCase = (case_id) => api.get(`/documents/read_by_case.php?case_id=${case_id}`);
const uploadDocument = (formData) => api.post('/documents/upload.php', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
const deleteDocument = (id) => api.post('/documents/delete.php', { id });

// --- Billing API ---
const getBillingForCase = (case_id) => api.get(`/billing/read_by_case.php?case_id=${case_id}`);
const updateBillingStatus = (id, status) => api.put('/billing/update_status.php', { id, status });
const createBillingRecord = (billingData) => api.post('/billing/create.php', billingData);

// --- Clients API ---
const getClients = () => api.get('/clients/read.php');
const getClientDetails = (id) => api.get(`/clients/read_one.php?id=${id}`);
const createClient = (clientData) => api.post('/clients/create.php', clientData);
const updateClient = (clientData) => api.put('/clients/update.php', clientData);
const deleteClient = (id) => api.post('/clients/delete.php', { id });

// --- Messages / Notes API ---  <<< --- THIS SECTION WAS MISSING ---
const getMessagesForCase = (case_id) => api.get(`/messages/read_by_case.php?case_id=${case_id}`);
const createMessage = (caseId, messageText) => api.post('/messages/create.php', { case_id: caseId, message: messageText });
// --- END MISSING SECTION ---

// --- Users API (Admin) ---
const getUsers = () => api.get('/users/read.php');
const getUserDetails = (id) => api.get(`/users/read_one.php?id=${id}`);
const createUser = (userData) => api.post('/users/create.php', userData);
const updateUser = (userData) => api.put('/users/update.php', userData);
const deleteUser = (id) => api.post('/users/delete.php', { id });

// --- Profile API (Self) ---
const getMyProfile = () => api.get('/profile/read.php');
const updateMyProfile = (profileData) => api.put('/profile/update.php', profileData);

// --- Dashboard API ---
const getDashboardStats = () => getCases();
const getWorkloadData = () => api.get('/dashboard/workload.php');
const getRecentActivity = (limit = 10) => api.get(`/dashboard/activity.php?limit=${limit}`);

// --- AI Lookup API ---
const getAiLookup = (queryText) => api.post('/ai_lookup.php', { query: queryText });
const analyzeDocument = (formData, onUploadProgress) => {
  return api.post('/ai_document_analysis.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// --- Case Types API (Admin) ---
const getCaseTypes = () => api.get('/case_types/read.php');
const createCaseType = (typeData) => api.post('/case_types/create.php', typeData); 
const updateCaseType = (typeData) => api.put('/case_types/update.php', typeData);   
const deleteCaseType = (id) => api.post('/case_types/delete.php', { id });

// --- Lawyer Specializations API (Admin) ---
const getLawyersWithSpecs = () => api.get('/users/read_lawyers.php'); 
const updateLawyerSpecializations = (userId, caseTypeIds) => api.put('/users/update_specializations.php', { user_id: userId, case_type_ids: caseTypeIds });


const apiService = {
  // Auth
  register,
  requestPasswordReset,
  resetPassword,

  // Cases
  getCases, getCaseDetails, createCase, updateCase, deleteCase,
  getCasesForClient, 

  // Schedules
  getSchedules, createScheduleEvent, updateScheduleEvent, deleteScheduleEvent, getSchedulesForCase,
  
  // Documents
  getDocumentsForCase, uploadDocument, deleteDocument,
  
  // Billing
  getBillingForCase, updateBillingStatus, createBillingRecord,
  
  // Clients
  getClients, getClientDetails, createClient, updateClient, deleteClient,
  
  // --- ADDED THESE EXPORTS ---
  getMessagesForCase,
  createMessage,
  // --- END ADDED EXPORTS ---
  
  // Users (Admin)
  getUsers, getUserDetails, createUser, updateUser, deleteUser,
  getLawyersWithSpecs, // Replaces old getLawyers
  updateLawyerSpecializations,

  // Profile
  getMyProfile, updateMyProfile,
  
  // Dashboard
  getDashboardStats, getWorkloadData, getRecentActivity,
  
  // AI
  getAiLookup, analyzeDocument,

  // Case Context (AI Option 5)
  getCaseContext: (caseId) => api.get(`/cases/get_case_context.php?case_id=${caseId}`),
  findSimilarCases: (caseId, caseTypeId, limit = 5) => api.post('/cases/find_similar.php', { case_id: caseId, case_type_id: caseTypeId, limit }),

  // Case Types (Admin)
  getCaseTypes, createCaseType, updateCaseType, deleteCaseType,
};

export default apiService;