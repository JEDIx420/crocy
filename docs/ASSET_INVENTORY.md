# CROCY — Runtime Asset Inventory & Audit

This inventory represents the verified audit of all runtime assets in `public/assets/` and source models in the repository.

---

## 1. Primary Player Character (Crocodile)
| Property | Value |
| :--- | :--- |
| **Runtime Path** | `public/assets/crocodile.glb` |
| **Source Path** | `crocodile_high_quality.glb` |
| **File Format** | Binary glTF 2.0 (GLB) |
| **Runtime File Size** | 3.75 MB (Source: 61.09 MB) |
| **Geometry** | 13,192 vertices, 22,154 triangles (Single mesh primitive: `Crocodile_Crocodile_0`) |
| **Vertex Attributes** | `POSITION`, `NORMAL`, `TANGENT`, `TEXCOORD_0`, `TEXCOORD_1` |
| **Materials & Textures** | 1 PBR Metallic-Roughness material (`Crocodile`):<br>• BaseColor: 2048x2048 JPEG (Optimized from 4096 PNG)<br>• MetallicRoughness: 2048x2048 JPEG<br>• Normal: 2048x2048 JPEG |
| **Skeleton / Skin** | **0 skins, 0 joints** (Model is an unrigged static sculpt) |
| **Animation Clips** | **0 clips** |
| **Original Dimensions** | Span: X=29.1m, Y=75.1m, Z=11.3m (raw FBX units) |
| **Runtime Scale** | Scaled by `0.0639` to match realistic length: 4.8m long, 1.86m wide, 0.72m high |
| **Orientation** | Snout faces `+Z` in raw model; rotated 180° in pivot so snout faces `-Z` (forward) |
| **Audit Status** | **Verified.** High-detail sculpt geometry and textures are 100% preserved. Skeleton and animations must be provided through a dedicated rigging pipeline in Phase 1. |

---

## 2. Aquatic & Terrestrial Ambient Fauna
| Asset | Runtime Path | Size | Tris | Rig / Skin | Animations | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Schooling Rice Fish** | `public/assets/rice_fish.glb` | 1.46 MB | ~4.2k | Rigged (1 skin, 40 nodes) | 1 clip (`Animation` - rhythmic swim stroke) | Verified & active |
| **Dark Sleeper Fish** | `public/assets/sleeper_fish.glb` | 2.63 MB | ~6.8k | Rigged (1 skin, 18 joints) | 1 clip (`Animation` - pectoral/tail stroke) | Verified & active |
| **Mudbank Crab** | `public/assets/crab.glb` | 200 KB | ~820 | Rigged (1 skin, 12 joints) | 1 clip (`walkLeft` - sideways leg scuttle) | Verified & active |

---

## 3. Vegetation & Environment Props
| Asset | Runtime Path | Size | Tris | Materials / Textures | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mangrove Tree** | `public/assets/mangrove_tree.glb` | 1.05 MB | ~18.4k | Foliage + Bark PBR textures (1k) | Verified & active |
| **Red Mangrove (High-Poly)** | `cc0__red_mangrove_rhizophora_mucronata.glb` | 26.0 MB | ~140k | Detailed aerial stilt roots | Available for Phase 4 optimization |
| **Dead Tree Driftwood** | `public/assets/dead_tree_trunk/` | 4.56 MB | ~4.8k | 1k PBR (diffuse, normal, ARM) | Verified & active |
| **Fern Undergrowth** | `public/assets/fern_02/` | 1.09 MB | ~1.6k | 1k PBR (diffuse, normal, ARM) | Verified & active |
| **Coastal Sand Material** | `public/assets/coast_sand/` | 4.63 MB | 2 quads | 1k PBR (diffuse, normal, rough) | Ready for terrain blending in Phase 4 |

---

## 4. Asset Tracking Status & Source Distinction
To optimize repository clone times and stay within GitHub file size limits, assets are strictly divided between git-tracked runtime files and local source files:

| Category | Assets | Location | Tracking Status |
| :--- | :--- | :--- | :--- |
| **Tracked Runtime Assets** | `crocodile.glb` (3.75MB), `crab.glb` (200KB), `rice_fish.glb` (1.46MB), `sleeper_fish.glb` (2.63MB), `mangrove_tree.glb` (1.05MB), `dead_tree_trunk/` (4.56MB), `fern_02/` (1.09MB), `coast_sand/` (4.63MB) | `public/assets/` | **Tracked in Git** (Deployed to GitHub Pages) |
| **Local Source Inventory** | `crocodile_high_quality.glb` (61MB uncompressed sculpt), `cc0__red_mangrove_rhizophora_mucronata.glb` (26MB raw model), `water_buffalo/` (13MB), `Ultimate Animated Animals - July 2021/` (Blend/FBX/glTF archives) | Root / subfolders | **Local Only** (Ignored in `.gitignore` to prevent bloat; available locally for rigging/baking pipelines) |
