"use client";

import { useEffect, type ReactNode } from "react";
import { apiGet, apiPost, publicAssetUrl } from "../lib/api";

export function SiteInteractions({ children }: { children: ReactNode }) {
  useEffect(() => {

    const onImageError = (event: Event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = "true";
      image.src = "/construction-placeholder.svg";
    };
    document.addEventListener("error", onImageError, true);
    document.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) {
        image.dataset.fallbackApplied = "true";
        image.src = "/construction-placeholder.svg";
      }
    });

    const filters = document.querySelectorAll<HTMLButtonElement>(".filter-btn");
    const onFilter = (button: HTMLButtonElement) => {
      filters.forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll<HTMLElement>(".project-card").forEach((card) => {
        const filter = button.dataset.filter;
        const show = filter === "all" || card.dataset.category === filter || card.dataset.status === filter || card.dataset.clientType === filter || (filter === "previous" && card.dataset.status === "completed");
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("visible");
      });
    };
    filters.forEach((button) => button.addEventListener("click", () => onFilter(button)));

    const tenderFilters = document.querySelectorAll<HTMLButtonElement>(".tender-filter");
    tenderFilters.forEach((button) => button.addEventListener("click", () => {
      tenderFilters.forEach((filter) => filter.classList.toggle("active", filter === button));
      document.querySelectorAll<HTMLElement>(".tender-item").forEach((item) => {
        const selected = button.dataset.tenderFilter;
        item.classList.toggle("is-hidden", selected !== "all" && item.dataset.clientType !== selected && item.dataset.noticeType !== selected && item.dataset.status !== selected);
      });
    }));
    const galleryFilters = document.querySelectorAll<HTMLButtonElement>(".gallery-filter");
    galleryFilters.forEach((button) => button.addEventListener("click", () => {
      galleryFilters.forEach((filter) => filter.classList.toggle("active", filter === button));
      document.querySelectorAll<HTMLElement>("#project-gallery figure").forEach((figure) => {
        const selected = button.dataset.galleryFilter || "all";
        const visible = selected === "all" || (selected.startsWith("project:") ? figure.dataset.projectStatus === selected.slice(8) : selected.startsWith("category:") ? figure.dataset.projectCategory === selected.slice(9) : figure.dataset.mediaType === selected);
        figure.classList.toggle("is-hidden", !visible);
      });
    }));

    const text = (tag: string, className: string, value: string) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      element.textContent = value;
      return element;
    };
    const loadCompanyProfile = async () => {
      try {
        const profile = await apiGet<Record<string, string | number | null>>("/company/");
        document.querySelectorAll<HTMLElement>("[data-company-field]").forEach((element) => {
          const value = profile[element.dataset.companyField || ""];
          if (value) element.textContent = String(value);
        });
        const phone = String(profile.phone || "");
        const email = String(profile.email || "");
        if (phone) document.querySelector<HTMLAnchorElement>("[data-company-phone]")?.setAttribute("href", `tel:${phone.replace(/[^+\d]/g, "")}`);
        if (email) document.querySelector<HTMLAnchorElement>("[data-company-email]")?.setAttribute("href", `mailto:${email}`);
        const mapUrl = String(profile.map_embed_url || "");
        if (mapUrl.startsWith("https://")) document.querySelector<HTMLIFrameElement>("[data-company-map]")?.setAttribute("src", mapUrl);
        if (profile.company_name) {
          document.querySelectorAll<HTMLElement>(".brand-copy strong").forEach((element) => { element.textContent = String(profile.company_name).toUpperCase(); });
          document.title = `${profile.company_name} | Building the way forward`;
        }
        const stats = document.querySelectorAll<HTMLElement>(".trust-grid > div:not(.trust-note)");
        const statValues = [
          { value: profile.founded_year ? Math.max(0, new Date().getFullYear() - Number(profile.founded_year)) : null, label: "Years of experience" },
          { value: profile.projects_delivered, label: "Projects delivered" },
          { value: profile.states_covered, label: "States reached" },
        ];
        stats.forEach((stat, index) => {
          const metric = statValues[index];
          if (metric?.value !== null && metric?.value !== undefined) {
            const strong = stat.querySelector("strong");
            const small = stat.querySelector("small");
            if (strong) strong.textContent = String(metric.value);
            if (small) small.textContent = metric.label;
          }
        });
      } catch { /* Keep the editable company profile fallback if the API is offline. */ }
    };
    const loadProjects = async () => {
      try {
        const items = await apiGet<Array<{ name: string; category: string; location: string; client_name: string; client_type: string; description: string; status: string; image_url: string; images: Array<{ image_url: string; video_url: string; media_type: string; alt_text: string }> ; completion_date: string | null }>>("/projects/");
        if (!items.length) return;
        const grid = document.querySelector<HTMLElement>(".project-grid");
        if (!grid) return;
        grid.replaceChildren();
        items.forEach((item) => {
          const card = text("article", "project-card visible", "") as HTMLElement;
          card.dataset.category = item.category;
          card.dataset.status = item.status;
          card.dataset.clientType = item.client_type;
          const imageLink = document.createElement("a");
          imageLink.className = "project-image";
          imageLink.href = "#contact";
          const image = document.createElement("img");
          image.src = publicAssetUrl(item.image_url) || "/construction-placeholder.svg";
          image.alt = item.name;
          image.loading = "lazy";
          imageLink.append(image, text("span", "project-arrow", "↗"));
          const date = item.completion_date ? new Date(item.completion_date).getFullYear() : "";
          const meta = text("div", "project-meta", "");
          meta.append(text("span", "", item.category.replace("-", " ").toUpperCase()), text("span", "", `${item.status.toUpperCase()}${date ? ` · ${date}` : ""}`));
          card.append(imageLink, meta, text("h3", "", item.name));
          card.append(text("p", "project-location", item.location));
          card.append(text("p", "project-client", `CLIENT / ${item.client_name || item.client_type.replace("_", " ")}`));
          if (item.description) card.append(text("p", "project-description", item.description));
          if (item.completion_date) card.append(text("p", "project-completion", `Completion / ${new Date(item.completion_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`));
          grid.append(card);
        });
        const gallery = document.querySelector<HTMLElement>("#project-gallery");
        const galleryImages = items.flatMap((project) => {
          const media = project.images?.length ? project.images : (project.image_url ? [{ image_url: project.image_url, video_url: "", media_type: "photo", alt_text: project.name }] : []);
          return media.map((item) => ({ ...item, project_status: project.status, project_category: project.category }));
        });
        if (gallery && galleryImages.length) {
          // Admin-uploaded project media is shown first; the company profile pages stay after it.
          const firstStatic = gallery.firstChild;
          galleryImages.slice(0, 8).forEach((item) => {
            const figure = document.createElement("figure");
            figure.dataset.mediaType = item.media_type;
            figure.dataset.projectStatus = item.project_status;
            figure.dataset.projectCategory = item.project_category;
            if (item.media_type === "video" && (item.video_url || item.image_url)) {
              const link = text("a", "gallery-video", "▶ Watch site video") as HTMLAnchorElement;
              link.href = item.video_url || item.image_url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              figure.append(link);
            } else if ((item.media_type === "design_2d" || item.media_type === "design_3d") && item.image_url) {
              const label = item.media_type === "design_2d" ? "Open 2D drawing" : "Open 3D design";
              const link = text("a", "gallery-video", `${label} ↗`) as HTMLAnchorElement;
              link.href = item.image_url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              figure.append(link);
            } else if (item.image_url) {
              const link = document.createElement("a");
              link.href = item.image_url;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              const image = document.createElement("img");
              image.src = publicAssetUrl(item.image_url);
              image.alt = item.alt_text || "Kalpbhumi Infra project photo";
              image.loading = "lazy";
              link.append(image);
              figure.append(link);
            }
            gallery.insertBefore(figure, firstStatic);
          });
        }
      } catch { /* Keep the editorial portfolio available when the API is offline. */ }
    };
    const loadTenders = async () => {
      try {
        const items = await apiGet<Array<{ title: string; location: string; category: string; notice_type: string; client_type: string; status: string; closing_date: string | null; notice_url: string; document_url: string; description: string }>>("/tenders/");
        if (!items.length) return;
        const list = document.querySelector<HTMLElement>(".tender-list");
        const top = list?.querySelector(".tender-top");
        if (!list || !top) return;
        list.replaceChildren(top);
        items.forEach((item) => {
          const row = text("article", "tender-item", "");
          row.dataset.clientType = item.client_type;
          row.dataset.noticeType = item.notice_type;
          row.dataset.status = item.status;
          const content = document.createElement("div");
          content.append(text("span", `tender-status ${item.status === "open" ? "open" : ""}`, item.status.toUpperCase()));
          content.append(text("h3", "", item.title));
          content.append(text("p", "", `${item.client_type.toUpperCase()} / ${item.notice_type.replace("_", " ")} · ${item.location} · ${item.category}${item.closing_date ? ` · Closes ${new Date(item.closing_date).toLocaleDateString("en-IN")}` : ""}`));
          const link = text("a", "", "↗") as HTMLAnchorElement;
          link.href = item.document_url || item.notice_url || "#contact";
          link.setAttribute("aria-label", `View ${item.title}`);
          if (item.document_url || item.notice_url) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
          row.append(content, link);
          list.append(row);
        });
        list.append(text("p", "tender-note", "For tender documents or clarification, contact our team."));
      } catch { /* Keep the editorial tender list available when the API is offline. */ }
    };
    const loadTeam = async () => {
      try {
        const items = await apiGet<Array<{ name: string; designation: string; department: string; experience_years: number; image_url: string; biography: string }>>("/team/");
        if (!items.length) return;
        const grid = document.querySelector<HTMLElement>(".team-grid");
        if (!grid) return;
        grid.replaceChildren();
        items.forEach((item, index) => {
          const card = text("article", "team-card visible", "");
          const photo = text("div", "team-photo", "");
          const image = document.createElement("img");
          image.src = publicAssetUrl(item.image_url) || "/construction-placeholder.svg";
          image.alt = item.name;
          image.loading = "lazy";
          photo.append(image);
          const info = text("div", "team-info", "");
          const copy = document.createElement("div");
          copy.append(text("h3", "", item.name), text("p", "", `${item.designation} · ${item.department} · ${item.experience_years} years`));
          if (item.biography) copy.title = `${item.department}: ${item.biography}`;
          info.append(copy, text("span", "", String(index + 1).padStart(2, "0")));
          card.append(photo, info);
          grid.append(card);
        });
        document.querySelector(".team-disclaimer")?.remove();
      } catch { /* Keep the editorial team profiles available when the API is offline. */ }
    };
    void loadProjects();
    void loadTenders();
    void loadTeam();
    void loadCompanyProfile();

    const reveal = document.querySelectorAll<HTMLElement>(".reveal");
    let revealObserver: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver?.unobserve(entry.target); }
      }), { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
      document.documentElement.classList.add("js-reveal");
      reveal.forEach((item) => revealObserver?.observe(item));
    } else reveal.forEach((item) => item.classList.add("visible"));

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    const form = document.getElementById("enquiry-form") as HTMLFormElement | null;
    const status = document.getElementById("form-status");
    const onSubmit = async (event: Event) => {
      event.preventDefault();
      if (!form || !form.reportValidity()) return;
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submit) { submit.disabled = true; submit.classList.add("is-loading"); }
      if (status) status.textContent = "Sending your enquiry...";
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const response = await apiPost("/enquiries/", data);
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        if (status) status.textContent = "Thanks, your enquiry is received. Our team will be in touch.";
      } catch {
        if (status) status.textContent = "We could not send this just now. Please email kalpbhumi.infra@gmail.com.";
      } finally { if (submit) { submit.disabled = false; submit.classList.remove("is-loading"); } }
    };
    form?.addEventListener("submit", onSubmit);
    return () => {
      form?.removeEventListener("submit", onSubmit);
      document.removeEventListener("error", onImageError, true);
      revealObserver?.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return <>{children}</>;
}
