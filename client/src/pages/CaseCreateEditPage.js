import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, TextField, Grid, MenuItem, Card, CardContent, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../api/apiService';
import authService from '../api/authService'; // <-- ADDED IMPORT

const CaseCreateEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const currentUser = authService.getCurrentUser(); // <-- GET CURRENT USER

    // Form fields state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [lawyerId, setLawyerId] = useState('');
    const [status, setStatus] = useState('open');
    const [progress, setProgress] = useState(0); 
    const [caseTypeId, setCaseTypeId] = useState('');

    // Dropdown options state
    const [clients, setClients] = useState([]);
    const [allLawyers, setAllLawyers] = useState([]);
    const [caseTypes, setCaseTypes] = useState([]);
    const [filteredLawyers, setFilteredLawyers] = useState([]);

    // Loading/Error state
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch initial data
    useEffect(() => {
        let isMounted = true;
        setPageLoading(true);
        setError('');

        const fetchData = async () => {
            try {
                const [clientsRes, lawyersRes, caseTypesRes] = await Promise.all([
                    apiService.getClients(),
                    apiService.getLawyersWithSpecs(),
                    apiService.getCaseTypes()
                ]);

                if (!isMounted) return;

                setClients(clientsRes.data.records || []);
                setAllLawyers(lawyersRes.data.records || []);
                setCaseTypes(caseTypesRes.data.records || []);

                if (isEditMode) {
                    const caseRes = await apiService.getCaseDetails(id);
                    const caseData = caseRes.data;
                    if (isMounted) {
                        setTitle(caseData.title || '');
                        setDescription(caseData.description || '');
                        setClientId(caseData.client_id || '');
                        setLawyerId(caseData.lawyer_id || '');
                        setStatus(caseData.status || 'open');
                        setProgress(caseData.progress || 0);
                        setCaseTypeId(caseData.case_type_id || '');
                        filterLawyers(caseData.case_type_id || '', lawyersRes.data.records || []);
                    }
                } else {
                    setFilteredLawyers([]);
                    setProgress(0); 
                }

            } catch (err) {
                if (isMounted) {
                    setError("Could not load necessary data. Please try again.");
                    console.error("Fetch Data Error:", err.response || err);
                }
            } finally {
                if (isMounted) setPageLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]); // filterLawyers intentionally excluded to prevent infinite loop

    // Function to filter lawyers
    const filterLawyers = (selectedCaseTypeId, lawyersToFilter = allLawyers) => {
        if (!selectedCaseTypeId) {
            setFilteredLawyers([]);
            return;
        }
        const suitableLawyers = lawyersToFilter.filter(lawyer =>
            lawyer.specialization_ids && lawyer.specialization_ids.includes(parseInt(selectedCaseTypeId, 10))
        );
        setFilteredLawyers(suitableLawyers);
    };

    // Handler for Case Type change
    const handleCaseTypeChange = (event) => {
        const newCaseTypeId = event.target.value;
        setCaseTypeId(newCaseTypeId);
        setLawyerId('');
        filterLawyers(newCaseTypeId);
    };

    // Form Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!title || !clientId || !caseTypeId) {
            setError("Please fill in Title, Client, and Case Type.");
            setLoading(false);
            return;
        }
        
        const progressValue = parseInt(progress, 10);
        if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
            setError("Progress must be a number between 0 and 100.");
            setLoading(false);
            return;
        }
    
        const caseData = {
            id: isEditMode ? id : undefined,
            title,
            description,
            client_id: clientId,
            lawyer_id: lawyerId || null,
            case_type_id: caseTypeId,
            status,
            progress: progressValue,
        };

        try {
            const apiCall = isEditMode
                ? apiService.updateCase(caseData)
                : apiService.createCase(caseData);

            await apiCall;
            setSuccess(`Case successfully ${isEditMode ? 'updated' : 'created'}!`);
            setLoading(false);
            setTimeout(() => navigate(isEditMode ? `/cases/${id}` : '/cases'), 1500);

        } catch (err) {
            setLoading(false);
            const errMsg = (err.response?.status === 403 || err.response?.status === 400)
               ? (err.response?.data?.message || "Operation failed. The selected lawyer (if any) may not be specialized for this case type.")
               : (err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} case.`);
            setError(errMsg);
            console.error("Save Case Error:", err.response || err);
        }
    };

    if (pageLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                {isEditMode ? `Edit Case: ${title || ''}` : 'Create New Case'}
            </Typography>

            {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField required fullWidth id="title" label="Case Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} margin="normal"/>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth id="description" label="Case Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} margin="normal"/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select required fullWidth
                                    id="case_type_id" label="Case Type"
                                    value={caseTypeId}
                                    onChange={handleCaseTypeChange}
                                    disabled={loading || caseTypes.length === 0}
                                    margin="normal"
                                >
                                    <MenuItem value=""><em>Select a Case Type</em></MenuItem>
                                    {caseTypes.map((type) => (<MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <TextField select required fullWidth id="client_id" label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={loading || clients.length === 0} margin="normal">
                                    <MenuItem value=""><em>Select a Client</em></MenuItem>
                                    {clients.map((client) => (<MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth
                                    id="lawyer_id" label="Assign Lawyer (Optional)"
                                    value={lawyerId}
                                    onChange={(e) => setLawyerId(e.target.value)}
                                    // --- MODIFIED: Added role check to disabled prop ---
                                    disabled={loading || !caseTypeId || currentUser?.role === 'lawyer'}
                                    margin="normal"
                                    // --- MODIFIED: Updated helperText for lawyer role ---
                                    helperText={
                                        currentUser?.role === 'lawyer' ? "Lawyers cannot assign other lawyers." :
                                        !caseTypeId ? "Select Case Type first to see available lawyers" : 
                                        (filteredLawyers.length === 0 ? "No lawyers specialize in this type" : "")
                                    }
                                >
                                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                                    {filteredLawyers.map((lawyer) => (<MenuItem key={lawyer.id} value={lawyer.id}>{lawyer.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                             
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                <InputLabel id="status-select-label">Status</InputLabel>
                                <Select
                                    labelId="status-select-label" id="status" value={status} label="Status"
                                    onChange={(e) => setStatus(e.target.value)} 
                                    disabled={loading || !isEditMode} 
                                >
                                    <MenuItem value={'open'}>Open</MenuItem>
                                    <MenuItem value={'in_progress'}>In Progress</MenuItem>
                                    <MenuItem value={'closed'}>Closed</MenuItem>
                                </Select>
                                </FormControl>
                            </Grid>

                            {isEditMode && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="progress"
                                        label="Progress (%)"
                                        type="number"
                                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                                        value={progress}
                                        onChange={(e) => setProgress(e.target.value)}
                                        disabled={loading}
                                        margin="normal"
                                    />
                                </Grid>
                            )}
                            
                        </Grid>

                        {error && loading && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create Case')}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate(isEditMode ? `/cases/${id}` : '/cases')} disabled={loading}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CaseCreateEditPage;