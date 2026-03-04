from pypdf import PdfReader
p = r"c:/Proyectos/63.-LitioMX/diagramas/D05.F7_2.A3.8 - Registro de Muestras V2 - Formularios de Google.pdf"
r = PdfReader(p)
print("PAGES", len(r.pages))
for i, pg in enumerate(r.pages, 1):
    t = (pg.extract_text() or "").strip()
    print(f"\n--- PAGE {i} ---\n" + t[:12000])
