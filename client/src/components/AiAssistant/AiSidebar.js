import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  Paper,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import apiService from '../../api/apiService';
import CaseContextCard from './CaseContextCard';

const AiSidebar = ({ open, onClose, currentPath }) => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState(''); // Store the query that was submitted
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pageContext, setPageContext] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [caseContext, setCaseContext] = useState(null);
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [loadingCaseContext, setLoadingCaseContext] = useState(false);

  // Detect page context and generate suggestions
  useEffect(() => {
    const detectContext = async () => {
      if (!currentPath) return;

      let context = { page: 'general' };
      let contextSuggestions = [];

      // Parse URL to detect context
      if (currentPath.includes('/cases/') && currentPath.split('/').length > 2) {
        // Case details page - Extract case ID and fetch case context
        const caseId = currentPath.split('/')[2];
        context = { page: 'case-detail', caseId };
        
        // Fetch case context automatically
        setLoadingCaseContext(true);
        try {
          const result = await apiService.getCaseContext(caseId);
          setCaseContext(result.data);
          
          // Generate case-type specific suggestions based on loaded case
          const caseType = result.data.case_type?.toLowerCase() || '';
          if (caseType.includes('fraud')) {
            contextSuggestions = [
              'What evidence is needed to prove fraud in the Philippines?',
              'Philippine fraud laws and penalties',
              'How to defend against fraud accusations?',
              'Analyze case documents for fraud indicators',
            ];
          } else if (caseType.includes('theft') || caseType.includes('robbery')) {
            contextSuggestions = [
              'Philippine theft and robbery laws',
              'What are the elements of theft?',
              'Differences between qualified and simple theft',
              'Review case evidence for theft prosecution',
            ];
          } else if (caseType.includes('harassment') || caseType.includes('unjust vexation')) {
            contextSuggestions = [
              'Philippine laws on harassment and unjust vexation',
              'How to prove harassment in court?',
              'Protection orders and remedies for harassment',
              'Analyze harassment evidence and timeline',
            ];
          } else if (caseType.includes('civil')) {
            contextSuggestions = [
              'Civil case procedures in the Philippines',
              'What are the key elements of a civil claim?',
              'Review case documents for civil litigation',
              'Find similar civil case precedents',
            ];
          } else if (caseType.includes('family') || caseType.includes('divorce') || caseType.includes('annulment')) {
            contextSuggestions = [
              'Philippine family law overview',
              'Annulment vs legal separation in the Philippines',
              'Child custody laws in the Philippines',
              'Analyze family case documentation',
            ];
          } else {
            // General case suggestions if type not matched
            contextSuggestions = [
              'Analyze this case and suggest next steps',
              'Find similar legal precedents',
              'Review case documents for key information',
              'What are the strengths and weaknesses?',
            ];
          }
        } catch (err) {
          console.error('Failed to fetch case context:', err);
          // Fallback to generic case suggestions
          contextSuggestions = [
            'Analyze this case and suggest next steps',
            'Find similar legal precedents',
            'Review case documents for key information',
            'What are the strengths and weaknesses?',
          ];
        } finally {
          setLoadingCaseContext(false);
        }
      } else if (currentPath.includes('/cases')) {
        // Cases list page
        context = { page: 'cases-list' };
        setCaseContext(null); // Clear case context when leaving case detail page
        contextSuggestions = [
          'What are common case management best practices?',
          'How to prioritize multiple cases?',
          'Legal research tips for case preparation',
        ];
      } else if (currentPath.includes('/clients/') && currentPath.split('/').length > 2) {
        // Client details page
        const clientId = currentPath.split('/')[2];
        context = { page: 'client-detail', clientId };
        setCaseContext(null);
        contextSuggestions = [
          'Review client\'s legal history',
          'What services can we offer this client?',
          'Best practices for client communication',
        ];
      } else if (currentPath.includes('/clients')) {
        // Clients list page
        context = { page: 'clients-list' };
        setCaseContext(null);
        contextSuggestions = [
          'Client relationship management tips',
          'How to onboard new clients effectively?',
        ];
      } else if (currentPath.includes('/calendar')) {
        context = { page: 'calendar' };
        setCaseContext(null);
        contextSuggestions = [
          'What are important legal deadlines to track?',
          'Court scheduling best practices',
        ];
      } else if (currentPath.includes('/billing')) {
        context = { page: 'billing' };
        setCaseContext(null);
        contextSuggestions = [
          'Legal billing best practices',
          'How to structure legal fees?',
        ];
      } else if (currentPath.includes('/dashboard')) {
        context = { page: 'dashboard' };
        setCaseContext(null);
        contextSuggestions = [
          'How to improve case workflow efficiency?',
          'Legal practice management tips',
        ];
      } else {
        // General suggestions
        setCaseContext(null);
        contextSuggestions = [
          'Philippine legal research assistance',
          'Case law analysis and precedents',
          'Legal document review',
        ];
      }

      setPageContext(context);
      setSuggestions(contextSuggestions);
    };

    detectContext();
  }, [currentPath, open]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  const handleIncludeDocsChange = (checked) => {
    setIncludeDocuments(checked);
  };

  const handleFindSimilar = async () => {
    if (!caseContext) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiService.findSimilarCases(
        caseContext.id,
        caseContext.case_type_id,
        5
      );
      
      if (result.data && result.data.similar_cases && result.data.similar_cases.length > 0) {
        const similarCases = result.data.similar_cases;
        const caseList = similarCases.map((c, i) => 
          `${i + 1}. **${c.title}** (${c.case_type || 'Unknown Type'})\n   - Status: ${c.status || 'Unknown'}\n   - Progress: ${c.progress || 0}%\n   - Client: ${c.client_name || 'Unknown'}\n`
        ).join('\n');
        
        const similarCasesQuery = `Found ${similarCases.length} similar cases to "${caseContext.title}":\n\n${caseList}\n\nPlease analyze these similar cases and provide insights on how they might relate to the current case.`;
        
        setSubmittedQuery(similarCasesQuery);
        const aiResult = await apiService.getAiLookup(similarCasesQuery);
        setResponse(aiResult.data);
      } else {
        setError('No similar cases found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find similar cases.');
      console.error('Find Similar Cases Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() && !selectedFile && !includeDocuments) {
      setError('Please enter a query or upload a file.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setSubmittedQuery(query); // Save the query that was submitted

    try {
      let result;
      
      // Check if we need to include case documents
      if (includeDocuments && caseContext && caseContext.documents && caseContext.documents.length > 0) {
        // Auto-load documents mode - include case context and documents
        const formData = new FormData();
        
        // Add the query
        formData.append('query', query || 'Analyze the case documents and provide insights');
        
        // Add case context information
        formData.append('case_id', caseContext.id);
        formData.append('case_title', caseContext.title);
        formData.append('case_type', caseContext.case_type || '');
        formData.append('case_description', caseContext.description || '');
        
        // Add document references (backend will fetch the actual files)
        formData.append('document_ids', JSON.stringify(caseContext.documents.map(doc => doc.id)));
        formData.append('include_all_docs', 'true');
        
        // Note: The backend api/ai_document_analysis.php will need to be updated
        // to handle multiple document IDs and fetch them from the database
        result = await apiService.analyzeDocument(formData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });
      } else if (selectedFile) {
        // Single file upload mode
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('query', query || 'Analyze this document');
        
        // If on case page, also include case context
        if (caseContext) {
          formData.append('case_id', caseContext.id);
          formData.append('case_title', caseContext.title);
          formData.append('case_type', caseContext.case_type || '');
        }
        
        result = await apiService.analyzeDocument(formData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });
      } else {
        // Text query mode - send original query without context prefix
        // If on case page, enhance query with case context
        let enhancedQuery = query;
        if (caseContext && query.trim()) {
          enhancedQuery = `${query}\n\n[Context: This question is about case "${caseContext.title}" (${caseContext.case_type || 'Unknown Type'})]`;
        }
        result = await apiService.getAiLookup(enhancedQuery);
      }
      
      setResponse(result.data);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      // Handle rejected non-legal queries differently
      if (err.response?.data?.rejected) {
        setError(err.response.data.message + ' ' + (err.response.data.hint || ''));
      } else {
        setError(err.response?.data?.message || 'Failed to get AI response. Please try again.');
      }
      console.error('AI Lookup Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/jpeg',
        'image/png',
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Please upload PDF, DOCX, TXT, or image files only');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleClearAll = () => {
    setQuery('');
    setSubmittedQuery('');
    setSelectedFile(null);
    setResponse(null);
    setError('');
    setUploadProgress(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Convert in-text citations [1], [2], etc. to clickable links
  const makeClickableCitations = (htmlContent, sources) => {
    if (!sources || sources.length === 0) return htmlContent;
    
    // Replace [1], [2], etc. with clickable links
    let processedHtml = htmlContent;
    sources.forEach((source, index) => {
      const citationNumber = index + 1;
      const citationPattern = new RegExp(`\\[${citationNumber}\\]`, 'g');
      const citationLink = `<a href="${source.url}" target="_blank" rel="noopener noreferrer" style="color: #5c6bc0; text-decoration: none; font-weight: 500; cursor: pointer;" title="${source.title}">[${citationNumber}]</a>`;
      processedHtml = processedHtml.replace(citationPattern, citationLink);
    });
    
    return processedHtml;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 24, color: '#5c6bc0' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1rem', color: '#333' }}>
                Chat
              </Typography>
              {pageContext && pageContext.page !== 'general' && (
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                  Context: {pageContext.page.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {response && (
              <Tooltip title="New Query">
                <IconButton onClick={handleClearAll} size="small" sx={{ color: '#666', '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} size="small" sx={{ color: '#666', '&:hover': { bgcolor: '#f5f5f5' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: 1.5, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
          {/* Case Context Card - Show when on case details page */}
          {loadingCaseContext && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {caseContext && !loadingCaseContext && (
            <CaseContextCard
              caseData={caseContext}
              onIncludeDocsChange={handleIncludeDocsChange}
              includeDocuments={includeDocuments}
              onFindSimilar={handleFindSimilar}
            />
          )}

          {!response && !loading && !error && (
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5, color: '#333' }}>
                Ask me anything about Philippine law
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem', mb: 1.5 }}>
                I can help with legal research, case analysis, and advisory guidance.
              </Typography>

              {/* Smart Suggestions */}
              {suggestions.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LightbulbIcon sx={{ fontSize: 18, color: '#5c6bc0' }} />
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Suggested Questions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {suggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          justifyContent: 'flex-start',
                          height: 'auto',
                          py: 1,
                          px: 1.5,
                          bgcolor: 'white',
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          fontWeight: 400,
                          color: '#555',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                            borderColor: '#5c6bc0',
                          },
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            textAlign: 'left',
                            padding: 0,
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Analyzing your query...
              </Typography>
            </Box>
          )}

          {response && (
            <Box>
              {/* Query Display with File */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#555', fontWeight: 500 }}>
                  {submittedQuery}
                </Typography>
                {selectedFile && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <InsertDriveFileIcon sx={{ fontSize: 20, color: '#666' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#333' }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>

              {/* AI Response */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#999', 
                    mb: 1.5,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block'
                  }}
                >
                  {response.mode === 'advice' ? 'Advisory' : 'Research'}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '& h2': { 
                      fontSize: '1rem', 
                      fontWeight: 500, 
                      mt: 2, 
                      mb: 1,
                      color: '#333'
                    },
                    '& h3': { 
                      fontSize: '0.95rem', 
                      fontWeight: 500, 
                      mt: 1.5, 
                      mb: 0.75,
                      color: '#333'
                    },
                    '& p': { 
                      mb: 1.25,
                      lineHeight: 1.6,
                      color: '#555',
                      fontSize: '0.875rem'
                    },
                    '& ul': { 
                      pl: 2.5,
                      mb: 1.25
                    },
                    '& li': { 
                      mb: 0.5,
                      lineHeight: 1.6,
                      color: '#555',
                      fontSize: '0.875rem'
                    },
                    '& strong': {
                      fontWeight: 500,
                      color: '#333'
                    },
                    '& a': {
                      color: '#5c6bc0',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: makeClickableCitations(response.response, response.sources) }}
                />
              </Box>

              {/* Sources - Only show if AI provided a valid response */}
              {response.response && response.sources && response.sources.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#999',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'block',
                      mb: 1
                    }}
                  >
                    Sources
                  </Typography>
                  {response.sources.map((source, index) => (
                    <Box key={index} sx={{ mb: 1, display: 'flex', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#5c6bc0',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          minWidth: '24px'
                        }}
                      >
                        [{index + 1}]
                      </Typography>
                      <Typography
                        variant="body2"
                        component="a"
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={source.title}
                        sx={{
                          color: '#5c6bc0',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          '&:hover': { 
                            textDecoration: 'underline'
                          },
                        }}
                      >
                        {source.title.length > 60 ? source.title.substring(0, 60) + '...' : source.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'white',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
          }}
        >
          {/* File Preview */}
          {selectedFile && (
            <Paper
              elevation={0}
              sx={{ 
                mb: 1, 
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'white',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                <InsertDriveFileIcon sx={{ fontSize: 20, flexShrink: 0, color: '#666' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      color: '#333'
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={handleRemoveFile}
                sx={{ 
                  color: '#999',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Paper>
          )}
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ mb: 1 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedFile ? "what is this about?" : "Ask about laws, cases, or get legal advice..."}
            variant="outlined"
            disabled={loading}
            sx={{ 
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#bdbdbd',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#5c6bc0',
                  borderWidth: 1,
                },
              },
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
              accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={loading}
            />
            <label htmlFor="file-upload">
              <IconButton
                component="span"
                disabled={loading}
                sx={{ 
                  color: '#666',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </label>
            
            <Box sx={{ flex: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading || (!query.trim() && !selectedFile)}
                endIcon={loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon />}
                sx={{ 
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 0.75,
                  bgcolor: '#5c6bc0',
                  boxShadow: '0 2px 4px rgba(92,107,192,0.2)',
                  '&:hover': {
                    bgcolor: '#4a5aab',
                    boxShadow: '0 2px 6px rgba(92,107,192,0.3)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#999',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? 'Processing' : 'Submit'}
              </Button>
            </Box>
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 0.5, 
              display: 'block',
              color: '#999',
              fontSize: '0.7rem',
              textAlign: 'center'
            }}
          >
            Supports PDF, DOCX, TXT, Images • Max 10MB
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AiSidebar;
