Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = Get-ChildItem -Path "D:\New folder" -Filter "*.docx" | Select-Object -First 1
Write-Host "Found file:" $file.FullName

$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$paragraphs = [regex]::Matches($xmlText, "<w:p[ >].*?</w:p>") | ForEach-Object {
    $pXml = $_.Value
    $t = [regex]::Matches($pXml, "<w:t[^>]*>(.*?)</w:t>") | ForEach-Object { $_.Groups[1].Value }
    $t -join ""
} | Where-Object { $_.Trim().Length -gt 0 }

$outputPath = "D:\New folder\spec_paragraphs.txt"
[System.IO.File]::WriteAllLines($outputPath, $paragraphs, [System.Text.Encoding]::UTF8)

Write-Host "Total paragraphs extracted:" $paragraphs.Count
