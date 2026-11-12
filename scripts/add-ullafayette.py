#!/usr/bin/env python3
"""UL Lafayette matrix supplement (Nov 12, 2026): UL Lafayette's
2026-2027 catalog harvest (96 courses) carried no fine arts LCCN
that Delgado also lists, leaving the Delgado to UL Lafayette
transfer degree plan with one named gap (fine arts, 3 hours).
The Board of Regents Articulation Matrix, 2025-26 (Home Courses
page, filter UL LAFAYETTE, 201 rows, 33 disciplines, extracted
Nov 12, 2026) is merged into the existing catalog record: one
record per home course code, LCCNs unioned, asterisks stripped,
catalog titles kept where the course already exists, matrix
titles for new courses. The college's catalog label now names
both sources so the on-page source line stays accurate.
"""
import json

ROWS = open("data/harvests/ull-matrix-2025-26-rows.txt").read().strip()
KEY = "University of Louisiana at Lafayette"


def main():
    rows = []
    for line in ROWS.splitlines():
        parts = [p.strip() for p in line.split("|")]
        assert len(parts) == 4, line
        rows.append(parts)
    print("rows:", len(rows))

    with open("data/courses.json") as f:
        data = json.load(f)
    col = data["colleges"][KEY]
    by_code = {c["code"]: c for c in col["courses"]}
    before = len(by_code)
    added_courses = 0
    added_lccns = 0
    for lccn_raw, code, title, _disc in rows:
        lccn = lccn_raw.rstrip("*")
        rec = by_code.get(code)
        if rec is None:
            rec = {"code": code, "title": title, "lccns": []}
            by_code[code] = rec
            added_courses += 1
        if lccn not in rec["lccns"]:
            rec["lccns"].append(lccn)
            added_lccns += 1
    col["courses"] = sorted(by_code.values(), key=lambda r: r["code"])
    col["catalog"] = ("2026-2027 catalog and Board of Regents "
                      "Articulation Matrix, 2025-26")
    print("courses before:", before, "| after:", len(col["courses"]),
          "| new courses:", added_courses, "| LCCNs added:", added_lccns)
    fa = [c for c in col["courses"]
          if any(l.startswith(("CART", "CMUS", "CTHE", "CDAN"))
                 for l in c["lccns"])]
    print("fine arts courses now:", [(c["code"], c["lccns"]) for c in fa])

    note = ("University of Louisiana at Lafayette: 2026-2027 catalog "
            "harvest supplemented Nov 12, 2026 with the Louisiana Board "
            "of Regents Course Articulation Matrix, 2025-26 edition "
            "(public Power BI view, Home Courses page, filter "
            "UL LAFAYETTE; 201 rows merged by home course code, LCCNs "
            "unioned) to close the fine arts gap in transfer degree "
            "plans")
    if note not in data["meta"]["builtFrom"]:
        data["meta"]["builtFrom"].append(note)
    with open("data/courses.json", "w") as f:
        json.dump(data, f, indent=1)
    print("courses.json updated")


if __name__ == "__main__":
    main()
