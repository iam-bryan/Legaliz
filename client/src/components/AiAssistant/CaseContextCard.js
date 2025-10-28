import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
  Collapse
} from '@mui/material';
import {
  FolderOpen,
  Description,
  FindInPage,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const CaseContextCard = ({ caseData, onIncludeDocsChange, includeDocuments, onFindSimilar }) => {
  const [expanded, setExpanded] = useState(false);

  if (!caseData) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'closed':
        return 'default';
      default:
        return 'info';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        boxShadow: 'none'
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FolderOpen sx={{ fontSize: 18, mr: 0.5, color: '#666' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: '#333' }}>
            {caseData.title}
          </Typography>
        </Box>

        {/* Status & Type */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label={caseData.case_type || 'Unknown Type'}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }}
          />
          <Chip
            label={caseData.status || 'Unknown'}
            color={getStatusColor(caseData.status)}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }}
          />
          {caseData.progress !== undefined && (
            <Chip
              label={`${caseData.progress}% Complete`}
              color={getProgressColor(caseData.progress)}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }}
            />
          )}
        </Box>

        {/* Client Info */}
        {caseData.client_name && (
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#666' }}>
            Client: {caseData.client_name}
          </Typography>
        )}

        {/* Lawyer Info */}
        {caseData.lawyer_name && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666' }}>
            Lawyer: {caseData.lawyer_name}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Documents Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Description sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
            {caseData.documents?.length || 0} Document{caseData.documents?.length !== 1 ? 's' : ''}
          </Typography>
          {caseData.documents?.length > 0 && (
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.7rem', p: 0.25 }}
            >
              {expanded ? 'Hide' : 'Show'}
            </Button>
          )}
        </Box>

        {/* Document List */}
        <Collapse in={expanded}>
          <Box sx={{ pl: 2.5, mb: 0.5 }}>
            {caseData.documents?.map((doc, index) => (
              <Typography
                key={doc.id || index}
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#555',
                  mb: 0.25,
                  fontSize: '0.7rem'
                }}
              >
                • {doc.file_name}
                {doc.file_size && (
                  <span style={{ color: '#999', marginLeft: 4 }}>
                    ({(doc.file_size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </Typography>
            ))}
          </Box>
        </Collapse>

        {/* Include Documents Checkbox */}
        {caseData.documents?.length > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDocuments}
                onChange={(e) => onIncludeDocsChange(e.target.checked)}
                size="small"
                sx={{ py: 0 }}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                Include all documents in AI analysis
              </Typography>
            }
            sx={{ mb: 0.5, mt: 0.5 }}
          />
        )}

        {/* Find Similar Cases Button */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<FindInPage />}
          onClick={onFindSimilar}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            py: 0.5,
            borderColor: '#ddd',
            color: '#555',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Find Similar Cases
        </Button>
      </CardContent>
    </Card>
  );
};

export default CaseContextCard;
