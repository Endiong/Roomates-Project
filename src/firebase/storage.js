// Cloudinary helper for photo uploads (Bypassing Firebase Storage)

export async function uploadPhoto(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config missing. Please check .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  const data = await res.json();
  return data.secure_url;
}

export async function deletePhoto(url) {
  // Cloudinary unsigned uploads cannot be deleted from the client side directly
  // for security reasons. They just remain in the cloud, which is fine for our use case.
  console.log('Skipping photo deletion (Cloudinary unsigned mode):', url);
}
