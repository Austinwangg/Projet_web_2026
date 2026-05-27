"""
Renders all .mmd files to PNG using Playwright + local Mermaid JS injected directly.
"""
import os, pathlib, time
from playwright.sync_api import sync_playwright

DIAGRAMS_DIR = pathlib.Path(r"C:\MAMP\htdocs\Projet_web_2026\diagrams")
BG = "#0D1B2A"

# Read mermaid.min.js content once
MERMAID_JS = (DIAGRAMS_DIR / "mermaid.min.js").read_text(encoding="utf-8")

DIAG_SIZES = {
    "mea_catalogue":    (2000, 1200),
    "mea_reservations": (2000, 1200),
    "mea_itineraires":  (1800, 1100),
    "mea_complements":  (2000, 1200),
    "sr_catalogue":     (2000, 1200),
    "sr_reservations":  (2000, 1400),
    "sr_complements":   (2000, 1300),
    "archi_global":     (2000, 1100),
    "archi_flux":       (1800, 1800),
    "archi_composants": (2000, 1300),
    "archi_roles":      (1800, 1100),
}

MERMAID_CONFIG = """{
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    background: '#0D1B2A',
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
  },
  er: { diagramPadding: 40, layoutDirection: 'TB', minEntityWidth: 120, minEntityHeight: 80, entityPadding: 15, useMaxWidth: false },
  flowchart: { padding: 20, nodeSpacing: 60, rankSpacing: 70, useMaxWidth: false },
  sequence: { boxMargin: 10, noteMargin: 10, messageMargin: 35, mirrorActors: false, useMaxWidth: false },
}"""

def render_one(page, code: str, out_png: pathlib.Path, width: int, height: int):
    # Escape backticks in the diagram code for JS template literal
    code_escaped = code.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:{BG}; width:{width}px; padding:20px; }}
  #diagram {{ background:{BG}; }}
  svg {{ max-width:none !important; }}
</style>
</head>
<body>
<div id="diagram"></div>
<script>
{MERMAID_JS}
</script>
<script>
(async () => {{
  mermaid.initialize({MERMAID_CONFIG});
  const code = `{code_escaped}`;
  const {{ svg }} = await mermaid.render('graph', code);
  document.getElementById('diagram').innerHTML = svg;
  // Force SVG to expand
  const svgEl = document.querySelector('svg');
  if (svgEl) {{
    svgEl.removeAttribute('style');
    svgEl.style.maxWidth = 'none';
  }}
  window.__done = true;
}})();
</script>
</body>
</html>"""

    page.set_viewport_size({"width": width, "height": height})
    page.set_content(html)
    # Wait for render to complete
    page.wait_for_function("() => window.__done === true", timeout=20000)
    time.sleep(0.8)

    svg_el = page.query_selector("svg")
    if svg_el:
        bbox = svg_el.bounding_box()
        if bbox and bbox["width"] > 50:
            pad = 25
            clip = {
                "x": max(0, bbox["x"] - pad),
                "y": max(0, bbox["y"] - pad),
                "width": min(width * 2, bbox["width"] + pad * 2),
                "height": min(height * 3, bbox["height"] + pad * 2),
            }
            # Expand viewport if needed
            needed_h = int(bbox["y"] + bbox["height"] + pad * 2 + 50)
            if needed_h > height:
                page.set_viewport_size({"width": width, "height": needed_h})
            page.screenshot(path=str(out_png), clip=clip, full_page=False)
            return bbox["width"], bbox["height"]

    # Fallback full page
    page.screenshot(path=str(out_png), full_page=True)
    return width, height

def main():
    mmd_files = sorted(DIAGRAMS_DIR.glob("*.mmd"))
    print(f"Rendering {len(mmd_files)} diagrams...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for mmd in mmd_files:
            name = mmd.stem
            w, h = DIAG_SIZES.get(name, (1800, 1100))
            out = DIAGRAMS_DIR / f"{name}.png"
            code = mmd.read_text(encoding="utf-8")
            try:
                rw, rh = render_one(page, code, out, w, h)
                size_kb = out.stat().st_size // 1024
                print(f"  OK {name}.png  {rw:.0f}x{rh:.0f}  {size_kb}KB")
            except Exception as e:
                print(f"  ERR {name}: {e}")

        browser.close()

    print("\nFinal PNGs:")
    for f in sorted(DIAGRAMS_DIR.glob("*.png")):
        print(f"  {f.name}  {f.stat().st_size//1024} KB")

if __name__ == "__main__":
    main()
