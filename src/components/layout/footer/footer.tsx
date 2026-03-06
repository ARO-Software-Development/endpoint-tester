import { useEffect, useState } from 'react'
import './footer.css'

const messages = [
    "© 2026 DARO Endpoint Tester. All rights reserved.",
    "See what is new for the v0.0.5 release!",
    "Visit La Terraza Restaurant Bar in Cananea, Sonora, Mexico for a great time!",
    "Visit my GitHub profile for more projects: github.com/karlosg3",
    "Visit the Bunker Breakfast and Lunch in Hermosillo, Sonora, Mexico for delicious food!",
    "'Prohibieron los corridos y ahora todos quieren ser un $ad Boy' - DEPR<3$$ED MFKZ",
]

export default function Footer() {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % messages.length);
                setFade(true);
            }, 500);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className='footer'>
            <span className={`footer-message ${fade ? 'fade-in' : 'fade-out'}`}>{messages[index]}</span>
        </footer>
    )
}