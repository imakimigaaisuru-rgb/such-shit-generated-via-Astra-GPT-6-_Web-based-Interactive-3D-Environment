"""Blender: open this script from the extracted design kit and Run Script.
Imports the same metre-scale GLB used to define the Three.js design.
No structural analysis is performed. Existing scene is preserved.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

try:
    folder = Path(__file__).resolve().parent
except NameError:
    folder = Path(bpy.path.abspath('//'))
model = folder / 'higan-house.glb'
if not model.exists():
    raise FileNotFoundError('Place this script beside higan-house.glb before running.')

bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.ops.import_scene.gltf(filepath=str(model))
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.render.resolution_x = 1600
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
world = bpy.data.worlds.new('Higan_Atmosphere')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.12, 0.22, 0.25, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.5
scene.world = world

# glTF Y-up coordinates become Blender Z-up: (x, y, z) -> (x, -z, y).
bpy.ops.object.camera_add(location=(18, -20, 12))
camera = bpy.context.object
camera.name = 'Higan_Overview'
camera.rotation_euler = (Vector((1.2, 1.7, 1.9)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 35
scene.camera = camera
bpy.ops.object.light_add(type='SUN', location=(-9, -8, 17))
sun = bpy.context.object
sun.name = 'Higan_Sun'
sun.data.energy = 2.0
sun.data.angle = math.radians(12)
sun.rotation_euler = (math.radians(25), math.radians(-20), math.radians(-25))
scene.render.filepath = str(folder / 'higan-render.png')
# Save an editable native scene locally after import. Rendering is user-initiated (F12).
bpy.ops.wm.save_as_mainfile(filepath=str(folder / 'higan-house.blend'))
print('Saved higan-house.blend. Press F12 to render. Concept model; not construction-certified.')
