import sys

file_path = 'c:/CineVerse/client/src/pages/MovieDetails.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ambientTrailerReady state
target_state = "const [showTrailer, setShowTrailer] = useState(false);\n    const trailerRef = useRef(null);"
new_state = """const [showTrailer, setShowTrailer] = useState(false);
    const [ambientTrailerReady, setAmbientTrailerReady] = useState(false);
    const trailerRef = useRef(null);"""

content = content.replace(target_state, new_state)

# 2. Add useEffect for the delay
target_effect = """    useEffect(() => {
        fetchData();
    }, [fetchData]);"""
new_effect = """    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!loading && movie) {
            const timer = setTimeout(() => {
                setAmbientTrailerReady(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loading, movie]);"""

content = content.replace(target_effect, new_effect)

# 3. Replace the ambient trailer render logic
target_ambient = """                {/* Ambient trailer video background (muted) */}
                {youtubeId && !showTrailer && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'hidden',
                        opacity: 0.25,
                        pointerEvents: 'none'
                    }}>
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&showinfo=0`}
                            style={{
                                width: '150%',
                                height: '150%',
                                position: 'absolute',
                                top: '-25%',
                                left: '-25%',
                                border: 'none'
                            }}
                            allow="autoplay"
                        />
                    </div>
                )}"""

target_ambient_lf = target_ambient.replace('\r\n', '\n')

new_ambient = """                {/* Ambient trailer video background (muted) */}
                {youtubeId && !showTrailer && ambientTrailerReady && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            overflow: 'hidden',
                            pointerEvents: 'none'
                        }}
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&showinfo=0`}
                            style={{
                                width: '150%',
                                height: '150%',
                                position: 'absolute',
                                top: '-25%',
                                left: '-25%',
                                border: 'none'
                            }}
                            allow="autoplay"
                        />
                    </motion.div>
                )}"""

if target_ambient in content:
    content = content.replace(target_ambient, new_ambient)
elif target_ambient_lf in content:
    content = content.replace(target_ambient_lf, new_ambient)
else:
    print("Warning: target ambient trailer not found.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MovieDetails.jsx")
