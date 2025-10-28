import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Alert, Button, Card, CardContent, Grid, Tabs, Tab,
    List, ListItem, ListItemText, IconButton, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, LinearProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CardHeader, ListItemIcon, Divider // <-- Added Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History'; // <-- Added for activity log
import DocumentUploadModal from '../components/Modals/DocumentUploadModal';
import ScheduleEventModal from '../components/Modals/ScheduleEventModal';
import BillingFormModal from '../components/Modals/BillingFormModal';

// --- CRITICAL FIX: Get the Full Project URL for linking documents ---
const FULL_PROJECT_URL = (process.env.REACT_APP_API_URL || '').replace('/api', '');

// --- Helper: Format relative time ---
const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

// --- Tab: Case Summary (Rebuilt) ---
const CaseSummary = ({ caseDetails }) => {
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [activityError, setActivityError] = useState('');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoadingActivities(true);
                setActivityError('');
                const response = await apiService.getCaseActivity(caseDetails.id, 10);
                setActivities(response.data.records || []);
            } catch (err) {
                setActivityError('Failed to load activity log.');
            } finally {
                setLoadingActivities(false);
            }
        };

        if (caseDetails?.id) {
            fetchActivities();
        }
    }, [caseDetails?.id]);

    return (
 <Box sx={{ p: 3 }}>
    <Grid container spacing={2}>
        {/* Top Row - Case Details and Progress */}
        <Grid item xs={12} md={8}>
            {/* Case Details Card */}
            <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
                <CardHeader title="Case Details" sx={{ pb: 1 }} />
                <CardContent sx={{ pt: 0 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography color="text.secondary" variant="body2">Client:</Typography>
                            <Typography variant="body2">{caseDetails.client_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography color="text.secondary" variant="body2">Assigned Attorney:</Typography>
                            <Typography variant="body2">{caseDetails.lawyer_name}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography color="text.secondary" variant="body2">Case Type:</Typography>
                            <Typography variant="body2">{caseDetails.case_type_name || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography color="text.secondary" variant="body2">Status:</Typography>
                            <Chip label={caseDetails.status} color={caseDetails.status === 'open' ? 'success' : caseDetails.status === 'closed' ? 'error' : 'warning'} size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography color="text.secondary" variant="body2">Filing Date:</Typography>
                            <Typography variant="body2">{new Date(caseDetails.created_at).toLocaleDateString()}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={4}>
            {/* Case Progress Card */}
            <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
                <CardHeader title="Case Progress" sx={{ pb: 1 }} />
                <CardContent sx={{ pt: 0 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {caseDetails.progress || 0}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={caseDetails.progress || 0}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </CardContent>
            </Card>
        </Grid>

        {/* Bottom Row - Description and Activity */}
        <Grid item xs={12} md={6}>
            {/* Description Card */}
            <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
                <CardHeader title="Description" sx={{ pb: 1 }} />
                <CardContent sx={{ pt: 0 }}>
                    <Typography variant="body2">{caseDetails.description || "No description provided."}</Typography>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={6}>
            {/* Activity Log Card */}
            <Card sx={{ borderRadius: '12px', boxShadow: 3, height: '100%' }}>
                <CardHeader 
                    title="Recent Activity" 
                    avatar={<HistoryIcon color="action" />}
                    sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                    {loadingActivities && <CircularProgress size={24} />}
                    {activityError && <Alert severity="error">{activityError}</Alert>}
                    {!loadingActivities && !activityError && (
                        <List sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
                            {activities.length > 0 ? (
                                activities.map((activity, index) => (
                                    <React.Fragment key={activity.id}>
                                        <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}>
                                                        {activity.description}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary">
                                                        {activity.user_name} • {formatRelativeTime(activity.timestamp)}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < activities.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText 
                                        primary={<Typography variant="body2">No activity recorded yet</Typography>}
                                        secondary={<Typography variant="caption">Case activity will appear here</Typography>}
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Grid>
    </Grid>
 </Box>
    );
};

// --- Tab: Case Documents (FIXED URL PREFIXING) ---
const CaseDocuments = ({ caseId }) => {
     const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchDocs = useCallback(() => { setLoading(true); setError(''); apiService.getDocumentsForCase(caseId).then(res => setDocs(res.data.records || [])).catch(err => setError("Failed docs load.")).finally(() => setLoading(false)); }, [caseId]);
    useEffect(() => { fetchDocs(); }, [fetchDocs]);
    const handleDelete = (docId) => { if (!window.confirm("Delete doc?")) return; setLoading(true); apiService.deleteDocument(docId).then(() => fetchDocs()).catch(err => setError("Failed delete.")).finally(() => setLoading(false)); };
    
    return ( <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
            <Box>
                <Typography variant="h6">Documents</Typography>
                <Typography variant="body2" color="text.secondary">{docs.length} files uploaded</Typography>
            </Box>
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setIsModalOpen(true)}> Upload Document </Button>
        </Box>
        <CardContent>
            {error && <Alert severity="error">{error}</Alert>}
            {loading && <CircularProgress size={24} />}
            <List>
                {docs.length > 0 ? docs.map(doc => (
                <ListItem key={doc.id} divider
                    secondaryAction={
                        <Box>
                             {/* FIX: Use FULL_PROJECT_URL prefix */}
                            <IconButton href={`${FULL_PROJECT_URL}${doc.file_path}`} target="_blank" title="View" color="primary" aria-label="view document"> <VisibilityIcon /> </IconButton>
                            <IconButton href={`${FULL_PROJECT_URL}${doc.file_path}`} download title="Download" color="default" aria-label="download document"> <GetAppIcon /> </IconButton>
                            <IconButton onClick={() => handleDelete(doc.id)} title="Delete" color="error" aria-label="delete document"> <DeleteIcon /> </IconButton>
                        </Box>
                    }>
                    <ListItemIcon sx={{mr: 1}}>
                        <PictureAsPdfIcon color={doc.file_name.endsWith('.pdf') ? 'error' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography sx={{fontWeight: 'medium'}}>{doc.title}</Typography>}
                        secondary={`Name: ${doc.file_name} • Uploaded by ${doc.uploader_name || 'N/A'} • ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                    />
                </ListItem>
                )) : (!loading && <ListItem><ListItemText primary="No documents uploaded for this case."/></ListItem>)}
            </List>
        </CardContent>
        <DocumentUploadModal open={isModalOpen} onClose={() => setIsModalOpen(false)} caseId={caseId} onUploadSuccess={fetchDocs} />
    </> );
};

// --- Tab: Case Schedule (No changes from your latest code) ---
const CaseSchedule = ({ caseId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventInfo, setSelectedEventInfo] = useState(null);
    const fetchEvents = useCallback(() => { setLoading(true); setError(''); apiService.getSchedulesForCase(caseId).then(res => setEvents(res.data.records || [])).catch(err => setError("Failed schedule load.")).finally(() => setLoading(false)); }, [caseId]);
    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    const handleOpenModal = (event = null) => { const eventInfo = event ? {id: event.id, title: event.title, startStr: event.start, endStr: event.end, extendedProps: {location: event.location, notes: event.notes, status: event.status}} : null; setSelectedEventInfo(eventInfo); setIsModalOpen(true); };
    return ( <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
            <Typography variant="h6">Case Schedule</Typography>
            <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal()}> Add Event </Button>
        </Box>
        <CardContent>
            {error && <Alert severity="error">{error}</Alert>}
            {loading && <CircularProgress size={24} />}
            <List dense>
                {events.length > 0 ? events.map(event => (
                    <ListItem button key={event.id} onClick={() => handleOpenModal(event)} divider>
                        <ListItemText
                            primary={<Typography sx={{fontWeight: 'medium'}}>{event.title}</Typography>}
                            secondary={`Date: ${new Date(event.start).toLocaleString()} | Status: ${event.status}`}
                        />
                        <Chip label={event.status} size="small" />
                    </ListItem>
                )) : (!loading && <ListItem><ListItemText primary="No events scheduled."/></ListItem>)}
            </List>
        </CardContent>
        <ScheduleEventModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveSuccess={fetchEvents} eventInfo={selectedEventInfo} caseId={caseId} />
    </> );
};

// --- Tab: Case Billing (No changes from your latest code) ---
const CaseBilling = ({ caseId }) => {
     const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchBilling = useCallback(() => { setLoading(true); setError(''); apiService.getBillingForCase(caseId).then(res => setBills(res.data.records || [])).catch(err => setError("Failed billing load.")).finally(() => setLoading(false)); }, [caseId]);
    useEffect(() => { fetchBilling(); }, [fetchBilling]);
    
    // Summary Card Calculations
    const totalBilled = bills.reduce((acc, bill) => acc + parseFloat(bill.amount), 0);
    const totalPaid = bills.filter(b => b.status === 'paid').reduce((acc, bill) => acc + parseFloat(bill.amount), 0);
    const totalPending = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue').reduce((acc, bill) => acc + parseFloat(bill.amount), 0);
    const paidInvoices = bills.filter(b => b.status === 'paid').length;
    const pendingInvoices = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue').length;

    const getStatusChipColor = (status) => { switch (status) { case 'paid': return 'success'; case 'unpaid': return 'warning'; case 'overdue': return 'error'; default: return 'default'; } };
    const handleOpenEditModal = (record) => { setSelectedRecord(record); setNewStatus(record.status); setUpdateError(''); setIsEditModalOpen(true); };
    const handleCloseEditModal = () => { setIsEditModalOpen(false); setSelectedRecord(null); setIsUpdatingStatus(false);};
    const handleUpdateStatus = () => { if (!selectedRecord || !newStatus) return; setUpdateError(''); setIsUpdatingStatus(true); apiService.updateBillingStatus(selectedRecord.id, newStatus).then(() => { handleCloseEditModal(); fetchBilling(); }).catch(err => { setUpdateError(err.response?.data?.message || "Update failed."); }).finally(() => { setIsUpdatingStatus(false); }); };
    const API_BASE_URL_FOR_BILLING = process.env.REACT_APP_API_URL || '/api';

    return (
        <>
            <Box sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ borderRadius: '12px', boxShadow: 1, border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Billed</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold'}}>₱{totalBilled.toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">Across {bills.length} invoices</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                         <Card sx={{ borderRadius: '12px', boxShadow: 1, border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Paid</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold', color: 'success.main'}}>₱{totalPaid.toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">{paidInvoices} invoice(s) paid</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                         <Card sx={{ borderRadius: '12px', boxShadow: 1, border: '1px solid #e0e0e0' }}>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Pending</Typography>
                                <Typography variant="h5" sx={{fontWeight: 'bold', color: 'warning.main'}}>₱{totalPending.toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">{pendingInvoices} invoice(s) pending</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Billing Items Table */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Billing Items</Typography>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsAddModalOpen(true)}> Add Item </Button>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{backgroundColor: 'grey.100'}}>
                            <TableRow>
                                {/* FIXED: Added sx props for consistent widths */}
                                <TableCell sx={{ width: '30%' }}>Description</TableCell>
                                <TableCell sx={{ width: '15%' }}>Date</TableCell>
                                <TableCell sx={{ width: '10%' }}>Hours</TableCell>
                                <TableCell sx={{ width: '10%' }}>Rate</TableCell>
                                <TableCell sx={{ width: '15%' }}>Amount</TableCell>
                                <TableCell sx={{ width: '10%' }}>Status</TableCell>
                                <TableCell sx={{ width: '10%', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>}
                            {!loading && bills.length === 0 && <TableRow><TableCell colSpan={7} align="center">No billing items found.</TableCell></TableRow>}
                            
                            {!loading && bills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell>{bill.description}</TableCell>
                                    <TableCell>{bill.due_date || new Date(bill.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell sx={{fontWeight: 'medium'}}>₱{Number(bill.amount).toFixed(2)}</TableCell>
                                    <TableCell><Chip label={bill.status} color={getStatusChipColor(bill.status)} size="small"/></TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton href={`${API_BASE_URL_FOR_BILLING}/billing/invoice_pdf.php?invoice_number=${bill.invoice_number}`} target="_blank" title="View PDF" size="small"><PictureAsPdfIcon fontSize="small"/></IconButton>
                                        <IconButton onClick={() => handleOpenEditModal(bill)} title="Edit Status" size="small"><EditIcon fontSize="small"/></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {/* Modals */}
            <BillingFormModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSaveSuccess={fetchBilling} caseId={caseId} />
             <Dialog open={isEditModalOpen} onClose={handleCloseEditModal}>
                 <DialogTitle>Update Status</DialogTitle>
                 <DialogContent>
                     {updateError && <Alert severity="error">{updateError}</Alert>}
                     <Typography sx={{mb: 2}}>Inv: {selectedRecord?.invoice_number}</Typography>
                     <FormControl fullWidth sx={{mt: 1}}>
                         <InputLabel id="status-update-label-case-detail">Status</InputLabel>
                         <Select
                            labelId="status-update-label-case-detail"
                            value={newStatus}
                            label="Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                            disabled={isUpdatingStatus}
                         >
                             <MenuItem value={'unpaid'}>Unpaid</MenuItem>
                             <MenuItem value={'paid'}>Paid</MenuItem>
                             <MenuItem value={'overdue'}>Overdue</MenuItem>
                             <MenuItem value={'pending'}>Pending</MenuItem>
                             <MenuItem value={'canceled'}>Canceled</MenuItem>
                         </Select>
                     </FormControl>
                 </DialogContent>
                 <DialogActions>
                     <Button onClick={handleCloseEditModal} disabled={isUpdatingStatus}>Cancel</Button>
                     <Button onClick={handleUpdateStatus} variant="contained" disabled={isUpdatingStatus}>
                         {isUpdatingStatus ? <CircularProgress size={24}/> : 'Update'}
                     </Button>
                 </DialogActions>
             </Dialog>
        </>
    );
};


// --- MAIN PAGE COMPONENT ---
const CaseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseDetails, setCaseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => { setLoading(true); setError(''); apiService.getCaseDetails(id).then(r => {setCaseDetails(r.data); setLoading(false);}).catch(e => {setError('Failed to fetch case details.'); setLoading(false);}); }, [id]);
    const handleTabChange = (e, v) => setTabValue(v);
    const handleEditClick = () => navigate(`/cases/edit/${id}`);
    const handleBackClick = () => navigate(-1); 

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!caseDetails) return <Alert severity="warning">Case details not found.</Alert>;

    const greyTabSx = {
        '&.Mui-selected': {
            color: 'text.primary',
        },
        '&.Mui-focusVisible': {
            backgroundColor: 'rgba(0, 0, 0, 0.06)'
        },
        '.MuiTouchRipple-child': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{caseDetails.title}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Case #{caseDetails.id}</Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditClick}>Edit Case</Button>
            </Box>

            <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        aria-label="case detail tabs" 
                        textColor="inherit"
                        sx={{
                            px: 3,
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'text.primary' 
                            }
                        }}
                    >
                        <Tab label="Summary" id="tab-0" sx={greyTabSx} />
                        <Tab label="Documents" id="tab-1" sx={greyTabSx} />
                        <Tab label="Schedule" id="tab-2" sx={greyTabSx} />
                        <Tab label="Billing" id="tab-3" sx={greyTabSx} />
                    </Tabs>
                </Box>
                <Box hidden={tabValue !== 0}> {tabValue === 0 && <CaseSummary caseDetails={caseDetails} />} </Box>
                <Box hidden={tabValue !== 1}> {tabValue === 1 && <CaseDocuments caseId={id} />} </Box>
                <Box hidden={tabValue !== 2}> {tabValue === 2 && <CaseSchedule caseId={id} />} </Box>
                <Box hidden={tabValue !== 3}> {tabValue === 3 && <CaseBilling caseId={id} />} </Box>
            </Card>
        </Box>
    );
};

export default CaseDetailsPage;