"""Convert data/policies/*.md into .docx files for SharePoint upload.

Handles only the Markdown subset used in the policy docs: '# ', '## ' headings
and plain paragraphs. Blank lines separate paragraphs.
"""
import sys
from pathlib import Path

from docx import Document

SRC = Path(__file__).resolve().parents[2] / "data" / "policies"
OUT = SRC / "docx"


def convert(md_path: Path) -> Path:
    doc = Document()
    paragraph: list[str] = []

    def flush() -> None:
        if paragraph:
            doc.add_paragraph(" ".join(paragraph))
            paragraph.clear()

    for line in md_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            flush()
            doc.add_heading(line[2:].strip(), level=1)
        elif line.startswith("## "):
            flush()
            doc.add_heading(line[3:].strip(), level=2)
        elif line.strip() == "":
            flush()
        else:
            paragraph.append(line.strip())
    flush()

    OUT.mkdir(exist_ok=True)
    out_path = OUT / (md_path.stem + ".docx")
    doc.save(out_path)
    return out_path


def main() -> int:
    md_files = sorted(SRC.glob("*.md"))
    if not md_files:
        print("no markdown files found in", SRC, file=sys.stderr)
        return 1
    for md in md_files:
        print("wrote", convert(md))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
