#!/usr/bin/env python3
"""Fetch official U.S. immigration sources and build a marriage-green-card update feed.

The script intentionally publishes source metadata and short extracted summaries only.
It does not copy full articles and does not provide individualized legal advice.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "automation" / "sources.json"
DATA_DIR = ROOT / "data"
OUTPUT_PATH = DATA_DIR / "knowledge-updates.json"
JS_OUTPUT_PATH = DATA_DIR / "knowledge-updates.js"
STATE_PATH = DATA_DIR / "knowledge-state.json"
USER_AGENT = "HuarenHunlvKnowledgeBot/1.0 (+https://huarenhunlv.com/)"
MAX_ITEMS = 80


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self.links: list[dict[str, str]] = []
        self._in_title = False
        self._current_href: str | None = None
        self._current_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "title":
            self._in_title = True
        elif tag.lower() == "meta":
            name = attributes.get("name", "").lower()
            prop = attributes.get("property", "").lower()
            if name == "description" or prop == "og:description":
                value = clean_text(attributes.get("content", ""))
                if value and not self.description:
                    self.description = value
        elif tag.lower() == "a" and attributes.get("href"):
            self._current_href = attributes["href"]
            self._current_text = []

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False
        elif tag.lower() == "a" and self._current_href is not None:
            text = clean_text(" ".join(self._current_text))
            if text:
                self.links.append({"href": self._current_href, "text": text})
            self._current_href = None
            self._current_text = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._current_href is not None:
            self._current_text.append(data)


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def fetch(url: str) -> tuple[str, str]:
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urlopen(request, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "")
        charset = response.headers.get_content_charset() or "utf-8"
        body = response.read(2_500_000)
        return body.decode(charset, errors="replace"), content_type


def canonical_url(base_url: str, href: str) -> str | None:
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    resolved = urljoin(base_url, href)
    parsed = urlparse(resolved)
    if parsed.scheme not in {"http", "https"}:
        return None
    return parsed._replace(fragment="").geturl()


def relevance_score(text: str, keywords: list[str]) -> int:
    lowered = text.casefold()
    score = 0
    for keyword in keywords:
        needle = keyword.casefold()
        if needle in lowered:
            score += 4 if needle in {"i-130", "i-485", "i-751", "f2a", "cr1", "ir1"} else 1
    return score


def digest_item(item: dict[str, Any]) -> str:
    normalized = "|".join(
        str(item.get(key, "")) for key in ("source_id", "title", "url", "summary")
    )
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:20]


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def build_items(config: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    keywords = config.get("keywords", [])
    items: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    now = datetime.now(timezone.utc).isoformat()

    for source in config.get("sources", []):
        try:
            body, _ = fetch(source["url"])
            parser = PageParser()
            parser.feed(body)
            page_title = clean_text(parser.title) or source["name"]
            page_summary = clean_text(parser.description)

            page_score = relevance_score(f"{page_title} {page_summary}", keywords)
            items.append(
                {
                    "source_id": source["id"],
                    "source": source["authority"],
                    "source_name": source["name"],
                    "source_type": source["type"],
                    "title": page_title,
                    "url": source["url"],
                    "summary": page_summary[:420],
                    "relevance": max(page_score, 1),
                    "checked_at": now,
                    "official": True,
                }
            )

            base_host = urlparse(source["url"]).netloc
            seen_urls: set[str] = set()
            for link in parser.links:
                url = canonical_url(source["url"], link["href"])
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                if urlparse(url).netloc != base_host:
                    continue
                title = clean_text(link["text"])
                score = relevance_score(f"{title} {url}", keywords)
                if score < 1:
                    continue
                items.append(
                    {
                        "source_id": source["id"],
                        "source": source["authority"],
                        "source_name": source["name"],
                        "source_type": source["type"],
                        "title": title[:220],
                        "url": url,
                        "summary": "来自美国政府官方网站的相关更新或指引。请点击原文核对生效日期、版本和适用条件。",
                        "relevance": score,
                        "checked_at": now,
                        "official": True,
                    }
                )
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            errors.append({"source": source.get("name", source.get("id", "unknown")), "error": str(exc)})

    unique: dict[str, dict[str, Any]] = {}
    for item in items:
        key = item["url"].rstrip("/")
        current = unique.get(key)
        if current is None or item["relevance"] > current["relevance"]:
            item["id"] = digest_item(item)
            unique[key] = item

    ranked = sorted(
        unique.values(),
        key=lambda item: (item["relevance"], item["source_type"] == "news"),
        reverse=True,
    )[:MAX_ITEMS]
    return ranked, errors


def main() -> int:
    config = load_json(CONFIG_PATH, {})
    if not config.get("sources"):
        print("No sources configured", file=sys.stderr)
        return 2

    previous = load_json(OUTPUT_PATH, {"items": []})
    previous_ids = {item.get("id") for item in previous.get("items", [])}
    items, errors = build_items(config)
    new_count = sum(1 for item in items if item["id"] not in previous_ids)
    generated_at = datetime.now(timezone.utc).isoformat()

    payload = {
        "generated_at": generated_at,
        "new_count": new_count,
        "item_count": len(items),
        "source_count": len(config["sources"]),
        "errors": errors,
        "disclaimer": "仅供一般信息参考，不构成法律意见。移民政策、表格版本、费用和排期可能变化，请以美国政府官方网站及持牌律师意见为准。",
        "items": items,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT_PATH.write_text(
        "window.HUNLV_KNOWLEDGE_UPDATES = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    STATE_PATH.write_text(
        json.dumps(
            {"last_run": generated_at, "last_success_count": len(items), "errors": errors},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Generated {len(items)} items; {new_count} new; {len(errors)} source errors")
    return 0 if items else 1


if __name__ == "__main__":
    raise SystemExit(main())
