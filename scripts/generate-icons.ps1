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

    # Background gradient
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $c1 = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)    # slate-900
    $c2 = [System.Drawing.Color]::FromArgb(255, 15, 118, 110)  # teal-700
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $c1, $c2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillRectangle($brush, $rect)

    # Inset subtle border
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(50, 255, 255, 255), [float]($Size * 0.02))
    $inset = [int]($Size * 0.05)
    $g.DrawRectangle($pen, $inset, $inset, ($Size - 2 * $inset), ($Size - 2 * $inset))

    $scale = [float]$Size / 512.0

    # Draw House Roof
    $roofBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $pt1 = [System.Drawing.PointF]::new(256.0 * $scale, 130.0 * $scale)
    $pt2 = [System.Drawing.PointF]::new(390.0 * $scale, 250.0 * $scale)
    $pt3 = [System.Drawing.PointF]::new(366.0 * $scale, 276.0 * $scale)
    $pt4 = [System.Drawing.PointF]::new(256.0 * $scale, 180.0 * $scale)
    $pt5 = [System.Drawing.PointF]::new(146.0 * $scale, 276.0 * $scale)
    $pt6 = [System.Drawing.PointF]::new(122.0 * $scale, 250.0 * $scale)
    [System.Drawing.PointF[]]$roofPoints = @($pt1, $pt2, $pt3, $pt4, $pt5, $pt6)
    $g.FillPolygon($roofBrush, $roofPoints)

    # House Body
    $bodyBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(245, 241, 245, 249))
    $g.FillRectangle($bodyBrush, [int](156 * $scale), [int](260 * $scale), [int](200 * $scale), [int](150 * $scale))

    # Door
    $doorBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $g.FillRectangle($doorBrush, [int](226 * $scale), [int](320 * $scale), [int](60 * $scale), [int](90 * $scale))

    # Windows
    $winBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $g.FillRectangle($winBrush, [int](175 * $scale), [int](285 * $scale), [int](36 * $scale), [int](36 * $scale))
    $g.FillRectangle($winBrush, [int](300 * $scale), [int](285 * $scale), [int](36 * $scale), [int](36 * $scale))

    # Badge 88 circle
    $badgeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 13, 148, 136))
    $g.FillEllipse($badgeBrush, [int](330 * $scale), [int](340 * $scale), [int](76 * $scale), [int](76 * $scale))
    $badgePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 56, 189, 248), [float]($Size * 0.015))
    $g.DrawEllipse($badgePen, [int](330 * $scale), [int](340 * $scale), [int](76 * $scale), [int](76 * $scale))

    # Text 88
    $fontSize = [float]($Size * 0.065)
    $font88 = [System.Drawing.Font]::new("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $badgeRect = [System.Drawing.RectangleF]::new(330.0 * $scale, 340.0 * $scale, 76.0 * $scale, 76.0 * $scale)
    $g.DrawString("88", $font88, $textBrush, $badgeRect, $format)

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
