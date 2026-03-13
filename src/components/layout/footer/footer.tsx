import { useEffect, useState } from 'react'
import './footer.css'

interface FooterMessage {
    text: string;
    url?: string;
}

const messages: FooterMessage[] = [
    { text: `© 2026 DARO Endpoint Tester. v${APP_VERSION} All rights reserved.` },
    { text: `See what is new for the v${APP_VERSION} release!`, url: "https://github.com/karlosg3/endpoint-tester/releases" },
    { text: "Visit La Terraza Restaurant Bar in Cananea, Sonora, Mexico for a great time!", url: "https://www.instagram.com/laterrazzarestaurante_/" },
    { text: "Visit my GitHub profile for more projects: github.com/karlosg3", url: "https://github.com/karlosg3" },
    { text: "Visit the Bunker Breakfast and Lunch in Hermosillo, Sonora, Mexico for delicious food!" },
    { text: "'Prohibieron los corridos y ahora todos quieren ser un $ad Boy' - DEPR<3$$ED MFKZ", url: "https://open.spotify.com/intl-es/album/3VVqkkiUqVklgPcC4dnYos?si=6LL2M-XiS8eNHTS4vo_sMQ"},
    { text: "Get the best supplements for your fitness journey in CR Supps", url: "https://www.instagram.com/cr_supps/" }
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

    const currentMessage = messages[index];

    return (
        <footer className='footer'>
            <span className={`footer-message ${fade ? 'fade-in' : 'fade-out'}`}>
                {currentMessage.url ? (
                    <a 
                        href={currentMessage.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        {currentMessage.text}
                    </a>
                ) : (
                    currentMessage.text
                )}
            </span>
        </footer>
    )
}