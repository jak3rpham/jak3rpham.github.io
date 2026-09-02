import os
import sys
import time
import subprocess
from google.genai import Client, types

def run_systems_veo():
    c = Client(vertexai=True, project='ai-riser-namdosan-fa737', location='us-central1')
    img_path = "public/images/home/systems-still.png"
    output_mp4 = "public/images/home/systems-motion.mp4"

    print("Loading image:", img_path)
    img = types.Image.from_file(location=img_path)

    prompt = (
        "An isometric technical node and edge data diagram with four parallel tracks smoothly "
        "drawing and building itself from left to right. Self-illuminated glowing teal edges connect "
        "the nodes against a flat near black background. Locked-off isometric camera, fluid continuous motion, "
        "no cuts, no typography, no labels, no film grain."
    )

    print("Launching Veo 3.1 image-to-video generation for systems diagram...")
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
                'text, typography, labels, callouts, logos, watermarks, film grain, '
                'chromatic aberration, motion blur, perspective drift, camera cuts'
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
            print(f"Veo systems video generated successfully! Size: {len(video_bytes):,} bytes")

            os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
            with open(output_mp4, "wb") as f:
                f.write(video_bytes)
            print(f"Saved AI systems video to {output_mp4}")
            break

        time.sleep(10)

if __name__ == "__main__":
    run_systems_veo()
