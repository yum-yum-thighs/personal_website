"""Create an H.264 playback copy while preserving the source and AAC audio."""
from pathlib import Path
import av

root = Path(__file__).resolve().parents[1]
source = root / 'art/myart/Film.mp4'
target = root / 'art/web/film.mp4'
with av.open(str(source)) as incoming, av.open(str(target), 'w', options={'movflags': '+faststart'}) as outgoing:
    original = incoming.streams.video[0]
    video = outgoing.add_stream('libx264', rate=original.average_rate)
    video.width = original.codec_context.width
    video.height = original.codec_context.height
    video.pix_fmt = 'yuv420p'
    video.options = {'crf': '23', 'preset': 'fast'}
    video.thread_type = 'AUTO'
    audio_map = {stream.index: outgoing.add_stream_from_template(stream) for stream in incoming.streams.audio}
    count = 0
    for packet in incoming.demux():
        if packet.stream.type == 'video':
            for frame in packet.decode():
                for encoded in video.encode(frame):
                    outgoing.mux(encoded)
                count += 1
                if count % 500 == 0:
                    print(f'Encoded {count} frames', flush=True)
        elif packet.stream.index in audio_map and packet.dts is not None:
            packet.stream = audio_map[packet.stream.index]
            outgoing.mux(packet)
    for encoded in video.encode():
        outgoing.mux(encoded)
print(f'Created {target.name}: {target.stat().st_size} bytes', flush=True)
