using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using System.IO;
using Trumpet.Net.Models;

namespace Trumpet_Web.Services
{
    public static class ImageHelper
    {
        /// <summary>
        /// Checks if an image at the specified path is larger than the given dimensions.
        /// Efficiently reads only the header to avoid loading the full image.
        /// </summary>
        public static bool IsImageLargeEnough(string filePath, int minWidth, int minHeight)
        {
            if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
            {
                // Try relative to current directory if absolute fails, or handle logic in caller
                return false;
            }

            try
            {
                using (var stream = File.OpenRead(filePath))
                {
                    var format = Image.DetectFormat(stream);
                    if (format == null) return false;

                    stream.Position = 0; // Reset stream
                    var info = Image.Identify(stream);
                    
                    return info.Width > minWidth && info.Height > minHeight;
                }
            }
            catch
            {
                // If checking fails (e.g. corrupt image), assume it's not valid
                return false;
            }
        }

        /// <summary>
        /// Finds the best cover image for an item based on size and fallback logic.
        /// </summary>
        public static Bitstream? GetBestCoverImage(Item item)
        {
            if (item == null || item.Bitstreams == null) return null;

            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp" };
            
            // Filter candidates
            var imageBitstreams = item.Bitstreams.Where(b => 
                (b.MimeType != null && (b.MimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) || b.MimeType.Equals("JPEG", StringComparison.OrdinalIgnoreCase) || b.MimeType.Equals("JPG", StringComparison.OrdinalIgnoreCase)))
                || (b.Name != null && imageExtensions.Any(ext => b.Name.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            ).ToList();

            // 1. Try to find large image (>400x400)
            foreach (var b in imageBitstreams)
            {
                if (IsImageLargeEnough(b.LocalFilePath, 400, 400))
                {
                    return b;
                }
            }

            // 2. Fallback: Use first available image if no large one found
            // Only if it passes a basic validity check (1x1)
            foreach (var b in imageBitstreams)
            {
                if (IsImageLargeEnough(b.LocalFilePath, 1, 1))
                {
                    return b;
                }
            }

            return null;
        }
    }
}
