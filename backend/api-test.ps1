$cfg = @{}
Get-Content "$PSScriptRoot\.env" | Where-Object { $_ -match '^\w+=' } | ForEach-Object { $k, $v = $_ -split '=', 2; $cfg[$k] = $v }
$base = 'http://localhost:5000/api'

function Call($method, $path, $body = $null, $token = $null) {
  $p = @{ Uri = "$base$path"; Method = $method; ContentType = 'application/json' }
  if ($token) { $p.Headers = @{ Authorization = "Bearer $token" } }
  if ($body)  { $p.Body = ($body | ConvertTo-Json) }
  try { Invoke-RestMethod @p }
  catch {
    if ($_.Exception.Response) { "ERROR $([int]$_.Exception.Response.StatusCode): $($_.ErrorDetails.Message)" }
    else { "NO RESPONSE: $($_.Exception.Message) (is the server running?)" }
  }
}
