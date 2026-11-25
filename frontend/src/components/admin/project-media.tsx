"use client";

import { useState, type FormEvent } from "react";
import { AdminApiError, adminFetch, toFormData } from "../../lib/admin-api";
import { publicAssetUrl } from "../../lib/api";
import { useAdmin } from "./admin-shell";
import { MEDIA_TYPES } from "./choices";
import { labelFor } from "./resource-manager";

export type ProjectMedia = {
  id: number;
  project: number;
  media_type: string;
  file_url: string;
  image_url: string;
  video_url: string;
  alt_text: string;
  position: number;
};

const ACCEPT: Record<string, string> = {
  photo: ".jpg,.jpeg,.png,.webp",
  design_2d: ".pdf,.jpg,.jpeg,.png,.webp",
  design_3d: ".pdf,.jpg,.jpeg,.png,.webp",
  video: ".mp4,.webm",
};

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(url) || url.includes("images.unsplash.com");
}

export function ProjectMediaManager({ projectId, media, onChange }: { projectId: number; media: ProjectMedia[]; onChange: () => void }) {
  const { handleError } = useAdmin();
  const [mediaType, setMediaType] = useState("photo");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file && !imageUrl && !videoUrl) {
      setError("Choose a file or enter an image / video URL.");
      return;
    }
    setBusy(true);
    setError("");
    const nextPosition = media.reduce((max, m) => Math.max(max, m.position + 1), 0);
    const payload: Record<string, unknown> = { project: projectId, media_type: mediaType, image_url: imageUrl, video_url: videoUrl, alt_text: altText, position: nextPosition };
    if (file) payload.file = file;
    try {
      await adminFetch("project-media", { method: "POST", body: toFormData(payload) });
      setFile(null); setImageUrl(""); setVideoUrl(""); setAltText(""); setInputKey((k) => k + 1);
      onChange();
    } catch (err) {
      if (err instanceof AdminApiError && !err.isAuthError) setError([err.message, ...Object.values(err.fieldErrors)].filter(Boolean).join(" "));
      else setError(handleError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ProjectMedia) {
    if (!window.confirm("Remove this media item?")) return;
    try {
      await adminFetch(`project-media/${item.id}`, { method: "DELETE" });
      onChange();
    } catch (err) {
      window.alert(handleError(err));
    }
  }

  return (
    <section>
      <h3 className="adm-section-title">Photos, drawings &amp; videos</h3>
      {media.length === 0 ? <p style={{ color: "var(--adm-muted)", fontSize: 14 }}>No media yet. The first site photo is used as the project cover.</p> : (
        <div className="adm-media-grid">
          {media.map((item) => {
            const url = item.file_url || item.image_url;
            return (
              <div key={item.id} className="adm-media-item">
                <div className="adm-media-thumb">
                  {url && isImage(url) ? <img src={publicAssetUrl(url)} alt={item.alt_text || ""} loading="lazy" /> :
                    <a href={publicAssetUrl(url || item.video_url)} target="_blank" rel="noreferrer">{item.media_type === "video" ? "▶ Video" : "Open file ↗"}</a>}
                </div>
                <strong>{labelFor(MEDIA_TYPES, item.media_type)}</strong>
                {item.alt_text && <p>{item.alt_text}</p>}
                <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(item)}>Remove</button>
              </div>
            );
          })}
        </div>
      )}

      <form className="adm-media-form" onSubmit={upload} noValidate>
        <strong style={{ color: "var(--forest)" }}>Add media</strong>
        {error && <div className="adm-alert" role="alert">{error}</div>}
        <div className="adm-form-grid">
          <label className="adm-field"><span>Type</span>
            <select className="adm-input" value={mediaType} onChange={(e) => { setMediaType(e.target.value); setFile(null); setInputKey((k) => k + 1); }}>
              {MEDIA_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>File</span>
            <input key={inputKey} className="adm-input" type="file" accept={ACCEPT[mediaType]} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="adm-field"><span>…or image URL</span>
            <input className="adm-input" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://" />
          </label>
          {mediaType === "video" && (
            <label className="adm-field"><span>Video URL</span>
              <input className="adm-input" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://" />
            </label>
          )}
          <label className="adm-field adm-field-full"><span>Caption / alt text</span>
            <input className="adm-input" value={altText} onChange={(e) => setAltText(e.target.value)} maxLength={180} />
          </label>
        </div>
        <div><button type="submit" className="adm-btn" disabled={busy}>{busy ? <><span className="btn-spinner" aria-hidden="true" />Uploading…</> : "Upload"}</button></div>
      </form>
    </section>
  );
}
