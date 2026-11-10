"""
ZERO 전설 확장 데이터를 만듭니다.

    python3 scripts/legends/build.py

- data.py의 영어 위키백과 제목이 실제로 있는지 위키백과 API로 확인하고,
  한국어 문서가 있으면 그 주소를, 없으면 영어 문서 주소를 wiki로 씁니다.
- 기존 계열에 더하는 인물은 그 계열의 Ark 인물 뒤 순서로 붙입니다.
- 결과: src/entities/figure/data/legends.json
"""
import json
import pathlib
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import data  # noqa: E402

UA = {"User-Agent": "ZERO-legends-build/1.0 (https://github.com/ryushin01/ZERO)"}


def wiki_links(titles):
    """영어 제목 → (정규화된 제목, 한국어 제목 또는 None). 없는 문서는 결과에 없습니다."""
    out = {}
    for i in range(0, len(titles), 40):
        batch = titles[i : i + 40]
        q = urllib.parse.urlencode({
            "action": "query", "format": "json", "redirects": 1, "prop": "langlinks",
            "lllang": "ko", "lllimit": "max", "titles": "|".join(batch),
        })
        req = urllib.request.Request(f"https://en.wikipedia.org/w/api.php?{q}", headers=UA)
        res = json.load(urllib.request.urlopen(req, timeout=30))
        q_ = res["query"]
        mapping = {t: t for t in batch}
        for n in q_.get("normalized", []):
            mapping = {k: (n["to"] if v == n["from"] else v) for k, v in mapping.items()}
        for r in q_.get("redirects", []):
            mapping = {k: (r["to"] if v == r["from"] else v) for k, v in mapping.items()}
        pages = {p["title"]: p for p in q_["pages"].values()}
        for orig, final in mapping.items():
            page = pages.get(final)
            if not page or "missing" in page:
                continue
            ko = next((l["*"] for l in page.get("langlinks", []) if l["lang"] == "ko"), None)
            out[orig] = (final, ko)
    return out


def ko_exists(title):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "redirects": 1, "titles": title})
    req = urllib.request.Request(f"https://ko.wikipedia.org/w/api.php?{q}", headers=UA)
    pages = json.load(urllib.request.urlopen(req, timeout=30))["query"]["pages"].values()
    return all("missing" not in p for p in pages)


def url(lang, title):
    return f"https://{lang}.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"


def main():
    ark = json.loads((ROOT / "src/entities/figure/data/figures.json").read_text())
    next_order = {}
    for f in ark:
        next_order[f["pantheonSlug"]] = max(next_order.get(f["pantheonSlug"], 0), f["order"])

    titles = [t for t in [f[9] for f in data.FIGURES] + [p["en"] for p in data.PANTHEONS] if not t.startswith("ko:")]
    links = wiki_links(titles)
    ko_titles = [t[3:] for t in [f[9] for f in data.FIGURES] if t.startswith("ko:")]
    ko_missing = [t for t in ko_titles if not ko_exists(t)]
    if ko_missing:
        print("한국어 위키백과에 없는 제목:", ko_missing)
        sys.exit(1)
    missing = [t for t in titles if t not in links]
    if missing:
        print("위키백과에 없는 제목:", missing)
        sys.exit(1)

    def wiki(title):
        if title.startswith("ko:"):
            return url("ko", title[3:])
        final, ko = links[title]
        return url("ko", ko) if ko else url("en", final)

    pantheons = []
    for p in data.PANTHEONS:
        item = {k: v for k, v in p.items() if k != "en"}
        item["wiki"] = wiki(p["en"])
        pantheons.append(item)

    figures = []
    for slug, pantheon, name, name_en, epithet, domains, summary, description, rarity, en in data.FIGURES:
        next_order[pantheon] = next_order.get(pantheon, 0) + 1
        figures.append({
            "slug": slug, "pantheonSlug": pantheon, "name": name, "nameEn": name_en, "epithet": epithet,
            "domains": domains, "summary": summary, "description": description, "order": next_order[pantheon],
            "rarity": rarity, "wiki": wiki(en),
        })

    out = ROOT / "src/entities/figure/data/legends.json"
    out.write_text(json.dumps({"pantheons": pantheons, "figures": figures}, ensure_ascii=False, indent=2) + "\n")
    ko = sum(1 for f in figures if "ko.wikipedia" in f["wiki"])
    print(f"계열 {len(pantheons)}, 인물 {len(figures)} (한국어 위키 {ko}, 영어 위키 {len(figures) - ko})")


if __name__ == "__main__":
    main()
