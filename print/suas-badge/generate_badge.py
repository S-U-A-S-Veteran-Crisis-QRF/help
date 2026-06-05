#!/usr/bin/env python3
"""
S.U.A.S. Veteran Crisis QRF — Punisher-style 4-color service badge.

Layout (Bambu A1 Mini + AMS Lite, total 3.0 mm tall, 70 mm diameter):
  Part 1 (extruder 1, BLACK) base disk          r=35.0  z=0.0..2.0
  Part 2 (extruder 2, RED)   outer ring         r=27..34 z=2.0..2.6
  Part 3 (extruder 3, WHITE) skull + arc text   z=2.0..2.6 (skull)
                                                z=2.6..3.0 (text on ring)
  Part 4 (extruder 4, GOLD)  AR-15 silhouette   z=2.0..2.6 (over skull)

Top arc: "SUAS"
Bottom arc: "SHUT UP AND SERVE"
"""

import math
import os
import struct
import zipfile

OUT = os.path.dirname(os.path.abspath(__file__))


# ---------- STL primitives ----------

def _norm(v1, v2, v3):
    ux, uy, uz = v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]
    vx, vy, vz = v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]
    nx = uy*vz - uz*vy
    ny = uz*vx - ux*vz
    nz = ux*vy - uy*vx
    L = math.sqrt(nx*nx + ny*ny + nz*nz) or 1.0
    return (nx/L, ny/L, nz/L)


def tri(a, b, c):
    return (_norm(a, b, c), a, b, c)


def write_binary_stl(triangles, path):
    with open(path, "wb") as f:
        f.write(b"\0" * 80)
        f.write(struct.pack("<I", len(triangles)))
        for n, a, b, c in triangles:
            f.write(struct.pack(
                "<12fH",
                n[0], n[1], n[2],
                a[0], a[1], a[2],
                b[0], b[1], b[2],
                c[0], c[1], c[2],
                0,
            ))


# ---------- Disk + annulus ----------

def disk(r, h, z0, segs=180):
    tris = []
    top = z0 + h; bot = z0
    ctop = (0.0, 0.0, top); cbot = (0.0, 0.0, bot)
    for i in range(segs):
        a1 = 2*math.pi*i/segs; a2 = 2*math.pi*(i+1)/segs
        p1t = (r*math.cos(a1), r*math.sin(a1), top)
        p2t = (r*math.cos(a2), r*math.sin(a2), top)
        p1b = (r*math.cos(a1), r*math.sin(a1), bot)
        p2b = (r*math.cos(a2), r*math.sin(a2), bot)
        tris.append(tri(ctop, p1t, p2t))
        tris.append(tri(cbot, p2b, p1b))
        tris.append(tri(p1b, p2b, p2t))
        tris.append(tri(p1b, p2t, p1t))
    return tris


def annulus(r_in, r_out, h, z0, segs=180):
    tris = []
    top = z0 + h; bot = z0
    for i in range(segs):
        a1 = 2*math.pi*i/segs; a2 = 2*math.pi*(i+1)/segs
        po1t = (r_out*math.cos(a1), r_out*math.sin(a1), top)
        po2t = (r_out*math.cos(a2), r_out*math.sin(a2), top)
        pi1t = (r_in*math.cos(a1), r_in*math.sin(a1), top)
        pi2t = (r_in*math.cos(a2), r_in*math.sin(a2), top)
        po1b = (r_out*math.cos(a1), r_out*math.sin(a1), bot)
        po2b = (r_out*math.cos(a2), r_out*math.sin(a2), bot)
        pi1b = (r_in*math.cos(a1), r_in*math.sin(a1), bot)
        pi2b = (r_in*math.cos(a2), r_in*math.sin(a2), bot)
        tris.append(tri(po1t, po2t, pi2t))
        tris.append(tri(po1t, pi2t, pi1t))
        tris.append(tri(po1b, pi1b, pi2b))
        tris.append(tri(po1b, pi2b, po2b))
        tris.append(tri(po1b, po2b, po2t))
        tris.append(tri(po1b, po2t, po1t))
        tris.append(tri(pi1b, pi2t, pi2b))
        tris.append(tri(pi1b, pi1t, pi2t))
    return tris


# ---------- Polygon triangulation (ear clipping) ----------

def signed_area(poly):
    s = 0.0
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i+1) % n]
        s += x1*y2 - x2*y1
    return s / 2.0


def ensure_ccw(poly):
    if signed_area(poly) < 0:
        return list(reversed(poly))
    return list(poly)


def _convex_ccw(p, c, n):
    return (c[0]-p[0]) * (n[1]-c[1]) - (c[1]-p[1]) * (n[0]-c[0]) > 1e-9


def _point_in_tri(p, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0]-p3[0])*(p2[1]-p3[1]) - (p2[0]-p3[0])*(p1[1]-p3[1])
    d1 = sign(p, a, b); d2 = sign(p, b, c); d3 = sign(p, c, a)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def ear_clip(poly):
    poly = ensure_ccw(poly)
    idx = list(range(len(poly)))
    tris = []
    guard = 0
    while len(idx) > 3 and guard < 20000:
        guard += 1
        n = len(idx)
        found = False
        for i in range(n):
            pi = idx[(i-1) % n]; ci = idx[i]; ni = idx[(i+1) % n]
            p, c, nx = poly[pi], poly[ci], poly[ni]
            if not _convex_ccw(p, c, nx):
                continue
            ok = True
            for j in range(n):
                if j in ((i-1) % n, i, (i+1) % n):
                    continue
                if _point_in_tri(poly[idx[j]], p, c, nx):
                    ok = False; break
            if ok:
                tris.append((pi, ci, ni))
                del idx[i]
                found = True
                break
        if not found:
            break
    if len(idx) == 3:
        tris.append(tuple(idx))
    return poly, tris


def extrude_polygon(poly_xy, z_bot, z_top):
    poly, tri_idx = ear_clip(poly_xy)
    tris = []
    for i1, i2, i3 in tri_idx:
        a = (poly[i1][0], poly[i1][1], z_top)
        b = (poly[i2][0], poly[i2][1], z_top)
        c = (poly[i3][0], poly[i3][1], z_top)
        tris.append(tri(a, b, c))
        ab = (poly[i1][0], poly[i1][1], z_bot)
        bb = (poly[i2][0], poly[i2][1], z_bot)
        cb = (poly[i3][0], poly[i3][1], z_bot)
        tris.append(tri(cb, bb, ab))
    n = len(poly)
    for i in range(n):
        a = poly[i]; b = poly[(i+1) % n]
        ab = (a[0], a[1], z_bot); at_v = (a[0], a[1], z_top)
        bb = (b[0], b[1], z_bot); bt = (b[0], b[1], z_top)
        tris.append(tri(ab, bb, bt))
        tris.append(tri(ab, bt, at_v))
    return tris


# ---------- Block letters (5 wide x 6 tall, stroke 1, slit 0.3 where holes exist) ----------

LETTER_S = [
    (0, 0), (5, 0), (5, 3.5), (1, 3.5), (1, 5), (5, 5),
    (5, 6), (0, 6), (0, 2.5), (4, 2.5), (4, 1), (0, 1),
]

LETTER_U = [
    (0, 0), (5, 0), (5, 6), (4, 6), (4, 1), (1, 1), (1, 6), (0, 6),
]

LETTER_A = [
    (0, 0), (1, 0), (1, 2.5),
    (2.35, 2.5), (2.35, 3.5),
    (1, 3.5), (1, 5),
    (4, 5), (4, 3.5),
    (2.65, 3.5), (2.65, 2.5),
    (4, 2.5), (4, 0),
    (5, 0), (5, 6), (0, 6),
]

LETTER_H = [
    (0, 0), (1, 0), (1, 2.5), (4, 2.5), (4, 0), (5, 0),
    (5, 6), (4, 6), (4, 3.5), (1, 3.5), (1, 6), (0, 6),
]

LETTER_T = [
    (2, 0), (3, 0), (3, 5), (5, 5), (5, 6), (0, 6), (0, 5), (2, 5),
]

LETTER_P = [
    (0, 0), (1, 0), (1, 3),
    (2.35, 3), (2.35, 4),
    (1, 4), (1, 5),
    (4, 5), (4, 4),
    (2.65, 4), (2.65, 3),
    (5, 3), (5, 6), (0, 6),
]

LETTER_N = [
    (0, 0), (1, 0), (1, 5), (4, 0), (5, 0),
    (5, 6), (4, 6), (4, 1), (1, 6), (0, 6),
]

LETTER_D = [
    (0, 0), (2.35, 0), (2.35, 1), (1, 1), (1, 5),
    (4, 5), (4, 1), (2.65, 1), (2.65, 0), (5, 0),
    (5, 6), (0, 6),
]

LETTER_E = [
    (0, 0), (5, 0), (5, 1), (1, 1), (1, 2.5), (4, 2.5),
    (4, 3.5), (1, 3.5), (1, 5), (5, 5), (5, 6), (0, 6),
]

LETTER_R = [
    (0, 0), (1, 0), (1, 3),
    (2.35, 3), (2.35, 4),
    (1, 4), (1, 5),
    (4, 5), (4, 4),
    (2.65, 4), (2.65, 3),
    (4, 3),
    (4, 0), (5, 0), (5, 6), (0, 6),
]

LETTER_V = [
    (2.5, 0), (5, 6), (4, 6), (2.5, 2.4), (1, 6), (0, 6),
]

LETTERS = {
    "S": LETTER_S, "U": LETTER_U, "A": LETTER_A, "H": LETTER_H,
    "T": LETTER_T, "P": LETTER_P, "N": LETTER_N, "D": LETTER_D,
    "E": LETTER_E, "R": LETTER_R, "V": LETTER_V,
}

LETTER_W = 5.0
LETTER_H_ = 6.0
SPACE_W = 4.0


# ---------- Skull silhouette (sunglasses-style merged eye socket) ----------

# Outline CCW from chin bottom-center; slit at x=±0.15 from cranium top down
# into a single elongated eye cavity. ~13 mm tall x ~12 mm wide.
SKULL = [
    (0, -6), (3, -5.5), (4, -3), (5, 0), (6, 5), (5, 6.5), (3, 7),
    (0.15, 7), (0.15, 3.5), (3.5, 3.5), (3.5, 1),
    (-3.5, 1), (-3.5, 3.5), (-0.15, 3.5), (-0.15, 7),
    (-3, 7), (-5, 6.5), (-6, 5), (-5, 0), (-4, -3), (-3, -5.5),
]


# ---------- AR-15 silhouette (CW; ear_clip will normalise) ----------

AR15_CW = [
    (20, 0.5),   (20, -0.5),
    (10, -0.5),  (10, -2.5),
    (2, -2.5),   (2, -1),
    (1, -1),     (0.5, -7),
    (-5, -7),    (-4, -1),
    (-5, -1),
    (-5, -4),    (-8, -4), (-8, -1),
    (-9, -1),
    (-10, -8),   (-13, -8),
    (-12, -1),
    (-22, -1),   (-22, 2),
    (-12, 2),    (-12, 3),
    (-9, 3),     (-9, 5.5),
    (-2, 5.5),   (-2, 3),
    (2, 3),      (2, 2.5),
    (10, 2.5),   (10, 0.5),
    (15, 0.5),   (15, 4.5),
    (17, 4.5),   (17, 0.5),
]


# ---------- Transforms ----------

def scale_translate(poly, scale=1.0, dx=0.0, dy=0.0):
    return [(x*scale + dx, y*scale + dy) for x, y in poly]


def rotate_translate(poly, theta_rad, dx, dy):
    c, s = math.cos(theta_rad), math.sin(theta_rad)
    return [(c*x - s*y + dx, s*x + c*y + dy) for x, y in poly]


# ---------- Arc text layout ----------

def arc_text(text, scale, char_gap, baseline_radius,
             center_angle_deg, side="top"):
    """
    Lay out `text` on an arc, centered at `center_angle_deg`.
    side="top": letters read CW around the top (interior of badge below),
                letter "up" = outward radial.
    side="bottom": letters read CCW around the bottom (interior above),
                   letter "up" = inward radial.
    """
    char_w = LETTER_W * scale
    space_w = SPACE_W * scale
    gap_w = char_gap * scale

    advances = []
    for ch in text:
        if ch == " ":
            advances.append(space_w)
        else:
            advances.append(char_w)

    total_arc = sum(advances) + max(0, len(text)-1) * gap_w
    half_angle = (total_arc / 2.0) / baseline_radius

    if side == "top":
        cursor_ang = math.radians(center_angle_deg) + half_angle
        sign = -1
    else:
        cursor_ang = math.radians(center_angle_deg) - half_angle
        sign = +1

    polys = []
    for i, ch in enumerate(text):
        adv = advances[i]
        half_adv_ang = (adv / 2.0) / baseline_radius
        cursor_ang += sign * half_adv_ang
        center_ang = cursor_ang

        if ch != " " and ch in LETTERS:
            letter = LETTERS[ch]
            # Center the letter on its own origin
            centered = [(x - LETTER_W/2.0, y - LETTER_H_/2.0) for x, y in letter]
            scaled = [(x*scale, y*scale) for x, y in centered]

            if side == "top":
                # local +Y -> outward radial = (cos a, sin a)
                # local +X -> CW tangent     = (sin a, -cos a)
                a = center_ang
                sa, ca = math.sin(a), math.cos(a)
                rotated = [(x*sa + y*ca, -x*ca + y*sa) for x, y in scaled]
            else:
                # local +Y -> inward radial  = (-cos a, -sin a)
                # local +X -> CCW tangent    = (-sin a, cos a)
                a = center_ang
                sa, ca = math.sin(a), math.cos(a)
                rotated = [(-x*sa - y*ca, x*ca - y*sa) for x, y in scaled]

            px = baseline_radius * math.cos(center_ang)
            py = baseline_radius * math.sin(center_ang)
            polys.append([(x + px, y + py) for x, y in rotated])

        cursor_ang += sign * (half_adv_ang + gap_w / baseline_radius)

    return polys


# ---------- 3MF writer ----------

def triangles_to_3mf_mesh(triangles):
    idx = {}; verts = []; tris_idx = []
    for _, a, b, c in triangles:
        face = []
        for v in (a, b, c):
            k = (round(v[0], 5), round(v[1], 5), round(v[2], 5))
            i = idx.get(k)
            if i is None:
                i = len(verts); idx[k] = i; verts.append(k)
            face.append(i)
        tris_idx.append(tuple(face))
    return verts, tris_idx


def write_3mf(parts, path, project_name):
    CORE_NS = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
    SLIC3R_NS = "http://schemas.slic3r.org/3mf/2017/06"
    object_xml_parts = []; component_xml_parts = []
    for i, p in enumerate(parts, start=1):
        verts, tris = triangles_to_3mf_mesh(p["triangles"])
        v_xml = "\n".join(
            f'      <vertex x="{v[0]:.5f}" y="{v[1]:.5f}" z="{v[2]:.5f}"/>'
            for v in verts
        )
        t_xml = "\n".join(
            f'      <triangle v1="{a}" v2="{b}" v3="{c}"/>' for a, b, c in tris
        )
        object_xml_parts.append(
            f'  <object id="{i}" type="model" partnumber="{p["name"]}">\n'
            f'    <mesh>\n'
            f'     <vertices>\n{v_xml}\n     </vertices>\n'
            f'     <triangles>\n{t_xml}\n     </triangles>\n'
            f'    </mesh>\n'
            f'  </object>'
        )
        component_xml_parts.append(f'      <component objectid="{i}"/>')
    assembly_id = len(parts) + 1
    assembly_xml = (
        f'  <object id="{assembly_id}" type="model" partnumber="{project_name}">\n'
        f'    <components>\n' + "\n".join(component_xml_parts) + "\n"
        f'    </components>\n'
        f'  </object>'
    )
    model_xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<model unit="millimeter" xml:lang="en-US" '
        f'xmlns="{CORE_NS}" xmlns:slic3rpe="{SLIC3R_NS}">\n'
        f'  <metadata name="Title">{project_name}</metadata>\n'
        '  <metadata name="Designer">S.U.A.S. Veteran Crisis QRF</metadata>\n'
        '  <metadata name="Application">Claude Code generator</metadata>\n'
        '  <resources>\n'
        + "\n".join(object_xml_parts) + "\n"
        + assembly_xml + "\n"
        '  </resources>\n'
        '  <build>\n'
        f'    <item objectid="{assembly_id}"/>\n'
        '  </build>\n'
        '</model>\n'
    )
    parts_xml = []
    for i, p in enumerate(parts, start=1):
        parts_xml.append(
            f'    <part id="{i}" subtype="normal_part">\n'
            f'      <metadata key="name" value="{p["name"]}"/>\n'
            f'      <metadata key="extruder" value="{p["extruder"]}"/>\n'
            f'      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>\n'
            f'    </part>'
        )
    model_settings = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<config>\n'
        f'  <object id="{assembly_id}">\n'
        f'    <metadata key="name" value="{project_name}"/>\n'
        + "\n".join(parts_xml) + "\n"
        '  </object>\n'
        '</config>\n'
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
        '  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n'
        '  <Default Extension="png" ContentType="image/png"/>\n'
        '  <Default Extension="config" ContentType="application/vnd.ms-printing.printticket+xml"/>\n'
        '</Types>\n'
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
        '  <Relationship Target="/3D/3dmodel.model" Id="rel-1" '
        'Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n'
        '</Relationships>\n'
    )
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("3D/3dmodel.model", model_xml)
        z.writestr("Metadata/model_settings.config", model_settings)


# ---------- SVG preview (exact top-down view, vector) ----------

def _poly_pts(poly):
    return " ".join(f"{x:.4f},{y:.4f}" for x, y in poly)


def write_svg_top(spec, path):
    """
    spec = {
      'disk_r', 'disk_color',
      'ring_in', 'ring_out', 'ring_color',
      'white_color', 'white_polys' (list of 2D polygons),
      'gold_color', 'gold_polys' (list of 2D polygons),
    }
    """
    half = spec['disk_r'] + 4
    px_per_mm = 14
    w = int(2 * half * px_per_mm)
    r_in = spec['ring_in']
    r_out = spec['ring_out']
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{w}" '
        f'viewBox="{-half} {-half} {2*half} {2*half}">',
        '  <rect x="' + f"{-half}" + '" y="' + f"{-half}" + '" '
        f'width="{2*half}" height="{2*half}" fill="#cfd6df"/>',
        '  <g transform="scale(1,-1)">',
        # subtle drop shadow under the disk
        f'    <circle cx="0.6" cy="-0.6" r="{spec["disk_r"]}" '
        f'fill="#000" opacity="0.18"/>',
        # 1. black base disk
        f'    <circle cx="0" cy="0" r="{spec["disk_r"]}" '
        f'fill="{spec["disk_color"]}"/>',
        # 2. red ring as an annular path (even-odd fill)
        f'    <path d="M {r_out} 0 A {r_out} {r_out} 0 1 1 {-r_out} 0 '
        f'A {r_out} {r_out} 0 1 1 {r_out} 0 Z '
        f'M {r_in} 0 A {r_in} {r_in} 0 1 0 {-r_in} 0 '
        f'A {r_in} {r_in} 0 1 0 {r_in} 0 Z" '
        f'fill="{spec["ring_color"]}" fill-rule="evenodd"/>',
    ]
    # 3. white skull + curved text
    for poly in spec['white_polys']:
        parts.append(
            f'    <polygon points="{_poly_pts(poly)}" '
            f'fill="{spec["white_color"]}"/>'
        )
    # 4. gold AR-15 (drawn last so it sits over the skull)
    for poly in spec['gold_polys']:
        parts.append(
            f'    <polygon points="{_poly_pts(poly)}" '
            f'fill="{spec["gold_color"]}"/>'
        )
    parts.append('  </g>')
    # ruler + label outside the disk
    parts.append(
        f'  <text x="0" y="{half - 1.0}" font-size="2.4" font-family="monospace" '
        f'text-anchor="middle" fill="#222">'
        f'70 mm · 4-color · z=0–3.0 mm</text>'
    )
    parts.append('</svg>')
    with open(path, "w") as f:
        f.write("\n".join(parts))


# ---------- Build the badge ----------

def main():
    BASE_H = 2.0
    RING_TOP = 2.6
    TEXT_TOP = 3.0  # white text sits 0.4 mm proud of the red ring
    EMBLEM_TOP = 2.6

    # 1. Black base disk
    base_tris = disk(r=35.0, h=BASE_H, z0=0.0, segs=180)

    # 2. Red ring
    ring_tris = annulus(r_in=27.0, r_out=34.0,
                        h=RING_TOP-BASE_H, z0=BASE_H, segs=180)

    # 3. White: skull (z=2.0..2.6) + curved top text + curved bottom text
    #          (text z=2.6..3.0 sitting on the red ring)
    skull_poly = scale_translate(SKULL, scale=1.0, dx=0.0, dy=0.0)
    skull_tris = extrude_polygon(skull_poly, z_bot=BASE_H, z_top=EMBLEM_TOP)

    text_top_polys = arc_text(
        "SUAS", scale=0.7, char_gap=1.0,
        baseline_radius=30.5, center_angle_deg=90, side="top",
    )
    text_bot_polys = arc_text(
        "SHUT UP AND SERVE", scale=0.55, char_gap=1.0,
        baseline_radius=30.5, center_angle_deg=270, side="bottom",
    )
    text_tris = []
    for p in text_top_polys + text_bot_polys:
        text_tris.extend(extrude_polygon(p, z_bot=RING_TOP, z_top=TEXT_TOP))

    white_tris = skull_tris + text_tris

    # 4. Gold AR-15 silhouette across the skull at eye level
    ar15_poly = scale_translate(AR15_CW, scale=0.55, dx=0.0, dy=2.25)
    ar15_tris = extrude_polygon(ar15_poly,
                                z_bot=BASE_H, z_top=EMBLEM_TOP)

    parts = [
        {"name": "01_base_black", "triangles": base_tris,
         "extruder": 1, "color_hex": "#0B0B0B"},
        {"name": "02_ring_red", "triangles": ring_tris,
         "extruder": 2, "color_hex": "#B22234"},
        {"name": "03_white_skull_text", "triangles": white_tris,
         "extruder": 3, "color_hex": "#FFFFFF"},
        {"name": "04_ar15_gold", "triangles": ar15_tris,
         "extruder": 4, "color_hex": "#D4AF37"},
    ]

    for p in parts:
        path = os.path.join(OUT, f"{p['name']}.stl")
        write_binary_stl(p["triangles"], path)
        print(f"wrote {path}  ({len(p['triangles'])} triangles)")

    threemf = os.path.join(OUT, "suas_badge_4color.3mf")
    write_3mf(parts, threemf, project_name="SUAS_Veteran_Crisis_QRF_Badge")
    print(f"wrote {threemf}")

    # Exact top-down vector preview — what the print face will look like.
    spec = {
        "disk_r": 35.0,
        "disk_color": "#0B0B0B",
        "ring_in": 27.0, "ring_out": 34.0,
        "ring_color": "#B22234",
        "white_color": "#FFFFFF",
        "white_polys": [skull_poly] + text_top_polys + text_bot_polys,
        "gold_color": "#D4AF37",
        "gold_polys": [ar15_poly],
    }
    svg_path = os.path.join(OUT, "preview_top.svg")
    write_svg_top(spec, svg_path)
    print(f"wrote {svg_path}")


if __name__ == "__main__":
    main()
