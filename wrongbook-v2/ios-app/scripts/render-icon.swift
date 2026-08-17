import AppKit
import Foundation

let outputPath = CommandLine.arguments.count > 1
  ? CommandLine.arguments[1]
  : "assets/app-icon-1024.png"
let outputURL = URL(fileURLWithPath: outputPath)
try FileManager.default.createDirectory(
  at: outputURL.deletingLastPathComponent(),
  withIntermediateDirectories: true
)

guard let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: 1024,
  pixelsHigh: 1024,
  bitsPerSample: 8,
  samplesPerPixel: 3,
  hasAlpha: false,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
  fputs("Unable to create opaque RGB icon bitmap.\n", stderr)
  exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context

NSColor(
  calibratedRed: 104.0 / 255.0,
  green: 87.0 / 255.0,
  blue: 245.0 / 255.0,
  alpha: 1.0
).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: 1024, height: 1024)).fill()

NSColor.white.setStroke()
let book = NSBezierPath(
  roundedRect: NSRect(x: 208, y: 180, width: 608, height: 664),
  xRadius: 108,
  yRadius: 108
)
book.lineWidth = 56
book.stroke()

let check = NSBezierPath()
check.move(to: NSPoint(x: 346, y: 508))
check.line(to: NSPoint(x: 468, y: 384))
check.line(to: NSPoint(x: 706, y: 662))
check.lineWidth = 68
check.lineCapStyle = .round
check.lineJoinStyle = .round
check.stroke()

context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
  fputs("Unable to encode PNG app icon.\n", stderr)
  exit(1)
}
try png.write(to: outputURL)
print("Rendered opaque RGB 1024x1024 App Store icon: \(outputPath)")
