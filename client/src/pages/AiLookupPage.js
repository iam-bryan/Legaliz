import React, { useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, TextField, Card, CardContent, CardHeader, IconButton, Chip, Link, Divider
} from '@mui/material';
import apiService from '../api/apiService';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';

const AiLookupPage = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState([]);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }
    setLoading(true);
    setError('');
    setResponse('');
    setSources([]);
    setMode('');

    try {
      const res = await apiService.getAiLookup(query);
      setResponse(res.data.response || 'No valid response text received from AI.');
      setSources(res.data.sources || []);
      setMode(res.data.mode || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get AI response. Check API key and implementation.');
      console.error("AI Lookup Error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Page Header */}
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }} aria-label="back to dashboard">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              AI Legal Research Assistant
            </Typography>
       </Box>

      {/* Query Input Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Enter Your Legal Query</Typography>
          <Box component="form" onSubmit={handleLookup} noValidate>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="e.g., What is the latest Supreme Court ruling on cyber libel?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleLookup(e);
                }
              }}
              margin="normal"
              disabled={loading}
              placeholder="Ask about legal precedents, case summaries, interpretations, or case strategy..."
            />
            {error && <Alert severity="error" sx={{ mt: 1, mb: 1 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !query.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 1 }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Response Display Card */}
      {loading && !response && (
         <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
            <CardHeader title="AI Response" />
             <CardContent sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                 <CircularProgress />
             </CardContent>
         </Card>
      )}
      
      {!loading && response && (
        <Box>
          {/* Mode Badge */}
          {mode && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={mode === 'advice' ? 'Advisory Mode' : 'Research Mode'} 
                color={mode === 'advice' ? 'secondary' : 'primary'}
                size="small"
              />
            </Box>
          )}

          {/* AI Response */}
          <Card sx={{ borderRadius: '12px', boxShadow: 3, mb: 3 }}>
            <CardHeader title="AI Legal Analysis" />
            <CardContent>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 2,
                  '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 2 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                  '& p': { mb: 2, lineHeight: 1.7 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                  '& li': { mb: 1 },
                  '& strong': { fontWeight: 600 },
                  '& code': { 
                    backgroundColor: 'grey.200', 
                    padding: '2px 6px', 
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  },
                  '& pre': {
                    backgroundColor: 'grey.200',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: response }}
              />
            </CardContent>
          </Card>

          {/* Sources Card */}
          {sources.length > 0 && (
            <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
              <CardHeader 
                title="Web Sources" 
                avatar={<LinkIcon />}
              />
              <CardContent>
                {sources.map((source, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Link 
                      href={source.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 500, fontSize: '1rem', color: 'primary.main' }}
                    >
                      {source.title}
                    </Link>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {source.snippet}
                    </Typography>
                    {index < sources.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AiLookupPage;