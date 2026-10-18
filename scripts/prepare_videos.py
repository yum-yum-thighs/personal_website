"""Make lightweight, fast-start gallery videos and posters. Requires PyAV/Pillow."""
from pathlib import Path
from fractions import Fraction
import json
import hashlib
import av

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'art/web'
JOBS = [('Film.mp4', 'film.mp4', 'Film'), ('Tree.mp4', 'Tree.mp4', 'Tree')]


def prepare(original, filename, title):
    source = ROOT / 'art/myart' / original
    target = WEB / filename
    if not source.exists():
        source = target
    if not source.exists():
        print(f'Skipped {original}: no source.', flush=True)
        return None
    info_file = WEB / 'video-info.json'
    if source == target and info_file.exists():
        saved = json.loads(info_file.read_text(encoding='utf-8')).get(filename.casefold())
        if saved and saved.get('version') == hashlib.sha256(target.read_bytes()).hexdigest()[:12]:
            poster_path = ROOT / 'art' / saved['poster']
            if poster_path.exists():
                print(f'{original}: optimized playback is already prepared; original master is absent.', flush=True)
                return saved
    before = source.stat().st_size
    temporary = WEB / (target.stem + '.encoding.mp4')
    poster = WEB / (target.stem + '-poster.webp')
    with av.open(str(source)) as incoming:
        original_video = incoming.streams.video[0]
        original_video.thread_type = 'AUTO'
        ratio = min(1, 960 / max(original_video.width, original_video.height))
        width = max(2, int(original_video.width * ratio) // 2 * 2)
        height = max(2, int(original_video.height * ratio) // 2 * 2)
        rate = min(original_video.average_rate or Fraction(30), Fraction(30))
        duration = incoming.duration / av.time_base
        poster_time = min(3, duration * .05)
        poster_saved = False
        last_frame = None
        with av.open(str(temporary), 'w', options={'movflags': '+faststart'}) as outgoing:
            outgoing.metadata.update(incoming.metadata)
            video = outgoing.add_stream('libx264', rate=rate)
            video.width, video.height = width, height
            video.pix_fmt = 'yuv420p'
            video.options = {'crf': '28', 'preset': 'fast', 'maxrate': '850k',
                             'bufsize': '1700k', 'g': str(round(float(rate)))}
            video.thread_type = 'AUTO'
            audio = {}
            for stream in incoming.streams.audio:
                if stream.codec_context.name != 'aac':
                    raise ValueError(f'{original}: export AAC audio before preparing this video.')
                audio[stream.index] = outgoing.add_stream_from_template(stream)
            last_pts = -1
            count = 0
            for packet in incoming.demux():
                if packet.stream.type == 'video':
                    for frame in packet.decode():
                        last_frame = frame
                        time = float(frame.time or 0)
                        if not poster_saved and time >= poster_time:
                            image = frame.to_image()
                            image.thumbnail((640, 640))
                            image.save(poster, 'WEBP', quality=82)
                            poster_saved = True
                        pts = round(time * float(rate))
                        if pts <= last_pts:
                            continue
                        converted = frame.reformat(width=width, height=height, format='yuv420p')
                        converted.pts = pts
                        converted.time_base = 1 / rate
                        for encoded in video.encode(converted):
                            outgoing.mux(encoded)
                        last_pts = pts
                        count += 1
                        if count % 900 == 0:
                            print(f'{original}: encoded {count} frames', flush=True)
                elif packet.stream.index in audio and packet.dts is not None:
                    packet.stream = audio[packet.stream.index]
                    outgoing.mux(packet)
            for encoded in video.encode():
                outgoing.mux(encoded)
        if not poster_saved and last_frame is not None:
            image = last_frame.to_image()
            image.thumbnail((640, 640))
            image.save(poster, 'WEBP', quality=82)
    temporary.replace(target)
    with av.open(str(target)) as result:
        assert abs(result.duration / av.time_base - duration) < .15, 'Duration changed.'
        assert result.streams.video[0].codec_context.name == 'h264', 'Expected H.264.'
        assert len(result.streams.audio) == len(audio), 'Audio stream was lost.'
    print(f'{original}: {before:,} -> {target.stat().st_size:,} bytes; {width}x{height}', flush=True)
    version = hashlib.sha256(target.read_bytes()).hexdigest()[:12]
    return dict(name=original, title=title, version=version, poster='web/' + poster.name,
                width=width, height=height, duration=duration)


if __name__ == '__main__':
    WEB.mkdir(exist_ok=True)
    info = {}
    for original, filename, title in JOBS:
        metadata = prepare(original, filename, title)
        if metadata:
            info[filename.casefold()] = metadata
    (WEB / 'video-info.json').write_text(json.dumps(info, indent=2) + '\n', encoding='utf-8')
