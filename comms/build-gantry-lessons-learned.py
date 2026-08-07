#!/usr/bin/env python3
"""Fill the Eaton EHS Lessons Learned template for the 8/4/2026 Gantry 2 conveyor fall."""
import re, html

import os, shutil, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, 'templates', 'eaton-lessons-learned-template.pptx')
OUT = os.path.join(HERE, 'gantry-conveyor-step-over.pptx')
WORK = os.path.join(HERE, '.build-gantry')
SRC = os.path.join(WORK, 'ppt', 'slides', 'slide1.xml')

# Drop the two floor photos here and re-run; the placeholder frames are replaced with
# the real images. Portrait phone photos are what these slots are sized for (3:4).
PHOTOS = {
    'A': os.path.join(HERE, 'img', 'gantry-step-over-path.jpg'),
    'B': os.path.join(HERE, 'img', 'gantry-containment-signage.jpg'),
}

E = 914400  # EMU per inch

def esc(s):
    return html.escape(s, quote=False)

# ---------- run/paragraph builders matching the template's own formatting ----------

CG = '<a:latin typeface="Century Gothic" panose="020B0502020202020204" pitchFamily="34" charset="0"/>'

def head(text, sz=1000):
    """Section heading: bold italic underlined Century Gothic."""
    return (
        '<a:p><a:pPr fontAlgn="base"><a:lnSpc><a:spcPct val="110000"/></a:lnSpc>'
        '<a:spcBef><a:spcPct val="20000"/></a:spcBef><a:spcAft><a:spcPct val="0"/></a:spcAft>'
        '<a:buClr><a:srgbClr val="3367CD"/></a:buClr><a:defRPr/></a:pPr>'
        f'<a:r><a:rPr lang="en-US" sz="{sz}" b="1" i="1" u="sng">'
        '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>' + CG +
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p>'
    )

def para(text, sz=1000):
    """Plain body paragraph, no bullet."""
    return (
        '<a:p><a:pPr fontAlgn="base"><a:lnSpc><a:spcPct val="110000"/></a:lnSpc>'
        '<a:spcBef><a:spcPct val="20000"/></a:spcBef><a:spcAft><a:spcPct val="0"/></a:spcAft>'
        '<a:buClr><a:srgbClr val="3367CD"/></a:buClr><a:defRPr/></a:pPr>'
        f'<a:r><a:rPr lang="en-US" sz="{sz}">'
        '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>'
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p>'
    )

def num(text, sz=1000, lead=None, start=None):
    """Auto-numbered body item. `lead` is rendered bold before the rest.

    PowerPoint continues one buAutoNum sequence for the whole shape, so the first
    item under a second heading needs startAt="1" or it carries on from the list above.
    """
    runs = ''
    if lead:
        runs += (f'<a:r><a:rPr lang="en-US" sz="{sz}" b="1">'
                 '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>'
                 f'</a:rPr><a:t xml:space="preserve">{esc(lead)}</a:t></a:r>')
    runs += (f'<a:r><a:rPr lang="en-US" sz="{sz}">'
             '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>'
             f'</a:rPr><a:t>{esc(text)}</a:t></a:r>')
    return (
        '<a:p><a:pPr marL="228600" indent="-228600" fontAlgn="base">'
        '<a:lnSpc><a:spcPct val="110000"/></a:lnSpc><a:spcAft><a:spcPct val="0"/></a:spcAft>'
        '<a:buClr><a:srgbClr val="3367CD"/></a:buClr><a:buFontTx/>'
        f'<a:buAutoNum type="arabicPeriod"{f" startAt={chr(34)}{start}{chr(34)}" if start else ""}/>'
        '<a:defRPr/></a:pPr>' + runs + '</a:p>'
    )

def qnum(text, sz=1000):
    """Numbered question in the bottom-left 'apply to you' box (90% line spacing, red bullets)."""
    return (
        '<a:p><a:pPr marL="228600" indent="-228600" fontAlgn="base">'
        '<a:lnSpc><a:spcPct val="90000"/></a:lnSpc><a:spcBef><a:spcPct val="20000"/></a:spcBef>'
        '<a:spcAft><a:spcPct val="0"/></a:spcAft><a:buClr><a:srgbClr val="E5182F"/></a:buClr>'
        '<a:buFontTx/><a:buAutoNum type="arabicPeriod"/><a:defRPr/></a:pPr>'
        f'<a:r><a:rPr lang="en-US" altLang="zh-CN" sz="{sz}" kern="0">'
        '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>'
        '<a:cs typeface="Arial" panose="020B0604020202020204" pitchFamily="34" charset="0"/>'
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p>'
    )

def qspacer(sz=1000):
    return ('<a:p><a:pPr fontAlgn="base"><a:lnSpc><a:spcPct val="90000"/></a:lnSpc>'
            '<a:spcAft><a:spcPct val="0"/></a:spcAft></a:pPr>'
            f'<a:endParaRPr lang="en-US" sz="{sz}"/></a:p>')

def qhead(text, sz=1000):
    return (
        '<a:p><a:pPr marL="228600" indent="-228600" fontAlgn="base">'
        '<a:lnSpc><a:spcPct val="90000"/></a:lnSpc><a:spcBef><a:spcPct val="20000"/></a:spcBef>'
        '<a:spcAft><a:spcPct val="0"/></a:spcAft><a:buClr><a:srgbClr val="E5182F"/></a:buClr>'
        '<a:buFont typeface="Wingdings" pitchFamily="2" charset="2"/><a:buNone/><a:defRPr/></a:pPr>'
        f'<a:r><a:rPr lang="en-US" altLang="zh-CN" sz="{sz}" b="1" i="1" u="sng" kern="0">'
        '<a:solidFill><a:srgbClr val="000000"/></a:solidFill>' + CG +
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p>'
    )

def title_para(text, sz=1600):
    return (
        '<a:p><a:pPr fontAlgn="base"><a:lnSpc><a:spcPct val="110000"/></a:lnSpc>'
        '<a:spcAft><a:spcPct val="0"/></a:spcAft><a:buClr><a:srgbClr val="3367CD"/></a:buClr></a:pPr>'
        f'<a:r><a:rPr lang="en-US" sz="{sz}" i="1">'
        '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>' + CG +
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p>'
    )

# ---------- surgical edits ----------

def find_sp(x, name):
    m = re.search(r'<p:sp>(?:(?!</p:sp>).)*?name="' + re.escape(name) + r'".*?</p:sp>', x, re.S)
    if not m:
        raise SystemExit('shape not found: ' + name)
    return m

def set_body(x, name, paras):
    m = find_sp(x, name)
    blk = m.group(0)
    bm = re.search(r'(<p:txBody>.*?</a:lstStyle>)(.*?)(</p:txBody>)', blk, re.S)
    if not bm:  # no lstStyle -> bodyPr only
        bm = re.search(r'(<p:txBody><a:bodyPr[^>]*/><a:lstStyle/>)(.*?)(</p:txBody>)', blk, re.S)
    new_blk = blk[:bm.start()] + bm.group(1) + ''.join(paras) + bm.group(3) + blk[bm.end():]
    return x[:m.start()] + new_blk + x[m.end():]

def set_xfrm(x, name, xi, yi, wi, hi):
    m = find_sp(x, name)
    blk = m.group(0)
    new = ('<a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/>'
           % (round(xi * E), round(yi * E), round(wi * E), round(hi * E)))
    blk2 = re.sub(r'<a:off x="\d+" y="\d+"/><a:ext cx="\d+" cy="\d+"/>', new, blk, count=1)
    return x[:m.start()] + blk2 + x[m.end():]

def drop_sp(x, name):
    m = find_sp(x, name)
    return x[:m.start()] + x[m.end():]

def drop_pic(x):
    m = re.search(r'<p:pic>.*?</p:pic>', x, re.S)
    return x[:m.start()] + x[m.end():]

# ---------- new shapes: photo frames + captions ----------

def frame(sid, name, xi, yi, wi, hi, label):
    """Dashed placeholder frame with a centred caption of what image belongs here."""
    lines = label.split('\n')
    paras = ''.join(
        '<a:p><a:pPr algn="ctr"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc></a:pPr>'
        f'<a:r><a:rPr lang="en-US" sz="900" b="{1 if i == 0 else 0}">'
        '<a:solidFill><a:srgbClr val="7F7F7F"/></a:solidFill>' + CG +
        f'</a:rPr><a:t>{esc(t)}</a:t></a:r></a:p>'
        for i, t in enumerate(lines)
    )
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        '<p:spPr><a:xfrm>'
        f'<a:off x="{round(xi*E)}" y="{round(yi*E)}"/><a:ext cx="{round(wi*E)}" cy="{round(hi*E)}"/>'
        '</a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        '<a:solidFill><a:srgbClr val="F2F2F2"/></a:solidFill>'
        '<a:ln w="12700"><a:solidFill><a:srgbClr val="A6A6A6"/></a:solidFill>'
        '<a:prstDash val="dash"/></a:ln></p:spPr>'
        '<p:txBody><a:bodyPr lIns="45716" tIns="45716" rIns="45716" bIns="45716" anchor="ctr">'
        '<a:normAutofit/></a:bodyPr><a:lstStyle/>' + paras + '</p:txBody></p:sp>'
    )

def caption(sid, name, xi, yi, wi, hi, text):
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
        '<p:spPr><a:xfrm>'
        f'<a:off x="{round(xi*E)}" y="{round(yi*E)}"/><a:ext cx="{round(wi*E)}" cy="{round(hi*E)}"/>'
        '</a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/>'
        '<a:ln><a:noFill/></a:ln></p:spPr>'
        '<p:txBody><a:bodyPr lIns="18288" tIns="18288" rIns="18288" bIns="18288" anchor="t"/>'
        '<a:lstStyle/>'
        '<a:p><a:pPr algn="ctr"><a:lnSpc><a:spcPct val="100000"/></a:lnSpc></a:pPr>'
        '<a:r><a:rPr lang="en-US" sz="800" i="1">'
        '<a:solidFill><a:srgbClr val="404040"/></a:solidFill>' + CG +
        f'</a:rPr><a:t>{esc(text)}</a:t></a:r></a:p></p:txBody></p:sp>'
    )

def picture(sid, name, rid, xi, yi, wi, hi):
    return (
        f'<p:pic><p:nvPicPr><p:cNvPr id="{sid}" name="{name}"/>'
        '<p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
        f'<p:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
        '<p:spPr><a:xfrm>'
        f'<a:off x="{round(xi*E)}" y="{round(yi*E)}"/><a:ext cx="{round(wi*E)}" cy="{round(hi*E)}"/>'
        '</a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        '<a:ln w="9525"><a:solidFill><a:srgbClr val="808080"/></a:solidFill></a:ln>'
        '</p:spPr></p:pic>'
    )

def add_image(src, media_name, rid):
    """Copy an image into the package and register its slide relationship."""
    shutil.copy(src, os.path.join(WORK, 'ppt', 'media', media_name))
    rels_path = os.path.join(WORK, 'ppt', 'slides', '_rels', 'slide1.xml.rels')
    r = open(rels_path).read()
    ext = os.path.splitext(media_name)[1].lower()
    rel = (f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/'
           f'officeDocument/2006/relationships/image" Target="../media/{media_name}"/>')
    open(rels_path, 'w').write(r.replace('</Relationships>', rel + '</Relationships>'))
    # make sure the extension is declared in [Content_Types].xml
    ct_path = os.path.join(WORK, '[Content_Types].xml')
    ct = open(ct_path).read()
    if f'Extension="{ext[1:]}"' not in ct:
        mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png'}[ext[1:]]
        ct = ct.replace('<Types ', '<Types ', 1)
        ct = ct.replace('</Types>',
                        f'<Default Extension="{ext[1:]}" ContentType="{mime}"/></Types>')
        open(ct_path, 'w').write(ct)

# ================================ CONTENT ================================

if os.path.isdir(WORK):
    shutil.rmtree(WORK)
with zipfile.ZipFile(TEMPLATE) as z:
    z.extractall(WORK)

x = open(SRC).read()

# --- strip the example artefacts ---
x = drop_sp(x, 'TextBox 12')   # red "EXAMPLE" badge
x = drop_sp(x, 'Rectangle 1')  # empty overlay that sat on the example photo
x = drop_pic(x)                # the wastewater photo

# --- header ---
x = set_body(x, 'Text Box 4', [
    title_para('Gantry Slip and Trip – Conveyor Step-Over Fall', 1600),
    title_para('August 4, 2026 – Sumter, South Carolina – Fabrication / Copper, A Shift', 1300),
    title_para('Plant Manager: Stephen Krajcarski (Interim), EHS Site Contact: Charlie Ball', 1300),
])

# --- incident description ---
x = set_xfrm(x, 'TextBox 6', 4.42, 1.22, 5.42, 1.05)
x = set_body(x, 'TextBox 6', [
    head('Incident description:'),
    para('An A-shift operator pushed a load back on the Gantry 2 conveyor behind EHRT 2, saw that '
         'interleaving paper had fallen from the stack, and stepped over the conveyor to get it. '
         'Stepping back over the outside conveyor he tripped and fell head-first, striking his face. '
         'Lip laceration and sutures; returned next shift, no restrictions. Recordable injury.'),
])

# --- findings + root causes ---
x = set_xfrm(x, 'TextBox 7', 4.42, 2.30, 5.42, 3.20)
x = set_body(x, 'TextBox 7', [
    head('Investigation Findings:'),
    num('Four conveyors meet at Gantry 2 — a middle face and two outside faces, all free rollers. '
        'Stacks are pushed back by hand from inside the aisle.'),
    num('Paper fell between the rollers. He entered the aisle to get it, then crossed the outside '
        'conveyor to exit rather than walking back out. His foot caught; the fall was head-first '
        'with no hands out.'),
    num('Area scanners stop the gantry when someone enters the zone, but are off during loading — '
        'the aisle was unguarded.'),
    num('Interleaving paper is a supplier fix for water spotting; packaging has drifted and it now '
        'arrives loose. Receiving inspection is written into the method sheet but is not performed.'),
    head('Root Causes and Management System Gaps:'),
    num('Poor Work Practice; Eyes or Mind Not on Task.', lead='Immediate cause — ', start=1),
    num('nothing prohibits crossing a conveyor on foot, and free '
        'rollers make hand push-back the only way to return a stack.',
        lead='(Improved) processes have not been created — '),
    num('area scanners guard the aisle only while the gantry runs, not while it is being loaded.',
        lead='Processes not (continuously) monitored for effectiveness — '),
    num('receiving inspection is documented but not performed, so '
        'packaging drift puts loose paper into the machine aisle.',
        lead='Processes have not been created — '),
])

# --- containment + corrective ---
x = set_xfrm(x, 'TextBox 11', 4.42, 5.53, 5.42, 1.50)
x = set_body(x, 'TextBox 11', [
    head('Interim Containment Actions:'),
    num('STOP / DO NOT ENTER floor signage at both ends of the gantry aisles.'),
    num('Safety stand-downs held with the affected shifts.'),
    num('Expandable barrier gate staged across the aisle opening.'),
    head('Preventive & Corrective Actions:'),
    num('Method now in force — push from the middle face only and exit the way you came in. Do not '
        'cross a conveyor on foot.', start=1),
    num('6-inch and 8-inch copper is a two-person push, one per outside face.'),
    num('Do-not-enter signage made permanent at both ends of each aisle.'),
])

# --- transferability ---
x = set_xfrm(x, 'Rectangle 2', 0.15, 4.78, 4.08, 2.22)
x = set_body(x, 'Rectangle 2', [
    qhead('How does this incident apply to you?'),
    qspacer(),
    qnum('Does anyone in your area cross a conveyor, rack, or other structure on foot to reach '
         'material or debris? Gantries 1 and 3 have the same layout, the same free rollers and the '
         'same hand push-back.'),
    qnum('Are your area scanners or light curtains active during loading and setup, or only while '
         'the machine is running?'),
    qnum('Does packaging debris — paper, plastic, banding — end up inside your machine aisles, and '
         'can anyone retrieve it without entering?'),
    qnum('Is there a written, trained method for returning material that does not require entering '
         'the aisle?'),
])

# --- photo panels ---
PW, PH = 1.92, 2.56
SLOTS = {'A': (0.20, 1.72), 'B': (2.23, 1.72)}
PLACEHOLDER = {
    'A': 'PHOTO A\nPath taken — aisle\nand outside conveyor\ncrossed on foot',
    'B': 'PHOTO B\nContainment — STOP /\nDO NOT ENTER floor\nsignage in the aisle',
}
panels = []
for i, slot in enumerate(('A', 'B')):
    px, py = SLOTS[slot]
    src = PHOTOS[slot]
    if os.path.exists(src):
        media = f'gantry-photo-{slot.lower()}{os.path.splitext(src)[1].lower()}'
        rid = f'rIdPhoto{slot}'
        add_image(src, media, rid)
        panels.append(picture(90 + i, f'Photo {slot}', rid, px, py, PW, PH))
        print(f'  photo {slot}: embedded {os.path.basename(src)}')
    else:
        panels.append(frame(90 + i, f'Photo {slot}', px, py, PW, PH, PLACEHOLDER[slot]))
        print(f'  photo {slot}: PLACEHOLDER (drop {src} to embed)')

new_shapes = (
    *panels,
    caption(92, 'Caption A', 0.20, 4.30, PW, 0.42,
            'Where he crossed. Exit was over the outside conveyor.'),
    caption(93, 'Caption B', 2.23, 4.30, PW, 0.42,
            'Containment: aisles closed, signage both ends.'),
)
x = x.replace('</p:spTree>', ''.join(new_shapes) + '</p:spTree>')

open(SRC, 'w').write(x)

if os.path.exists(OUT):
    os.remove(OUT)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(WORK):
        for f in files:
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, WORK))
shutil.rmtree(WORK)
print('wrote ' + OUT)
