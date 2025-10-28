import React, { useState, useCallback, useEffect } from 'react'; // <-- IMPORT useEffect HERE
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Alert, CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import apiService from '../../api/apiService'; // Adjust path as needed

const DocumentUploadModal = ({ open, onClose, caseId, onUploadSuccess }) => {
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('');
  const [docTags, setDocTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (open) {
      setFilesToUpload([]);
      setDocTitle('');
      setDocType('');
      setDocTags('');
      setError('');
      setLoading(false);
    }
  }, [open]);


  const onDrop = useCallback(acceptedFiles => {
    setFilesToUpload(acceptedFiles);
    setError(''); // Clear errors on new file selection
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Only one file at a time
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
    if (filesToUpload.length === 0 || !caseId || !docTitle) {
      setError('Please provide a title and select a file.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', filesToUpload[0]);
    formData.append('case_id', caseId);
    formData.append('title', docTitle);
    formData.append('document_type', docType || 'Uncategorized');
    formData.append('tags', docTags);

    apiService.uploadDocument(formData)
      .then(() => {
        setLoading(false);
        onUploadSuccess(); // Call the success callback passed from parent
        onClose(); // Close the modal
      })
      .catch(err => {
        setError(err.response?.data?.message || 'File upload failed.');
        console.error("Upload error in modal:", err.response || err);
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document for Case #{caseId}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box
          {...getRootProps()}
          sx={{ mt: 1, border: '2px dashed grey', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragActive ? '#eeeeee' : '#fafafa', mb: 2, borderRadius: '8px' }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }}/>
          {isDragActive ? <Typography>Drop the file here...</Typography> : <Typography>Drag 'n' drop file here, or click to select</Typography>}
          <Typography variant="caption" display="block">Allowed: PDF, DOC(X), JPG, PNG, TXT (Max 5MB)</Typography>
        </Box>

        {filesToUpload.length > 0 && (
          <Typography sx={{ mb: 2 }}>Selected: {filesToUpload[0].name}</Typography>
        )}

        <TextField required fullWidth label="Document Title" sx={{ mb: 2 }} value={docTitle} onChange={e => setDocTitle(e.target.value)} disabled={loading}/>
        <TextField label="Document Type (Optional)" fullWidth sx={{ mb: 2 }} value={docType} onChange={e => setDocType(e.target.value)} disabled={loading}/>
        <TextField label="Tags (Comma-separated, Optional)" fullWidth sx={{ mb: 2 }} value={docTags} onChange={e => setDocTags(e.target.value)} disabled={loading}/>

      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={filesToUpload.length === 0 || !docTitle || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadModal;