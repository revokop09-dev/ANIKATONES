"use client";
import { useState } from "react";
import { ModeToggle } from "../ModeToggle";
import Logo from "./logo";
import { Button } from "../ui/button";
import Search from "./search";
import { Search as SearchIcon, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
    const path = usePathname();
    const router = useRouter();
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    // Check if the current page is the player page
    const isPlayerPage = path.includes("/player");
    const showBackButton = path !== "/";

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-black shadow-md grid gap-3 pt-5 px-5 pb-5 md:px-20 lg:px-32">
            <div className="flex items-center justify-between">
                {showBackButton ? (
                    <Button
                        size="icon"
                        onClick={() => router.back()}
                        variant="outline"
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                ) : (
                    <ModeToggle />
                )}
                <Logo />
                {isPlayerPage ? (
                    <Button
                        size="icon"
                        asChild
                        variant="outline"
                        className="rounded-full"
                    >
                        <Link href="/">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        onClick={toggleSearch}
                        variant="outline"
                        className="rounded-full"
                    >
                        <SearchIcon className="w-4 h-4" />
                    </Button>
                )}
            </div>
            {/* Conditionally render the Search component based on isSearchVisible */}
            {!isPlayerPage && <Search className={isSearchVisible ? "" : "hidden"} />}
        </header>
    );
}
