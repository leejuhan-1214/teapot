Add-Type -AssemblyName System.Drawing
$teapotDist = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../dist'))
foreach ($teapotSize in @(192, 512)) {
    $teapotBitmap = [System.Drawing.Bitmap]::new($teapotSize, $teapotSize)
    $teapotGraphics = [System.Drawing.Graphics]::FromImage($teapotBitmap)
    $teapotGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $teapotGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#102b2b'))
    $teapotGraphics.ScaleTransform($teapotSize / 512.0, $teapotSize / 512.0)
    $teapotBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#b6f6d7'))
    $teapotShape = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $teapotShape.AddLines([System.Drawing.PointF[]]@([System.Drawing.PointF]::new(218,125),[System.Drawing.PointF]::new(284,125),[System.Drawing.PointF]::new(284,190),[System.Drawing.PointF]::new(371,190),[System.Drawing.PointF]::new(371,250),[System.Drawing.PointF]::new(284,250),[System.Drawing.PointF]::new(284,335)))
    $teapotShape.AddBezier(284,335,284,365,300,377,329,377)
    $teapotShape.AddLines([System.Drawing.PointF[]]@([System.Drawing.PointF]::new(329,377),[System.Drawing.PointF]::new(371,377),[System.Drawing.PointF]::new(371,437),[System.Drawing.PointF]::new(322,437)))
    $teapotShape.AddBezier(322,437,250,437,218,405,218,340)
    $teapotShape.AddLines([System.Drawing.PointF[]]@([System.Drawing.PointF]::new(218,340),[System.Drawing.PointF]::new(218,250),[System.Drawing.PointF]::new(164,250),[System.Drawing.PointF]::new(164,190),[System.Drawing.PointF]::new(218,190),[System.Drawing.PointF]::new(218,125)))
    $teapotShape.CloseFigure()
    $teapotGraphics.FillPath($teapotBrush, $teapotShape)
    $teapotGraphics.FillEllipse($teapotBrush, 359, 123, 44, 44)
    $teapotBitmap.Save((Join-Path $teapotDist "icon-$teapotSize.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $teapotShape.Dispose()
    $teapotBrush.Dispose()
    $teapotGraphics.Dispose()
    $teapotBitmap.Dispose()
}
Write-Output 'Generated 192px and 512px install icons.'
