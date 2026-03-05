Add-Type -AssemblyName System.Drawing
$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'

# Background: solid #1a1714
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 23, 20))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)

# Radial glow — soft amber center highlight
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(200, -50, 800, 500)
$glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(30, 232, 173, 74)
$glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 232, 173, 74))
$g.FillEllipse($glowBrush, 200, -50, 800, 500)

# Logo: load c1r_v4 from _variants/ (source path, not public/)
$logoPath = Join-Path $PSScriptRoot '..\_variants\logo\icons\android-chrome-512x512.png'
$logo = [System.Drawing.Image]::FromFile($logoPath)
$logoSize = 280
$logoX = [int](($width - $logoSize) / 2)
$logoY = 40
$g.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)
$logo.Dispose()

# Wordmark: "FolkUp Quest" — Georgia Bold, amber
$titleFont = New-Object System.Drawing.Font('Georgia', 48, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 173, 74))
$titleFormat = New-Object System.Drawing.StringFormat
$titleFormat.Alignment = 'Center'
$g.DrawString('FolkUp Quest', $titleFont, $titleBrush, [System.Drawing.RectangleF]::new(0, 340, $width, 70), $titleFormat)

# Tagline: "35 минут . 9 выборов . 3 концовки" — Segoe UI, amber 70% opacity
$tagFont = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Regular)
$tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(178, 232, 173, 74))
$tagline = "35 " + [char]0x043C + [char]0x0438 + [char]0x043D + [char]0x0443 + [char]0x0442 + " " + [char]0x00B7 + " 9 " + [char]0x0432 + [char]0x044B + [char]0x0431 + [char]0x043E + [char]0x0440 + [char]0x043E + [char]0x0432 + " " + [char]0x00B7 + " 3 " + [char]0x043A + [char]0x043E + [char]0x043D + [char]0x0446 + [char]0x043E + [char]0x0432 + [char]0x043A + [char]0x0438
$g.DrawString($tagline, $tagFont, $tagBrush, [System.Drawing.RectangleF]::new(0, 420, $width, 50), $titleFormat)

# Divider line
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(58, 53, 48), 2)
$g.DrawLine($pen, 440, 490, 760, 490)

# Footer URL: "quest.folkup.app" — Segoe UI 16pt, muted
$footFont = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Regular)
$footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(122, 117, 111))
$g.DrawString('quest.folkup.app', $footFont, $footBrush, [System.Drawing.RectangleF]::new(0, 520, $width, 40), $titleFormat)

# Save
$outPath = Join-Path $PSScriptRoot '..\public\og-image.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$titleFont.Dispose()
$tagFont.Dispose()
$footFont.Dispose()
$titleFormat.Dispose()
Write-Output "OG image saved to $outPath"
