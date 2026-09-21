// =======================================================================
// Cloudinary Image Upload Service for Mindclick
// Direct Unsigned Client-to-Cloud Upload (100% Expo / React Native Compatible)
// =======================================================================

export const CLOUDINARY_CONFIG = {
  cloudName: "oco1yaop",
  uploadPreset: "mindclick",
  uploadUrl: "https://api.cloudinary.com/v1_1/oco1yaop/image/upload",
};

/**
 * อัปโหลดรูปภาพขึ้น Cloudinary เพื่อรับ HTTPS CDN URL ถาวร
 * @param {string} fileUri - Path ของไฟล์รูปในเครื่อง (file://...) หรือ Data URI (data:image/...)
 * @param {object} options - ตัวเลือกเพิ่มเติม เช่น folder (mindclick/avatars, mindclick/gallery, mindclick/feed)
 * @returns {Promise<string>} - secure_url ของรูปภาพที่อัปโหลดสำเร็จ
 */
export async function uploadImageToCloudinary(fileUri, options = {}) {
  if (!fileUri) {
    throw new Error("ไม่พบไฟล์รูปภาพที่จะอัปโหลด");
  }

  const formData = new FormData();

  // กรณีเป็น Data URI (Base64)
  if (fileUri.startsWith("data:image")) {
    formData.append("file", fileUri);
  } else {
    // กรณีเป็น Local File URI ในอุปกรณ์
    const filename = fileUri.split("/").pop() || `upload_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: mimeType,
    });
  }

  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  if (options.folder) {
    formData.append("folder", options.folder);
  }

  try {
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || "การอัปโหลดรูปภาพขึ้น Cloudinary ล้มเหลว";
      console.error("Cloudinary upload error response:", data);
      throw new Error(errorMsg);
    }

    if (!data.secure_url) {
      throw new Error("ไม่พบ secure_url ในการตอบกลับของ Cloudinary");
    }

    return data.secure_url;
  } catch (err) {
    console.error("uploadImageToCloudinary exception:", err);
    throw err;
  }
}

/**
 * สร้าง URL รูปภาพที่ปรับขนาดและบีบอัดอัตโนมัติผ่าน Cloudinary CDN
 * @param {string} originalUrl - URL รูปภาพต้นฉบับ
 * @param {object} transforms - เช่น { width: 400, height: 400, quality: "auto" }
 */
export function getOptimizedImageUrl(originalUrl, transforms = {}) {
  if (!originalUrl || typeof originalUrl !== "string") return originalUrl;
  if (!originalUrl.includes("res.cloudinary.com")) return originalUrl;

  const parts = [];
  if (transforms.width) parts.push(`w_${transforms.width}`);
  if (transforms.height) parts.push(`h_${transforms.height}`);
  if (transforms.crop) parts.push(`c_${transforms.crop}`);
  parts.push("f_auto");
  parts.push("q_auto");

  const transformStr = parts.join(",");
  return originalUrl.replace("/upload/", `/upload/${transformStr}/`);
}
