<?php
// /api/billing/invoice_pdf.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoloader
require_once __DIR__ . '/../vendor/setasign/fpdf/fpdf.php'; // Direct include for basic FPDF

class PDF extends FPDF {
    // Page header (Optional)
    function Header() {
        $this->SetFont('Arial','B',15);
        $this->Cell(80); // Center
        $this->Cell(30,10,'INVOICE',0,0,'C');
        $this->Ln(20); // Line break
    }
    // Page footer (Optional)
    function Footer() {
        $this->SetY(-15); $this->SetFont('Arial','I',8); $this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
    }
}

// --- Main Logic ---
$database = new Database();
$db = $database->getConnection();
$invoice_number = isset($_GET['invoice_number']) ? $_GET['invoice_number'] : '';

if (empty($invoice_number)) { die("Error: Invoice number is required."); }

// --- Fetch Invoice Data ---
try {
    $query = "SELECT b.invoice_number, b.amount, b.description, b.due_date, b.created_at as invoice_date, b.status, cs.title as case_title, cs.id as case_id, cl.name as client_name, cl.address as client_address, cl.contact as client_contact, cl.email as client_email, CONCAT(u.first_name, ' ', u.last_name) as lawyer_name FROM billings b JOIN cases cs ON b.case_id = cs.id LEFT JOIN clients cl ON cs.client_id = cl.id LEFT JOIN users u ON cs.lawyer_id = u.id WHERE b.invoice_number = :invoice_number LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':invoice_number', $invoice_number);
    $stmt->execute();
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$invoice) { die("Error: Invoice not found."); }
} catch (Exception $e) { error_log("Invoice PDF Error: " . $e->getMessage()); die("Error retrieving invoice data."); }

// --- Generate PDF ---
$pdf = new PDF();
$pdf->AliasNbPages();
$pdf->AddPage();
$pdf->SetFont('Arial','',12);

// Invoice Details
$pdf->SetFont('Arial','B',12); $pdf->Cell(40,10,'Invoice #:'); $pdf->SetFont('Arial','',12); $pdf->Cell(100,10, $invoice['invoice_number']); $pdf->Ln();
$pdf->SetFont('Arial','B',12); $pdf->Cell(40,10,'Invoice Date:'); $pdf->SetFont('Arial','',12); $pdf->Cell(100,10, date('Y-m-d', strtotime($invoice['invoice_date']))); $pdf->Ln();
$pdf->SetFont('Arial','B',12); $pdf->Cell(40,10,'Due Date:'); $pdf->SetFont('Arial','',12); $pdf->Cell(100,10, $invoice['due_date'] ? date('Y-m-d', strtotime($invoice['due_date'])) : 'N/A'); $pdf->Ln();
$pdf->SetFont('Arial','B',12); $pdf->Cell(40,10,'Status:'); $pdf->SetFont('Arial','',12); $pdf->Cell(100,10, ucfirst($invoice['status'])); $pdf->Ln(15);

// Client Details
$pdf->SetFont('Arial','B',12); $pdf->Cell(0,10,'Bill To:',0,1); $pdf->SetFont('Arial','',12); $pdf->Cell(0,6, $invoice['client_name'] ?: 'N/A', 0, 1);
if (!empty($invoice['client_address'])) { $pdf->MultiCell(0,6, $invoice['client_address'], 0, 'L'); }
if (!empty($invoice['client_email'])) { $pdf->Cell(0,6, 'Email: ' . $invoice['client_email'], 0, 1); }
if (!empty($invoice['client_contact'])) { $pdf->Cell(0,6, 'Contact: ' . $invoice['client_contact'], 0, 1); }
$pdf->Ln(10);

// Case Details
$pdf->SetFont('Arial','B',12); $pdf->Cell(0,10,'Regarding Case:',0,1); $pdf->SetFont('Arial','',12);
// --- THIS LINE IS CHANGED ---
$pdf->Cell(0,6, $invoice['case_title'], 0, 1); // Removed the '(ID: ...)' part
// --- END CHANGE ---
$pdf->Ln(15);

// Billing Item(s)
$pdf->SetFont('Arial','B',12); $pdf->Cell(130,7,'Description',1); $pdf->Cell(60,7,'Amount (PHP)',1,1,'R');
$pdf->SetFont('Arial','',12);
$descriptionWidth = 130; $amountWidth = 60; $lineHeight = 6; $x = $pdf->GetX(); $y = $pdf->GetY();
$pdf->MultiCell($descriptionWidth, $lineHeight, $invoice['description'], 1, 'L');
$yDescriptionEnd = $pdf->GetY(); $cellHeight = $yDescriptionEnd - $y; $pdf->SetXY($x + $descriptionWidth, $y);
$pdf->Cell($amountWidth, $cellHeight, number_format($invoice['amount'], 2), 1, 1, 'R');

// Total
$pdf->Ln(10); $pdf->SetFont('Arial','B',14); $pdf->Cell(130,10,'Total Amount Due:',0,0,'R'); $pdf->SetFont('Arial','B',14); $pdf->Cell(60,10,'PHP ' . number_format($invoice['amount'], 2),0,1,'R');

// Output PDF
$pdf->Output('I', 'Invoice-' . $invoice['invoice_number'] . '.pdf');
exit;
?>