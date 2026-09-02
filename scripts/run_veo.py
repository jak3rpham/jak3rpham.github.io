import os
import sys
import time
import subprocess
from google.genai import Client, types

def run_veo_generation():
    c = Client(vertexai=True, project='ai-riser-namdosan-fa737', location='us-central1')
    img_path = "public/images/home/builder-still.png"
    output_mp4 = "public/images/home/builder-motion.mp4"
    frames_dir = "public/images/home/frames/hero"
    fallback_poster = "public/images/home/hero-still.webp"

    print("Loading image:", img_path)
    img = types.Image.from_file(location=img_path)

    prompt = (
        "Cinematic slow push in. The floating glowing teal particles and code glyphs gently gather "
        "and resolve into the solid silhouette figure at the desk. Smooth continuous motion, no camera cuts, "
        "no flashes, locked eye-level 50mm, crisp clean edges, zero film grain, deep pitch black background."
    )

    print("Launching Veo 3.1 image-to-video generation (duration=6s, fps=24)...")
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
            person_generation='allow_adult',
            negative_prompt=(
                'text, typography, logos, watermarks, film grain, chromatic aberration, '
                'motion blur, readable UI, brand marks, facial detail, rapid movement, camera cuts'
            )
        )
    )

    print(f"Operation started: {op.name}")
    start_time = time.time()

    while True:
        res = c.operations.get(operation=op)
        elapsed = int(time.time() - start_time)
        print(f"[{elapsed}s] Done status: {res.done}")

        if res.done:
            if res.error:
                print(f"Error from Veo: {res.error}")
                sys.exit(1)

            if not res.response or not res.response.generated_videos:
                print("No generated videos in response!")
                sys.exit(1)

            video_bytes = res.response.generated_videos[0].video.video_bytes
            print(f"Veo video generated successfully! Size: {len(video_bytes):,} bytes")

            os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
            with open(output_mp4, "wb") as f:
                f.write(video_bytes)
            print(f"Saved AI video to {output_mp4}")
            break

        time.sleep(10)

    # Slice frames using ffmpeg per scroll-sequence.md
    # 6 seconds clip. To get ~150 frames, fps = 25 gives 150 frames.
    print(f"Slicing WebP frames into {frames_dir}...")
    os.makedirs(frames_dir, exist_ok=True)
    cmd_webp = [
        "ffmpeg", "-y",
        "-i", output_mp4,
        "-vf", "fps=25,scale=1280:-2:flags=lanczos",
        "-c:v", "libwebp",
        "-q:v", "65",
        "-compression_level", "6",
        "-loop", "0",
        f"{frames_dir}/%04d.webp"
    ]
    subprocess.run(cmd_webp, check=True)
    print("WebP frames sliced successfully.")

    # Save fallback poster
    import glob
    frames = sorted(glob.glob(f"{frames_dir}/*.webp"))
    print(f"Total sliced frames: {len(frames)}")
    if frames:
        import shutil
        shutil.copyfile(frames[-1], fallback_poster)
        print(f"Saved fallback poster to {fallback_poster}")

if __name__ == "__main__":
    run_veo_generation()
