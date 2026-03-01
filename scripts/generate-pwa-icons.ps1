Add-Type -AssemblyName System.Drawing

$sizes = @(192, 512)
$publicDir = Join-Path $PSScriptRoot '..\public'

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'

    # Scale factor relative to 180px (apple-touch-icon reference)
    $scale = $size / 180.0

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 23, 20))
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Lamp glow (outer ring)
    $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 232, 173, 74))
    $glowX = [int](45 * $scale)
    $glowY = [int](30 * $scale)
    $glowSize = [int](90 * $scale)
    $g.FillEllipse($glowBrush, $glowX, $glowY, $glowSize, $glowSize)

    # Lamp body
    $lampBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 173, 74))
    $lampX = [int](60 * $scale)
    $lampY = [int](45 * $scale)
    $lampSize = [int](60 * $scale)
    $g.FillEllipse($lampBrush, $lampX, $lampY, $lampSize, $lampSize)

    # Lamp stem
    $penWidth = [math]::Max(2, [int](6 * $scale))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 232, 173, 74), $penWidth)
    $pen.StartCap = 'Round'
    $pen.EndCap = 'Round'
    $stemX = [int](90 * $scale)
    $stemY1 = [int](120 * $scale)
    $stemY2 = [int](150 * $scale)
    $g.DrawLine($pen, $stemX, $stemY1, $stemX, $stemY2)

    # Save
    $outPath = Join-Path $publicDir "icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "PWA icon ${size}x${size} saved to $outPath"
}
