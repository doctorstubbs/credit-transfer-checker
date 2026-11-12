#!/usr/bin/env python3
"""Stage 31 (Nov 11, 2026): Louisiana State University and A&M College coverage
from the Board of Regents Articulation Matrix, Home Courses page,
MatrixYear 2025-26, extracted from the public Power BI view discipline
by discipline (225 rows, 41 disciplines; the filter lists the college
as LSU, the Baton Rouge flagship, distinct from LSUA, LSUE,
LSUS, and LSU Health Sciences). Same transform as BRCC: one record per home course
code, LCCNs merged, asterisks stripped for matching, titles are the
matrix Common Course Titles.
"""
import json
import re
import sys

ROWS = open("data/harvests/lsu-matrix-2025-26-rows.txt").read().strip()


def main():
    rows = []
    for line in ROWS.splitlines():
        parts = [p.strip() for p in line.split("|")]
        assert len(parts) == 4, line
        rows.append(parts)
    print("rows:", len(rows))

    by_code = {}
    for lccn_raw, code, title, _disc in rows:
        lccn = lccn_raw.rstrip("*")
        rec = by_code.setdefault(code, {"code": code, "title": title, "lccns": []})
        if lccn not in rec["lccns"]:
            rec["lccns"].append(lccn)
    courses = sorted(by_code.values(), key=lambda r: r["code"])
    print("unique home courses:", len(courses))
    multi = [c for c in courses if len(c["lccns"]) > 1]
    print("courses with multiple LCCNs:", len(multi))

    with open("data/courses.json") as f:
        data = json.load(f)
    statewide = set(data.get("statewide", {}).keys())
    brcc_lccns = {l for c in courses for l in c["lccns"]}
    print("LSU LCCNs:", len(brcc_lccns), "| in statewide 292 set:", len(brcc_lccns & statewide))
    for name, col in data["colleges"].items():
        theirs = {l for c in col["courses"] for l in c["lccns"]}
        print(f"overlap with {name}: {len(brcc_lccns & theirs)}")

    data["colleges"]["Louisiana State University and A&M College"] = {
        "catalog": "Board of Regents Articulation Matrix, 2025-26",
        "courses": courses,
    }
    note = ("Louisiana State University and A&M College: Louisiana Board of Regents Course "
            "Articulation Matrix, 2025-26 edition (public Power BI view, Home "
            "Courses page, extracted Nov 11, 2026; BRCC's own catalog publishes "
            "no LCCN tags, so the Regents matrix is the public source; titles "
            "are the matrix Common Course Titles)")
    if note not in data["meta"]["builtFrom"]:
        data["meta"]["builtFrom"].append(note)
    with open("data/courses.json", "w") as f:
        json.dump(data, f, indent=1)
    print("courses.json updated")


if __name__ == "__main__":
    sys.exit(main())
