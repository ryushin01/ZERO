// 그림에서 눈길이 모이는 곳(초점)을 macOS Vision으로 찾아 "경로<TAB>x% y%"로 한 줄씩 씁니다.
// 얼굴이 있으면 가장 큰 얼굴을, 없으면 가장 두드러진 영역을 초점으로 삼습니다.
// 카드처럼 잘라 보여 줄 때 CSS object-position으로 씁니다. (pnpm illustrations가 부릅니다)
//
//   swift scripts/illustrations/focus.swift 그림1.webp 그림2.webp ...
import Foundation
import Vision

/// Vision의 정규화 좌표(왼쪽 아래가 원점)를 CSS 퍼센트(왼쪽 위가 원점)로 바꿉니다.
func cssPosition(_ point: CGPoint) -> String {
  let x = Int((min(max(point.x, 0), 1) * 100).rounded())
  let y = Int(((1 - min(max(point.y, 0), 1)) * 100).rounded())
  return "\(x)% \(y)%"
}

func area(_ box: CGRect) -> CGFloat { box.width * box.height }

for path in CommandLine.arguments.dropFirst() {
  let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])
  let faces = VNDetectFaceRectanglesRequest()
  let attention = VNGenerateAttentionBasedSaliencyImageRequest()
  do {
    try handler.perform([faces, attention])
  } catch {
    // 읽지 못한 그림은 건너뜁니다. (기본 초점을 씀)
    continue
  }
  // 아주 작은 얼굴(배경 인물)은 빼고, 가장 큰 얼굴의 가운데를 봅니다.
  let face = (faces.results ?? [])
    .filter { area($0.boundingBox) >= 0.002 }
    .max { area($0.boundingBox) < area($1.boundingBox) }
  if let face {
    print("\(path)\t\(cssPosition(CGPoint(x: face.boundingBox.midX, y: face.boundingBox.midY)))")
    continue
  }
  let salient = (attention.results?.first?.salientObjects ?? [])
    .max { $0.confidence * Float(area($0.boundingBox)) < $1.confidence * Float(area($1.boundingBox)) }
  if let salient {
    // 영역의 위쪽 1/3 쯤(사람이라면 머리)에 맞춥니다.
    let box = salient.boundingBox
    print("\(path)\t\(cssPosition(CGPoint(x: box.midX, y: box.maxY - box.height / 3)))")
  }
}
