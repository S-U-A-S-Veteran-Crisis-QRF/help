#!/usr/bin/env python3
"""
Flat top-down PREVIEW mockups of three SUAS coin directions.
These are 2D proofs for choosing a direction — NOT printable STLs.
Each is a 45 mm coin rendered at 12 px/mm. Curved rim text uses SVG
textPath so it reads like a real challenge coin, not stencil polygons.
"""
import os

OUT = os.path.dirname(os.path.abspath(__file__))
PXMM = 12
D = 45
R = D / 2 * PXMM            # outer radius px
CX = CY = R + 18            # center, with margin
W = int(2 * CX)


def coin_svg(filename, *, field, ring, emblem, accent, top_text, bot_text,
             center_kind, title, subtitle):
    rim_r = R - 10
    text_path_r = R - 26
    inner_r = R - 46
    parts = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{W}" '
        f'viewBox="0 0 {W} {W}" font-family="Helvetica,Arial,sans-serif">'
    )
    parts.append('<defs>')
    # circular paths for arc text (top arc left->right over the top,
    # bottom arc left->right under the bottom, flipped so it reads upright)
    parts.append(
        f'<path id="topArc" fill="none" d="M {CX-text_path_r} {CY} '
        f'A {text_path_r} {text_path_r} 0 0 1 {CX+text_path_r} {CY}"/>'
    )
    parts.append(
        f'<path id="botArc" fill="none" d="M {CX-text_path_r} {CY} '
        f'A {text_path_r} {text_path_r} 0 0 0 {CX+text_path_r} {CY}"/>'
    )
    parts.append(
        f'<radialGradient id="sheen" cx="38%" cy="32%" r="75%">'
        f'<stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>'
        f'<stop offset="55%" stop-color="#ffffff" stop-opacity="0.04"/>'
        f'<stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>'
        f'</radialGradient>'
    )
    parts.append('</defs>')

    # backdrop
    parts.append(f'<rect width="{W}" height="{W}" fill="#cfd6df"/>')
    # drop shadow
    parts.append(f'<circle cx="{CX+3}" cy="{CY+4}" r="{R}" fill="#000" opacity="0.20"/>')
    # outer ring (rim metal)
    parts.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="{ring}"/>')
    # field
    parts.append(f'<circle cx="{CX}" cy="{CY}" r="{rim_r}" fill="{field}"/>')
    # decorative reeded edge ticks
    ticks = []
    import math
    for i in range(120):
        a = 2 * math.pi * i / 120
        x1 = CX + (R - 2) * math.cos(a)
        y1 = CY + (R - 2) * math.sin(a)
        x2 = CX + (rim_r + 1) * math.cos(a)
        y2 = CY + (rim_r + 1) * math.sin(a)
        ticks.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                     f'stroke="{field}" stroke-width="1.5" opacity="0.35"/>')
    parts.append("".join(ticks))
    # inner bevel circle
    parts.append(f'<circle cx="{CX}" cy="{CY}" r="{inner_r}" fill="none" '
                 f'stroke="{accent}" stroke-width="2" opacity="0.5"/>')

    # arc text
    parts.append(
        f'<text fill="{accent}" font-weight="800" font-size="34" '
        f'letter-spacing="3"><textPath href="#topArc" startOffset="50%" '
        f'text-anchor="middle">{top_text}</textPath></text>'
    )
    parts.append(
        f'<text fill="{accent}" font-weight="800" font-size="34" '
        f'letter-spacing="3"><textPath href="#botArc" startOffset="50%" '
        f'text-anchor="middle">{bot_text}</textPath></text>'
    )

    # center emblem
    parts.append(center_emblem(center_kind, emblem, accent, field))

    # center title/subtitle
    parts.append(
        f'<text x="{CX}" y="{CY+96}" fill="{accent}" font-weight="900" '
        f'font-size="48" letter-spacing="6" text-anchor="middle">{title}</text>'
    )
    parts.append(
        f'<text x="{CX}" y="{CY+126}" fill="{accent}" font-weight="600" '
        f'font-size="20" letter-spacing="4" text-anchor="middle" '
        f'opacity="0.9">{subtitle}</text>'
    )

    # sheen overlay for a metallic feel
    parts.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="url(#sheen)"/>')
    parts.append('</svg>')

    with open(os.path.join(OUT, filename), "w") as f:
        f.write("\n".join(parts))
    return filename


def center_emblem(kind, emblem, accent, field):
    import math
    g = []
    if kind == "shield":
        # rounded shield with star, donor-safe
        g.append(
            f'<path d="M {CX} {CY-78} C {CX+62} {CY-78}, {CX+86} {CY-66}, '
            f'{CX+86} {CY-58} L {CX+86} {CY+8} C {CX+86} {CY+52}, {CX+46} '
            f'{CY+78}, {CX} {CY+90} C {CX-46} {CY+78}, {CX-86} {CY+52}, '
            f'{CX-86} {CY+8} L {CX-86} {CY-58} C {CX-86} {CY-66}, {CX-62} '
            f'{CY-78}, {CX} {CY-78} Z" fill="{emblem}"/>'
        )
        g.append(star(CX, CY-34, 26, 12, field))
    elif kind == "star":
        # bold single star inside concentric rings (morale)
        g.append(f'<circle cx="{CX}" cy="{CY}" r="74" fill="{emblem}"/>')
        g.append(f'<circle cx="{CX}" cy="{CY}" r="60" fill="none" '
                 f'stroke="{field}" stroke-width="3" opacity="0.6"/>')
        g.append(star(CX, CY-6, 46, 20, field))
    elif kind == "chevrons":
        # geometric layered chevrons (AMS-reskin look) + center star
        g.append(f'<circle cx="{CX}" cy="{CY}" r="76" fill="{emblem}"/>')
        for i, off in enumerate((0, 22, 44)):
            y = CY - 30 + off
            g.append(
                f'<polygon points="{CX-52},{y+14} {CX},{y-14} {CX+52},{y+14} '
                f'{CX+40},{y+22} {CX},{y-2} {CX-40},{y+22}" '
                f'fill="{field}" opacity="{0.9 - i*0.18:.2f}"/>'
            )
        g.append(star(CX, CY+52, 16, 7, field))
    return "".join(g)


def star(cx, cy, ro, ri, fill):
    import math
    pts = []
    for i in range(10):
        ang = -math.pi/2 + i * math.pi/5
        r = ro if i % 2 == 0 else ri
        pts.append(f"{cx + r*math.cos(ang):.1f},{cy + r*math.sin(ang):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


# ---- Three directions ----

coin_svg(
    "coin_1_community.svg",
    field="#13294b", ring="#3a4654", emblem="#c9a227", accent="#f3ede1",
    top_text="S.U.A.S. VETERAN CRISIS QRF",
    bot_text="988 — PRESS 1",
    center_kind="shield", title="SUAS", subtitle="EST. 2022",
)

coin_svg(
    "coin_2_reskin.svg",
    field="#1c1c1c", ring="#5a5a5a", emblem="#2e6f5e", accent="#e8e3d6",
    top_text="SHUT UP AND SERVE",
    bot_text="NO ONE LEFT BEHIND",
    center_kind="chevrons", title="SUAS", subtitle="VETERAN CRISIS QRF",
)

coin_svg(
    "coin_3_morale.svg",
    field="#2b2f36", ring="#b8932e", emblem="#1a1d22", accent="#d8b24a",
    top_text="SPIRITUS — NO ONE LEFT BEHIND",
    bot_text="988 — PRESS 1",
    center_kind="star", title="SUAS", subtitle="QUICK REACTION FORCE",
)

print("wrote coin_1_community.svg, coin_2_reskin.svg, coin_3_morale.svg")
