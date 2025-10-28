import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Select, MenuItem, InputLabel, FormControl,
  Card, CardContent, List, ListItem, ListItemText, IconButton, TextField, Grid
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import apiService from '../api/apiService';
import authService from '../api/authService'; // <-- ADDED IMPORT
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { useNavigate } from 'react-router-dom'; 

const DocumentsPage = () => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [filesToUpload, setFilesToUpload] = useState([]);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('');
  const [docTags, setDocTags] = useState('');

  const navigate = useNavigate(); 
  const currentUser = authService.getCurrentUser(); // <-- GET CURRENT USER
  const canDelete = currentUser && currentUser.role !== 'client'; // <-- Define delete perm

  // Fetch cases for the dropdown
  useEffect(() => {
    apiService.getCases()
      .then(res => setCases(res.data.records || []))
      .catch(err => setError("Failed to load cases list."))
      .finally(() => setLoadingCases(false));
  }, []);

  // Fetch documents when a case is selected
  useEffect(() => {
    if (selectedCaseId) {
      setLoadingDocs(true);
      setError('');
      apiService.getDocumentsForCase(selectedCaseId)
        .then(res => setDocuments(res.data.records || []))
        .catch(err => setError("Failed to load documents for this case."))
        .finally(() => setLoadingDocs(false));
    } else {
      setDocuments([]); 
    }
  }, [selectedCaseId]);

  // Handle file drop
  const onDrop = useCallback(acceptedFiles => {
    setFilesToUpload(acceptedFiles);
    setUploadError(''); 
    setUploadSuccess('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'text/plain': ['.txt'],
    }
  });

  const handleUpload = () => {
    if (filesToUpload.length === 0 || !selectedCaseId || !docTitle) {
      setUploadError('Please select a case, provide a title, and choose a file.');
      return;
    }
    setUploadError('');
    setUploadSuccess('');
    setLoadingDocs(true); 

    const formData = new FormData();
    formData.append('file', filesToUpload[0]);
    formData.append('case_id', selectedCaseId);
    formData.append('title', docTitle);
    formData.append('document_type', docType || 'Uncategorized');
    formData.append('tags', docTags);

    apiService.uploadDocument(formData)
      .then(() => {
        setUploadSuccess('File uploaded successfully!');
        return apiService.getDocumentsForCase(selectedCaseId);
      })
       .then(res => setDocuments(res.data.records || []))
      .catch(err => {
        setUploadError(err.response?.data?.message || 'File upload failed.');
        console.error("Upload error:", err.response || err);
      })
      .finally(() => {
        setLoadingDocs(false); 
        setFilesToUpload([]);
        setDocTitle('');
        setDocType('');
        setDocTags('');
      });
  };

  const handleDelete = (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    setLoadingDocs(true);
    setError('');
    apiService.deleteDocument(docId)
      .then(() => {
        return apiService.getDocumentsForCase(selectedCaseId);
      })
      .then(res => setDocuments(res.data.records || []))
      .catch(err => setError("Failed to delete document."))
      .finally(() => setLoadingDocs(false));
  };

  return (
    <Box>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }} aria-label="back to dashboard">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Document Management
            </Typography>
       </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="case-select-label">Select Case</InputLabel>
        <Select
          labelId="case-select-label"
          id="case-select"
          value={selectedCaseId}
          label="Select Case"
          onChange={(e) => setSelectedCaseId(e.target.value)}
          disabled={loadingCases}
        >
          <MenuItem value=""><em>Select a Case</em></MenuItem>
          {cases.map((c) => (<MenuItem key={c.id} value={c.id}>{c.title} (#{c.id})</MenuItem>))}
        </Select>
      </FormControl>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upload New Document</Typography>
              <Box
                {...getRootProps()}
                sx={{ border: '2px dashed grey', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragActive ? '#eeeeee' : '#fafafa', mb: 2, borderRadius: '8px' }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }}/>
                {isDragActive ? <Typography>Drop the file here ...</Typography> : <Typography>Drag 'n' drop a file here, or click to select file</Typography>}
                <Typography variant="caption" display="block" gutterBottom>Allowed: PDF, DOC, DOCX, JPG, PNG, TXT (Max 5MB)</Typography>
              </Box>

              {filesToUpload.length > 0 && (<Typography sx={{ mb: 2 }}>Selected: {filesToUpload[0].name}</Typography>)}

              <TextField label="Document Title" required fullWidth sx={{ mb: 2 }} value={docTitle} onChange={e => setDocTitle(e.target.value)} disabled={loadingDocs}/>
              <TextField label="Document Type (Optional)" fullWidth sx={{ mb: 2 }} value={docType} onChange={e => setDocType(e.target.value)} disabled={loadingDocs}/>
              <TextField label="Tags (Comma-separated, Optional)" fullWidth sx={{ mb: 2 }} value={docTags} onChange={e => setDocTags(e.target.value)} disabled={loadingDocs}/>
              
              {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
              {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}
              
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={handleUpload}
                disabled={filesToUpload.length === 0 || !selectedCaseId || loadingDocs || !docTitle}
              >
                 {loadingDocs ? <CircularProgress size={24} color="inherit"/> : 'Upload'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Documents for Selected Case</Typography>
              {loadingDocs && <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}><CircularProgress size={24} /></Box>}
              {!loadingDocs && documents.length === 0 && <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>{selectedCaseId ? 'No documents found for this case.' : 'Select a case to view documents.'}</Typography>}
              {!loadingDocs && documents.length > 0 && (
                <List>
                  {documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      divider
                      secondaryAction={
                        <>
                          <Button size="small" variant="outlined" href={doc.file_path} target="_blank" sx={{ mr: 1 }}>View</Button>
                          {/* --- MODIFIED: Show button based on role --- */}
                          {canDelete && (
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc.id)} disabled={loadingDocs}>
                              <DeleteIcon color="error"/>
                            </IconButton>
                          )}
                        </>
                      }
                    >
                      <ListItemText
                        primary={doc.title}
                        secondary={`Name: ${doc.file_name} | Type: ${doc.document_type || 'N/A'} | Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentsPage;