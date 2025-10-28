import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import authService from '../api/authService';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- ADDED: Helper functions for Case Stage ---
const formatCaseStage = (stage) => {
  if (!stage) return 'N/A';
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getCaseStageChipColor = (stage) => {
  switch (stage) {
    case 'intake': return 'default';
    case 'discovery': return 'info';
    case 'negotiation': return 'secondary';
    case 'litigation_trial': return 'warning';
    case 'resolution': return 'success';
    default: return 'default';
  }
};
// --- END: Case Stage Helpers ---

// --- ADDED BACK: Helper functions for Status ---
const getStatusChipColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
};

const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
};
// --- END: Status Helpers ---

const CasesListPage = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [caseTypes, setCaseTypes] = useState([]);
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [caseStageFilter, setCaseStageFilter] = useState('all');

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const canAddCases = currentUser && ['admin', 'partner', 'lawyer'].includes(currentUser.role);

  // --- ADDED BACK: Data fetching functions ---
  const fetchCases = () => {
    return apiService.getCases()
      .then(response => {
        const fetchedCases = response.data.records || [];
        setCases(fetchedCases);
        setFilteredCases(fetchedCases);
      })
      .catch(err => {
        setError('Failed to fetch cases. Please try again.');
        console.error("Fetch Cases Error:", err.response || err);
        throw err; // Re-throw to be caught by Promise.all
      });
  };

  const fetchCaseTypes = () => {
    return apiService.getCaseTypes()
      .then(response => {
        setCaseTypes(response.data.records || []);
      })
      .catch(err => {
        console.error("Fetch Case Types Error:", err.response || err);
        // Don't set main error, but re-throw
        throw err;
      });
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchCases(),
      fetchCaseTypes()
    ]).catch(err => {
       setError('Failed to load page data. Please refresh.');
    }).finally(() => {
      setLoading(false);
    });
  }, []); // Empty dependency array, runs once on mount
  // --- END: Data fetching ---


  // --- MODIFIED: useEffect to apply all filters (This was correct) ---
  useEffect(() => {
    let tempCases = [...cases];

    // 1. Filter by status
    if (statusFilter !== 'all') {
      tempCases = tempCases.filter(c => c.status === statusFilter);
    }

    // 2. Filter by case type
    if (caseTypeFilter !== 'all') {
      tempCases = tempCases.filter(c => c.case_type_name === caseTypeFilter);
    }
    
    // 3. Filter by case stage
    if (caseStageFilter !== 'all') {
      tempCases = tempCases.filter(c => c.case_stage === caseStageFilter);
    }

    // 4. Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempCases = tempCases.filter(c =>
        (c.title && c.title.toLowerCase().includes(lowerSearchTerm)) ||
        (c.client_name && c.client_name.toLowerCase().includes(lowerSearchTerm)) ||
        (c.lawyer_name && c.lawyer_name.toLowerCase().includes(lowerSearchTerm)) ||
        (c.case_type_name && c.case_type_name.toLowerCase().includes(lowerSearchTerm)) ||
        (c.case_stage && formatCaseStage(c.case_stage).toLowerCase().includes(lowerSearchTerm))
      );
    }

    setFilteredCases(tempCases);
  }, [cases, searchTerm, statusFilter, caseTypeFilter, caseStageFilter]);


  const handleRowDoubleClick = (params) => {
    navigate(`/cases/${params.row.id}`);
  };

  const columns = [
    { field: 'title', headerName: 'Case Title', flex: 2, minWidth: 250 },
    { field: 'client_name', headerName: 'Client', flex: 1, minWidth: 150 },
    { field: 'lawyer_name', headerName: 'Assigned Attorney', flex: 1, minWidth: 150 },
    { 
      field: 'case_type_name', 
      headerName: 'Case Type', 
      flex: 1, 
      minWidth: 140,
      valueGetter: (params) => params.row.case_type_name || 'N/A'
    },
    {
      field: 'case_stage',
      headerName: 'Case Stage',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={formatCaseStage(params.value)}
          color={getCaseStageChipColor(params.value)}
          size="small"
          sx={{ minWidth: '100px', textAlign: 'center' }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={formatStatus(params.value)}
          color={getStatusChipColor(params.value)}
          size="small"
          sx={{ minWidth: '100px', textAlign: 'center' }}
        />
      )
    },
  ];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')} 
            sx={{ mr: 1 }}
            title="Go to Dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Case Management
          </Typography>
        </Box>
        {canAddCases && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cases/new')}
          >
            Add New Case
          </Button>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          label="Search (Title, Client, Attorney, etc.)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '300px', maxWidth: '450px' }}
        />
        
        {/* --- ADDED BACK: Case Type Filter JSX --- */}
        <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1, maxWidth: '220px' }}>
          <InputLabel>Case Type</InputLabel>
          <Select
            value={caseTypeFilter}
            label="Case Type"
            onChange={(e) => setCaseTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Case Types</MenuItem>
            {caseTypes.map((type) => (
              <MenuItem key={type.id} value={type.name}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* --- Case Stage Filter (This was correct) --- */}
        <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1, maxWidth: '220px' }}>
          <InputLabel>Case Stage</InputLabel>
          <Select
            value={caseStageFilter}
            label="Case Stage"
            onChange={(e) => setCaseStageFilter(e.target.value)}
          >
            <MenuItem value="all">All Stages</MenuItem>
            <MenuItem value="intake">{formatCaseStage('intake')}</MenuItem>
            <MenuItem value="discovery">{formatCaseStage('discovery')}</MenuItem>
            <MenuItem value="negotiation">{formatCaseStage('negotiation')}</MenuItem>
            <MenuItem value="litigation_trial">{formatCaseStage('litigation_trial')}</MenuItem>
            <MenuItem value="resolution">{formatCaseStage('resolution')}</MenuItem>
          </Select>
        </FormControl>

        {/* --- ADDED BACK: Status Filter JSX --- */}
        <FormControl size="small" sx={{ minWidth: 180, flexGrow: 1, maxWidth: '220px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="open">{formatStatus('open')}</MenuItem>
            <MenuItem value="in_progress">{formatStatus('in_progress')}</MenuItem>
            <MenuItem value="closed">{formatStatus('closed')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: 3 }}>
        <DataGrid
          rows={filteredCases}
          columns={columns}
          // --- ADDED BACK: DataGrid props ---
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowDoubleClick={handleRowDoubleClick}
          sx={{
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer'
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              justifyContent: 'flex-start'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default CasesListPage;