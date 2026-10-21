# Script de test de tous les endpoints API Formation
# Utilisation: .\test-all-endpoints.ps1

$baseUrl = "http://localhost:8080"
$formateurCreds = "salah.benali:formateur123"
$etudiantCreds = "ali.chaabane:etudiant123"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST DES ENDPOINTS API FORMATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Fonction pour créer les credentials en Base64
function Get-BasicAuthHeader {
    param([string]$credentials)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($credentials)
    $base64 = [Convert]::ToBase64String($bytes)
    return @{ Authorization = "Basic $base64" }
}

$formateurHeaders = Get-BasicAuthHeader -credentials $formateurCreds
$etudiantHeaders = Get-BasicAuthHeader -credentials $etudiantCreds

# ===== FORMATEUR ENDPOINTS =====
Write-Host "`n=== FORMATEUR API ===`n" -ForegroundColor Yellow

# 1. GET Groupes
Write-Host "[1/7] GET /api/formateur/groupes" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/groupes" -Method Get -Headers $formateurHeaders
    Write-Host "    ✓ SUCCESS - Nombre de groupes: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 2. GET Séances
Write-Host "`n[2/7] GET /api/formateur/seances" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/seances" -Method Get -Headers $formateurHeaders
    Write-Host "    ✓ SUCCESS - Nombre de séances: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 3. GET Planning
Write-Host "`n[3/7] GET /api/formateur/planning" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/planning" -Method Get -Headers $formateurHeaders
    Write-Host "    ✓ SUCCESS - Nombre de séances dans le planning: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. GET Étudiants d'un groupe (ID=7)
Write-Host "`n[4/7] GET /api/formateur/groupes/7/etudiants" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/groupes/7/etudiants" -Method Get -Headers $formateurHeaders
    Write-Host "    ✓ SUCCESS - Nombre d'étudiants: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. GET Notes
Write-Host "`n[5/7] GET /api/formateur/notes" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/notes" -Method Get -Headers $formateurHeaders
    Write-Host "    ✓ SUCCESS - Nombre de notes: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 6. POST Saisir une note
Write-Host "`n[6/7] POST /api/formateur/notes" -ForegroundColor Green
try {
    $noteData = @{
        valeur = 16.5
        session = "Contrôle Continu 2"
        etudiant = @{ id = 36 }
        cours = @{ id = 11 }
    } | ConvertTo-Json
    
    $headers = $formateurHeaders.Clone()
    $headers['Content-Type'] = 'application/json'
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/notes" -Method Post -Headers $headers -Body $noteData
    Write-Host "    ✓ SUCCESS - Note créée avec ID: $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 7. PUT Modifier une note
Write-Host "`n[7/7] PUT /api/formateur/notes/31" -ForegroundColor Green
try {
    $noteData = @{
        valeur = 18.0
        session = "Contrôle Continu 1 - Modifié"
    } | ConvertTo-Json
    
    $headers = $formateurHeaders.Clone()
    $headers['Content-Type'] = 'application/json'
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/formateur/notes/31" -Method Put -Headers $headers -Body $noteData
    Write-Host "    ✓ SUCCESS - Note modifiée avec valeur: $($response.valeur)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# ===== ETUDIANT ENDPOINTS =====
Write-Host "`n`n=== ETUDIANT API ===`n" -ForegroundColor Yellow

# 1. GET Planning
Write-Host "[1/5] GET /api/etudiant/planning" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/etudiant/planning" -Method Get -Headers $etudiantHeaders
    Write-Host "    ✓ SUCCESS - Nombre de séances: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 2. GET Notes
Write-Host "`n[2/5] GET /api/etudiant/notes" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/etudiant/notes" -Method Get -Headers $etudiantHeaders
    Write-Host "    ✓ SUCCESS - Nombre de notes: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 3. GET Notifications
Write-Host "`n[3/5] GET /api/etudiant/notifications" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/etudiant/notifications" -Method Get -Headers $etudiantHeaders
    Write-Host "    ✓ SUCCESS - Nombre de notifications: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. GET Cours
Write-Host "`n[4/5] GET /api/etudiant/cours" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/etudiant/cours" -Method Get -Headers $etudiantHeaders
    Write-Host "    ✓ SUCCESS - Nombre de cours: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. GET Formateurs
Write-Host "`n[5/5] GET /api/etudiant/formateurs" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/etudiant/formateurs" -Method Get -Headers $etudiantHeaders
    Write-Host "    ✓ SUCCESS - Nombre de formateurs: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "    ✗ FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTS TERMINÉS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
