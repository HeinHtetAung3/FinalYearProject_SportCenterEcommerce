export function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image.'));
        image.src = src;
    });
}

export async function createCroppedImageFile(imageSrc, pixelCrop, originalName = 'avatar.jpg') {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Canvas is not supported in this browser.');
    }

    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => {
                if (!result) {
                    reject(new Error('Failed to generate cropped image.'));
                    return;
                }
                resolve(result);
            },
            'image/jpeg',
            0.92
        );
    });

    const baseName = String(originalName || 'avatar').replace(/\.[^/.]+$/, '') || 'avatar';
    return new File([blob], `${baseName}-cropped.jpg`, {
        type: 'image/jpeg'
    });
}