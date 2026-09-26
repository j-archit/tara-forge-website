TaraForge3D brand files
=======================
Colours: Tara Gold #C9A84C, Night #050A1F, print bronze #7E6220, print ink #0A0F24.

svg/        Master vector files. "-tight" = cropped to the mark, no padding (use beside the wordmark).
            Square files have built-in padding (use for icons/avatars). favicon.svg for browsers. spark.svg = star bullet (uses currentColor).
png/ webp/ avif/   Transparent rasters of the mark, 64-2048 px, in gold / bronze / ink / white. Use WebP or AVIF on the website, PNG for everything else.
app-icons/  Opaque icons on Night: apple-touch-icon (180), 192, 512, 512 maskable, 1024 (app stores).
ico/        favicon.ico (16/32/48/64) for older browsers.
social/     Profile pictures on Night (circle-safe), PNG + WebP.
pdf/ eps/   Vector mark for printers, laser/vinyl cutting and embroidery vendors.
lockup/     Mark + TARA FORGE 3D wordmark, set in Archivo (SIL Open Font License) and converted to outlines:
            no font needed anywhere. Horizontal and stacked, in on-dark, on-light, ink, white and gold.
            svg/ pdf/ eps/ are vector; png/ webp/ avif/ are transparent at 800, 1600 and 3200 px wide.
            Use via <img src>, not pasted inline (glyph ids would clash between two inline copies).
site.webmanifest  Drop-in manifest for the website (expects files under /brand/).

Head tags:
<link rel="icon" href="/brand/svg/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/brand/ico/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/brand/app-icons/apple-touch-icon.png">
<link rel="manifest" href="/brand/site.webmanifest">
<meta name="theme-color" content="#050A1F">
