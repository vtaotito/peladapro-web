const PREFIX = "peladapro_img_";
const MAX_DIMENSION = 512;
const MAX_BYTES = 200 * 1024;

function storageKey(key: string): string {
  return `${PREFIX}${key}`;
}

function resizeIfNeeded(
  img: HTMLImageElement,
  maxDim: number,
): { width: number; height: number } {
  let { width, height } = img;
  if (width <= maxDim && height <= maxDim) return { width, height };

  if (width > height) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }
  return { width, height };
}

function compressToDataUrl(
  img: HTMLImageElement,
  maxDim: number,
  maxBytes: number,
): string {
  const { width, height } = resizeIfNeeded(img, maxDim);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.9;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrl.length > maxBytes && quality > 0.1) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return dataUrl;
}

export async function saveImage(key: string, file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        resolve(compressToDataUrl(img, MAX_DIMENSION, MAX_BYTES));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = raw;
  });

  localStorage.setItem(storageKey(key), dataUrl);
  return dataUrl;
}

export function getImage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKey(key));
}

export function removeImage(key: string): void {
  localStorage.removeItem(storageKey(key));
}

export function userAvatarKey(userId: string): string {
  return `avatar_${userId}`;
}

export function groupImageKey(groupId: string): string {
  return `group_img_${groupId}`;
}

export function groupEmblemKey(groupId: string): string {
  return `group_emblem_${groupId}`;
}
