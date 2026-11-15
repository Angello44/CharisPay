/* ============================================================
   Cloudinary Configuration
   ============================================================
   Upload bukti transfer pakai Cloudinary (unsigned upload).
   Tidak butuh API Secret di client — aman untuk browser.
   ============================================================ */

const Cloudinary = {
    cloudName:    "vaf4iivo",
    uploadPreset: "spp_charis",
    folder:       "bukti-transfer",

    /**
     * Upload file ke Cloudinary
     * @param {File} file - file yang akan diupload
     * @param {Function} onProgress - callback progress (0-100)
     * @returns {Promise<string>} URL file yang diupload
     */
    async upload(file, onProgress = null) {
        const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.uploadPreset);
        formData.append("folder", this.folder);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track progress
            if (onProgress) {
                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        const persen = Math.round((e.loaded / e.total) * 100);
                        onProgress(persen);
                    }
                });
            }

            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    const res = JSON.parse(xhr.responseText);
                    resolve(res.secure_url); // HTTPS URL
                } else {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err.error?.message || "Upload gagal"));
                }
            });

            xhr.addEventListener("error", () => {
                reject(new Error("Koneksi gagal, coba lagi"));
            });

            xhr.open("POST", url);
            xhr.send(formData);
        });
    },

    /**
     * Kompresi gambar sebelum upload pakai Canvas API
     * Foto dari kamera HP bisa 3-5MB → dikecilkan ke ~300KB
     * @param {File} file
     * @param {number} maxWidth - lebar maksimal (default 1200px)
     * @param {number} quality - kualitas JPEG 0-1 (default 0.7)
     * @returns {Promise<File>} file yang sudah dikompres
     */
    async compress(file, maxWidth = 1200, quality = 0.7) {
        // PDF tidak perlu dikompres
        if (file.type === "application/pdf") return file;

        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                // Hitung dimensi baru
                let width  = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width  = maxWidth;
                }

                // Gambar ke canvas
                const canvas = document.createElement("canvas");
                canvas.width  = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Convert ke blob
                canvas.toBlob(
                    (blob) => {
                        const compressed = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now()
                        });
                        resolve(compressed);
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.src = url;
        });
    }
};
