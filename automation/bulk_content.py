#!/usr/bin/env python3
"""Publish 30 controlled content cards per public content category every day.

The cards are generated from the reviewed marriage-green-card topic catalog in
``update_knowledge.py``.  They are published directly without a human approval
step.  The "成功案例" cards are clearly labelled as teaching examples rather
than real client outcomes.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from update_knowledge import (
    DAILY_PATH,
    DAILY_TOPICS,
    JS_OUTPUT_PATH,
    OUTPUT_PATH,
    STATE_PATH,
    load_json,
)

CATEGORIES = ["婚绿知识", "材料清单", "模拟提交", "成功案例", "常见问题"]
CATEGORY_SLUGS = {
    "婚绿知识": "knowledge",
    "材料清单": "materials",
    "模拟提交": "simulation",
    "成功案例": "cases",
    "常见问题": "faq",
}
FOCUSES = [
    {"slug": "eligibility", "label": "资格与适用条件"},
    {"slug": "evidence", "label": "材料一致性与证据"},
    {"slug": "timing", "label": "时间节点与常见错误"},
]
CARDS_PER_CATEGORY = 30
HISTORY_DAYS = 7
MAX_HISTORY = len(CATEGORIES) * CARDS_PER_CATEGORY * HISTORY_DAYS
DISCLAIMER = "一般信息和教学内容，不构成针对个人案件的法律意见。请以美国政府最新规则及持牌律师意见为准。"


def make_card(now: datetime, category: str, index: int) -> dict[str, Any]:
    topic = DAILY_TOPICS[index % len(DAILY_TOPICS)]
    repeated_cycle = index // len(DAILY_TOPICS)
    focus = FOCUSES[(now.date().toordinal() + repeated_cycle) % len(FOCUSES)]
    title = topic["title"]
    points = list(topic["key_points"])

    if category == "婚绿知识":
        card_title = f"{title}｜{focus['label']}"
        summary = f"{topic['summary']} 本条从“{focus['label']}”角度说明需要先核对的规则、事实和下一步。"
    elif category == "材料清单":
        card_title = f"{title}：材料清单（{focus['label']}）"
        summary = f"围绕“{title}”，建议把材料分为身份与资格文件、表格与签名、关系或事实证据三组，并在递交前按照“{focus['label']}”逐项复核。"
        points = [f"材料项：{item}" for item in points]
    elif category == "模拟提交":
        card_title = f"{title}：模拟提交检查（{focus['label']}）"
        summary = f"模拟提交时，先确认适用路径，再依次完成信息填写、证据上传和最终复核。本轮重点检查“{focus['label']}”，发现前后不一致时先修正再提交。"
        points = [f"模拟检查：{item}" for item in points]
    elif category == "成功案例":
        card_title = f"教学成功案例：{title}（{focus['label']}）"
        summary = f"教学示例，非真实个案：申请人围绕“{title}”先核对适用规则，再按时间线整理材料，并针对“{focus['label']}”补足说明，使案件能够继续推进。实际结果取决于每个案件的事实和证据。"
        points = [f"示例做法：{item}" for item in points]
    else:
        card_title = f"常见问题：{title}在“{focus['label']}”上要注意什么？"
        summary = f"{topic['summary']} 实际准备时，应把“{focus['label']}”与本人真实情况逐项对照，不能只照搬其他案件的答案或材料。"
        points = [f"回答重点：{item}" for item in points]

    date_key = now.date().isoformat()
    sequence = index + 1
    return {
        "id": f"auto-{date_key}-{CATEGORY_SLUGS[category]}-{sequence:02d}-{topic['slug']}-{focus['slug']}",
        "date": date_key,
        "published_at": now.isoformat(),
        "category": category,
        "category_order": CATEGORIES.index(category),
        "sub_category": topic["category"],
        "sequence": sequence,
        "title": card_title,
        "summary": summary,
        "key_points": points,
        "official_url": topic["official_url"],
        "official_source": True,
        "official": False,
        "example_only": category == "成功案例",
        "auto_published": True,
        "review_required": False,
        "site": "华人婚姻绿卡网",
        "disclaimer": DISCLAIMER,
    }


def build_cards(now: datetime) -> list[dict[str, Any]]:
    return [
        make_card(now, category, index)
        for category in CATEGORIES
        for index in range(CARDS_PER_CATEGORY)
    ]


def update_history(now: datetime, cards: list[dict[str, Any]]) -> list[dict[str, Any]]:
    existing = load_json(DAILY_PATH, {"items": []}).get("items", [])
    by_id = {item.get("id"): item for item in existing if item.get("id")}
    for card in cards:
        by_id[card["id"]] = card

    history = sorted(
        by_id.values(),
        key=lambda item: (
            item.get("date", ""),
            -int(item.get("category_order", 99)),
            -int(item.get("sequence", 999)),
        ),
        reverse=True,
    )[:MAX_HISTORY]
    DAILY_PATH.write_text(
        json.dumps(
            {
                "generated_at": now.isoformat(),
                "publishing_mode": "automatic-direct",
                "review_required": False,
                "retention_days": HISTORY_DAYS,
                "daily_target": len(CATEGORIES) * CARDS_PER_CATEGORY,
                "items": history,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return history


def main() -> int:
    now = datetime.now(timezone.utc)
    cards = build_cards(now)
    history = update_history(now, cards)
    counts = {category: CARDS_PER_CATEGORY for category in CATEGORIES}

    payload = load_json(OUTPUT_PATH, {})
    payload.update(
        {
            "site": "华人婚姻绿卡网",
            "generated_at": now.isoformat(),
            "publishing_mode": "automatic-direct",
            "review_required": False,
            "daily_feature": cards[0],
            "daily_features": cards,
            "daily_count": len(cards),
            "daily_category_counts": counts,
            "daily_history_count": len(history),
            "daily_retention_days": HISTORY_DAYS,
            "disclaimer": DISCLAIMER,
        }
    )
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT_PATH.write_text(
        "window.HUNLV_KNOWLEDGE_UPDATES = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    state = load_json(STATE_PATH, {})
    state.update(
        {
            "site": "华人婚姻绿卡网",
            "last_run": now.isoformat(),
            "publishing_mode": "automatic-direct",
            "review_required": False,
            "daily_feature_id": cards[0]["id"],
            "daily_feature_ids": [card["id"] for card in cards],
            "daily_published_count": len(cards),
            "daily_category_counts": counts,
            "daily_history_count": len(history),
        }
    )
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Auto-published {len(cards)} cards: {CARDS_PER_CATEGORY} in each of {len(CATEGORIES)} categories")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
