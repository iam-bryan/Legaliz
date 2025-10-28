import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';
import { CardContent, Box, useTheme, alpha } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CaseOverviewChart = ({ workloadData = { labels: [], data: [] }, cases = [] }) => {
  const theme = useTheme();

  // Format dates for better readability
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Status color mapping using theme colors
  const statusColors = {
    open: theme.palette.success.main,
    in_progress: theme.palette.warning.main,
    pending: theme.palette.info.main,
    closed: theme.palette.error.main,
  };

  // Group cases by date and status
  const processCasesByDateAndStatus = () => {
    const dateStatusMap = {};
    
    cases.forEach(caseItem => {
      const date = new Date(caseItem.created_at).toISOString().split('T')[0];
      const status = caseItem.status || 'unknown';
      
      if (!dateStatusMap[date]) {
        dateStatusMap[date] = { open: 0, in_progress: 0, pending: 0, closed: 0 };
      }
      
      if (dateStatusMap[date][status] !== undefined) {
        dateStatusMap[date][status]++;
      }
    });
    
    return dateStatusMap;
  };

  const dateStatusMap = processCasesByDateAndStatus();
  
  // Prepare datasets for each status
  const statuses = ['open', 'in_progress', 'pending', 'closed'];
  const datasets = statuses.map(status => {
    const data = workloadData.labels.map(label => {
      return dateStatusMap[label]?.[status] || 0;
    });

    return {
      label: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      data: data,
      backgroundColor: alpha(statusColors[status] || theme.palette.grey[400], 0.8),
      hoverBackgroundColor: statusColors[status] || theme.palette.grey[400],
      borderWidth: 0,
      borderRadius: 4,
    };
  });

  const chartData = {
    labels: workloadData.labels.map(label => formatDateLabel(label)),
    datasets: datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          color: theme.palette.text.primary,
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: alpha(theme.palette.grey[900], 0.95),
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `Date: ${context[0].label}`;
          },
          label: (context) => {
            const status = context.dataset.label;
            const count = context.parsed.y;
            return `${status}: ${count} case${count !== 1 ? 's' : ''}`;
          },
          footer: (tooltipItems) => {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total} case${total !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          stepSize: 5,
          color: theme.palette.text.secondary,
          padding: 10,
          callback: function(value) {
            // Only show integers
            if (Number.isInteger(value)) {
              return value;
            }
          }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          borderDash: [3, 4],
        },
        border: {
          display: false,
        },
      },
      x: {
        stacked: true,
        ticks: {
          color: theme.palette.text.secondary,
          padding: 10,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <CardContent sx={{ pt: 2, pb: 1 }}>
      <Box sx={{ height: 280, position: 'relative' }}>
        <Bar options={options} data={chartData} />
      </Box>
    </CardContent>
  );
};

export default CaseOverviewChart;
