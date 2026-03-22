"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ExternalLink, Pause, Play, Repeat, Repeat1, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "../ui/slider";
import { getSongsById } from "@/lib/fetch";
import Link from "next/link";
import { MusicContext } from "@/hooks/use-context";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

export default function Player() {
    const [data, setData] = useState(null); // Updated to handle null initially
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioURL, setAudioURL] = useState("");
    const [isLooping, setIsLooping] = useState(false);
    const [songIndex, setSongIndex] = useState(0);  // Track current song index
    const [playlist, setPlaylist] = useState([]);  // Playlist to hold song data
    const values = useContext(MusicContext);

    // Function to fetch the song data
    const getSong = async (index) => {
        const get = await getSongsById(values.music);
        const data = await get.json();
        setPlaylist(data.data); // Store all songs in the playlist
        setData(data.data[index]); // Set current song based on index
        setAudioURL(data?.data[index]?.downloadUrl[2]?.url || data?.data[index]?.downloadUrl[1]?.url || data?.data[index]?.downloadUrl[0]?.url);
    };

    // Formatting the time
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Play/pause toggle function
    const togglePlayPause = () => {
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    // Handle seeking in the song
    const handleSeek = (e) => {
        const seekTime = e[0];
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    // Handle looping the song
    const loopSong = () => {
        audioRef.current.loop = !audioRef.current.loop;
        setIsLooping(!isLooping);
        if (isLooping) {
            toast.success('Removed from Loop!');
        } else {
            toast.success('Added to Loop!');
        }
    };

    // Handle going to the next song
    const handleNext = () => {
        const nextIndex = (songIndex + 1) % playlist.length; // Loop back to the first song when reaching the end
        setSongIndex(nextIndex);
    };

    // Handle going to the previous song
    const handlePrevious = () => {
        const prevIndex = (songIndex - 1 + playlist.length) % playlist.length; // Loop to the last song when going backward
        setSongIndex(prevIndex);
    };

    // Fetch song on songIndex change
    useEffect(() => {
        if (values.music) {
            getSong(songIndex); // Fetch the current song when songIndex changes
            if (localStorage.getItem("c")) {
                audioRef.current.currentTime = parseFloat(localStorage.getItem("c") + 1);
                localStorage.removeItem("c");
            }
            setPlaying(localStorage.getItem("p") === "true" || !localStorage.getItem("p") || true);
            const handleTimeUpdate = () => {
                try {
                    setCurrentTime(audioRef.current.currentTime);
                    setDuration(audioRef.current.duration);
                } catch (e) {
                    setPlaying(false);
                }
            };
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                }
            };
        }
    }, [values.music, songIndex]); // Re-run effect on songIndex change

    return (
        <main>
            <audio autoPlay={playing} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedData={() => setDuration(audioRef.current.duration)} src={audioURL} ref={audioRef}></audio>
            {values.music && <div className="shadow-lg fixed flex items-center bottom-0 right-0 left-0 border-border overflow-hidden border-t z-50 bg-background p-3 gap-3">
                <div className="relative">
                    <Button size="icon" variant="secondary" className="h-full w-full bg-secondary/30 hover:bg-secondary/50 backdrop-blur-sm absolute z-10" onClick={togglePlayPause}>{playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}</Button>
                    <img src={data?.image ? data?.image[1]?.url : ""} alt={data?.name} className="rounded-md h-20 min-w-20 hover:opacity-85 transition" />
                    <img src={data?.image ? data?.image[1]?.url : ""} alt={data?.name} className="rounded-md h-[110%] min-w-[110%] opacity-40 hidden dark:block absolute top-0 left-0 right-0 blur-3xl -z-10" />
                </div>
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2 w-full">
                        <div>
                            {!data?.name ? <Skeleton className="h-4 w-32" /> : (
                                <Link href={`/${values.music}?c=${currentTime}`} className="text-base hover:opacity-85 transition font-medium flex md:hidden gap-2 items-center">{data?.name?.slice(0, 10)}{data?.name?.length >= 11 ? ".." : ""}<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></Link>
                            )}
                            {!data?.artists?.primary[0]?.name ? <Skeleton className="h-3 w-14 mt-1" /> : (
                                <h2 className="block md:hidden text-xs -mt-0.5 text-muted-foreground">{data?.artists?.primary[0]?.name}</h2>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 -mt-3.5">
                            <Button size="icon" className="p-0 h-8 w-8" variant={!isLooping ? "ghost" : "secondary"} onClick={loopSong}>
                                {!isLooping ? <Repeat className="h-3.5 w-3.5" /> : <Repeat1 className="h-3.5 w-3.5" />}
                            </Button>
                            <Button size="icon" className="p-0 h-8 w-8" variant="outline" onClick={() => { values.setMusic(null); localStorage.clear(); audioRef.current.currentTime = 0; audioRef.current.src = null; setAudioURL(null); }}>
                                <X className="h-3.5 w-3.5" />
                            </Button>
                            {/* New Previous and Next Buttons */}
                            <Button size="icon" className="p-0 h-8 w-8" variant="outline" onClick={handlePrevious}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" className="p-0 h-8 w-8" variant="outline" onClick={handleNext}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div className="w-full grid gap-1">
                        {!duration ? <Skeleton className="h-2 w-full" /> : (
                            <Slider onValueChange={handleSeek} value={[currentTime]} max={duration} className="w-full" />
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-light text-muted-foreground">{formatTime(currentTime)}</span>
                            {!duration ? <Skeleton className="h-2 w-10" /> : (
                                <span className="text-[10px] font-light text-muted-foreground">{formatTime(duration)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>}
        </main>
    );
}
