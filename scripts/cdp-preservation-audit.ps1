param(
  [int]$Port = 9256,
  [string]$BaseUrl = 'http://127.0.0.1:4173'
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

$targets = ((Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/json/list").Content | ConvertFrom-Json)
$page = $targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1
if (-not $page) { throw 'Chrome page unavailable' }

$socket = [Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

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
$expression = @'
(async () => {
  const describe = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 140),
      x: Math.round(rect.x), y: Math.round(rect.y),
      width: Math.round(rect.width), height: Math.round(rect.height),
      opacity: style.opacity, display: style.display, visibility: style.visibility,
      fontSize: style.fontSize, lineHeight: style.lineHeight
    };
  };
  const sections = [...document.querySelectorAll('main section')].map((element, index) => {
    const rect = element.getBoundingClientRect();
    return {
      index: index + 1,
      id: element.id || '',
      className: (element.className || '').toString().slice(0, 90),
      height: Math.round(rect.height),
      top: Math.round(rect.top + scrollY),
      heading: (element.querySelector('h1,h2,h3')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90)
    };
  });
  const smallControls = [...document.querySelectorAll('a,button,input,select,textarea,summary')]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40);
    });
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const unnamedButtons = [...document.querySelectorAll('button')].filter((button) =>
    !(button.textContent || '').trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')
  ).length;
  const missingAlt = document.querySelectorAll('img:not([alt])').length;
  const qa = { duplicateIds, unnamedButtons, missingAlt, errors: window.__qaErrors || [] };

  const tickerToggle = document.querySelector('.ibtx-announcement__toggle');
  if (tickerToggle) {
    tickerToggle.click();
    qa.ticker = {
      paused: document.querySelector('.ibtx-announcement')?.classList.contains('is-paused'),
      pressed: tickerToggle.getAttribute('aria-pressed')
    };
    tickerToggle.click();
  }

  const faqButton = document.querySelector('.faq button, .faq-item button');
  if (faqButton) {
    faqButton.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    qa.faq = {
      expanded: faqButton.getAttribute('aria-expanded'),
      controlled: Boolean(faqButton.getAttribute('aria-controls')),
      answerHidden: document.getElementById(faqButton.getAttribute('aria-controls'))?.getAttribute('aria-hidden')
    };
    faqButton.click();
  }

  const tabList = document.querySelector('.decision-tabs');
  if (tabList) {
    const firstTab = tabList.querySelector('[role="tab"]');
    firstTab?.focus();
    tabList.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    qa.tabs = {
      active: tabList.querySelector('[aria-selected="true"]')?.dataset.decisionTab || '',
      selectedCount: tabList.querySelectorAll('[aria-selected="true"]').length,
      tabPanelCount: document.querySelectorAll('[role="tabpanel"]').length
    };
  }
  return {
    url: location.href,
    viewport: {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight
    },
    h1: describe(document.querySelector('main h1')),
    header: describe(document.querySelector('.ibt-shell-header')),
    sections,
    smallControlCount: smallControls.length,
    smallControlSamples: smallControls.slice(0, 12).map(describe),
    activeOverlays: [...document.querySelectorAll('body *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (style.position === 'fixed' || style.position === 'sticky') &&
          rect.width > innerWidth * .85 && rect.height > innerHeight * .7 &&
          style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .05;
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        className: (element.className || '').toString().slice(0, 100),
        position: getComputedStyle(element).position,
        zIndex: getComputedStyle(element).zIndex
      })),
    qa
  };
})()
'@

$id = 100
$id++
Send-CdpCommand $socket $id 'Page.addScriptToEvaluateOnNewDocument' @{
  source = @'
window.__qaErrors = [];
window.addEventListener('error', (event) => window.__qaErrors.push(String(event.message || event.error || 'window error')));
window.addEventListener('unhandledrejection', (event) => window.__qaErrors.push(String(event.reason || 'unhandled rejection')));
'@
} | Out-Null
foreach ($mode in $modes) {
  foreach ($item in $pages) {
    $id++
    Send-CdpCommand $socket $id 'Emulation.setDeviceMetricsOverride' @{
      width = $mode.Width; height = $mode.Height; deviceScaleFactor = 1; mobile = $mode.Mobile
    } | Out-Null
    $id++
    Send-CdpCommand $socket $id 'Page.navigate' @{ url = "$BaseUrl/$($item[0])" } | Out-Null
    Start-Sleep -Milliseconds 1000
    $id++
    $result = Send-CdpCommand $socket $id 'Runtime.evaluate' @{ expression = $expression; returnByValue = $true; awaitPromise = $true }
    [pscustomobject]@{
      page = $item[1]
      mode = $mode.Name
      data = $result.result.result.value
    } | ConvertTo-Json -Compress -Depth 12
  }
}
$socket.Dispose()
