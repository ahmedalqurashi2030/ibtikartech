param(
  [int]$Port = 9256,
  [string]$BaseUrl = 'http://127.0.0.1:4173',
  [string]$OutputRoot = 'artifacts/preservation-refine/after'
)

function Receive-CdpMessage($Socket) {
  $buffer = New-Object byte[] 1048576
  $segment = [ArraySegment[byte]]::new($buffer)
  $stream = New-Object IO.MemoryStream
  do {
    $result = $Socket.ReceiveAsync($segment, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $stream.Write($buffer, 0, $result.Count)
  } while (-not $result.EndOfMessage)
  $message = [Text.Encoding]::UTF8.GetString($stream.ToArray())
  $stream.Dispose()
  return $message
}

function Send-CdpCommand($Socket, $Id, $Method, $Params) {
  $payload = @{ id = $Id; method = $Method; params = $Params } | ConvertTo-Json -Compress -Depth 12
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $Socket.SendAsync(
    [ArraySegment[byte]]::new($bytes),
    [Net.WebSockets.WebSocketMessageType]::Text,
    $true,
    [Threading.CancellationToken]::None
  ).GetAwaiter().GetResult() | Out-Null
  while ($true) {
    $message = Receive-CdpMessage $Socket
    $parsed = $message | ConvertFrom-Json
    if ($parsed.id -eq $Id) { return $parsed }
  }
}

$targetInfo = ((Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/json/list").Content | ConvertFrom-Json) |
  Where-Object { $_.type -eq 'page' } | Select-Object -First 1
if (-not $targetInfo) { throw 'Chrome page unavailable' }

[IO.Directory]::CreateDirectory((Join-Path (Get-Location) $OutputRoot)) | Out-Null
$socket = [Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$targetInfo.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

$pages = @(
  @('index.html', 'home'),
  @('services.html', 'services'),
  @('ecommerce.html', 'ecommerce'),
  @('product-page-optimization.html', 'specialized'),
  @('tharaa.html', 'tharaa')
)
$modes = @(
  @{ Name = 'desktop'; Width = 1425; Height = 1000; Mobile = $false },
  @{ Name = 'mobile'; Width = 390; Height = 844; Mobile = $true }
)

$id = 500
foreach ($mode in $modes) {
  foreach ($page in $pages) {
    $id++
    Send-CdpCommand $socket $id 'Emulation.setDeviceMetricsOverride' @{
      width = $mode.Width; height = $mode.Height; deviceScaleFactor = 1; mobile = $mode.Mobile
    } | Out-Null
    $id++
    Send-CdpCommand $socket $id 'Page.navigate' @{ url = "$BaseUrl/$($page[0])" } | Out-Null
    Start-Sleep -Milliseconds 1400

    $id++
    $heightResult = Send-CdpCommand $socket $id 'Runtime.evaluate' @{
      expression = 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)'; returnByValue = $true
    }
    $documentHeight = [int]$heightResult.result.result.value
    $maxScroll = [Math]::Max(0, $documentHeight - $mode.Height)
    $positions = @(0, [Math]::Round($maxScroll / 3), [Math]::Round($maxScroll * 2 / 3), $maxScroll)

    for ($slice = 0; $slice -lt $positions.Count; $slice++) {
      $id++
      Send-CdpCommand $socket $id 'Runtime.evaluate' @{
        expression = "window.scrollTo(0,$($positions[$slice])); document.documentElement.scrollTop"; returnByValue = $true
      } | Out-Null
      Start-Sleep -Milliseconds 350
      $id++
      $capture = Send-CdpCommand $socket $id 'Page.captureScreenshot' @{
        format = 'png'; fromSurface = $true; captureBeyondViewport = $false
      }
      $path = Join-Path $OutputRoot "$($page[1])-$($mode.Name)-$($slice + 1).png"
      [IO.File]::WriteAllBytes((Join-Path (Get-Location) $path), [Convert]::FromBase64String($capture.result.data))
      Write-Output $path
    }
  }
}

$socket.Dispose()
