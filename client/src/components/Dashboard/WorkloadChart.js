import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';
import { CardContent, Box, useTheme, alpha } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WorkloadChart = ({ workloadData = { labels: [], data: [] } }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  const chartData = {
    labels: workloadData.labels,
    datasets: [
      {
        label: 'Cases Created',
        data: workloadData.data,
        backgroundColor: alpha(primaryColor, 0.7),
        hoverBackgroundColor: primaryColor,
        borderWidth: 0,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 40,
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
      tooltip: {
        enabled: true,
        backgroundColor: alpha(theme.palette.grey[900], 0.9),
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 4,
        displayColors: false,
        intersect: false, // Show tooltip even if not directly hovering point
        mode: 'index', // Show tooltip for the index
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                 stepSize: 1,
                 color: theme.palette.text.secondary,
                 padding: 10, // Add padding to labels
            },
            grid: {
                color: theme.palette.divider,
                drawBorder: false, // Hide Y axis line
                // Add dashed lines for a lighter look
                borderDash: [3, 4],
            },
            // Hide the axis line itself
            border: {
                display: false
            }
        },
        x: {
            ticks: {
                 color: theme.palette.text.secondary,
                 padding: 10,
            },
            grid: {
                display: false,
            },
            border: {
                display: false
            }
        }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  return (
    <CardContent sx={{ pt: 2, pb: 1 }}>
         <Box sx={{ height: 300, position: 'relative' }}>
            <Bar options={options} data={chartData} />
         </Box>
    </CardContent>
  );
};

export default WorkloadChart;