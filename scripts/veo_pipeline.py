import os
import sys
import time
import subprocess
from google.genai import Client, types

def poll_and_save(operation_name, output_mp4, frames_dir, fallback_poster):
    c = Client(vertexai=True, project='ai-riser-namdosan-fa737', location='us-central1')
    op_obj = types.GenerateVideosOperation(name=operation_name)
    
    print(f"Polling operation: {operation_name}...")
    start_time = time.time()
    
    while True:
        res = c.operations.get(operation=op_obj)
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
            print(f"Video generated successfully! Size: {len(video_bytes):,} bytes")
            
            os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
            with open(output_mp4, "wb") as f:
                f.write(video_bytes)
            print(f"Saved video to {output_mp4}")
            break
            
        time.sleep(10)

    # Slice frames using ffmpeg per scroll-sequence.md
    print(f"Slicing frames into {frames_dir}...")
    os.makedirs(frames_dir, exist_ok=True)
    cmd_webp = [
        "ffmpeg", "-y",
        "-i", output_mp4,
        "-vf", "fps=30,scale=1280:-2:flags=lanczos",
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
    op_name = "projects/ai-riser-namdosan-fa737/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001/operations/c9a4b538-d5ef-45e0-9b4a-ad9139661673"
    poll_and_save(
        operation_name=op_name,
        output_mp4="public/images/home/builder-motion.mp4",
        frames_dir="public/images/home/frames/hero",
        fallback_poster="public/images/home/hero-still.webp"
    )
