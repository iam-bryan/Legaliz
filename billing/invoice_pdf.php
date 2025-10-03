<?php
require_once __DIR__ . '/../config.php';
require_login();

$id = (int)($_GET['id'] ?? 0);

// Fetch invoice details with related information
$stmt = $pdo->prepare('
    SELECT b.*, 
           c.title AS case_title, 
           c.description as case_description,
           cl.name AS client_name, 
           cl.email AS client_email,
           cl.phone AS client_phone,
           cl.address AS client_address,
           u.name AS lawyer_name,
           u.email AS lawyer_email
    FROM billing b 
    LEFT JOIN cases c ON c.id = b.case_id 
    LEFT JOIN clients cl ON cl.id = c.client_id 
    LEFT JOIN users u ON u.id = c.assigned_lawyer_id
    WHERE b.id = ?
');

$stmt->execute([$id]);
$invoice = $stmt->fetch();

if (!$invoice) {
    http_response_code(404);
    die('Invoice not found');
}

// Check permissions - clients can only view their own invoices
if ($_SESSION['role'] === 'client') {
    $client_check = $pdo->prepare('
        SELECT 1 FROM billing b
        JOIN cases c ON c.id = b.case_id
        WHERE b.id = ? AND c.client_id = ?
    ');
    $client_check->execute([$id, $_SESSION['client_id']]);
    if (!$client_check->fetch()) {
        http_response_code(403);
        die('Access denied');
    }
}

// Try to use dompdf if available
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    
    try {
        use Dompdf\Dompdf;
        use Dompdf\Options;
        
        $options = new Options();
        $options->set('defaultFont', 'Arial');
        $options->set('isRemoteEnabled', true);
        
        $dompdf = new Dompdf($options);
        
        // Professional invoice HTML template
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice ' . htmlspecialchars($invoice['invoice_number']) . '</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                .header { border-bottom: 3px solid #2c5aa0; padding-bottom: 20px; margin-bottom: 30px; }
                .company-name { font-size: 28px; font-weight: bold; color: #2c5aa0; margin-bottom: 5px; }
                .company-tagline { color: #666; font-style: italic; }
                .invoice-title { font-size: 24px; color: #2c5aa0; margin: 20px 0; }
                .invoice-meta { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .client-info, .invoice-details { margin-bottom: 30px; }
                .section-title { font-size: 16px; font-weight: bold; color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                .table th { background-color: #2c5aa0; color: white; font-weight: bold; }
                .amount { text-align: right; font-weight: bold; }
                .total-row { background-color: #f8f9fa; font-weight: bold; font-size: 18px; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                .status { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                .status-paid { background: #d4edda; color: #155724; }
                .status-unpaid { background: #f8d7da; color: #721c24; }
                .status-overdue { background: #fff3cd; color: #856404; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">Legal Case Management System</div>
                <div class="company-tagline">Professional Legal Services</div>
            </div>
            
            <div class="invoice-meta">
                <h1 class="invoice-title">INVOICE</h1>
                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; width: 50%;">
                        <strong>Invoice #:</strong> ' . htmlspecialchars($invoice['invoice_number']) . '<br>
                        <strong>Date Issued:</strong> ' . date('F j, Y', strtotime($invoice['issued_at'])) . '<br>
                        <strong>Status:</strong> <span class="status status-' . $invoice['status'] . '">' . ucfirst($invoice['status']) . '</span>
                    </div>
                    <div style="display: table-cell; width: 50%; text-align: right;">
                        <strong>Case ID:</strong> #' . $invoice['case_id'] . '<br>
                        <strong>Amount Due:</strong> <span style="font-size: 18px; color: #2c5aa0;">₱' . number_format((float)$invoice['amount'], 2) . '</span>
                    </div>
                </div>
            </div>
            
            <div class="client-info">
                <div class="section-title">Bill To:</div>
                <strong>' . htmlspecialchars($invoice['client_name'] ?: 'N/A') . '</strong><br>';
        
        if ($invoice['client_email']) {
            $html .= 'Email: ' . htmlspecialchars($invoice['client_email']) . '<br>';
        }
        if ($invoice['client_phone']) {
            $html .= 'Phone: ' . htmlspecialchars($invoice['client_phone']) . '<br>';
        }
        if ($invoice['client_address']) {
            $html .= 'Address: ' . htmlspecialchars($invoice['client_address']) . '<br>';
        }
        
        $html .= '</div>
            
            <div class="invoice-details">
                <div class="section-title">Case Information:</div>
                <strong>Case:</strong> ' . htmlspecialchars($invoice['case_title']) . '<br>';
                
        if ($invoice['lawyer_name']) {
            $html .= '<strong>Assigned Lawyer:</strong> ' . htmlspecialchars($invoice['lawyer_name']) . '<br>';
        }
        
        $html .= '</div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right; width: 150px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>' . nl2br(htmlspecialchars($invoice['description'])) . '</td>
                        <td class="amount">₱' . number_format((float)$invoice['amount'], 2) . '</td>
                    </tr>
                    <tr class="total-row">
                        <td style="text-align: right;"><strong>TOTAL AMOUNT DUE:</strong></td>
                        <td class="amount">₱' . number_format((float)$invoice['amount'], 2) . '</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
                <p><strong>Note:</strong> This is a computer-generated invoice and does not require a signature.</p>
                <p>Thank you for choosing our legal services. If you have any questions about this invoice, please contact us.</p>
                <p style="text-align: center; margin-top: 30px;">
                    Generated on ' . date('F j, Y \a\t g:i A') . ' | Legal Case Management System
                </p>
            </div>
        </body>
        </html>';
        
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        
        // Update PDF path in database if successful
        $pdf_filename = 'invoice_' . $invoice['id'] . '_' . date('Y-m-d') . '.pdf';
        $update_stmt = $pdo->prepare('UPDATE billing SET pdf_path = ? WHERE id = ?');
        $update_stmt->execute([$pdf_filename, $id]);
        
        $dompdf->stream($pdf_filename, ['Attachment' => 0]);
        exit;
        
    } catch (Exception $e) {
        error_log('PDF Generation Error: ' . $e->getMessage());
        // Fall through to fallback method
    }
}

// Fallback: Try to serve sample PDF or create simple HTML
$sample_pdf = __DIR__ . '/invoices/sample_invoice.pdf';
if (file_exists($sample_pdf)) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="invoice_' . $invoice['id'] . '.pdf"');
    header('Content-Length: ' . filesize($sample_pdf));
    readfile($sample_pdf);
    exit;
}

// Last resort: Generate simple HTML version
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice <?= htmlspecialchars($invoice['invoice_number']) ?></title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
        .client-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .amount { text-align: right; }
        .total { font-weight: bold; background-color: #e9ecef; }
        .no-pdf { background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        @media print { .no-pdf, .print-btn { display: none; } }
    </style>
</head>
<body>
    <div class="no-pdf">
        <strong>Note:</strong> PDF generation requires dompdf library. Showing HTML version instead.
        <button onclick="window.print()" class="print-btn" style="float: right; padding: 5px 10px;">Print</button>
    </div>
    
    <div class="header">
        <h1>Legal Case Management System</h1>
        <h2>INVOICE</h2>
    </div>
    
    <div class="invoice-info">
        <strong>Invoice #:</strong> <?= htmlspecialchars($invoice['invoice_number']) ?><br>
        <strong>Date:</strong> <?= date('F j, Y', strtotime($invoice['issued_at'])) ?><br>
        <strong>Status:</strong> <?= ucfirst(htmlspecialchars($invoice['status'])) ?>
    </div>
    
    <div class="client-info">
        <h3>Bill To:</h3>
        <strong><?= htmlspecialchars($invoice['client_name'] ?: 'N/A') ?></strong><br>
        <?php if ($invoice['client_email']): ?>
            Email: <?= htmlspecialchars($invoice['client_email']) ?><br>
        <?php endif; ?>
        <strong>Case:</strong> <?= htmlspecialchars($invoice['case_title']) ?>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><?= nl2br(htmlspecialchars($invoice['description'])) ?></td>
                <td class="amount">₱<?= number_format((float)$invoice['amount'], 2) ?></td>
            </tr>
            <tr class="total">
                <td><strong>TOTAL</strong></td>
                <td class="amount"><strong>₱<?= number_format((float)$invoice['amount'], 2) ?></strong></td>
            </tr>
        </tbody>
    </table>
    
    <p style="margin-top: 40px; font-size: 0.9em; color: #666;">
        This is a system-generated invoice. Generated on <?= date('F j, Y \a\t g:i A') ?>
    </p>
</body>
</html>
<?php exit; ?>