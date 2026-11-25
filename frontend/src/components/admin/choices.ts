// Mirrors the TextChoices in backend/api/models.py.
import type { Option } from "./resource-manager";

export const PROJECT_CATEGORIES: Option[] = [
  { value: "roads", label: "Roads" },
  { value: "buildings", label: "Buildings" },
  { value: "water", label: "Water & drainage" },
  { value: "design", label: "Architecture & design" },
];
export const PROJECT_CLIENT_TYPES: Option[] = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "third_party", label: "Third-party" },
];
export const PROJECT_STATUSES: Option[] = [
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];
export const MEDIA_TYPES: Option[] = [
  { value: "photo", label: "Site / project photo" },
  { value: "design_2d", label: "2D drawing" },
  { value: "design_3d", label: "3D design" },
  { value: "video", label: "Site video" },
];
export const DEPARTMENTS: Option[] = [
  { value: "management", label: "Management" },
  { value: "technical", label: "Technical staff" },
  { value: "site", label: "Site & supervision" },
  { value: "admin", label: "Administrative" },
  { value: "support", label: "Supporting staff" },
];
export const NOTICE_TYPES: Option[] = [
  { value: "tender", label: "Tender notice" },
  { value: "work_order", label: "Work order" },
  { value: "contract", label: "Contract opportunity" },
  { value: "vendor", label: "Vendor opportunity" },
];
export const TENDER_CLIENT_TYPES: Option[] = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
];
export const TENDER_STATUSES: Option[] = [
  { value: "open", label: "Open" },
  { value: "upcoming", label: "Upcoming" },
  { value: "closed", label: "Closed" },
];
export const REQUEST_TYPES: Option[] = [
  { value: "quotation", label: "Request a quotation" },
  { value: "project", label: "Project consultation" },
  { value: "tender", label: "Tender / contract" },
  { value: "other", label: "Other" },
];
