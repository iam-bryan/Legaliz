import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, Box, useTheme, alpha } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CaseDistributionChart = ({ cases = [] }) => {
  const theme = useTheme();

  // Process data
  const statusCounts = cases.reduce((acc, currentCase) => {
    const status = currentCase.status || 'unknown';
    // Group 'in_progress' and 'pending' for simplicity if desired, or keep separate
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Consistent color mapping
  const statusColorMap = {
      open: theme.palette.success.light, // Use lighter shades
      in_progress: theme.palette.warning.light,
      closed: theme.palette.error.light,
      pending: theme.palette.info.light,
      unknown: theme.palette.grey[400] // Lighter grey
  };

  const labels = Object.keys(statusCounts);
  const dataValues = Object.values(statusCounts);
  const backgroundColors = labels.map(label => statusColorMap[label] || theme.palette.grey[400]);
  // Use slightly darker hover color
  const hoverBackgroundColors = labels.map(label => alpha(statusColorMap[label] || theme.palette.grey[400], 0.8));


  const chartData = {
    // Make labels cleaner
    labels: labels.map(l => l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
    datasets: [
      {
        label: 'Number of Cases',
        data: dataValues,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: hoverBackgroundColors, // Add hover effect
        borderWidth: 0,
        borderRadius: 6, // Slightly more rounded
        barThickness: 'flex',
        maxBarThickness: 40, // Adjust for spacing
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: alpha(theme.palette.grey[900], 0.9),
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                 stepSize: 1,
                 color: theme.palette.text.secondary,
                 padding: 10,
            },
            grid: {
                color: theme.palette.divider,
                drawBorder: false,
                borderDash: [3, 4], // Dashed lines
            },
             border: {
                display: false // Hide Y axis line
            }
        },
        x: {
             ticks: {
                 color: theme.palette.text.secondary,
                 padding: 10,
            },
            grid: {
                display: false, // Keep X grid hidden
            },
             border: {
                display: false // Hide X axis line
            }
        }
    },
    // Add spacing between bars if needed (adjust categoryPercentage)
    // categoryPercentage: 0.8,
    // barPercentage: 0.9
  };

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: 3 }}>
        <CardHeader
            title="Case Status Distribution"
            titleTypographyProps={{ variant: 'h6', fontWeight: 'medium' }}
            sx={{ pb: 0 }}
        />
        <CardContent>
             <Box sx={{ height: 300, position: 'relative' }}>
                <Bar options={options} data={chartData} />
             </Box>
        </CardContent>
    </Card>
  );
};

export default CaseDistributionChart;