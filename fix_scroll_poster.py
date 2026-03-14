import sys

file_path = 'c:/CineVerse/client/src/pages/MovieDetails.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add window.scrollTo(0, 0); in the main useEffect
target_effect = """    useEffect(() => {
        fetchData();
    }, [fetchData]);"""

target_effect_lf = target_effect.replace('\r\n', '\n')

new_effect = """    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, [fetchData]);"""

if target_effect in content:
    content = content.replace(target_effect, new_effect)
elif target_effect_lf in content:
    content = content.replace(target_effect_lf, new_effect)

# Fix 2: Change background to backgroundImage to ensure the poster renders
target_poster = """                {/* Poster Background layer (fades out when trailer starts) */}
                {(backdrop || poster) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: ambientTrailerReady ? 0 : 1 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `url(${backdrop || poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            backgroundAttachment: 'fixed',
                            zIndex: -2,
                            pointerEvents: 'none'
                        }}
                    />
                )}"""

target_poster_lf = target_poster.replace('\r\n', '\n')

new_poster = """                {/* Poster Background layer (fades out when trailer starts) */}
                {(backdrop || poster) && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: ambientTrailerReady ? 0 : 1 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${backdrop || poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            backgroundAttachment: 'fixed',
                            zIndex: -2,
                            pointerEvents: 'none'
                        }}
                    />
                )}"""

if target_poster in content:
    content = content.replace(target_poster, new_poster)
elif target_poster_lf in content:
    content = content.replace(target_poster_lf, new_poster)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("MovieDetails updated.")

seat_file = 'c:/CineVerse/client/src/pages/SeatSelection.jsx'
with open(seat_file, 'r', encoding='utf-8') as f:
    s_content = f.read()

target_seat_effect = """    useEffect(() => {
        fetchData();
    }, [fetchData]);"""

target_seat_effect_lf = target_seat_effect.replace('\r\n', '\n')

new_seat_effect = """    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, [fetchData]);"""

if target_seat_effect in s_content:
    s_content = s_content.replace(target_seat_effect, new_seat_effect)
elif target_seat_effect_lf in s_content:
    s_content = s_content.replace(target_seat_effect_lf, new_seat_effect)

with open(seat_file, 'w', encoding='utf-8') as f:
    f.write(s_content)
print("SeatSelection updated.")
