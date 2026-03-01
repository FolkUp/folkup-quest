Add-Type -AssemblyName System.Drawing
$size = 180
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 23, 20))
$g.FillRectangle($bgBrush, 0, 0, $size, $size)

# Lamp glow
$glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 232, 173, 74))
$g.FillEllipse($glowBrush, 45, 30, 90, 90)

# Lamp body
$lampBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 173, 74))
$g.FillEllipse($lampBrush, 60, 45, 60, 60)

# Lamp stem
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 232, 173, 74), 6)
$pen.StartCap = 'Round'
$pen.EndCap = 'Round'
$g.DrawLine($pen, 90, 120, 90, 150)

# Save
$outPath = Join-Path $PSScriptRoot '..\public\apple-touch-icon.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Apple touch icon saved to $outPath"
