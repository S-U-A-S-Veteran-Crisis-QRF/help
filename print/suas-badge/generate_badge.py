#!/usr/bin/env python3
"""
Generate a 4-color S.U.A.S. Veteran Crisis QRF service badge for the
Bambu A1 Mini with AMS Lite. Outputs 4 STL parts and one bundled 3MF
project file that opens directly in Orca Slicer.

Design (stacked layers, total 3.2 mm tall, 70 mm diameter):
  Part 1 (extruder 1, BLACK)  base disk      r=35.0  h=2.0  z0=0.0
  Part 2 (extruder 2, RED)    outer ring     r=28-33 h=0.6  z0=2.0
  Part 3 (extruder 3, WHITE)  5-point star   r=24/10 h=0.6  z0=2.0
  Part 4 (extruder 4, GOLD)   inner star     r=11/4.5 h=0.6 z0=2.6
"""

import math
import os
import struct
import zipfile

OUT = os.path.dirname(os.path.abspath(__file__))


# ---------- STL primitives ----------

def _norm(v1, v2, v3):
    ux, uy, uz = v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]
    vx, vy, vz = v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]
    nx = uy * vz - uz * vy
    ny = uz * vx - ux * vz
    nz = ux * vy - uy * vx
    L = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
    return (nx / L, ny / L, nz / L)


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


# ---------- Shape generators ----------

def disk(r, h, z0, segs=180):
    tris = []
    top = z0 + h
    bot = z0
    ctop = (0.0, 0.0, top)
    cbot = (0.0, 0.0, bot)
    for i in range(segs):
        a1 = 2 * math.pi * i / segs
        a2 = 2 * math.pi * (i + 1) / segs
        p1t = (r * math.cos(a1), r * math.sin(a1), top)
        p2t = (r * math.cos(a2), r * math.sin(a2), top)
        p1b = (r * math.cos(a1), r * math.sin(a1), bot)
        p2b = (r * math.cos(a2), r * math.sin(a2), bot)
        tris.append(tri(ctop, p1t, p2t))
        tris.append(tri(cbot, p2b, p1b))
        tris.append(tri(p1b, p2b, p2t))
        tris.append(tri(p1b, p2t, p1t))
    return tris


def annulus(r_in, r_out, h, z0, segs=180):
    tris = []
    top = z0 + h
    bot = z0
    for i in range(segs):
        a1 = 2 * math.pi * i / segs
        a2 = 2 * math.pi * (i + 1) / segs
        po1t = (r_out * math.cos(a1), r_out * math.sin(a1), top)
        po2t = (r_out * math.cos(a2), r_out * math.sin(a2), top)
        pi1t = (r_in * math.cos(a1), r_in * math.sin(a1), top)
        pi2t = (r_in * math.cos(a2), r_in * math.sin(a2), top)
        po1b = (r_out * math.cos(a1), r_out * math.sin(a1), bot)
        po2b = (r_out * math.cos(a2), r_out * math.sin(a2), bot)
        pi1b = (r_in * math.cos(a1), r_in * math.sin(a1), bot)
        pi2b = (r_in * math.cos(a2), r_in * math.sin(a2), bot)
        # top face
        tris.append(tri(po1t, po2t, pi2t))
        tris.append(tri(po1t, pi2t, pi1t))
        # bottom face (reverse winding)
        tris.append(tri(po1b, pi1b, pi2b))
        tris.append(tri(po1b, pi2b, po2b))
        # outer wall
        tris.append(tri(po1b, po2b, po2t))
        tris.append(tri(po1b, po2t, po1t))
        # inner wall (faces inward)
        tris.append(tri(pi1b, pi2t, pi2b))
        tris.append(tri(pi1b, pi1t, pi2t))
    return tris


def star_prism(points, r_out, r_in, h, z0, rotation=math.pi / 2):
    tris = []
    top = z0 + h
    bot = z0
    n = points * 2
    verts = []
    for i in range(n):
        ang = rotation + 2 * math.pi * i / n
        r = r_out if i % 2 == 0 else r_in
        verts.append((r * math.cos(ang), r * math.sin(ang)))
    ctop = (0.0, 0.0, top)
    cbot = (0.0, 0.0, bot)
    for i in range(n):
        v1 = (verts[i][0], verts[i][1], top)
        v2 = (verts[(i + 1) % n][0], verts[(i + 1) % n][1], top)
        tris.append(tri(ctop, v1, v2))
        v1b = (verts[i][0], verts[i][1], bot)
        v2b = (verts[(i + 1) % n][0], verts[(i + 1) % n][1], bot)
        tris.append(tri(cbot, v2b, v1b))
        # wall
        tris.append(tri(v1b, v2b, v2))
        tris.append(tri(v1b, v2, v1))
    return tris


# ---------- 3MF writer ----------

def triangles_to_3mf_mesh(triangles):
    """Deduplicate vertices, return (vertices_list, triangle_indices_list)."""
    idx = {}
    verts = []
    tris_idx = []
    for _, a, b, c in triangles:
        face = []
        for v in (a, b, c):
            key = (round(v[0], 5), round(v[1], 5), round(v[2], 5))
            i = idx.get(key)
            if i is None:
                i = len(verts)
                idx[key] = i
                verts.append(key)
            face.append(i)
        tris_idx.append(tuple(face))
    return verts, tris_idx


def write_3mf(parts, path, project_name="SUAS_Badge"):
    """
    parts: list of dicts with keys:
      name        — human label
      triangles   — list of STL triangles
      extruder    — 1..4 (AMS slot)
      color_hex   — "#RRGGBB" for slicer preview
    """
    CORE_NS = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
    SLIC3R_NS = "http://schemas.slic3r.org/3mf/2017/06"

    # build 3D/3dmodel.model
    object_xml_parts = []
    component_xml_parts = []
    object_ids = []

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
        object_ids.append(i)
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

    # Bambu/Orca model_settings.config — per-part filament assignment
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


# ---------- Build the badge ----------

def main():
    parts = [
        {
            "name": "01_base_black",
            "triangles": disk(r=35.0, h=2.0, z0=0.0, segs=180),
            "extruder": 1,
            "color_hex": "#0B0B0B",
        },
        {
            "name": "02_ring_red",
            "triangles": annulus(r_in=28.0, r_out=33.0, h=0.6, z0=2.0, segs=180),
            "extruder": 2,
            "color_hex": "#B22234",
        },
        {
            "name": "03_star_white",
            "triangles": star_prism(
                points=5, r_out=24.0, r_in=10.0, h=0.6, z0=2.0,
                rotation=math.pi / 2,
            ),
            "extruder": 3,
            "color_hex": "#FFFFFF",
        },
        {
            "name": "04_inner_star_gold",
            "triangles": star_prism(
                points=5, r_out=11.0, r_in=4.5, h=0.6, z0=2.6,
                rotation=math.pi / 2,
            ),
            "extruder": 4,
            "color_hex": "#D4AF37",
        },
    ]

    for p in parts:
        path = os.path.join(OUT, f"{p['name']}.stl")
        write_binary_stl(p["triangles"], path)
        print(f"wrote {path}  ({len(p['triangles'])} triangles)")

    threemf = os.path.join(OUT, "suas_badge_4color.3mf")
    write_3mf(parts, threemf, project_name="SUAS_Veteran_Crisis_QRF_Badge")
    print(f"wrote {threemf}")


if __name__ == "__main__":
    main()
