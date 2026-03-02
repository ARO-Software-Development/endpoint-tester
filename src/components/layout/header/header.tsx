import codeLogo from '../../../assets/Code.svg'
// import githubLogo from '../../../assets/Github.svg'
import './header.css'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
    { name: 'Tester', path: '/tester' },
    { name: 'Documentation', path: '/docs' },
    { name: 'GitHub', path: 'https://github.com/karlosg3/endpoint-tester', external: true },
];

const pageTitles: Record<string, string> = {
    '/': 'Home',
    '/tester': 'Tester',
    '/docs': 'Documentation'
};

export default function Header() {
    const location = useLocation();
    const currentPage = pageTitles[location.pathname] || 'Page';

    return (
        <header className='header'>
            <div className="left-header">
                <Link to='/' className='logo-link'>
                    <img src ={codeLogo} alt='Logo' className='header-logo' />
                </Link>
                <span className='header-title'>{currentPage}</span>
            </div>
            <nav className='nav-header'>
                {navLinks.map((link) =>
                    link.external ? (
                        <a
                            key={link.name}
                            href={link.path}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='nav-link-header'
                        >
                            {/* Github logo doesnt display
                            {link.name === 'GitHub' && (
                                <img
                                    src={githubLogo}
                                    alt='GitHub'
                                    className='header-github-logo'
                                />
                            )}
                            */}
                            {link.name}
                            
                        </a>
                    ) : (
                        <Link key={link.name} to={link.path} className='nav-link-header'>
                            {link.name}
                        </Link>
                    )
                )}
            </nav>
        </header>
    )
}