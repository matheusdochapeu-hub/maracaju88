Add-Type -AssemblyName System.Drawing

function Generate-AppIcon {
    param(
        [int]$Size,
        [string]$Path
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background gradient - Verde Musgo
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $c1 = [System.Drawing.Color]::FromArgb(255, 27, 56, 32)   # moss-900 (#1b3820)
    $c2 = [System.Drawing.Color]::FromArgb(255, 46, 89, 51)   # moss-700 (#2e5933)
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $c1, $c2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillRectangle($brush, $rect)

    # Inset subtle border
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(50, 255, 255, 255), [float]($Size * 0.02))
    $inset = [int]($Size * 0.05)
    $g.DrawRectangle($pen, $inset, $inset, ($Size - 2 * $inset), ($Size - 2 * $inset))

    $scale = [float]$Size / 512.0

    # Draw House Roof
    $roofBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 80, 140, 86))
    $pt1 = [System.Drawing.PointF]::new(256.0 * $scale, 130.0 * $scale)
    $pt2 = [System.Drawing.PointF]::new(390.0 * $scale, 250.0 * $scale)
    $pt3 = [System.Drawing.PointF]::new(366.0 * $scale, 276.0 * $scale)
    $pt4 = [System.Drawing.PointF]::new(256.0 * $scale, 180.0 * $scale)
    $pt5 = [System.Drawing.PointF]::new(146.0 * $scale, 276.0 * $scale)
    $pt6 = [System.Drawing.PointF]::new(122.0 * $scale, 250.0 * $scale)
    [System.Drawing.PointF[]]$roofPoints = @($pt1, $pt2, $pt3, $pt4, $pt5, $pt6)
    $g.FillPolygon($roofBrush, $roofPoints)

    # Chimney
    $chimneyBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 46, 89, 51))
    $g.FillRectangle($chimneyBrush, [int](325 * $scale), [int](155 * $scale), [int](34 * $scale), [int](55 * $scale))

    # House Body
    $bodyBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.FillRectangle($bodyBrush, [int](156 * $scale), [int](260 * $scale), [int](200 * $scale), [int](150 * $scale))

    # Door
    $doorBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 25, 51, 29))
    $g.FillRectangle($doorBrush, [int](226 * $scale), [int](320 * $scale), [int](60 * $scale), [int](90 * $scale))

    # Windows
    $winBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 61, 120, 90))
    $g.FillRectangle($winBrush, [int](175 * $scale), [int](285 * $scale), [int](36 * $scale), [int](36 * $scale))
    $g.FillRectangle($winBrush, [int](300 * $scale), [int](285 * $scale), [int](36 * $scale), [int](36 * $scale))

    # Heart above Door (Couple)
    $heartBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 194, 87, 70))
    $g.FillEllipse($heartBrush, [int](240 * $scale), [int](295 * $scale), [int](16 * $scale), [int](16 * $scale))
    $g.FillEllipse($heartBrush, [int](256 * $scale), [int](295 * $scale), [int](16 * $scale), [int](16 * $scale))

    # Save PNG
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $Path"
}

$baseDir = Split-Path -Parent $PSScriptRoot
Generate-AppIcon -Size 512 -Path "$baseDir\icons\icon-512.png"
Generate-AppIcon -Size 192 -Path "$baseDir\icons\icon-192.png"
Generate-AppIcon -Size 180 -Path "$baseDir\icons\apple-touch-icon.png"
Generate-AppIcon -Size 64  -Path "$baseDir\icons\favicon.png"
Copy-Item "$baseDir\icons\favicon.png" "$baseDir\favicon.ico" -Force
