"""카드·무구·유물·전장 이름에만 쓰는 나눔명조 ExtraBold(800)를 이름에 쓰인 글자만 남겨 만듭니다.

원본: 나눔명조(Nanum Myeongjo, SIL OFL 1.1). OFL의 예약 이름(Nanum, NanumMyeongjo) 때문에
줄인 파일은 이름을 ZeroNames로 바꿉니다. 글자 목록은 name-font.test.js가 만듭니다.

    pip install fonttools brotli
    pnpm subset:name-font
"""

import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

SOURCE = "https://github.com/google/fonts/raw/main/ofl/nanummyeongjo/NanumMyeongjo-ExtraBold.ttf"
FONTS = Path(__file__).resolve().parent.parent / "src" / "app" / "styles" / "fonts"
FAMILY = "ZeroNames"


def main() -> None:
    text = (FONTS / "zero-names.chars.txt").read_text(encoding="utf-8").strip()
    with urllib.request.urlopen(SOURCE) as response:
        font = TTFont(io.BytesIO(response.read()))
    options = subset.Options()
    options.flavor = "woff2"
    options.name_IDs = ["*"]
    # 원본 TTF의 힌팅은 화면 글꼴 크기에서 거의 차이가 없고 파일만 키우므로 뺍니다(Google Fonts 배포본과 같음).
    options.hinting = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    for record in font["name"].names:
        if record.nameID in (1, 4, 16, 21):
            record.string = FAMILY
        elif record.nameID == 6:
            record.string = f"{FAMILY}-ExtraBold"
        elif record.nameID == 3:
            record.string = f"{FAMILY} subset"
    font.flavor = "woff2"
    target = FONTS / "zero-names.woff2"
    font.save(target)
    print(f"{target.name}: {len(text)}자, {target.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
