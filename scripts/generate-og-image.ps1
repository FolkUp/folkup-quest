Add-Type -AssemblyName System.Drawing
$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAlias'

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 23, 20))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Lamp glow (amber circle)
$glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 232, 173, 74))
$g.FillEllipse($glowBrush, 500, 80, 200, 200)
$lampBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 173, 74))
$g.FillEllipse($lampBrush, 560, 140, 80, 80)

# Title
$titleFont = New-Object System.Drawing.Font('Georgia', 52, [System.Drawing.FontStyle]::Regular)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 173, 74))
$titleFormat = New-Object System.Drawing.StringFormat
$titleFormat.Alignment = 'Center'
$g.DrawString('FolkUp Quest', $titleFont, $titleBrush, [System.Drawing.RectangleF]::new(0, 300, $width, 80), $titleFormat)

# Subtitle
$subFont = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(181, 176, 169))
$g.DrawString('35 min. 9 choices. 3 endings.', $subFont, $subBrush, [System.Drawing.RectangleF]::new(0, 400, $width, 50), $titleFormat)

# Divider line
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(58, 53, 48), 2)
$g.DrawLine($pen, 480, 470, 720, 470)

# Footer
$footFont = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Regular)
$footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(122, 117, 111))
$g.DrawString('quest.folkup.app', $footFont, $footBrush, [System.Drawing.RectangleF]::new(0, 500, $width, 40), $titleFormat)

# Save
$outPath = Join-Path $PSScriptRoot '..\public\og-image.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "OG image saved to $outPath"
