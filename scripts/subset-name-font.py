"""카드·무구·유물·전장 이름에만 쓰는 함렛 600을 이름에 쓰인 글자만 남겨 만듭니다.

원본: 함렛(Hahmlet, SIL OFL 1.1) 가변 글꼴을 굵기 600으로 고정한 뒤 줄입니다. 원본과 헷갈리지 않게
줄인 파일의 이름은 ZeroNames로 바꿉니다. 글자 목록은 name-font.test.js가 만듭니다.

    pip install fonttools brotli
    pnpm subset:name-font
"""

import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = "https://github.com/google/fonts/raw/main/ofl/hahmlet/Hahmlet%5Bwght%5D.ttf"
FONTS = Path(__file__).resolve().parent.parent / "src" / "app" / "styles" / "fonts"
FAMILY = "ZeroNames"


def main() -> None:
    text = (FONTS / "zero-names.chars.txt").read_text(encoding="utf-8").strip()
    with urllib.request.urlopen(SOURCE) as response:
        font = TTFont(io.BytesIO(response.read()))
    font = instancer.instantiateVariableFont(font, {"wght": 600})
    options = subset.Options()
    options.flavor = "woff2"
    options.name_IDs = ["*"]
    options.layout_features = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    for record in font["name"].names:
        if record.nameID in (1, 4, 16, 21):
            record.string = FAMILY
        elif record.nameID == 6:
            record.string = f"{FAMILY}-SemiBold"
        elif record.nameID == 3:
            record.string = f"{FAMILY} subset"
    font.flavor = "woff2"
    target = FONTS / "zero-names.woff2"
    font.save(target)
    print(f"{target.name}: {len(text)}자, {target.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
