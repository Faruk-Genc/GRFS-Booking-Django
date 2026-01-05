# Room Images Directory

## Where to Upload Room Images

Place all room images in this directory: `frontend/public/rooms/`

## Image Naming Convention

Name your images using the following format:
- **`room-{ID}.jpg`** (or `.png`, `.jpeg`, `.webp`)

Where `{ID}` is the room ID from your database.

### Examples:
- Room with ID 1 → `room-1.jpg`
- Room with ID 5 → `room-5.jpg`
- Room with ID 12 → `room-12.jpg`

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Fallback Image

If a room image is not found, the system will try to load `/rooms/placeholder.jpg`. 
You can optionally create a placeholder image with this name for rooms without images.

## Notes

- Images in the `public` folder are served statically and accessible at `/rooms/{filename}`
- After adding images, you may need to restart your development server
- The images are referenced by room ID, so make sure the filename matches the room ID in your database

