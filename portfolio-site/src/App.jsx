import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Download,
  Loader2,
  Mail,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

const STEPS = ["Basics", "Skills", "Projects", "Education & links", "Review"];

const emptyProject = () => ({
  id: Math.random().toString(36).slice(2),
  title: "",
  description: "",
  tech: "",
  link: "",
});

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function PortfolioBuilder() {
  const [step, setStep] = useState(0);
  const [accent, setAccent] = useState("amber");
  const [data, setData] = useState({
    name: "",
    targetRole: "",
    about: "",
    skills: "",
    projects: [emptyProject()],
    school: "",
    degree: "",
    gradYear: "",
    email: "",
    linkedin: "",
    github: "",
    website: "",
  });
  const [polished, setPolished] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => {
    setData((d) => ({ ...d, [field]: value }));
    setPolished(null);
  };

  const updateProject = (id, field, value) => {
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
    setPolished(null);
  };

  const addProject = () =>
    setData((d) => (d.projects.length >= 5 ? d : { ...d, projects: [...d.projects, emptyProject()] }));

  const removeProject = (id) =>
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  const skillList = data.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const accentHex = accent === "teal" ? "#2F6F62" : "#D8A331";

  async function polishWithAI() {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: data.name,
        targetRole: data.targetRole,
        about: data.about,
        skills: skillList,
        education: data.school
          ? { school: data.school, degree: data.degree, gradYear: data.gradYear }
          : null,
        projects: data.projects.map((p) => ({
          title: p.title,
          description: p.description,
          tech: p.tech,
        })),
      };
      const res = await fetch("/.netlify/functions/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const textBlock = (json.content || []).find((b) => b.type === "text");
      if (!textBlock) throw new Error("empty response");
      const clean = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setPolished(parsed);
    } catch (e) {
      setError("Couldn't polish that just now. Your drafts below are untouched — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function buildStaticHTML() {
    const tagline = escapeHtml(polished?.tagline || data.targetRole || "");
    const about = escapeHtml(
      polished?.about || data.about || "Write a little about yourself in the form to see it here."
    );
    const projects = data.projects
      .filter((p) => p.title || p.description)
      .map((p, i) => ({
        title: escapeHtml(p.title || `Project ${i + 1}`),
        description: escapeHtml(polished?.projects?.[i]?.description || p.description || ""),
        tech: escapeHtml(p.tech || ""),
        link: p.link || "",
      }));
    const linksHtml = [
      data.email && `<a href="mailto:${escapeHtml(data.email)}">Email</a>`,
      data.linkedin && `<a href="${escapeHtml(data.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>`,
      data.github && `<a href="${escapeHtml(data.github)}" target="_blank" rel="noreferrer">GitHub</a>`,
      data.website && `<a href="${escapeHtml(data.website)}" target="_blank" rel="noreferrer">Website</a>`,
    ]
      .filter(Boolean)
      .join("\n");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(data.name || "Portfolio")}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { --accent: ${accentHex}; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1B2430; background: #FFFFFF; line-height: 1.55; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 64px 24px 80px; }
  h1 { font-family: Georgia, "Iowan Old Style", "Times New Roman", serif; font-size: 42px; margin: 0 0 8px; }
  .tagline { color: var(--accent); font-size: 18px; margin: 0 0 28px; }
  .about { font-size: 17px; max-width: 60ch; margin: 0 0 36px; color: #333c47; }
  h2 { font-family: Georgia, serif; font-size: 20px; border-bottom: 2px solid var(--accent); display: inline-block; padding-bottom: 4px; margin: 40px 0 18px; }
  .skills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; list-style: none; }
  .skills li { border: 1px solid rgba(20,20,20,.15); border-radius: 6px; padding: 6px 12px; font-size: 14px; }
  .project { padding: 18px 0; border-top: 1px solid rgba(20,20,20,.1); }
  .project:last-child { border-bottom: 1px solid rgba(20,20,20,.1); }
  .project h3 { margin: 0 0 6px; font-size: 18px; }
  .project p { margin: 0 0 6px; color: #333c47; }
  .project .tech { font-size: 13px; color: #6b7280; }
  .project a { color: var(--accent); font-size: 14px; }
  .edu { color: #333c47; }
  .links { display: flex; gap: 18px; margin-top: 14px; }
  .links a { color: var(--accent); text-decoration: none; font-weight: 600; }
  .links a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(data.name || "Your Name")}</h1>
    <p class="tagline">${tagline}</p>
    <p class="about">${about}</p>

    ${skillList.length ? `<h2>Skills</h2><ul class="skills">${skillList.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : ""}

    ${projects.length ? `<h2>Projects</h2>${projects
      .map(
        (p) => `<div class="project">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${p.tech ? `<p class="tech">${p.tech}</p>` : ""}
        ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noreferrer">View project</a>` : ""}
      </div>`
      )
      .join("")}` : ""}

    ${
      data.school
        ? `<h2>Education</h2><p class="edu">${escapeHtml(
            polished?.education ||
              `${data.degree ? data.degree + ", " : ""}${data.school}${data.gradYear ? " — " + data.gradYear : ""}`
          )}</p>`
        : ""
    }

    ${linksHtml ? `<div class="links">${linksHtml}</div>` : ""}
  </div>
</body>
</html>`;
  }

  function downloadHTML() {
    const html = buildStaticHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.name || "portfolio").toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canContinue = () => {
    if (step === 0) return data.name.trim().length > 0;
    return true;
  };

  return (
    <div className="pb-app">
      <style>{`
        .pb-app {
          --ink: #12161F;
          --panel: #1A2030;
          --panel-soft: #212840;
          --paper: #FFFFFF;
          --text-hi: #F2F1EC;
          --text-lo: #9198A8;
          --text-ink: #1B2430;
          --text-ink-soft: #5B6472;
          --line: rgba(255,255,255,0.09);
          --line-paper: rgba(20,20,20,0.1);
          --accent: ${accentHex};
          background: var(--ink);
          color: var(--text-hi);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          display: grid;
          grid-template-columns: 380px 1fr;
          min-height: 100%;
          border-radius: 12px;
          overflow: hidden;
        }
        @media (max-width: 860px) {
          .pb-app { grid-template-columns: 1fr; }
        }
        .pb-form {
          padding: 28px 26px 32px;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
        }
        .pb-title { font-size: 20px; font-weight: 600; margin: 0 0 2px; }
        .pb-subtitle { font-size: 13px; color: var(--text-lo); margin: 0 0 22px; }
        .pb-steps { display: flex; flex-direction: column; gap: 2px; margin-bottom: 22px; }
        .pb-step-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 8px; border-radius: 8px; cursor: pointer;
          font-size: 13.5px; color: var(--text-lo);
        }
        .pb-step-row.active { background: var(--panel-soft); color: var(--text-hi); }
        .pb-step-num {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; border: 1px solid currentColor; flex-shrink: 0;
        }
        .pb-step-row.active .pb-step-num { background: var(--accent); border-color: var(--accent); color: var(--ink); }
        .pb-field { margin-bottom: 16px; }
        .pb-label { display: block; font-size: 12.5px; color: var(--text-lo); margin-bottom: 6px; }
        .pb-input, .pb-textarea {
          width: 100%; background: var(--panel-soft); border: 1px solid var(--line);
          color: var(--text-hi); border-radius: 8px; padding: 10px 12px; font-size: 14px;
          font-family: inherit; resize: vertical;
        }
        .pb-input:focus, .pb-textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
        .pb-hint { font-size: 11.5px; color: var(--text-lo); margin-top: 5px; }
        .pb-project-card {
          background: var(--panel-soft); border: 1px solid var(--line); border-radius: 10px;
          padding: 14px; margin-bottom: 12px; position: relative;
        }
        .pb-project-remove {
          position: absolute; top: 10px; right: 10px; background: none; border: none;
          color: var(--text-lo); cursor: pointer; padding: 4px;
        }
        .pb-project-remove:hover { color: #E5645A; }
        .pb-add-btn {
          display: flex; align-items: center; gap: 6px; background: none;
          border: 1px dashed var(--line); color: var(--text-lo); border-radius: 8px;
          padding: 10px; width: 100%; justify-content: center; cursor: pointer; font-size: 13px;
        }
        .pb-add-btn:hover { border-color: var(--accent); color: var(--text-hi); }
        .pb-nav { display: flex; justify-content: space-between; margin-top: auto; padding-top: 18px; gap: 10px; }
        .pb-btn {
          display: flex; align-items: center; gap: 6px; border-radius: 8px; padding: 9px 16px;
          font-size: 13.5px; font-weight: 600; cursor: pointer; border: none;
        }
        .pb-btn-primary { background: var(--accent); color: var(--ink); }
        .pb-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .pb-btn-ghost { background: none; color: var(--text-lo); border: 1px solid var(--line); }
        .pb-btn-ghost:hover { color: var(--text-hi); }
        .pb-ai-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, var(--accent), #f0c869);
          color: var(--ink); border: none; border-radius: 8px; padding: 12px; width: 100%;
          font-weight: 700; font-size: 14px; cursor: pointer; margin-bottom: 12px;
        }
        .pb-ai-btn:disabled { opacity: 0.6; cursor: wait; }
        .pb-error { font-size: 12.5px; color: #E5645A; margin-bottom: 10px; }
        .pb-preview-pane { background: #0E1219; display: flex; flex-direction: column; min-height: 560px; }
        .pb-preview-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 22px; border-bottom: 1px solid var(--line);
        }
        .pb-swatches { display: flex; gap: 8px; align-items: center; }
        .pb-swatch { width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
        .pb-swatch.selected { border-color: var(--text-hi); }
        .pb-status { font-size: 12px; color: var(--text-lo); }
        .pb-status.polished { color: var(--accent); }
        .pb-download {
          display: flex; align-items: center; gap: 6px; background: var(--panel-soft);
          border: 1px solid var(--line); color: var(--text-hi); border-radius: 7px;
          padding: 7px 12px; font-size: 12.5px; cursor: pointer;
        }
        .pb-download:hover { border-color: var(--accent); }
        .pb-canvas-scroll { flex: 1; overflow-y: auto; padding: 32px; }
        .pb-page {
          background: var(--paper); color: var(--text-ink); border-radius: 8px;
          max-width: 620px; margin: 0 auto; padding: 48px 44px; min-height: 500px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }
        .pb-page h1 {
          font-family: Georgia, "Iowan Old Style", "Times New Roman", serif;
          font-size: 34px; margin: 0 0 6px;
        }
        .pb-page .pb-tagline { color: var(--accent); font-size: 15px; margin: 0 0 20px; font-weight: 600; }
        .pb-page .pb-about { font-size: 15px; color: var(--text-ink-soft); max-width: 56ch; margin: 0 0 28px; }
        .pb-page h2 {
          font-family: Georgia, serif; font-size: 16px; border-bottom: 2px solid var(--accent);
          display: inline-block; padding-bottom: 3px; margin: 30px 0 14px;
        }
        .pb-page-skills { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 0; list-style: none; }
        .pb-page-skills li { border: 1px solid var(--line-paper); border-radius: 6px; padding: 4px 10px; font-size: 12.5px; }
        .pb-page-project { padding: 14px 0; border-top: 1px solid var(--line-paper); }
        .pb-page-project h3 { margin: 0 0 4px; font-size: 15px; }
        .pb-page-project p { margin: 0 0 4px; font-size: 13.5px; color: var(--text-ink-soft); }
        .pb-page-project .tech { font-size: 11.5px; color: #8a93a3; }
        .pb-empty { color: #9AA2AF; font-size: 13.5px; font-style: italic; }
        .pb-page-links { display: flex; gap: 14px; margin-top: 14px; }
        .pb-page-links a { color: var(--accent); font-size: 12.5px; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 4px; }
      `}</style>

      <div className="pb-form">
        <p className="pb-title">Portfolio builder</p>
        <p className="pb-subtitle">Rough notes in. A typeset page out.</p>

        <div className="pb-steps">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`pb-step-row ${i === step ? "active" : ""}`}
              onClick={() => setStep(i)}
            >
              <span className="pb-step-num">{i + 1}</span>
              {s}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <div className="pb-field">
              <label className="pb-label">Full name</label>
              <input className="pb-input" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Alex Chen" />
            </div>
            <div className="pb-field">
              <label className="pb-label">What you're applying for</label>
              <input className="pb-input" value={data.targetRole} onChange={(e) => update("targetRole", e.target.value)} placeholder="Software engineering internships" />
            </div>
            <div className="pb-field">
              <label className="pb-label">About you (rough is fine)</label>
              <textarea className="pb-textarea" rows={5} value={data.about} onChange={(e) => update("about", e.target.value)} placeholder="2nd year CS student, like building small web tools, did a hackathon, want to get better at backend stuff..." />
              <p className="pb-hint">Write it like notes to yourself — the AI polish step cleans it up later.</p>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="pb-field">
            <label className="pb-label">Skills (comma separated)</label>
            <textarea className="pb-textarea" rows={4} value={data.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Python, React, Figma, SQL, public speaking" />
            <p className="pb-hint">Mix technical and non-technical — both matter to employers.</p>
          </div>
        )}

        {step === 2 && (
          <>
            {data.projects.map((p, i) => (
              <div className="pb-project-card" key={p.id}>
                {data.projects.length > 1 && (
                  <button className="pb-project-remove" onClick={() => removeProject(p.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="pb-field">
                  <label className="pb-label">Project {i + 1} title</label>
                  <input className="pb-input" value={p.title} onChange={(e) => updateProject(p.id, "title", e.target.value)} placeholder="Campus event finder app" />
                </div>
                <div className="pb-field">
                  <label className="pb-label">What it does / what you did (rough)</label>
                  <textarea className="pb-textarea" rows={3} value={p.description} onChange={(e) => updateProject(p.id, "description", e.target.value)} placeholder="built with 2 friends, lets students find free events, i did the backend and login" />
                </div>
                <div className="pb-field">
                  <label className="pb-label">Tech used</label>
                  <input className="pb-input" value={p.tech} onChange={(e) => updateProject(p.id, "tech", e.target.value)} placeholder="React, Node, Postgres" />
                </div>
                <div className="pb-field" style={{ marginBottom: 0 }}>
                  <label className="pb-label">Link (optional)</label>
                  <input className="pb-input" value={p.link} onChange={(e) => updateProject(p.id, "link", e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>
            ))}
            {data.projects.length < 5 && (
              <button className="pb-add-btn" onClick={addProject}>
                <Plus size={14} /> Add another project
              </button>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="pb-field">
              <label className="pb-label">School</label>
              <input className="pb-input" value={data.school} onChange={(e) => update("school", e.target.value)} placeholder="University of Leeds" />
            </div>
            <div className="pb-field">
              <label className="pb-label">Degree</label>
              <input className="pb-input" value={data.degree} onChange={(e) => update("degree", e.target.value)} placeholder="BSc Computer Science" />
            </div>
            <div className="pb-field">
              <label className="pb-label">Graduation year</label>
              <input className="pb-input" value={data.gradYear} onChange={(e) => update("gradYear", e.target.value)} placeholder="2027" />
            </div>
            <div className="pb-field">
              <label className="pb-label">Email</label>
              <input className="pb-input" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="alex@email.com" />
            </div>
            <div className="pb-field">
              <label className="pb-label">LinkedIn URL</label>
              <input className="pb-input" value={data.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="pb-field">
              <label className="pb-label">GitHub URL</label>
              <input className="pb-input" value={data.github} onChange={(e) => update("github", e.target.value)} placeholder="https://github.com/..." />
            </div>
            <div className="pb-field" style={{ marginBottom: 0 }}>
              <label className="pb-label">Other website (optional)</label>
              <input className="pb-input" value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <button className="pb-ai-btn" onClick={polishWithAI} disabled={loading}>
              {loading ? <Loader2 size={16} className="pb-spin" /> : <Sparkles size={16} />}
              {loading ? "Polishing your copy..." : "Polish my copy with AI"}
            </button>
            {error && <p className="pb-error">{error}</p>}
            <p className="pb-hint" style={{ marginBottom: 16 }}>
              This rewrites your about section and project descriptions into clean, professional wording — using only what you typed in. Nothing is invented.
            </p>
            {polished && (
              <p className="pb-hint" style={{ color: "var(--accent)" }}>
                Polished. Check the preview — you can still edit your drafts on earlier steps if anything's off.
              </p>
            )}
          </>
        )}

        <div className="pb-nav">
          <button className="pb-btn pb-btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft size={14} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="pb-btn pb-btn-primary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canContinue()}>
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button className="pb-btn pb-btn-primary" onClick={downloadHTML}>
              <Download size={14} /> Download page
            </button>
          )}
        </div>
      </div>

      <div className="pb-preview-pane">
        <div className="pb-preview-toolbar">
          <div className="pb-swatches">
            <div className={`pb-swatch ${accent === "amber" ? "selected" : ""}`} style={{ background: "#D8A331" }} onClick={() => setAccent("amber")} />
            <div className={`pb-swatch ${accent === "teal" ? "selected" : ""}`} style={{ background: "#2F6F62" }} onClick={() => setAccent("teal")} />
            <span className={`pb-status ${polished ? "polished" : ""}`}>{polished ? "Polished by AI" : "Draft"}</span>
          </div>
          <button className="pb-download" onClick={downloadHTML}>
            <Download size={13} /> Download .html
          </button>
        </div>
        <div className="pb-canvas-scroll">
          <div className="pb-page">
            <h1>{data.name || "Your Name"}</h1>
            <p className="pb-tagline">{polished?.tagline || data.targetRole || "Your target role"}</p>
            <p className="pb-about">
              {polished?.about || data.about || <span className="pb-empty">Your about section will appear here as you type.</span>}
            </p>

            {skillList.length > 0 && (
              <>
                <h2>Skills</h2>
                <ul className="pb-page-skills">
                  {skillList.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {data.projects.some((p) => p.title || p.description) && (
              <>
                <h2>Projects</h2>
                {data.projects.map((p, i) =>
                  p.title || p.description ? (
                    <div className="pb-page-project" key={p.id}>
                      <h3>{p.title || `Project ${i + 1}`}</h3>
                      <p>{polished?.projects?.[i]?.description || p.description}</p>
                      {p.tech && <p className="tech">{p.tech}</p>}
                    </div>
                  ) : null
                )}
              </>
            )}

            {data.school && (
              <>
                <h2>Education</h2>
                <p style={{ fontSize: 13.5, color: "var(--text-ink-soft)" }}>
                  {polished?.education ||
                    `${data.degree ? data.degree + ", " : ""}${data.school} ${data.gradYear ? `— ${data.gradYear}` : ""}`}
                </p>
              </>
            )}

            {(data.email || data.linkedin || data.github || data.website) && (
              <div className="pb-page-links">
                {data.email && <a href={`mailto:${data.email}`}><Mail size={12} /> Email</a>}
                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer"><Linkedin size={12} /> LinkedIn</a>}
                {data.github && <a href={data.github} target="_blank" rel="noreferrer"><Github size={12} /> GitHub</a>}
                {data.website && <a href={data.website} target="_blank" rel="noreferrer"><Globe size={12} /> Website</a>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
