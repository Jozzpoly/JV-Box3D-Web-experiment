# Scan asset slot

Drop two files here:

- `terrain-visual.glb` — textured photogrammetry render mesh.
- `terrain-collision.glb` — cleaned, reduced, manifold-enough static collision mesh.

Both files must use metres, +Y up, matching transforms and the same origin. The app runs without them and logs a clear informational fallback.
