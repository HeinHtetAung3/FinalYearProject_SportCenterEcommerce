package com.sportsecommerce.service.impl;

import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.service.ProfileImageStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalProfileImageStorageService implements ProfileImageStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final String PUBLIC_PREFIX = "/uploads/profile/";
    private static final int AVATAR_SIZE_PX = 512;

    private final Path profileDirectoryPath;

    public LocalProfileImageStorageService(
            @Value("${app.upload.profile-dir:uploads/profile}") String profileDir
    ) {
        this.profileDirectoryPath = Paths.get(profileDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile image) {
        String extension = resolveExtension(image.getOriginalFilename());
        boolean outputPng = "png".equals(extension);
        String normalizedExtension = outputPng ? "png" : "jpg";
        String filename = UUID.randomUUID() + "." + extension;
        filename = UUID.randomUUID() + "." + normalizedExtension;
        Path targetPath = profileDirectoryPath.resolve(filename).normalize();
        if (!targetPath.startsWith(profileDirectoryPath)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }

        try {
            Files.createDirectories(profileDirectoryPath);
            try (InputStream input = image.getInputStream()) {
                BufferedImage source = ImageIO.read(input);
                if (source == null) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid image data");
                }
                BufferedImage normalized = centerCropAndResize(source, AVATAR_SIZE_PX, outputPng);
                try (OutputStream out = Files.newOutputStream(targetPath)) {
                    boolean written = ImageIO.write(normalized, normalizedExtension, out);
                    if (!written) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported image format");
                    }
                }
            }
            return PUBLIC_PREFIX + filename;
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image");
        }
    }

    @Override
    public void deleteByPublicUrl(String publicUrl) {
        if (publicUrl == null || publicUrl.isBlank() || !publicUrl.startsWith(PUBLIC_PREFIX)) {
            return;
        }
        String filename = publicUrl.substring(PUBLIC_PREFIX.length()).trim();
        if (filename.isBlank() || filename.contains("/") || filename.contains("\\")) {
            return;
        }

        Path targetPath = profileDirectoryPath.resolve(filename).normalize();
        if (!targetPath.startsWith(profileDirectoryPath)) {
            return;
        }
        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ignored) {
            // no-op: old file cleanup is best effort
        }
    }

    private static String resolveExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image file name is required");
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == originalFilename.length() - 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
        }
        String ext = originalFilename.substring(dotIndex + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
        }
        return ext;
    }

    private static BufferedImage centerCropAndResize(BufferedImage source, int size, boolean outputPng) {
        int srcW = source.getWidth();
        int srcH = source.getHeight();
        int cropSize = Math.min(srcW, srcH);
        int x = (srcW - cropSize) / 2;
        int y = (srcH - cropSize) / 2;

        BufferedImage cropped = source.getSubimage(x, y, cropSize, cropSize);
        int type = outputPng ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
        BufferedImage resized = new BufferedImage(size, size, type);

        Graphics2D g = resized.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.drawImage(cropped, 0, 0, size, size, null);
        } finally {
            g.dispose();
        }
        return resized;
    }
}
