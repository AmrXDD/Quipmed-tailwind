# 3D model sources

`human_brain/` is the original download ("Human Brain" by 3DRT STUDIOS,
CC BY 4.0, see `human_brain/license.txt`). Attribution is shown in the site
footer and in the Terms of use. Keep it there while the model is used.

The site loads the optimised `public/models/brain.glb` (about 390 KB). To rebuild it:

```bash
npx @gltf-transform/cli@4 metalrough assets-src/models/human_brain/scene.gltf /tmp/brain-mr.glb
npx @gltf-transform/cli@4 optimize /tmp/brain-mr.glb public/models/brain.glb --compress meshopt --texture-compress webp --texture-size 1024 --simplify false
```

The `metalrough` step is required. The source uses
`KHR_materials_pbrSpecularGlossiness`, which current three.js no longer loads.
