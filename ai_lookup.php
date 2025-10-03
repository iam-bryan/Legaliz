<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/openai_config.php';
require_login();

function cosine_similarity($a, $b) {
    $dot = 0.0; $na = 0.0; $nb = 0.0;
    $len = min(count($a), count($b));
    for ($i=0; $i<$len; $i++) {
        $dot += $a[$i] * $b[$i];
        $na += $a[$i] * $a[$i];
        $nb += $b[$i] * $b[$i];
    }
    return $dot / (sqrt($na) * sqrt($nb));
}

$error = '';
$results = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $query = trim($_POST['query']);
    if (!$query) {
        $error = 'Enter a query.';
    } else {
        // Get query embedding
        $payload = json_encode([
            "model" => "text-embedding-3-small",
            "input" => $query
        ]);
        $ch = curl_init("https://api.openai.com/v1/embeddings");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $OPENAI_API_KEY"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        $resp = curl_exec($ch);
        $data = json_decode($resp, true);

        if (isset($data['data'][0]['embedding'])) {
            $query_emb = $data['data'][0]['embedding'];

            // Fetch stored cases
            $stmt = $pdo->query("SELECT id,title,citation,summary,embedding FROM public_cases");
            $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $scored = [];
            foreach ($cases as $c) {
                $emb = unserialize($c['embedding']); // or json_decode
                $score = cosine_similarity($query_emb, $emb);
                $scored[] = ["case" => $c, "score" => $score];
            }

            // Rank and take top 5
            usort($scored, fn($a,$b) => $b['score'] <=> $a['score']);
            $results = array_slice($scored, 0, 5);
        } else {
            $error = "Embedding API error.";
        }
    }
}
?>

<?php include __DIR__ . '/partials/header.php'; ?>

<h3>AI Case Lookup</h3>
<form method="post">
    <textarea name="query" class="form-control mb-2" rows="4" required><?=htmlspecialchars($_POST['query'] ?? '')?></textarea>
    <button class="btn btn-primary">Search</button>
</form>

<?php if ($error): ?>
    <div class="alert alert-danger"><?=htmlspecialchars($error)?></div>
<?php endif; ?>

<?php if (!empty($results)): ?>
    <h4 class="mt-4">Top Similar Cases</h4>
    <?php foreach ($results as $r): ?>
        <div class="card mb-2">
            <div class="card-body">
                <h5><?=htmlspecialchars($r['case']['title'])?></h5>
                <small><?=htmlspecialchars($r['case']['citation'])?></small>
                <p><?=htmlspecialchars(substr($r['case']['summary'], 0, 400))?>...</p>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

<?php include __DIR__ . '/partials/footer.php'; ?>
