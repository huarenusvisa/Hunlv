#!/usr/bin/env python3
"""Build the Huaren Hunlv daily marriage-green-card knowledge feed.

The program has two layers:
1. Check official U.S. government sources for current links and changes.
2. Publish one dated, evergreen Chinese knowledge card every day, even when no
   government page has changed.

Only short summaries and official links are published. This is general
information and not individualized legal advice.
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
DAILY_PATH = DATA_DIR / "daily-knowledge.json"
USER_AGENT = "HuarenHunlvKnowledgeBot/2.0 (+https://huarenhunlv.com/)"
MAX_ITEMS = 80
MAX_DAILY_HISTORY = 365

DAILY_TOPICS = [
    {
        "slug": "citizen-spouse-paths",
        "title": "美国公民申请配偶：境内调整身份与境外领事程序怎么选",
        "category": "申请路径",
        "summary": "申请人在美国境内且符合条件时，通常考虑I-130与I-485路径；申请人在美国境外时，一般经过USCIS、NVC和领事馆。是否能够境内调整身份，还要结合入境方式、身份记录及其他个案因素判断。",
        "key_points": ["先确认担保人身份", "确认申请人在美国境内还是境外", "不要仅凭结婚地点判断申请路径"],
        "official_url": "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-immediate-relatives-of-us-citizen",
    },
    {
        "slug": "i130-i130a",
        "title": "I-130与I-130A分别是谁填写",
        "category": "表格说明",
        "summary": "I-130由提出申请的美国公民或绿卡持有人提交；配偶案件通常还要准备I-130A，主要填写受益配偶的个人、住址、工作和家庭信息。提交前应核对版本日期、签名和所有必填项目。",
        "key_points": ["I-130是亲属关系申请", "I-130A主要记录受益配偶信息", "表格版本和签名不可遗漏"],
        "official_url": "https://www.uscis.gov/i-130",
    },
    {
        "slug": "i485-basics",
        "title": "I-485不是所有婚姻绿卡申请人都能立即提交",
        "category": "境内申请",
        "summary": "I-485用于符合条件的人在美国境内申请调整身份。美国公民的直系亲属通常不受年度配额排期限制，但是否可以提交仍取决于入境、管辖、资格和其他法律因素；绿卡持有人配偶还要关注F2A排期和USCIS当月指定使用的表格。",
        "key_points": ["先判断是否具备调整身份资格", "绿卡配偶要核对F2A排期", "递交后仍需持续维护地址和通知"],
        "official_url": "https://www.uscis.gov/i-485",
    },
    {
        "slug": "bona-fide-marriage",
        "title": "婚姻真实性证据应该怎样组织",
        "category": "证据准备",
        "summary": "婚姻绿卡审查重点不是婚礼规模，而是双方是否真实建立共同生活。常见证据包括共同住所、共同财务、保险、税务、通信记录、旅行、家庭照片和亲友陈述。材料应按时间线和主题整理，避免只提交大量重复照片。",
        "key_points": ["用时间线展示关系发展", "共同生活证据比摆拍照片更重要", "解释无法提供常见证据的真实原因"],
        "official_url": "https://www.uscis.gov/i-130",
    },
    {
        "slug": "i864-support",
        "title": "I-864经济担保的核心是什么",
        "category": "经济担保",
        "summary": "I-864通常由担保人签署，用于证明申请人获得永久居民身份后具备合格经济担保。收入不足时，可能需要结合资产、合格家庭成员或联合担保人，但具体计算应按当年贫困线、家庭人数和表格说明核对。",
        "key_points": ["家庭人数计算必须准确", "使用最新报税和收入材料", "联合担保人也要独立符合条件"],
        "official_url": "https://www.uscis.gov/i-864",
    },
    {
        "slug": "medical-i693",
        "title": "I-693移民体检应在什么时候准备",
        "category": "体检材料",
        "summary": "I-693必须由USCIS认可的民事外科医生完成。申请人应查看USCIS最新递交规则和有效期政策，确认是否与I-485一起提交或在补件、面谈阶段提交，并保持密封文件完整。",
        "key_points": ["只能找认可的民事外科医生", "不要自行拆开密封件", "接种和有效期规则可能更新"],
        "official_url": "https://www.uscis.gov/i-693",
    },
    {
        "slug": "conditional-residence",
        "title": "为什么有的人拿两年条件绿卡，有的人拿十年绿卡",
        "category": "获批结果",
        "summary": "判断重点通常是申请人取得永久居民身份当天，婚姻是否已满两年。未满两年一般取得两年条件永久居民身份；达到两年通常取得十年永久居民卡。关键日期是获批或以移民签证入境成为永久居民之日，不是递交申请之日。",
        "key_points": ["看成为永久居民当天的婚龄", "两年卡到期前通常要处理I-751", "不要等卡过期后才准备"],
        "official_url": "https://www.uscis.gov/i-751",
    },
    {
        "slug": "i751-window",
        "title": "I-751什么时候递交，为什么不能拖到最后一天",
        "category": "条件绿卡",
        "summary": "共同申请解除条件时，通常应在两年条件绿卡到期前90天窗口内递交I-751。离婚、虐待、极端困难等豁免情形有不同规则。申请人应提前准备持续共同生活证据，并核对最新表格、费用和邮寄地址。",
        "key_points": ["先确认到期日和递交窗口", "持续保留两年内共同生活证据", "特殊情形不要套用普通共同申请规则"],
        "official_url": "https://www.uscis.gov/i-751",
    },
    {
        "slug": "nvc-stage",
        "title": "案件进入NVC以后要做什么",
        "category": "境外流程",
        "summary": "境外配偶案件的I-130获批后，通常进入国家签证中心阶段。申请人需要按通知处理费用、DS-260、民事文件和经济担保材料。文件合格不等于立即面谈，仍需等待领事馆排期及个案安排。",
        "key_points": ["保存NVC案件号和发票号", "文件应符合签证互惠表要求", "及时更新邮箱和联系信息"],
        "official_url": "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html",
    },
    {
        "slug": "f2a-visa-bulletin",
        "title": "绿卡持有人申请配偶为什么必须关注F2A排期",
        "category": "排期",
        "summary": "绿卡持有人配偶属于家庭第二优先A类。能否推进到最终批准或在美国境内递交I-485，可能取决于国务院签证公告和USCIS当月指定使用的日期表。表A、表B用途不同，不能只看一个日期。",
        "key_points": ["确认优先日期", "同时看国务院公告和USCIS指定表", "排期前进或倒退都可能发生"],
        "official_url": "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
    },
    {
        "slug": "interview-prep",
        "title": "婚姻绿卡面谈前应该怎样复核材料",
        "category": "面谈准备",
        "summary": "面谈前应把已递交表格与最新事实逐项对照，准备身份证明、关系原件、共同生活更新证据及通知要求的材料。双方应如实回答，不要背诵统一答案；发现旧表格存在错误时，应提前准备清楚、可信的说明。",
        "key_points": ["复印并熟悉已递交材料", "带上通知要求的原件", "事实变化要如实更新"],
        "official_url": "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
    },
    {
        "slug": "address-change",
        "title": "搬家后为什么必须及时更新移民地址",
        "category": "案件管理",
        "summary": "案件处理中搬家，如果只向邮局转寄邮件，通常不足以完成移民机关的地址更新。申请人应按照USCIS或国务院对应流程及时变更地址，并分别检查每个待审案件，避免错过指纹、补件或面谈通知。",
        "key_points": ["邮局转寄不等于移民地址更新", "核对所有收据号", "保留地址变更确认记录"],
        "official_url": "https://www.uscis.gov/addresschange",
    },
    {
        "slug": "forms-edition-fees",
        "title": "递交前必须再次核对表格版本、费用与地址",
        "category": "递交检查",
        "summary": "USCIS可能调整表格版本、费用、付款方式和锁箱地址。即使材料已准备数周，也应在寄出当天重新打开官方表格页面核对Edition Date、费用和Direct Filing Addresses，避免因使用旧版本或错误地址被退件。",
        "key_points": ["寄出当天再检查一次", "不要照搬旧案件的邮寄地址", "保留完整寄件和付款记录"],
        "official_url": "https://www.uscis.gov/forms/filing-guidance/tips-for-filing-forms-by-mail",
    },
    {
        "slug": "translation-rule",
        "title": "中文材料翻译怎样才符合基本递交要求",
        "category": "材料翻译",
        "summary": "提交给美国移民机关的外文文件通常应附完整英文翻译和译者证明，说明译文完整准确且译者具备翻译能力。只翻译重点、遗漏印章或不一致的人名日期，都可能造成审查困难。",
        "key_points": ["原文和完整译文一起提交", "统一姓名、日期和地址格式", "译者证明应包含必要声明"],
        "official_url": "https://www.uscis.gov/forms/filing-guidance/tips-for-filing-forms-by-mail",
    },
]


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
    return re.sub(r"\s+", " ", value).strip()


def fetch(url: str) -> tuple[str, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9"})
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
    normalized = "|".join(str(item.get(key, "")) for key in ("source_id", "title", "url", "summary"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:20]


def load_json(path: Path, default: Any) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def build_daily_card(now: datetime) -> dict[str, Any]:
    date_key = now.date().isoformat()
    topic = DAILY_TOPICS[now.date().toordinal() % len(DAILY_TOPICS)]
    return {
        "id": f"daily-{date_key}-{topic['slug']}",
        "date": date_key,
        "title": topic["title"],
        "category": topic["category"],
        "summary": topic["summary"],
        "key_points": topic["key_points"],
        "official_url": topic["official_url"],
        "official": True,
        "site": "华人婚姻绿卡网",
        "disclaimer": "一般知识说明，不构成针对个人案件的法律意见。",
    }


def update_daily_history(card: dict[str, Any]) -> list[dict[str, Any]]:
    existing = load_json(DAILY_PATH, {"items": []}).get("items", [])
    by_date = {item.get("date"): item for item in existing if item.get("date")}
    by_date[card["date"]] = card
    history = sorted(by_date.values(), key=lambda item: item["date"], reverse=True)[:MAX_DAILY_HISTORY]
    DAILY_PATH.write_text(json.dumps({"generated_at": datetime.now(timezone.utc).isoformat(), "items": history}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return history


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
            items.append({"source_id": source["id"], "source": source["authority"], "source_name": source["name"], "source_type": source["type"], "title": page_title, "url": source["url"], "summary": page_summary[:420], "relevance": max(page_score, 1), "checked_at": now, "official": True})

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
                items.append({"source_id": source["id"], "source": source["authority"], "source_name": source["name"], "source_type": source["type"], "title": title[:220], "url": url, "summary": "来自美国政府官方网站的相关更新或指引。请点击原文核对生效日期、版本和适用条件。", "relevance": score, "checked_at": now, "official": True})
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            errors.append({"source": source.get("name", source.get("id", "unknown")), "error": str(exc)})

    unique: dict[str, dict[str, Any]] = {}
    for item in items:
        key = item["url"].rstrip("/")
        current = unique.get(key)
        if current is None or item["relevance"] > current["relevance"]:
            item["id"] = digest_item(item)
            unique[key] = item

    ranked = sorted(unique.values(), key=lambda item: (item["relevance"], item["source_type"] == "news"), reverse=True)[:MAX_ITEMS]
    return ranked, errors


def main() -> int:
    config = load_json(CONFIG_PATH, {})
    if not config.get("sources"):
        print("No sources configured", file=sys.stderr)
        return 2

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)
    daily_card = build_daily_card(now)
    daily_history = update_daily_history(daily_card)

    previous = load_json(OUTPUT_PATH, {"items": []})
    previous_ids = {item.get("id") for item in previous.get("items", [])}
    items, errors = build_items(config)
    new_count = sum(1 for item in items if item["id"] not in previous_ids)
    generated_at = now.isoformat()

    payload = {
        "site": "华人婚姻绿卡网",
        "scope": "仅限美国婚姻绿卡知识、流程、表格、排期和官方政策更新",
        "generated_at": generated_at,
        "daily_feature": daily_card,
        "daily_history_count": len(daily_history),
        "new_count": new_count,
        "item_count": len(items),
        "source_count": len(config["sources"]),
        "errors": errors,
        "disclaimer": "仅供一般信息参考，不构成法律意见。移民政策、表格版本、费用和排期可能变化，请以美国政府官方网站及持牌律师意见为准。",
        "items": items,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT_PATH.write_text("window.HUNLV_KNOWLEDGE_UPDATES = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    STATE_PATH.write_text(json.dumps({"site": "华人婚姻绿卡网", "last_run": generated_at, "daily_feature_id": daily_card["id"], "last_success_count": len(items), "errors": errors}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated daily card {daily_card['id']}; {len(items)} official items; {new_count} new; {len(errors)} source errors")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
