"""
Renders all .mmd files to PNG using Playwright + Mermaid CDN.
"""
import os, pathlib, time
from playwright.sync_api import sync_playwright

DIAGRAMS_DIR = pathlib.Path(__file__).parent
BG = "#0D1B2A"

DIAG_SIZES = {
    # ER diagrams need tall canvas
    "mea_catalogue":    (1800, 1100),
    "mea_reservations": (1800, 1100),
    "mea_itineraires":  (1600, 1000),
    "mea_complements":  (1800, 1100),
    "sr_catalogue":     (1800, 1100),
    "sr_reservations":  (1800, 1300),
    "sr_complements":   (1800, 1200),
    # Architecture diagrams
    "archi_global":     (1800, 1000),
    "archi_flux":       (1600, 1600),
    "archi_composants": (1800, 1200),
    "archi_roles":      (1600, 1000),
}

HTML_TPL = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:{bg}; display:flex; justify-content:center; align-items:center;
          min-height:100vh; padding:20px; }}
  .mermaid {{ background:{bg}; }}
</style>
<script src="mermaid.min.js"></script>
</head>
<body>
<div class="mermaid">
{code}
</div>
<script>
mermaid.initialize({{
  startOnLoad: true,
  theme: 'dark',
  themeVariables: {{
    background: '{bg}',
    mainBkg: '#162A3E',
    nodeBorder: '#00B4D8',
    clusterBkg: '#162A3E',
    clusterBorder: '#00B4D8',
    titleColor: '#FFFFFF',
    edgeLabelBackground: '#162A3E',
    lineColor: '#00B4D8',
    primaryColor: '#162A3E',
    primaryTextColor: '#FFFFFF',
    primaryBorderColor: '#00B4D8',
    secondaryColor: '#1A3A5C',
    tertiaryColor: '#0D1B2A',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    attributeBackgroundColorEven: '#162A3E',
    attributeBackgroundColorOdd: '#0D1B2A',
  }},
  er: {{ diagramPadding: 30, layoutDirection: 'TB', minEntityWidth: 100, minEntityHeight: 75, entityPadding: 15 }},
  flowchart: {{ padding: 20, nodeSpacing: 50, rankSpacing: 60 }},
  sequence: {{ boxMargin: 10, noteMargin: 10, messageMargin: 35, mirrorActors: false }},
}});
</script>
</body>
</html>"""

def render(page, mmd_file: pathlib.Path, out_png: pathlib.Path, width: int, height: int):
    code = mmd_file.read_text(encoding="utf-8")
    html = HTML_TPL.format(bg=BG, code=code.replace("`", "\\`"))

    # Write temp HTML
    html_path = DIAGRAMS_DIR / f"_tmp_{mmd_file.stem}.html"
    html_path.write_text(html, encoding="utf-8")

    page.set_viewport_size({"width": width, "height": height})
    page.goto(f"file:///{html_path.as_posix()}")

    # Wait for mermaid to render
    page.wait_for_function("() => document.querySelector('svg') !== null", timeout=15000)
    time.sleep(1.5)  # extra settle time

    # Get actual SVG bounding box and screenshot just that element
    svg = page.query_selector("svg")
    if svg:
        bbox = svg.bounding_box()
        # Add padding
        pad = 30
        clip = {
            "x": max(0, bbox["x"] - pad),
            "y": max(0, bbox["y"] - pad),
            "width": min(width, bbox["width"] + pad * 2),
            "height": min(height * 3, bbox["height"] + pad * 2),
        }
        page.screenshot(path=str(out_png), clip=clip, full_page=False)
    else:
        page.screenshot(path=str(out_png), full_page=True)

    html_path.unlink(missing_ok=True)
    print(f"  OK {out_png.name}  ({bbox['width']:.0f}x{bbox['height']:.0f})")

def main():
    mmd_files = sorted(DIAGRAMS_DIR.glob("*.mmd"))
    print(f"Rendering {len(mmd_files)} diagrams...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for mmd in mmd_files:
            name = mmd.stem
            w, h = DIAG_SIZES.get(name, (1600, 1000))
            out = DIAGRAMS_DIR / f"{name}.png"
            try:
                render(page, mmd, out, w, h)
            except Exception as e:
                print(f"  ERR {name}: {e}")

        browser.close()

    print("\nDone. PNG files:")
    for f in sorted(DIAGRAMS_DIR.glob("*.png")):
        print(f"  {f.name}  {f.stat().st_size//1024} KB")

if __name__ == "__main__":
    main()
