<!DOCTYPE html>
<html lang="en">
<head>
    <?php 
    require_once __DIR__ . '/config.php'; require_login(); include __DIR__ . '/partials/header.php'; ?>
    <title>Legal Case Management Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <style>
        :root {
            --legal-primary: #1a365d;
            --legal-secondary: #2d3748;
            --legal-accent: #3182ce;
            --legal-success: #38a169;
            --legal-warning: #d69e2e;
            --legal-danger: #e53e3e;
            --legal-light: #f7fafc;
            --legal-border: #e2e8f0;
            --legal-gold: #b7791f;
            --sidebar-bg: #2c3e50;
            --sidebar-text: #ecf0f1;
            --sidebar-active: #3498db;
        }

        body {
            background-color: var(--legal-light);
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-header {
            background: linear-gradient(135deg, var(--legal-primary) 0%, var(--legal-secondary) 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: none;
            transition: all 0.3s ease;
            height: 100%;
            border-left: 4px solid var(--legal-accent);
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .stat-card.primary { border-left-color: var(--legal-accent); }
        .stat-card.success { border-left-color: var(--legal-success); }
        .stat-card.warning { border-left-color: var(--legal-warning); }
        .stat-card.danger { border-left-color: var(--legal-danger); }
        .stat-card.gold { border-left-color: var(--legal-gold); }

        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }

        .stat-icon.primary { background: linear-gradient(135deg, var(--legal-accent), #4299e1); }
        .stat-icon.success { background: linear-gradient(135deg, var(--legal-success), #48bb78); }
        .stat-icon.warning { background: linear-gradient(135deg, var(--legal-warning), #ecc94b); }
        .stat-icon.danger { background: linear-gradient(135deg, var(--legal-danger), #fc8181); }
        .stat-icon.gold { background: linear-gradient(135deg, var(--legal-gold), #d69e2e); }

        .case-card {
            background: white;
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-left: 4px solid var(--legal-accent);
            transition: all 0.3s ease;
        }

        .case-card:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .case-card.high-priority { border-left-color: var(--legal-danger); }
        .case-card.medium-priority { border-left-color: var(--legal-warning); }
        .case-card.low-priority { border-left-color: var(--legal-success); }

        .status-badge {
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .status-active { background-color: #c6f6d5; color: #22543d; }
        .status-pending { background-color: #fef5e7; color: #c05621; }
        .status-closed { background-color: #fed7d7; color: #742a2a; }
        .status-review { background-color: #e6fffa; color: #234e52; }

        .priority-badge {
            padding: 0.3rem 0.6rem;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .priority-high { background-color: #fed7d7; color: #742a2a; }
        .priority-medium { background-color: #fef5e7; color: #c05621; }
        .priority-low { background-color: #c6f6d5; color: #22543d; }

        .btn-legal-primary {
            background: linear-gradient(135deg, var(--legal-accent), #4299e1);
            border: none;
            border-radius: 0.5rem;
            padding: 0.6rem 1.2rem;
            font-weight: 500;
            color: white;
            transition: all 0.3s ease;
        }

        .btn-legal-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
            color: white;
        }

        .deadline-item {
            padding: 1rem;
            background: white;
            border-radius: 0.5rem;
            margin-bottom: 0.75rem;
            border-left: 4px solid var(--legal-warning);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .deadline-urgent { border-left-color: var(--legal-danger); }
        .deadline-normal { border-left-color: var(--legal-warning); }
        .deadline-future { border-left-color: var(--legal-success); }

        /* Admin Dashboard Cards */
        .admin-card {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            text-align: center;
            transition: all 0.3s ease;
            height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .admin-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .admin-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin-bottom: 1rem;
        }

        .admin-icon.users { background: linear-gradient(135deg, var(--legal-accent), #4299e1); }
        .admin-icon.cases { background: linear-gradient(135deg, var(--legal-success), #48bb78); }
        .admin-icon.ai { background: linear-gradient(135deg, var(--legal-gold), #d69e2e); }

        .admin-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--legal-secondary);
        }

        .admin-subtitle {
            font-size: 0.875rem;
            color: #6c757d;
            margin-bottom: 1.5rem;
        }

        .admin-btn {
            background: var(--legal-accent);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem 2rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .admin-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
            color: white;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            
            .sidebar.show {
                transform: translateX(0);
            }
            
            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Main Content -->
    <main class="main-content">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h2 class="mb-1">Admin Dashboard</h2>
                        <p class="mb-0 opacity-75">System administration and management</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="dropdown">
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                                <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <!-- Admin Dashboard Cards -->
            <div class="row g-4 mb-4">
                <div class="col-lg-4 col-md-9">
                    <div class="admin-card">
                        <div class="admin-icon users">
                            <i class="bi bi-people"></i>
                        </div>
                        <div class="admin-title">Manage Accounts</div>
                        <div class="admin-subtitle">Users</div>
                        <a href="users.php" class="admin-btn">Manage Users</a>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6">
                    <div class="admin-card">
                        <div class="admin-icon cases">
                            <i class="bi bi-folder2-open"></i>
                        </div>
                        <div class="admin-title">All Cases</div>
                        <div class="admin-subtitle">Cases</div>
                        <a href="cases/list.php" class="admin-btn">View Cases</a>
                    </div>
                </div>

                <div class="col-lg-4 col-md-6">
                    <div class="admin-card">
                        <div class="admin-icon ai">
                            <i class="bi bi-robot"></i>
                        </div>
                        <div class="admin-title">Case Lookup</div>
                        <div class="admin-subtitle">AI</div>
                        <a href="ai_lookup.php" class="admin-btn">Open AI Lookup</a>
                    </div>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="row g-4 mb-4">
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card primary">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="text-secondary mb-1">Active Cases</div>
                                <div class="h3 mb-0 text-primary">12</div>
                                <small class="text-success"><i class="bi bi-arrow-up"></i> +12%</small>
                            </div>
                            <div class="stat-icon primary">
                                <i class="bi bi-folder2-open"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card success">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="text-secondary mb-1">Total Clients</div>
                                <div class="h3 mb-0 text-success">30</div>
                                <small class="text-success"><i class="bi bi-arrow-up"></i> +8%</small>
                            </div>
                            <div class="stat-icon success">
                                <i class="bi bi-people"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card warning">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="text-secondary mb-1">Pending Tasks</div>
                                <div class="h3 mb-0 text-warning">8</div>
                                <small class="text-warning"><i class="bi bi-clock"></i> Due soon</small>
                            </div>
                            <div class="stat-icon warning">
                                <i class="bi bi-list-check"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card gold">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="text-secondary mb-1">Revenue (MTD)</div>
                                <div class="h3 mb-0" style="color: var(--legal-gold);">$45,200</div>
                                <small class="text-success"><i class="bi bi-arrow-up"></i> +15%</small>
                            </div>
                            <div class="stat-icon gold">
                                <i class="bi bi-currency-dollar"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Cases Section -->
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm" style="border-radius: 1rem;">
                        <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h5 class="mb-1">Recent Cases</h5>
                                <small class="text-muted">Latest case activities and updates</small>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-legal-primary btn-sm">
                                    <i class="bi bi-plus-circle me-1"></i>New Case
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div class="case-card high-priority">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-start">
                                            <div class="me-3">
                                                <i class="bi bi-briefcase-fill text-primary fs-4"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-1">Smith vs. Johnson</h6>
                                                <p class="text-muted mb-2 small">
                                                    Personal Injury • Case #2024-PI-001
                                                </p>
                                                <div class="d-flex gap-2 mb-2">
                                                    <span class="status-badge status-active">Active</span>
                                                    <span class="priority-badge priority-high">High Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center">
                                            <div class="fw-semibold text-success">$125,000</div>
                                            <small class="text-muted">Est. Value</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-end">
                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-calendar3 me-1"></i>Aug 30, 2025
                                                </small>
                                            </div>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="case-card medium-priority">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-start">
                                            <div class="me-3">
                                                <i class="bi bi-briefcase-fill text-primary fs-4"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-1">Estate of Williams</h6>
                                                <p class="text-muted mb-2 small">
                                                    Estate Planning • Case #2024-EP-003
                                                </p>
                                                <div class="d-flex gap-2 mb-2">
                                                    <span class="status-badge status-pending">Pending</span>
                                                    <span class="priority-badge priority-medium">Medium Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center">
                                            <div class="fw-semibold text-success">$2,300,000</div>
                                            <small class="text-muted">Est. Value</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-end">
                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-calendar3 me-1"></i>Sep 5, 2025
                                                </small>
                                            </div>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="case-card high-priority">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-start">
                                            <div class="me-3">
                                                <i class="bi bi-briefcase-fill text-primary fs-4"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-1">ABC Corp Contract Dispute</h6>
                                                <p class="text-muted mb-2 small">
                                                    Commercial Law • Case #2024-CL-012
                                                </p>
                                                <div class="d-flex gap-2 mb-2">
                                                    <span class="status-badge status-review">Review</span>
                                                    <span class="priority-badge priority-high">High Priority</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center">
                                            <div class="fw-semibold text-success">$500,000</div>
                                            <small class="text-muted">Est. Value</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-end">
                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    <i class="bi bi-calendar3 me-1"></i>Sep 15, 2025
                                                </small>
                                            </div>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                                <button class="btn btn-outline-secondary">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar Content -->
                <div class="col-lg-4">
                    <!-- Upcoming Deadlines -->
                    <div class="card border-0 shadow-sm mb-4" style="border-radius: 1rem;">
                        <div class="card-header bg-transparent border-0 p-3">
                            <h6 class="mb-0"><i class="bi bi-alarm me-2"></i>Upcoming Deadlines</h6>
                        </div>
                        <div class="card-body p-3">
                            <div class="deadline-item deadline-urgent">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="fw-semibold">Discovery Deadline</div>
                                        <small class="text-muted">Smith vs. Johnson</small>
                                    </div>
                                    <div class="text-end">
                                        <div class="small fw-semibold text-danger">Tomorrow</div>
                                        <small class="text-muted">Aug 25</small>
                                    </div>
                                </div>
                            </div>

                            <div class="deadline-item deadline-normal">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="fw-semibold">Court Hearing</div>
                                        <small class="text-muted">Estate of Williams</small>
                                    </div>
                                    <div class="text-end">
                                        <div class="small fw-semibold text-warning">6 days</div>
                                        <small class="text-muted">Aug 30</small>
                                    </div>
                                </div>
                            </div>

                            <div class="deadline-item deadline-future">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="fw-semibold">Brief Filing</div>
                                        <small class="text-muted">ABC Corp Dispute</small>
                                    </div>
                                    <div class="text-end">
                                        <div class="small fw-semibold text-warning">12 days</div>
                                        <small class="text-muted">Sep 5</small>
                                    </div>
                                </div>
                            </div>

                            <div class="text-center mt-3">
                                <button class="btn btn-outline-primary btn-sm">
                                    <a href="schedules/list.php" class="bi bi-calendar3 me-1">View Full Calendar </a>
                                </button>
                            </div>
                        </div>
                    </div>
