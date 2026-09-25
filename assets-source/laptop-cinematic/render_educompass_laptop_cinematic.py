"""Render the approved EduCompass laptop cinematic as transparent WebP frames.

This permanent production source preserves the approved prototype laptop geometry,
lighting, near-black display material, and camera trajectory.  The laptop remains
static; camera motion supplies the physical 3/4-to-front-facing turn and final
dolly into the display.
"""

from pathlib import Path
from math import radians
from time import perf_counter

import bpy
from mathutils import Vector


SOURCE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SOURCE_DIR.parents[1]
OUTPUT_DIR = PROJECT_ROOT / "public" / "images" / "laptop-cinematic"
BLEND_FILE = SOURCE_DIR / "educompass_laptop_cinematic.blend"
FRAME_COUNT = 84


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.materials,
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for item in datablocks:
            if item.users == 0:
                datablocks.remove(item)


def new_material(name, color, metallic=0.0, roughness=0.5, specular=0.5):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    specular_input = bsdf.inputs.get("Specular IOR Level")
    if specular_input:
        specular_input.default_value = specular
    return material


def rounded_box(name, location, dimensions, material, bevel=0.08):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Machined edge radius", "BEVEL")
        modifier.width = bevel
        modifier.segments = 4
        modifier.limit_method = "ANGLE"
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def cylinder(name, location, radius, depth, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_area(name, location, energy, size, color, target):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    light.data.color = color
    look_at(light, target)
    return light


def create_laptop():
    graphite = new_material(
        "Space black anodized aluminum", (0.012, 0.014, 0.017), metallic=0.88, roughness=0.27
    )
    graphite_light = new_material(
        "Machined graphite deck", (0.022, 0.025, 0.03), metallic=0.76, roughness=0.33
    )
    edge_metal = new_material(
        "Polished graphite edge", (0.055, 0.06, 0.07), metallic=0.9, roughness=0.2
    )
    key_material = new_material(
        "Laser etched keys", (0.007, 0.008, 0.01), metallic=0.1, roughness=0.42
    )
    screen_material = new_material(
        "Inactive reflective display", (0.001, 0.0015, 0.0025), metallic=0.35, roughness=0.105, specular=0.66
    )
    port_material = new_material(
        "Port interior", (0.0004, 0.0005, 0.0007), metallic=0.1, roughness=0.62
    )

    # One immutable, space-black laptop. Only the camera is animated.
    rounded_box("Unibody chassis", (0, 0, 0), (8.65, 5.68, 0.38), graphite, 0.16)
    rounded_box("Machined top deck", (0, 0.02, 0.225), (8.45, 5.48, 0.09), graphite_light, 0.12)
    rounded_box("Front polished lip", (0, -2.77, -0.015), (7.45, 0.075, 0.08), edge_metal, 0.025)

    rounded_box("Keyboard recess", (0, 0.72, 0.285), (7.55, 2.6, 0.035), port_material, 0.05)
    key_y = (0.01, 0.39, 0.77, 1.15, 1.53, 1.91)
    for row, y in enumerate(key_y):
        cols = 14 if row not in (0, 5) else 13
        x_offset = -((cols - 1) * 0.245) / 2
        for col in range(cols):
            width = 0.32 if row == 5 and col in (0, cols - 1) else 0.215
            key = rounded_box(
                f"Key {row + 1:02d}-{col + 1:02d}",
                (x_offset + col * 0.245, y, 0.335),
                (width, 0.27, 0.065),
                key_material,
                0.035,
            )
            key.rotation_euler[2] = radians(0.0)
    rounded_box("Large glass trackpad", (0, -1.28, 0.295), (3.55, 1.78, 0.026), graphite, 0.09)
    rounded_box("Trackpad perimeter", (0, -1.28, 0.286), (3.68, 1.91, 0.012), edge_metal, 0.1)

    cylinder("Continuous hinge", (0, 2.31, 0.46), 0.135, 7.82, edge_metal, rotation=(0, radians(90), 0))
    rounded_box("Display outer shell", (0, 2.5, 3.05), (8.34, 0.18, 5.3), graphite, 0.115)
    rounded_box("Thin black bezel", (0, 2.395, 3.08), (8.08, 0.026, 5.02), port_material, 0.08)
    rounded_box("Glossy inactive screen", (0, 2.374, 3.08), (7.78, 0.018, 4.72), screen_material, 0.055)
    cylinder("Camera lens", (0, 2.365, 5.38), 0.04, 0.012, port_material, rotation=(radians(90), 0, 0))

    for index, y in enumerate((0.58, 0.16, -0.35)):
        rounded_box(
            f"Right-side port {index + 1}",
            (4.34, y, 0.02),
            (0.02, 0.28 if index == 0 else 0.18, 0.09),
            port_material,
            0.01,
        )

    return screen_material


def animate_camera(scene):
    bpy.ops.object.camera_add(location=(11.0, -13.0, 7.0))
    camera = bpy.context.object
    camera.name = "Cinematic camera"
    camera.data.lens = 55
    camera.data.sensor_width = 36
    camera.data.dof.use_dof = False
    scene.camera = camera

    # Approved 36-frame review path retimed proportionally for 84 production frames.
    # Frame 84 is straight along the display normal: yaw, pitch and roll are zero
    # relative to the centred screen, ready for an invisible DOM handoff.
    keyframes = {
        1: ((13.5, -16.0, 7.8), (0.0, 0.30, 2.25)),
        23: ((8.0, -16.0, 6.8), (0.0, 0.50, 2.28)),
        46: ((2.5, -15.2, 5.2), (0.0, 0.95, 2.55)),
        65: ((0.0, -12.0, 4.15), (0.0, 1.50, 2.70)),
        75: ((0.0, -10.0, 3.15), (0.0, 2.374, 3.08)),
        84: ((0.0, 2.20, 3.08), (0.0, 2.374, 3.08)),
    }
    for frame, (location, target) in keyframes.items():
        camera.location = location
        look_at(camera, target)
        camera.keyframe_insert(data_path="location", frame=frame)
        camera.keyframe_insert(data_path="rotation_euler", frame=frame)


def animate_screen_handoff(screen_material):
    """Faint early sheen only; final display is clean, uninterrupted near-black."""
    bsdf = screen_material.node_tree.nodes.get("Principled BSDF")
    roughness = bsdf.inputs["Roughness"]
    specular = bsdf.inputs.get("Specular IOR Level")
    for frame, roughness_value, specular_value in (
        (1, 0.28, 0.23),
        (23, 0.32, 0.18),
        (46, 0.42, 0.11),
        (65, 0.62, 0.025),
        (75, 0.78, 0.0),
        (84, 0.88, 0.0),
    ):
        roughness.default_value = roughness_value
        roughness.keyframe_insert(data_path="default_value", frame=frame)
        if specular:
            specular.default_value = specular_value
            specular.keyframe_insert(data_path="default_value", frame=frame)


def configure_scene():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 2560
    scene.render.resolution_y = 1600
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.quality = 85
    scene.render.film_transparent = True
    scene.render.use_file_extension = True
    scene.frame_start = 1
    scene.frame_end = FRAME_COUNT
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.world.color = (0.001, 0.001, 0.002)
    return scene


def setup_lighting():
    # No environment, floor, desk, or studio geometry: only lights on alpha.
    add_area("Broad softbox key", (-7.0, -7.5, 8.5), 1050, 5.5, (0.77, 0.84, 1.0), (0, 1.0, 1.8))
    add_area("Warm edge strip", (6.0, -1.5, 4.8), 540, 3.0, (1.0, 0.62, 0.34), (0, 1.6, 2.6))
    add_area("Rear graphite rim", (0.0, 6.0, 7.5), 900, 4.0, (0.48, 0.58, 0.85), (0, 1.8, 2.4))


def render_sequence(scene):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    started_at = perf_counter()
    for frame in range(1, FRAME_COUNT + 1):
        scene.frame_set(frame)
        scene.render.filepath = str(OUTPUT_DIR / f"laptop_{frame - 1:03d}.webp")
        bpy.ops.render.render(write_still=True)
    print(f"EDUCOMPASS_RENDER_SECONDS={perf_counter() - started_at:.2f}")


def main():
    clear_scene()
    scene = configure_scene()
    screen_material = create_laptop()
    animate_camera(scene)
    animate_screen_handoff(screen_material)
    setup_lighting()
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_FILE))
    render_sequence(scene)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_FILE))


if __name__ == "__main__":
    main()
