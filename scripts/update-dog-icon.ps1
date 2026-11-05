Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\matheus.ribeiro\.gemini\antigravity\brain\fdd387de-2159-4522-99af-0ae8c18b6d22\maracaju88_dog_avatar_icon_1793886254628.jpg'
$baseDir = 'C:\Users\matheus.ribeiro\Desktop\Matheus\5. IA\maracaju88'

function Resize-Image($src, $dst, $w, $h) {
    $srcImg = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
    Write-Host "Generated: $dst ($w x $h)"
}

Resize-Image $sourcePath "$baseDir\icons\icon-512.png" 512 512
Resize-Image $sourcePath "$baseDir\icons\icon-192.png" 192 192
Resize-Image $sourcePath "$baseDir\icons\apple-touch-icon.png" 180 180
Resize-Image $sourcePath "$baseDir\icons\favicon.png" 64 64
Copy-Item "$baseDir\icons\favicon.png" "$baseDir\favicon.ico" -Force
Write-Host "All icons updated successfully with the new dog logo!"
