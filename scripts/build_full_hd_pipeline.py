import os
import sys
import time
import subprocess
from PIL import Image
from google.genai import Client, types

def upscale_stills_to_2k():
    print("Upscaling stills to 2560x1440 per antigravity-brief.md specifications...")
    for name in ["builder-still.png", "systems-still.png"]:
        path = os.path.join("public/images/home", name)
        if os.path.exists(path):
            img = Image.open(path)
            # Resize to 2560x1440
            upscaled = img.resize((2560, 1440), Image.Resampling.LANCZOS)
            upscaled.save(path, format="PNG")
            print(f"Saved {path} at 2560x1440 PNG")

def generate_video_fullhd(c, img_path, prompt, negative_prompt, output_mp4):
    print(f"\n--- Generating Full HD (1080p) Video: {output_mp4} ---")
    img = types.Image.from_file(location=img_path)

    op = c.models.generate_videos(
        model='veo-3.1-fast-generate-001',
        source={
            'prompt': prompt,
            'image': img
        },
        config=types.GenerateVideosConfig(
            aspect_ratio='16:9',
            duration_seconds=6,
            fps=24,
            resolution='1080p',
            person_generation='allow_adult',
            negative_prompt=negative_prompt
        )
    )
    print(f"Operation started: {op.name}")
    start = time.time()

    while True:
        res = c.operations.get(operation=op)
        elapsed = int(time.time() - start)
        print(f"[{elapsed}s] Status: {res.done}")

        if res.done:
            if res.error:
                print(f"Error: {res.error}")
                raise RuntimeError(str(res.error))

            if not res.response or not res.response.generated_videos:
                raise RuntimeError("No videos in response")

            video_bytes = res.response.generated_videos[0].video.video_bytes
            print(f"Veo Full HD video generated! Size: {len(video_bytes):,} bytes")
            with open(output_mp4, "wb") as f:
                f.write(video_bytes)
            print(f"Saved {output_mp4}")
            break

        time.sleep(10)

    # Verify resolution with ffprobe
    res_str = subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', output_mp4
    ]).decode().strip()
    print(f"Verified resolution for {output_mp4}: {res_str}")

def slice_frames_fullhd(mp4_path, frames_dir, fallback_path, target_width=1920):
    print(f"\n--- Slicing Full HD frames into {frames_dir} at width {target_width} ---")
    os.makedirs(frames_dir, exist_ok=True)
    # Clean previous frames
    for f in os.listdir(frames_dir):
        if f.endswith(".webp"):
            os.remove(os.path.join(frames_dir, f))

    cmd = [
        "ffmpeg", "-y",
        "-i", mp4_path,
        "-vf", f"fps=25,scale={target_width}:-2:flags=lanczos",
        "-c:v", "libwebp",
        "-q:v", "55",
        "-compression_level", "6",
        "-loop", "0",
        f"{frames_dir}/%04d.webp"
    ]
    subprocess.run(cmd, check=True)

    frames = sorted([os.path.join(frames_dir, f) for f in os.listdir(frames_dir) if f.endswith(".webp")])
    total_bytes = sum(os.path.getsize(f) for f in frames)
    total_mb = round(total_bytes / (1024 * 1024), 2)
    print(f"Frames count: {len(frames)}, Total size: {total_mb} MB")

    if frames:
        import shutil
        shutil.copyfile(frames[-1], fallback_path)
        print(f"Saved fallback poster to {fallback_path}")

def main():
    upscale_stills_to_2k()
    c = Client(vertexai=True, project='ai-riser-namdosan-fa737', location='us-central1')

    # 1. Builder (Hero)
    prompt_builder = (
        "Cinematic slow push in. The floating glowing teal particles and code glyphs gently gather "
        "and resolve into the solid silhouette figure at the desk. Smooth continuous motion, no camera cuts, "
        "no flashes, locked eye-level 50mm, crisp clean edges, zero film grain, deep pitch black background."
    )
    neg_builder = (
        "text, typography, logos, watermarks, film grain, chromatic aberration, "
        "motion blur, readable UI, brand marks, facial detail, rapid movement, camera cuts"
    )
    generate_video_fullhd(
        c=c,
        img_path="public/images/home/builder-still.png",
        prompt=prompt_builder,
        negative_prompt=neg_builder,
        output_mp4="public/images/home/builder-motion.mp4"
    )
    slice_frames_fullhd(
        mp4_path="public/images/home/builder-motion.mp4",
        frames_dir="public/images/home/frames/hero",
        fallback_path="public/images/home/hero-still.webp",
        target_width=1920
    )

    # 2. Systems
    prompt_systems = (
        "An isometric technical node and edge data diagram with four parallel tracks smoothly "
        "drawing and building itself from left to right. Self-illuminated glowing teal edges connect "
        "the nodes against a flat near black background. Locked-off isometric camera, fluid continuous motion, "
        "no cuts, no typography, no labels, no film grain."
    )
    neg_systems = (
        "text, typography, labels, callouts, logos, watermarks, film grain, "
        "chromatic aberration, motion blur, perspective drift, camera cuts"
    )
    generate_video_fullhd(
        c=c,
        img_path="public/images/home/systems-still.png",
        prompt=prompt_systems,
        negative_prompt=neg_systems,
        output_mp4="public/images/home/systems-motion.mp4"
    )
    slice_frames_fullhd(
        mp4_path="public/images/home/systems-motion.mp4",
        frames_dir="public/images/home/frames/systems",
        fallback_path="public/images/home/systems-still.webp",
        target_width=1920
    )

if __name__ == "__main__":
    main()
