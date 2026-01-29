from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_VERTICAL_ANCHOR
from pptx.dml.color import RGBColor

# =========================
# Presentation + Theme
# =========================
prs = Presentation()
prs.slide_width = Inches(10)
prs.slide_height = Inches(7.5)

ORANGE = RGBColor(255, 107, 53)  # #FF6B35
BLUE = RGBColor(78, 205, 196)    # #4ECDC4
DARK = RGBColor(45, 45, 45)
LIGHT = RGBColor(245, 245, 245)
WHITE = RGBColor(255, 255, 255)


def _set_solid_background(slide, rgb):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = rgb


def _add_title_bar(slide, title, color):
    title_box = slide.shapes.add_textbox(Inches(0), Inches(0), Inches(10), Inches(1))
    title_box.fill.solid()
    title_box.fill.fore_color.rgb = color
    tf = title_box.text_frame
    tf.clear()
    tf.text = title
    tf.margin_left = Inches(0.35)
    tf.vertical_anchor = MSO_VERTICAL_ANCHOR.MIDDLE

    p = tf.paragraphs[0]
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.LEFT


def _add_tag(slide, left, top, text, color=BLUE):
    box = slide.shapes.add_textbox(left, top, Inches(3.5), Inches(0.45))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    tf = box.text_frame
    tf.clear()
    tf.text = text
    tf.vertical_anchor = MSO_VERTICAL_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER


def add_title_slide(prs, title, subtitle, footer="Spanish • Grammar • Present Tense"):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    _set_solid_background(slide, ORANGE)

    # Title
    t = slide.shapes.add_textbox(Inches(0.6), Inches(2.15), Inches(8.8), Inches(1.2))
    tf = t.text_frame
    tf.clear()
    tf.text = title
    p = tf.paragraphs[0]
    p.font.size = Pt(52)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER

    # Subtitle
    s = slide.shapes.add_textbox(Inches(1.0), Inches(3.55), Inches(8.0), Inches(0.9))
    sf = s.text_frame
    sf.clear()
    sf.text = subtitle
    sp = sf.paragraphs[0]
    sp.font.size = Pt(28)
    sp.font.color.rgb = WHITE
    sp.alignment = PP_ALIGN.CENTER

    # Footer
    f = slide.shapes.add_textbox(Inches(0.6), Inches(6.9), Inches(8.8), Inches(0.4))
    ff = f.text_frame
    ff.clear()
    ff.text = footer
    fp = ff.paragraphs[0]
    fp.font.size = Pt(14)
    fp.font.color.rgb = WHITE
    fp.alignment = PP_ALIGN.CENTER

    return slide


def add_bullets_slide(prs, title, bullets, color=BLUE, time_text=None, kagan_text=None):
    """bullets: list[str | tuple[int, str]] where tuple is (level, text)."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _add_title_bar(slide, title, color)

    if time_text:
        _add_tag(slide, Inches(6.3), Inches(0.25), f"Time: {time_text}", ORANGE)
    if kagan_text:
        _add_tag(slide, Inches(0.35), Inches(1.1), f"Kagan: {kagan_text}", BLUE)

    box = slide.shapes.add_textbox(Inches(0.7), Inches(1.35), Inches(8.9), Inches(5.9))
    tf = box.text_frame
    tf.word_wrap = True
    tf.clear()

    first = True
    for item in bullets:
        level = 0
        text = item
        if isinstance(item, tuple) and len(item) == 2:
            level, text = item

        if first:
            tf.text = text
            p = tf.paragraphs[0]
            first = False
        else:
            p = tf.add_paragraph()
            p.text = text

        p.level = int(level)
        p.font.size = Pt(26 if level == 0 else 22)
        p.font.color.rgb = DARK
        p.space_after = Pt(10)

    return slide


def add_table_slide(prs, title, headers, rows, color=ORANGE, time_text=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _add_title_bar(slide, title, color)

    if time_text:
        _add_tag(slide, Inches(6.3), Inches(0.25), f"Time: {time_text}", BLUE)

    n_rows = len(rows) + 1
    n_cols = len(headers)
    table = slide.shapes.add_table(n_rows, n_cols, Inches(0.7), Inches(1.6), Inches(8.6), Inches(4.9)).table

    # Header
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = color
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER

    # Rows
    for r, row in enumerate(rows, start=1):
        for c, txt in enumerate(row):
            cell = table.cell(r, c)
            cell.text = txt
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(20)
            p.font.color.rgb = DARK
            p.alignment = PP_ALIGN.CENTER
            if r % 2 == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT

    return slide


def add_two_column_examples(prs, title, left_title, left_items, right_title, right_items, color=BLUE, time_text=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _add_title_bar(slide, title, color)
    if time_text:
        _add_tag(slide, Inches(6.3), Inches(0.25), f"Time: {time_text}", ORANGE)

    # Left box
    left = slide.shapes.add_textbox(Inches(0.6), Inches(1.4), Inches(4.45), Inches(5.7))
    left.fill.solid()
    left.fill.fore_color.rgb = LIGHT
    ltf = left.text_frame
    ltf.clear()
    ltf.word_wrap = True

    ltf.text = left_title
    p0 = ltf.paragraphs[0]
    p0.font.size = Pt(26)
    p0.font.bold = True
    p0.font.color.rgb = DARK
    p0.alignment = PP_ALIGN.CENTER

    for t in left_items:
        p = ltf.add_paragraph()
        p.text = t
        p.font.size = Pt(20)
        p.font.color.rgb = DARK
        p.space_after = Pt(6)

    # Right box
    right = slide.shapes.add_textbox(Inches(4.95), Inches(1.4), Inches(4.45), Inches(5.7))
    right.fill.solid()
    right.fill.fore_color.rgb = LIGHT
    rtf = right.text_frame
    rtf.clear()
    rtf.word_wrap = True

    rtf.text = right_title
    p1 = rtf.paragraphs[0]
    p1.font.size = Pt(26)
    p1.font.bold = True
    p1.font.color.rgb = DARK
    p1.alignment = PP_ALIGN.CENTER

    for t in right_items:
        p = rtf.add_paragraph()
        p.text = t
        p.font.size = Pt(20)
        p.font.color.rgb = DARK
        p.space_after = Pt(6)

    return slide


# =========================
# Deck Content (Middle School, Chunked, Kagan)
# =========================

# Slide 1
add_title_slide(
    prs,
    "O → UE Stem-Changing Verbs",
    "Present tense • Boot verbs • Quick speaking practice",
    footer="Goal: use o→ue verbs in real sentences"
)

# Slide 2
add_bullets_slide(
    prs,
    "Targets + Success Criteria",
    [
        "I can explain what a stem-change is (o→ue).",
        "I can conjugate an o→ue verb in the present tense.",
        "I can use an o→ue verb in a sentence about real life.",
        (0, "Success looks like:"),
        (1, "I change o→ue in the ‘boot’ (yo/tú/él/ella/ud./ellos/uds.)."),
        (1, "I do NOT change nosotros or vosotros."),
        (1, "My verb matches the subject."),
    ],
    color=BLUE,
    time_text="2 min"
)

# Slide 3
add_bullets_slide(
    prs,
    "Agenda (50 minutes)",
    [
        "Do Now + check: 5 min",
        "Mini-lesson: what changes + where it changes: 10 min",
        "Guided practice (Kagan): 6 min",
        "Quiz-Quiz-Trade (Kagan): 8 min",
        "Stand Up–Hand Up–Pair Up speaking (Kagan): 6 min",
        "Common errors: 2 min",
        "Exit ticket: 4 min",
        "Wrap-up: 1 min",
    ],
    color=ORANGE,
    time_text="1 min"
)

# Slide 4
add_bullets_slide(
    prs,
    "Do Now (Silent) → Then Pair Check",
    [
        "Write the present tense endings for -AR, -ER, -IR.",
        "Then conjugate: HABLAR (yo, tú, nosotros).",
        "Then: COMER (yo, él, ellos).",
        "Then: VIVIR (tú, nosotros, vosotros).",
        (0, "Pair check (quiet voices):"),
        (1, "Partner A reads answers; Partner B checks + coaches."),
        (1, "Fix 1 thing with a different color."),
    ],
    color=BLUE,
    time_text="5 min",
    kagan_text="RallyCoach (mini)"
)

# Slide 5
add_bullets_slide(
    prs,
    "What is a stem-change?",
    [
        "Some verbs change the vowel in the stem (the ‘middle’).",
        "Today’s change: o → ue",
        "It happens in the present tense for most subjects.",
        (0, "Quick breakdown:"),
        (1, "Infinitive: dORMir (to sleep)"),
        (1, "Stem: dORM-"),
        (1, "Ending: -ir"),
    ],
    color=ORANGE,
    time_text="3 min"
)

# Slide 6
add_bullets_slide(
    prs,
    "The Rule (Boot Verb!)",
    [
        "Change o → ue in: yo, tú, él/ella/ud., ellos/ellas/uds.",
        "NO change in: nosotros, vosotros",
        "This makes a ‘boot’ shape on the chart.",
        (0, "Say it with me:"),
        (1, "Boot = YES change"),
        (1, "Nosotros/Vosotros = NO change"),
    ],
    color=BLUE,
    time_text="4 min"
)

# Slide 7
add_table_slide(
    prs,
    "Model Verb: DORMIR (to sleep)",
    ["Subject", "Conjugation", "Where is o→ue?"],
    [
        ["yo", "duermo", "YES"],
        ["tú", "duermes", "YES"],
        ["él/ella/ud.", "duerme", "YES"],
        ["nosotros", "dormimos", "NO"],
        ["vosotros", "dormís", "NO"],
        ["ellos/ellas/uds.", "duermen", "YES"],
    ],
    color=ORANGE,
    time_text="3 min"
)

# Slide 8
add_two_column_examples(
    prs,
    "Try It: Spot the Change",
    "These should change (boot)",
    [
        "yo ____ (poder) → yo puedo",
        "tú ____ (volver) → tú vuelves",
        "ellos ____ (contar) → ellos cuentan",
    ],
    "These should NOT change",
    [
        "nosotros ____ (poder) → nosotros podemos",
        "vosotros ____ (volver) → vosotros volvéis",
        "nosotros ____ (dormir) → nosotros dormimos",
    ],
    color=BLUE,
    time_text="3 min"
)

# Slide 9
add_bullets_slide(
    prs,
    "Kagan: Think–Pair–Share (Quick Check)",
    [
        "THINK (30 sec): Why don’t nosotros/vosotros change?",
        "PAIR (1 min): Compare answers. Make 1 sentence together.",
        "SHARE (1 min): Be ready if called.",
        (0, "Sentence frame:"),
        (1, "Nosotros ______ porque ______."),
    ],
    color=ORANGE,
    time_text="3 min",
    kagan_text="Think–Pair–Share"
)

# Slide 10
add_bullets_slide(
    prs,
    "Guided Practice (Kagan: RallyRobin)",
    [
        "Partner A says the conjugation. Partner B says a sentence.",
        "Switch roles every card.",
        (0, "Use these verbs (o→ue):"),
        (1, "poder (to be able to)"),
        (1, "volver (to return)"),
        (1, "contar (to count / to tell)"),
        (1, "encontrar (to find)"),
        (1, "almorzar (to eat lunch)"),
        (0, "Sentence frames:"),
        (1, "Yo ______ en la escuela."),
        (1, "Mis amigos ______ los días."),
        (1, "Nosotros ______ la tarea."),
    ],
    color=BLUE,
    time_text="6 min",
    kagan_text="RallyRobin"
)

# Slide 11
add_bullets_slide(
    prs,
    "Kagan: Quiz–Quiz–Trade",
    [
        "Stand up with a card.",
        "Find a partner. Greet.",
        "Quiz: Partner A asks; Partner B answers.",
        "Coach: If wrong, help fix it (kind + specific).",
        "Switch roles.",
        "Trade cards. Thank your partner. Find a new partner.",
        (0, "Card prompts (examples):"),
        (1, "Conjugate: poder (tú)"),
        (1, "Conjugate: volver (nosotros)"),
        (1, "Make a sentence with: encontrar (yo)"),
    ],
    color=ORANGE,
    time_text="8 min",
    kagan_text="Quiz–Quiz–Trade"
)

# Slide 12
add_bullets_slide(
    prs,
    "Kagan: Stand Up–Hand Up–Pair Up (Speaking)",
    [
        "Stand up. Hand up. Pair up.",
        "Partner A: Ask the question. Partner B: Answer in a full sentence.",
        "Switch. Then find a new partner.",
        (0, "Questions:"),
        (1, "¿A qué hora duermes?"),
        (1, "¿Puedes ayudar en casa?"),
        (1, "¿Almuerzas en la escuela o en casa?"),
        (1, "¿Encuentras tu teléfono fácilmente?"),
        (0, "Answer frames:"),
        (1, "Yo ______ a las _____."),
        (1, "Sí, yo puedo ______ / No, no puedo ______."),
    ],
    color=BLUE,
    time_text="6 min",
    kagan_text="Stand Up–Hand Up–Pair Up"
)

# Slide 13
add_bullets_slide(
    prs,
    "Common Errors (Fix It Fast)",
    [
        "❌ nosotros *pue* d emos → ✅ nosotros podemos (NO change)",
        "❌ yo dormo → ✅ yo duermo (o→ue)",
        "❌ vosotros vuelves → ✅ vosotros volvéis (match subject)",
        (0, "Self-check:"),
        (1, "Did I keep the right ending? (-o, -as, -a, -amos, -áis/-éis, -an)"),
        (1, "Did I change ONLY the stem vowel (o→ue)?"),
    ],
    color=ORANGE,
    time_text="2 min"
)

# Slide 14
add_bullets_slide(
    prs,
    "Exit Ticket (Independent)",
    [
        "1) Conjugate: poder (él) → ______",
        "2) Conjugate: dormir (nosotros) → ______",
        "3) Conjugate: volver (ellos) → ______",
        "4) Write 1 full sentence with an o→ue verb (boot form).",
        "5) Circle: Does nosotros change? YES / NO",
        (0, "Challenge:"),
        (1, "Write a 2-sentence mini-dialog using: puedo + duermes"),
    ],
    color=BLUE,
    time_text="4 min"
)

# Slide 15
add_bullets_slide(
    prs,
    "Wrap-Up",
    [
        "Turn and tell: ‘The rule is…’",
        "Homework/extension: pick 3 o→ue verbs and write 6 sentences (2 boot, 1 nosotros for each).",
        "Tomorrow: e→ie stem-changers!",
    ],
    color=ORANGE,
    time_text="1 min",
    kagan_text="Timed Pair Share (30/30)"
)

# =========================
# Save
# =========================
out_path_workspace = "/workspace/o_to_ue_stem_changing_verbs_lesson.pptx"
out_path_tmp = "/tmp/o_to_ue_stem_changing_verbs_lesson.pptx"
prs.save(out_path_workspace)
prs.save(out_path_tmp)

print("✅ Presentation created successfully!")
print(f"📥 Saved to: {out_path_workspace}")
print(f"📥 Backup saved to: {out_path_tmp}")
print(f"📊 Slides generated: {len(prs.slides)}")
